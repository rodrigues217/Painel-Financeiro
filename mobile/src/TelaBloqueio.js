import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTema } from "./context/ThemeContext";
import { armazenamento } from "./storage";
import { biometriaDisponivel, autenticarComBiometria } from "./bloqueio";

export default function TelaBloqueio({ onDesbloquear }) {
  const { cores, fontes } = useTema();
  const styles = criarEstilos(cores, fontes);
  const [pinDigitado, setPinDigitado] = useState("");
  const [temBiometria, setTemBiometria] = useState(false);

  useEffect(() => {
    biometriaDisponivel().then((disponivel) => {
      setTemBiometria(disponivel);
      if (disponivel) tentarBiometria();
    });
  }, []);

  async function tentarBiometria() {
    const ok = await autenticarComBiometria();
    if (ok) onDesbloquear();
  }

  async function conferirPin() {
    const pinSalvo = await armazenamento.lerPin();
    if (pinDigitado === pinSalvo) {
      onDesbloquear();
    } else {
      Alert.alert("PIN incorreto", "Tente novamente.");
      setPinDigitado("");
    }
  }

  return (
    <View style={styles.container}>
      <Ionicons name="lock-closed-outline" size={40} color={cores.dourado} style={{ marginBottom: 16 }} />
      <Text style={styles.titulo}>Painel Financeiro bloqueado</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite seu PIN"
        placeholderTextColor={cores.textoSecundario}
        keyboardType="number-pad"
        secureTextEntry
        maxLength={6}
        value={pinDigitado}
        onChangeText={setPinDigitado}
        onSubmitEditing={conferirPin}
      />
      <TouchableOpacity style={styles.botao} onPress={conferirPin}>
        <Text style={styles.botaoTexto}>Desbloquear</Text>
      </TouchableOpacity>
      {temBiometria && (
        <TouchableOpacity style={styles.linkBiometria} onPress={tentarBiometria}>
          <Text style={styles.linkBiometriaTexto}>Usar biometria</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function criarEstilos(cores, fontes) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: cores.fundo, alignItems: "center", justifyContent: "center", padding: 30 },
    titulo: { fontFamily: fontes.display, fontSize: 18, color: cores.creme, marginBottom: 24 },
    input: {
      width: "100%", borderWidth: 1, borderColor: cores.borda, borderRadius: 10, padding: 12,
      color: cores.creme, fontFamily: fontes.texto, fontSize: 16, backgroundColor: cores.superficie,
      textAlign: "center", marginBottom: 14, letterSpacing: 4,
    },
    botao: { backgroundColor: cores.dourado, paddingVertical: 12, borderRadius: 10, width: "100%", alignItems: "center" },
    botaoTexto: { color: cores.fundo, fontFamily: fontes.textoForte, fontSize: 14 },
    linkBiometria: { marginTop: 18 },
    linkBiometriaTexto: { color: cores.dourado, fontFamily: fontes.textoMedio, fontSize: 13 },
  });
}
