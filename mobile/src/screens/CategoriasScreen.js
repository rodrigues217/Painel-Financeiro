import React, { useCallback, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { api } from "../api/client";
import { useTema } from "../context/ThemeContext";

export default function CategoriasScreen() {
  const { cores, fontes } = useTema();
  const styles = criarEstilos(cores, fontes);

  const [categorias, setCategorias] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [nome, setNome] = useState("");

  const carregar = useCallback(async () => {
    try {
      const lista = await api.listarCategorias();
      setCategorias(lista);
    } catch (e) {
      Alert.alert("Erro", "Não foi possível carregar as categorias: " + e.message);
    }
  }, []);

  useFocusEffect(useCallback(() => { carregar(); }, [carregar]));

  function limparFormulario() {
    setEditandoId(null);
    setNome("");
  }

  async function salvar() {
    if (!nome.trim()) {
      Alert.alert("Atenção", "Digite o nome da categoria.");
      return;
    }
    try {
      if (editandoId) {
        await api.editarCategoria(editandoId, nome.trim());
      } else {
        await api.criarCategoria(nome.trim());
      }
      limparFormulario();
      carregar();
    } catch (e) {
      Alert.alert("Erro", "Não foi possível salvar: " + e.message);
    }
  }

  function editar(item) {
    setEditandoId(item.id);
    setNome(item.nome);
  }

  function excluir(id) {
    Alert.alert("Confirmar", "Excluir esta categoria?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            await api.excluirCategoria(id);
            carregar();
          } catch (e) {
            Alert.alert("Não foi possível excluir", "Provavelmente há despesas vinculadas a essa categoria.");
          }
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <View style={styles.formulario}>
        <Text style={styles.tituloForm}>{editandoId ? "Editar categoria" : "Nova categoria"}</Text>
        <TextInput style={styles.input} placeholder="Nome da categoria" placeholderTextColor={cores.textoSecundario} value={nome} onChangeText={setNome} />
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

      <FlatList
        data={categorias}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.linhaItem}>
            <Text style={styles.itemNome}>{item.nome}</Text>
            <TouchableOpacity onPress={() => editar(item)} style={styles.acaoBtn}>
              <Text style={styles.acaoTexto}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => excluir(item.id)} style={styles.acaoBtn}>
              <Text style={styles.acaoTextoExcluir}>Excluir</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.textoVazio}>Nenhuma categoria cadastrada.</Text>}
      />
    </View>
  );
}

function criarEstilos(cores, fontes) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: cores.fundo, padding: 20 },
    formulario: { backgroundColor: cores.superficie, borderRadius: 14, borderWidth: 1, borderColor: cores.borda, padding: 16, marginBottom: 20 },
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
    linhaItem: {
      flexDirection: "row", alignItems: "center", paddingVertical: 14,
      borderBottomWidth: 1, borderBottomColor: cores.borda,
    },
    itemNome: { flex: 1, fontFamily: fontes.texto, fontSize: 14, color: cores.creme },
    acaoBtn: { paddingHorizontal: 8, paddingVertical: 6 },
    acaoTexto: { color: cores.dourado, fontSize: 12, fontFamily: fontes.textoMedio },
    acaoTextoExcluir: { color: cores.terracota, fontSize: 12, fontFamily: fontes.textoMedio },
    textoVazio: { textAlign: "center", color: cores.textoSecundario, fontFamily: fontes.texto, marginTop: 20, fontStyle: "italic" },
  });
}
