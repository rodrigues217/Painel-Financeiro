import AsyncStorage from "@react-native-async-storage/async-storage";

const CHAVES = {
  meta: "@painel_financeiro/meta_lucro",
  tema: "@painel_financeiro/tema",
  notificacao: "@painel_financeiro/notificacao_fim_mes",
  pin: "@painel_financeiro/pin",
};

async function lerSeguro(chave) {
  try {
    return await AsyncStorage.getItem(chave);
  } catch {
    return null;
  }
}

async function salvarSeguro(chave, valor) {
  try {
    if (valor === null || valor === undefined) {
      await AsyncStorage.removeItem(chave);
    } else {
      await AsyncStorage.setItem(chave, String(valor));
    }
    return true;
  } catch {
    return false;
  }
}

export const armazenamento = {
  lerMeta: async () => {
    const valor = await lerSeguro(CHAVES.meta);
    return valor ? parseFloat(valor) : null;
  },
  salvarMeta: (valor) => salvarSeguro(CHAVES.meta, valor),

  lerTema: async () => (await lerSeguro(CHAVES.tema)) || "escuro",
  salvarTema: (tema) => salvarSeguro(CHAVES.tema, tema),

  lerNotificacaoAtiva: async () => (await lerSeguro(CHAVES.notificacao)) === "true",
  salvarNotificacaoAtiva: (ativa) => salvarSeguro(CHAVES.notificacao, ativa ? "true" : "false"),

  lerPin: () => lerSeguro(CHAVES.pin),
  salvarPin: (pin) => salvarSeguro(CHAVES.pin, pin),
  removerPin: () => salvarSeguro(CHAVES.pin, null),
};
