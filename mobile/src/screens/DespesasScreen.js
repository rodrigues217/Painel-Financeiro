import React, { useCallback, useMemo, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { api } from "../api/client";
import { formatarMoeda } from "../utils";
import { useTema } from "../context/ThemeContext";

function proximoMes(dataIso) {
  const [ano, mes, dia] = dataIso.split("-").map(Number);
  const data = new Date(ano, mes - 1 + 1, dia);
  return data.toISOString().slice(0, 10);
}

export default function DespesasScreen() {
  const { cores, fontes } = useTema();
  const styles = criarEstilos(cores, fontes);

  const [despesas, setDespesas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [busca, setBusca] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [valor, setValor] = useState("");
  const [categoriaId, setCategoriaId] = useState(null);
  const [data, setData] = useState("");
  const [descricao, setDescricao] = useState("");
  const [recorrente, setRecorrente] = useState(false);

  const carregar = useCallback(async () => {
    try {
      const [listaDespesas, listaCategorias] = await Promise.all([
        api.listarDespesas(),
        api.listarCategorias(),
      ]);
      setDespesas(listaDespesas);
      setCategorias(listaCategorias);
      if (!categoriaId && listaCategorias.length > 0) {
        setCategoriaId(listaCategorias[0].id);
      }
    } catch (e) {
      Alert.alert("Erro", "Não foi possível carregar as despesas: " + e.message);
    }
  }, [categoriaId]);

  useFocusEffect(useCallback(() => { carregar(); }, []));

  const despesasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return despesas;
    return despesas.filter((d) =>
      (d.descricao || "").toLowerCase().includes(termo) ||
      (d.categoria?.nome || "").toLowerCase().includes(termo)
    );
  }, [despesas, busca]);

  function limparFormulario() {
    setEditandoId(null);
    setValor("");
    setData("");
    setDescricao("");
    setRecorrente(false);
  }

  async function salvar() {
    if (!valor || !data || !categoriaId) {
      Alert.alert("Atenção", "Preencha valor, categoria e data.");
      return;
    }
    const corpo = { valor: parseFloat(valor), categoriaId, dataDespesa: data, descricao: descricao || null };
    try {
      if (editandoId) {
        await api.editarDespesa(editandoId, corpo);
      } else {
        await api.criarDespesa(corpo);
        if (recorrente) {
          await api.criarDespesa({ ...corpo, dataDespesa: proximoMes(data) });
        }
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
    setCategoriaId(item.categoria.id);
    setData(item.dataDespesa);
    setDescricao(item.descricao || "");
  }

  function excluir(id) {
    Alert.alert("Confirmar", "Excluir esta despesa?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            await api.excluirDespesa(id);
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
        <Text style={styles.tituloForm}>{editandoId ? "Editar despesa" : "Nova despesa"}</Text>
        <TextInput style={styles.input} placeholder="Valor (ex: 50.00)" placeholderTextColor={cores.textoSecundario} keyboardType="decimal-pad" value={valor} onChangeText={setValor} />
        <View style={styles.pickerWrapper}>
          <Picker selectedValue={categoriaId} onValueChange={setCategoriaId} style={{ color: cores.creme }} dropdownIconColor={cores.dourado}>
            {categorias.map((c) => (
              <Picker.Item key={c.id} label={c.nome} value={c.id} color={cores.creme} />
            ))}
          </Picker>
        </View>
        <TextInput style={styles.input} placeholder="Data (AAAA-MM-DD)" placeholderTextColor={cores.textoSecundario} value={data} onChangeText={setData} />
        <TextInput style={styles.input} placeholder="Descrição (opcional)" placeholderTextColor={cores.textoSecundario} value={descricao} onChangeText={setDescricao} />

        {!editandoId && (
          <TouchableOpacity style={styles.linhaCheckbox} onPress={() => setRecorrente(!recorrente)}>
            <Ionicons name={recorrente ? "checkbox" : "square-outline"} size={20} color={cores.dourado} />
            <Text style={styles.checkboxTexto}>Repetir automaticamente no mês seguinte</Text>
          </TouchableOpacity>
        )}

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
        placeholder="Buscar por descrição ou categoria..."
        placeholderTextColor={cores.textoSecundario}
        value={busca}
        onChangeText={setBusca}
      />

      <FlatList
        data={despesasFiltradas}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <View style={styles.linhaItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemValor}>{formatarMoeda(item.valor)}</Text>
              <Text style={styles.itemDetalhe}>
                {item.dataDespesa} · {item.categoria.nome}{item.descricao ? ` · ${item.descricao}` : ""}
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
        ListEmptyComponent={<Text style={styles.textoVazio}>Nenhuma despesa encontrada.</Text>}
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
    linhaCheckbox: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
    checkboxTexto: { fontFamily: fontes.texto, fontSize: 12, color: cores.textoSecundario, flex: 1 },
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
    itemValor: { fontFamily: fontes.displayForte, fontSize: 16, color: cores.terracota },
    itemDetalhe: { color: cores.textoSecundario, fontFamily: fontes.texto, fontSize: 12, marginTop: 2 },
    acaoBtn: { paddingHorizontal: 8, paddingVertical: 6 },
    acaoTexto: { color: cores.dourado, fontSize: 12, fontFamily: fontes.textoMedio },
    acaoTextoExcluir: { color: cores.terracota, fontSize: 12, fontFamily: fontes.textoMedio },
    textoVazio: { textAlign: "center", color: cores.textoSecundario, fontFamily: fontes.texto, marginTop: 20, fontStyle: "italic" },
  });
}
