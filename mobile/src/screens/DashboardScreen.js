import React, { useCallback, useState } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, RefreshControl, Alert, Share, Modal } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { api } from "../api/client";
import { formatarMoeda, primeiroEUltimoDiaDoMesAtual, ultimosMeses, montarRelatorioCsv } from "../utils";
import { armazenamento } from "../storage";
import { useTema } from "../context/ThemeContext";

export default function DashboardScreen() {
  const { cores, fontes } = useTema();
  const styles = criarEstilos(cores, fontes);

  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [historico, setHistorico] = useState([]);
  const [meta, setMeta] = useState(null);
  const [modalMetaAberto, setModalMetaAberto] = useState(false);
  const [metaTexto, setMetaTexto] = useState("");

  const carregar = useCallback(async (dataInicio, dataFim) => {
    setCarregando(true);
    try {
      const [resultado, metaSalva] = await Promise.all([
        api.buscarDashboard(dataInicio, dataFim),
        armazenamento.lerMeta(),
      ]);
      setDados(resultado);
      setMeta(metaSalva);

      const meses = ultimosMeses(6);
      const resultadosMeses = await Promise.all(meses.map((m) => api.buscarDashboard(m.inicio, m.fim)));
      setHistorico(meses.map((m, i) => ({ ...m, ...resultadosMeses[i] })));
    } catch (e) {
      Alert.alert("Erro", "Não foi possível carregar o dashboard: " + e.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      const [i, f] = inicio && fim ? [inicio, fim] : primeiroEUltimoDiaDoMesAtual();
      if (!inicio) setInicio(i);
      if (!fim) setFim(f);
      carregar(i, f);
    }, [])
  );

  const maiorValor = Math.max(1, ...(dados?.despesasPorCategoria || []).map((c) => Number(c.total)));
  const maiorValorHistorico = Math.max(1, ...historico.flatMap((m) => [Number(m.totalReceita || 0), Number(m.totalDespesa || 0)]));
  const progressoMeta = meta ? Math.min(100, Math.max(0, ((dados?.margemLucro || 0) / meta) * 100)) : null;

  function abrirModalMeta() {
    setMetaTexto(meta ? String(meta) : "");
    setModalMetaAberto(true);
  }

  async function salvarMeta() {
    const valor = parseFloat(metaTexto);
    if (metaTexto && (isNaN(valor) || valor <= 0)) {
      Alert.alert("Atenção", "Digite um valor válido.");
      return;
    }
    await armazenamento.salvarMeta(metaTexto ? valor : null);
    setMeta(metaTexto ? valor : null);
    setModalMetaAberto(false);
  }

  async function exportarRelatorio() {
    try {
      const [receitas, despesas] = await Promise.all([api.listarReceitas(), api.listarDespesas()]);
      const dentroDoPeriodo = (data) => data >= inicio && data <= fim;
      const csv = montarRelatorioCsv({
        periodoLabel: `${inicio} a ${fim}`,
        receitas: receitas.filter((r) => dentroDoPeriodo(r.dataReceita)),
        despesas: despesas.filter((d) => dentroDoPeriodo(d.dataDespesa)),
        totalReceita: dados?.totalReceita || 0,
        totalDespesa: dados?.totalDespesa || 0,
      });
      await Share.share({ message: csv, title: "Relatório financeiro" });
    } catch (e) {
      Alert.alert("Erro", "Não foi possível gerar o relatório: " + e.message);
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      refreshControl={<RefreshControl tintColor={cores.dourado} refreshing={carregando} onRefresh={() => carregar(inicio, fim)} />}
    >
      <View style={styles.linhaFiltro}>
        <TextInput
          style={styles.inputData}
          value={inicio}
          onChangeText={setInicio}
          placeholder="AAAA-MM-DD"
          placeholderTextColor={cores.textoSecundario}
        />
        <Text style={styles.ateTexto}>até</Text>
        <TextInput
          style={styles.inputData}
          value={fim}
          onChangeText={setFim}
          placeholder="AAAA-MM-DD"
          placeholderTextColor={cores.textoSecundario}
        />
        <TouchableOpacity style={styles.botaoFiltro} onPress={() => carregar(inicio, fim)}>
          <Text style={styles.botaoFiltroTexto}>Filtrar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.heroCard}>
        <Text style={styles.heroLabel}>Margem de lucro</Text>
        <Text style={styles.heroValor}>{formatarMoeda(dados?.margemLucro)}</Text>

        <View style={styles.linhaSecundaria}>
          <View>
            <Text style={styles.secundarioLabel}>Receita</Text>
            <Text style={[styles.secundarioValor, { color: cores.verde }]}>{formatarMoeda(dados?.totalReceita)}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.secundarioLabel}>Despesa</Text>
            <Text style={[styles.secundarioValor, { color: cores.terracota }]}>{formatarMoeda(dados?.totalDespesa)}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.metaCard} onPress={abrirModalMeta}>
        {meta ? (
          <>
            <View style={styles.metaLinhaTopo}>
              <Text style={styles.metaLabel}>Meta do mês: {formatarMoeda(meta)}</Text>
              <Text style={styles.metaEditar}>editar</Text>
            </View>
            <View style={styles.barraFundo}>
              <View style={[styles.barraPreenchida, { width: `${progressoMeta}%` }]} />
            </View>
            <Text style={styles.metaPercentual}>{Math.round(progressoMeta)}% da meta atingida</Text>
          </>
        ) : (
          <Text style={styles.metaLabel}>+ Definir meta de lucro do mês</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.botaoExportar} onPress={exportarRelatorio}>
        <Text style={styles.botaoExportarTexto}>Exportar relatório do período</Text>
      </TouchableOpacity>

      <Text style={styles.tituloSecao}>Últimos 6 meses</Text>
      <View style={styles.historicoGrafico}>
        {historico.map((m) => (
          <View key={m.label} style={styles.historicoColuna}>
            <View style={styles.historicoBarras}>
              <View style={[styles.historicoBarra, { height: (Number(m.totalReceita || 0) / maiorValorHistorico) * 90, backgroundColor: cores.verde }]} />
              <View style={[styles.historicoBarra, { height: (Number(m.totalDespesa || 0) / maiorValorHistorico) * 90, backgroundColor: cores.terracota }]} />
            </View>
            <Text style={styles.historicoLabel}>{m.label}</Text>
          </View>
        ))}
      </View>
      <View style={styles.legenda}>
        <View style={styles.legendaItem}><View style={[styles.legendaBolinha, { backgroundColor: cores.verde }]} /><Text style={styles.legendaTexto}>Receita</Text></View>
        <View style={styles.legendaItem}><View style={[styles.legendaBolinha, { backgroundColor: cores.terracota }]} /><Text style={styles.legendaTexto}>Despesa</Text></View>
      </View>

      <Text style={styles.tituloSecao}>Despesas por categoria</Text>
      {(dados?.despesasPorCategoria || []).length === 0 && (
        <Text style={styles.textoVazio}>Nenhuma despesa lançada nesse período.</Text>
      )}
      {(dados?.despesasPorCategoria || []).map((c) => (
        <View key={c.categoria} style={styles.categoriaItem}>
          <View style={styles.categoriaLinhaTopo}>
            <Text style={styles.categoriaNome}>{c.categoria}</Text>
            <Text style={styles.categoriaValor}>{formatarMoeda(c.total)}</Text>
          </View>
          <View style={styles.barraFundo}>
            <View style={[styles.barraPreenchida, { width: `${(Number(c.total) / maiorValor) * 100}%` }]} />
          </View>
        </View>
      ))}

      <Modal visible={modalMetaAberto} transparent animationType="fade" onRequestClose={() => setModalMetaAberto(false)}>
        <View style={styles.modalFundo}>
          <View style={styles.modalCard}>
            <Text style={styles.tituloForm}>Meta de lucro do mês</Text>
            <TextInput
              style={styles.input}
              placeholder="Valor (ex: 800.00)"
              placeholderTextColor={cores.textoSecundario}
              keyboardType="decimal-pad"
              value={metaTexto}
              onChangeText={setMetaTexto}
            />
            <View style={styles.linhaBotoes}>
              <TouchableOpacity style={styles.botao} onPress={salvarMeta}>
                <Text style={styles.botaoTexto}>Salvar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.botao, styles.botaoSecundario]} onPress={() => setModalMetaAberto(false)}>
                <Text style={styles.botaoTextoSecundario}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function criarEstilos(cores, fontes) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: cores.fundo, padding: 20 },
    linhaFiltro: { flexDirection: "row", alignItems: "center", marginBottom: 22, gap: 6 },
    inputData: {
      flex: 1, borderWidth: 1, borderColor: cores.borda, borderRadius: 8, padding: 8,
      color: cores.creme, fontFamily: fontes.texto, fontSize: 12, backgroundColor: cores.superficie,
    },
    ateTexto: { color: cores.textoSecundario, fontFamily: fontes.texto, fontSize: 12 },
    botaoFiltro: { backgroundColor: cores.dourado, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 8 },
    botaoFiltroTexto: { color: cores.fundo, fontFamily: fontes.textoForte, fontSize: 12 },

    heroCard: {
      backgroundColor: cores.superficie, borderRadius: 16, borderWidth: 1, borderColor: cores.borda,
      padding: 22, marginBottom: 16,
    },
    heroLabel: { fontFamily: fontes.texto, fontSize: 12, color: cores.textoSecundario, textAlign: "center", marginBottom: 6 },
    heroValor: { fontFamily: fontes.displayForte, fontSize: 38, color: cores.dourado, textAlign: "center", marginBottom: 20 },
    linhaSecundaria: {
      flexDirection: "row", justifyContent: "space-between", paddingTop: 16,
      borderTopWidth: 1, borderTopColor: cores.borda,
    },
    secundarioLabel: { fontFamily: fontes.texto, fontSize: 11, color: cores.textoSecundario, marginBottom: 4 },
    secundarioValor: { fontFamily: fontes.display, fontSize: 20 },

    metaCard: {
      backgroundColor: cores.superficie, borderRadius: 14, borderWidth: 1, borderColor: cores.borda,
      padding: 16, marginBottom: 12,
    },
    metaLinhaTopo: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
    metaLabel: { fontFamily: fontes.textoMedio, fontSize: 13, color: cores.creme },
    metaEditar: { fontFamily: fontes.textoMedio, fontSize: 12, color: cores.dourado },
    metaPercentual: { fontFamily: fontes.texto, fontSize: 11, color: cores.textoSecundario, marginTop: 6 },

    botaoExportar: {
      borderWidth: 1, borderColor: cores.bordaForte, borderRadius: 10, paddingVertical: 12,
      alignItems: "center", marginBottom: 26,
    },
    botaoExportarTexto: { fontFamily: fontes.textoMedio, fontSize: 13, color: cores.dourado },

    tituloSecao: { fontFamily: fontes.textoMedio, fontSize: 12, color: cores.textoSecundario, marginBottom: 12 },
    textoVazio: { color: cores.textoSecundario, fontFamily: fontes.texto, fontStyle: "italic" },

    historicoGrafico: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", height: 110, marginBottom: 8 },
    historicoColuna: { alignItems: "center", flex: 1 },
    historicoBarras: { flexDirection: "row", alignItems: "flex-end", gap: 3, height: 90 },
    historicoBarra: { width: 8, borderRadius: 2, minHeight: 2 },
    historicoLabel: { fontFamily: fontes.texto, fontSize: 10, color: cores.textoSecundario, marginTop: 6 },
    legenda: { flexDirection: "row", justifyContent: "center", gap: 20, marginBottom: 26 },
    legendaItem: { flexDirection: "row", alignItems: "center", gap: 6 },
    legendaBolinha: { width: 8, height: 8, borderRadius: 4 },
    legendaTexto: { fontFamily: fontes.texto, fontSize: 11, color: cores.textoSecundario },

    categoriaItem: { marginBottom: 16 },
    categoriaLinhaTopo: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
    categoriaNome: { fontFamily: fontes.texto, fontSize: 13, color: cores.creme },
    categoriaValor: { fontFamily: fontes.textoMedio, fontSize: 13, color: cores.creme },
    barraFundo: { height: 2, backgroundColor: cores.barraFundo },
    barraPreenchida: { height: "100%", backgroundColor: cores.dourado },

    modalFundo: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "center", padding: 24 },
    modalCard: { backgroundColor: cores.superficie, borderRadius: 16, borderWidth: 1, borderColor: cores.borda, padding: 20 },
    tituloForm: { fontFamily: fontes.display, fontSize: 16, color: cores.creme, marginBottom: 12 },
    input: {
      borderWidth: 1, borderColor: cores.borda, borderRadius: 8, padding: 10, marginBottom: 10,
      color: cores.creme, fontFamily: fontes.texto, fontSize: 14, backgroundColor: cores.superficieAlt,
    },
    linhaBotoes: { flexDirection: "row", gap: 8 },
    botao: { backgroundColor: cores.dourado, padding: 11, borderRadius: 8, flex: 1, alignItems: "center" },
    botaoTexto: { color: cores.fundo, fontFamily: fontes.textoForte, fontSize: 13 },
    botaoSecundario: { backgroundColor: "transparent", borderWidth: 1, borderColor: cores.bordaForte },
    botaoTextoSecundario: { color: cores.textoSecundario, fontFamily: fontes.textoMedio, fontSize: 13 },
  });
}
