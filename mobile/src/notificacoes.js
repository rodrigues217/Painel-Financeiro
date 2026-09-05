import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

const IDENTIFICADOR = "lembrete-fim-mes";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function ativarLembreteFimDeMes() {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
      return { sucesso: false, motivo: "permissao_negada" };
    }
    await Notifications.cancelScheduledNotificationAsync(IDENTIFICADOR).catch(() => {});
    await Notifications.scheduleNotificationAsync({
      identifier: IDENTIFICADOR,
      content: {
        title: "Fechamento do mês chegando",
        body: "Já lançou todas as receitas e despesas desse mês no Painel Financeiro?",
      },
      trigger: {
        day: 28,
        hour: 19,
        minute: 0,
        repeats: true,
      },
    });
    return { sucesso: true };
  } catch (e) {
    return { sucesso: false, motivo: e.message };
  }
}

export async function desativarLembreteFimDeMes() {
  try {
    await Notifications.cancelScheduledNotificationAsync(IDENTIFICADOR);
  } catch {
    // sem problema se não havia nada agendado
  }
}

export const suportaNotificacaoAgendada = Platform.OS === "ios" || Platform.OS === "android";
