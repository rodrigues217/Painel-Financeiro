import React, { useCallback, useMemo, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useFocusEffect } from "@react-navigation/native";
import { api } from "../api/client";
import { formatarMoeda } from "../utils";
import { useTema } from "../context/ThemeContext";

export default function ReceitasScreen() {
  const { cores, fontes } = useTema();
  const styles = criarEstilos(cores, fontes);

  const [receitas, setReceitas] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [busca, setBusca] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [valor, setValor] = useState("");
  const [data, setData] = useState("");
  const [descricao, setDescricao] = useState("");
  const [produtoId, setProdutoId] = useState(null);

  const carregar = useCallback(async () => {
    try {
      const [lista, listaProdutos] = await Promise.all([api.listarReceitas(), api.listarProdutos()]);
      setReceitas(lista);
      setProdutos(listaProdutos);
    } catch (e) {
      Alert.alert("Erro", "Não foi possível carregar as receitas: " + e.message);
    }
  }, []);

  useFocusEffect(useCallback(() => { carregar(); }, [carregar]));

  const receitasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return receitas;
    return receitas.filter((r) =>
      (r.descricao || "").toLowerCase().includes(termo) ||
      (r.produto?.nome || "").toLowerCase().includes(termo)
    );
  }, [receitas, busca]);

  function limparFormulario() {
    setEditandoId(null);
    setValor("");
    setData("");
    setDescricao("");
    setProdutoId(null);
  }

  async function salvar() {
    if (!valor || !data) {
      Alert.alert("Atenção", "Preencha valor e data.");
      return;
    }
    const corpo = { valor: parseFloat(valor), dataReceita: data, descricao: descricao || null, produtoId: produtoId || null };
    try {
      if (editandoId) {
        await api.editarReceita(editandoId, corpo);
      } else {
        await api.criarReceita(corpo);
      }
      limparFormulario();
      carregar();
    } catch (e) {
      Alert.alert("Erro", "Não foi possível salvar: " + e.message);
    }
  }

  function editar(item) {
    setEditandoId(item.id);
    setValor(String(item.valor));
    setData(item.dataReceita);
    setDescricao(item.descricao || "");
    setProdutoId(item.produto ? item.produto.id : null);
  }

  function excluir(id) {
    Alert.alert("Confirmar", "Excluir esta receita?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            await api.excluirReceita(id);
            carregar();
          } catch (e) {
            Alert.alert("Erro", e.message);
          }
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <View style={styles.formulario}>
        <Text style={styles.tituloForm}>{editandoId ? "Editar receita" : "Nova receita"}</Text>
        <TextInput style={styles.input} placeholder="Valor (ex: 150.00)" placeholderTextColor={cores.textoSecundario} keyboardType="decimal-pad" value={valor} onChangeText={setValor} />
        <View style={styles.pickerWrapper}>
          <Picker selectedValue={produtoId} onValueChange={setProdutoId} style={{ color: cores.creme }} dropdownIconColor={cores.dourado}>
            <Picker.Item label="Sem produto vinculado" value={null} color={cores.creme} />
            {produtos.map((p) => (
              <Picker.Item key={p.id} label={p.nome} value={p.id} color={cores.creme} />
            ))}
          </Picker>
        </View>
        <TextInput style={styles.input} placeholder="Data (AAAA-MM-DD)" placeholderTextColor={cores.textoSecundario} value={data} onChangeText={setData} />
        <TextInput style={styles.input} placeholder="Descrição (opcional)" placeholderTextColor={cores.textoSecundario} value={descricao} onChangeText={setDescricao} />
        <View style={styles.linhaBotoes}>
          <TouchableOpacity style={styles.botao} onPress={salvar}>
            <Text style={styles.botaoTexto}>Salvar</Text>
          </TouchableOpacity>
          {editandoId && (
            <TouchableOpacity style={[styles.botao, styles.botaoSecundario]} onPress={limparFormulario}>
              <Text style={styles.botaoTextoSecundario}>Cancelar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <TextInput
        style={styles.busca}
        placeholder="Buscar por descrição ou produto..."
        placeholderTextColor={cores.textoSecundario}
        value={busca}
        onChangeText={setBusca}
      />

      <FlatList
        data={receitasFiltradas}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <View style={styles.linhaItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemValor}>{formatarMoeda(item.valor)}</Text>
              <Text style={styles.itemDetalhe}>
                {item.dataReceita}{item.produto ? ` · ${item.produto.nome}` : ""}{item.descricao ? ` · ${item.descricao}` : ""}
              </Text>
            </View>
            <TouchableOpacity onPress={() => editar(item)} style={styles.acaoBtn}>
              <Text style={styles.acaoTexto}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => excluir(item.id)} style={styles.acaoBtn}>
              <Text style={styles.acaoTextoExcluir}>Excluir</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.textoVazio}>Nenhuma receita encontrada.</Text>}
      />
    </View>
  );
}

function criarEstilos(cores, fontes) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: cores.fundo, padding: 20 },
    formulario: { backgroundColor: cores.superficie, borderRadius: 14, borderWidth: 1, borderColor: cores.borda, padding: 16, marginBottom: 16 },
    tituloForm: { fontFamily: fontes.display, fontSize: 16, color: cores.creme, marginBottom: 12 },
    input: {
      borderWidth: 1, borderColor: cores.borda, borderRadius: 8, padding: 10, marginBottom: 10,
      color: cores.creme, fontFamily: fontes.texto, fontSize: 14, backgroundColor: cores.superficieAlt,
    },
    pickerWrapper: { borderWidth: 1, borderColor: cores.borda, borderRadius: 8, marginBottom: 10, backgroundColor: cores.superficieAlt },
    busca: {
      borderWidth: 1, borderColor: cores.borda, borderRadius: 8, padding: 10, marginBottom: 12,
      color: cores.creme, fontFamily: fontes.texto, fontSize: 13, backgroundColor: cores.superficie,
    },
    linhaBotoes: { flexDirection: "row", gap: 8 },
    botao: { backgroundColor: cores.dourado, padding: 11, borderRadius: 8, flex: 1, alignItems: "center" },
    botaoTexto: { color: cores.fundo, fontFamily: fontes.textoForte, fontSize: 13 },
    botaoSecundario: { backgroundColor: "transparent", borderWidth: 1, borderColor: cores.bordaForte },
    botaoTextoSecundario: { color: cores.textoSecundario, fontFamily: fontes.textoMedio, fontSize: 13 },
    linhaItem: {
      flexDirection: "row", alignItems: "center", paddingVertical: 14,
      borderBottomWidth: 1, borderBottomColor: cores.borda,
    },
    itemValor: { fontFamily: fontes.displayForte, fontSize: 16, color: cores.verde },
    itemDetalhe: { color: cores.textoSecundario, fontFamily: fontes.texto, fontSize: 12, marginTop: 2 },
    acaoBtn: { paddingHorizontal: 8, paddingVertical: 6 },
    acaoTexto: { color: cores.dourado, fontSize: 12, fontFamily: fontes.textoMedio },
    acaoTextoExcluir: { color: cores.terracota, fontSize: 12, fontFamily: fontes.textoMedio },
    textoVazio: { textAlign: "center", color: cores.textoSecundario, fontFamily: fontes.texto, marginTop: 20, fontStyle: "italic" },
  });
}
