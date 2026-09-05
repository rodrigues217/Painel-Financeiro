import React, { useCallback, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { api } from "../api/client";
import { formatarMoeda } from "../utils";
import { useTema } from "../context/ThemeContext";

export default function ProdutosScreen() {
  const { cores, fontes } = useTema();
  const styles = criarEstilos(cores, fontes);

  const [produtos, setProdutos] = useState([]);
  const [receitas, setReceitas] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [nome, setNome] = useState("");
  const [custo, setCusto] = useState("");

  const carregar = useCallback(async () => {
    try {
      const [listaProdutos, listaReceitas] = await Promise.all([api.listarProdutos(), api.listarReceitas()]);
      setProdutos(listaProdutos);
      setReceitas(listaReceitas);
    } catch (e) {
      Alert.alert("Erro", "Não foi possível carregar os produtos: " + e.message);
    }
  }, []);

  useFocusEffect(useCallback(() => { carregar(); }, [carregar]));

  function limparFormulario() {
    setEditandoId(null);
    setNome("");
    setCusto("");
  }

  async function salvar() {
    if (!nome.trim()) {
      Alert.alert("Atenção", "Digite o nome do produto.");
      return;
    }
    const corpo = { nome: nome.trim(), custoUnitario: custo ? parseFloat(custo) : null };
    try {
      if (editandoId) {
        await api.editarProduto(editandoId, corpo);
      } else {
        await api.criarProduto(corpo);
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
    setCusto(item.custoUnitario != null ? String(item.custoUnitario) : "");
  }

  function excluir(id) {
    Alert.alert("Confirmar", "Excluir este produto?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            await api.excluirProduto(id);
            carregar();
          } catch (e) {
            Alert.alert("Não foi possível excluir", e.message || "Provavelmente há receitas vinculadas a esse produto.");
          }
        },
      },
    ]);
  }

  function vendasEReceitaDoProduto(produtoId) {
    const doProduto = receitas.filter((r) => r.produto && r.produto.id === produtoId);
    const totalReceita = doProduto.reduce((s, r) => s + r.valor, 0);
    return { quantidade: doProduto.length, totalReceita };
  }

  return (
    <View style={styles.container}>
      <View style={styles.formulario}>
        <Text style={styles.tituloForm}>{editandoId ? "Editar produto" : "Novo produto"}</Text>
        <TextInput style={styles.input} placeholder="Nome do produto (ex: Kaiak 100ml)" placeholderTextColor={cores.textoSecundario} value={nome} onChangeText={setNome} />
        <TextInput style={styles.input} placeholder="Custo unitário (opcional)" placeholderTextColor={cores.textoSecundario} keyboardType="decimal-pad" value={custo} onChangeText={setCusto} />
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
        data={produtos}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => {
          const { quantidade, totalReceita } = vendasEReceitaDoProduto(item.id);
          const custoTotal = item.custoUnitario ? item.custoUnitario * quantidade : null;
          const lucroEstimado = custoTotal != null ? totalReceita - custoTotal : null;
          return (
            <View style={styles.linhaItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemNome}>{item.nome}</Text>
                <Text style={styles.itemDetalhe}>
                  {quantidade} venda{quantidade !== 1 ? "s" : ""} · {formatarMoeda(totalReceita)} em receita
                  {lucroEstimado != null ? ` · lucro estimado ${formatarMoeda(lucroEstimado)}` : ""}
                </Text>
              </View>
              <TouchableOpacity onPress={() => editar(item)} style={styles.acaoBtn}>
                <Text style={styles.acaoTexto}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => excluir(item.id)} style={styles.acaoBtn}>
                <Text style={styles.acaoTextoExcluir}>Excluir</Text>
              </TouchableOpacity>
            </View>
          );
        }}
        ListEmptyComponent={<Text style={styles.textoVazio}>Nenhum produto cadastrado.</Text>}
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
    itemNome: { fontFamily: fontes.displayForte, fontSize: 15, color: cores.creme },
    itemDetalhe: { color: cores.textoSecundario, fontFamily: fontes.texto, fontSize: 11, marginTop: 3 },
    acaoBtn: { paddingHorizontal: 8, paddingVertical: 6 },
    acaoTexto: { color: cores.dourado, fontSize: 12, fontFamily: fontes.textoMedio },
    acaoTextoExcluir: { color: cores.terracota, fontSize: 12, fontFamily: fontes.textoMedio },
    textoVazio: { textAlign: "center", color: cores.textoSecundario, fontFamily: fontes.texto, marginTop: 20, fontStyle: "italic" },
  });
}
