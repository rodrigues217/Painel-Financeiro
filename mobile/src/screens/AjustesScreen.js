import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Switch, Alert, ScrollView } from "react-native";
import { useTema } from "../context/ThemeContext";
import { armazenamento } from "../storage";
import { ativarLembreteFimDeMes, desativarLembreteFimDeMes } from "../notificacoes";
import { biometriaDisponivel } from "../bloqueio";

export default function AjustesScreen() {
  const { cores, fontes, modo, alternarTema } = useTema();
  const styles = criarEstilos(cores, fontes);

  const [notificacaoAtiva, setNotificacaoAtiva] = useState(false);
  const [pinAtual, setPinAtual] = useState(null);
  const [novoPin, setNovoPin] = useState("");
  const [temBiometria, setTemBiometria] = useState(false);

  useEffect(() => {
    armazenamento.lerNotificacaoAtiva().then(setNotificacaoAtiva);
    armazenamento.lerPin().then(setPinAtual);
    biometriaDisponivel().then(setTemBiometria);
  }, []);

  async function alternarNotificacao(valor) {
    setNotificacaoAtiva(valor);
    if (valor) {
      const resultado = await ativarLembreteFimDeMes();
      if (!resultado.sucesso) {
        setNotificacaoAtiva(false);
        Alert.alert("Não foi possível ativar", "Verifique se as notificações estão permitidas para o app nas configurações do celular.");
        return;
      }
    } else {
      await desativarLembreteFimDeMes();
    }
    await armazenamento.salvarNotificacaoAtiva(valor);
  }

  async function salvarPin() {
    if (novoPin.length < 4) {
      Alert.alert("Atenção", "Use um PIN com pelo menos 4 dígitos.");
      return;
    }
    await armazenamento.salvarPin(novoPin);
    setPinAtual(novoPin);
    setNovoPin("");
    Alert.alert("Pronto", "PIN definido. O app vai pedir esse código toda vez que abrir.");
  }

  async function removerPin() {
    await armazenamento.removerPin();
    setPinAtual(null);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.secao}>
        <View style={styles.linha}>
          <Text style={styles.linhaLabel}>Modo claro</Text>
          <Switch
            value={modo === "claro"}
            onValueChange={alternarTema}
            trackColor={{ false: cores.superficieAlt, true: cores.dourado }}
            thumbColor={cores.creme}
          />
        </View>
      </View>

      <View style={styles.secao}>
        <View style={styles.linha}>
          <Text style={styles.linhaLabel}>Lembrete de fim de mês</Text>
          <Switch
            value={notificacaoAtiva}
            onValueChange={alternarNotificacao}
            trackColor={{ false: cores.superficieAlt, true: cores.dourado }}
            thumbColor={cores.creme}
          />
        </View>
        <Text style={styles.legenda}>Avisa no dia 28 de cada mês pra você conferir se lançou tudo.</Text>
      </View>

      <View style={styles.secao}>
        <Text style={styles.tituloSecao}>Travar o app com PIN{temBiometria ? " ou biometria" : ""}</Text>
        {pinAtual ? (
          <>
            <Text style={styles.legenda}>PIN ativo. O app vai pedir esse código (ou biometria) toda vez que abrir.</Text>
            <TouchableOpacity style={[styles.botao, styles.botaoSecundario]} onPress={removerPin}>
              <Text style={styles.botaoTextoSecundario}>Remover PIN</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TextInput
              style={styles.input}
              placeholder="Criar PIN (mín. 4 dígitos)"
              placeholderTextColor={cores.textoSecundario}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={6}
              value={novoPin}
              onChangeText={setNovoPin}
            />
            <TouchableOpacity style={styles.botao} onPress={salvarPin}>
              <Text style={styles.botaoTexto}>Definir PIN</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
}

function criarEstilos(cores, fontes) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: cores.fundo, padding: 20 },
    secao: {
      backgroundColor: cores.superficie, borderRadius: 14, borderWidth: 1, borderColor: cores.borda,
      padding: 16, marginBottom: 16,
    },
    linha: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    linhaLabel: { fontFamily: fontes.textoMedio, fontSize: 14, color: cores.creme },
    legenda: { fontFamily: fontes.texto, fontSize: 12, color: cores.textoSecundario, marginTop: 8 },
    tituloSecao: { fontFamily: fontes.display, fontSize: 15, color: cores.creme, marginBottom: 8 },
    input: {
      borderWidth: 1, borderColor: cores.borda, borderRadius: 8, padding: 10, marginTop: 10, marginBottom: 10,
      color: cores.creme, fontFamily: fontes.texto, fontSize: 14, backgroundColor: cores.superficieAlt,
    },
    botao: { backgroundColor: cores.dourado, padding: 11, borderRadius: 8, alignItems: "center" },
    botaoTexto: { color: cores.fundo, fontFamily: fontes.textoForte, fontSize: 13 },
    botaoSecundario: { backgroundColor: "transparent", borderWidth: 1, borderColor: cores.bordaForte, marginTop: 10 },
    botaoTextoSecundario: { color: cores.terracota, fontFamily: fontes.textoMedio, fontSize: 13 },
  });
}
