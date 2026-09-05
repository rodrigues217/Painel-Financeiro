import * as LocalAuthentication from "expo-local-authentication";

export async function biometriaDisponivel() {
  try {
    const suportado = await LocalAuthentication.hasHardwareAsync();
    const cadastrada = await LocalAuthentication.isEnrolledAsync();
    return suportado && cadastrada;
  } catch {
    return false;
  }
}

export async function autenticarComBiometria() {
  try {
    const resultado = await LocalAuthentication.authenticateAsync({
      promptMessage: "Desbloquear Painel Financeiro",
      cancelLabel: "Usar PIN",
    });
    return resultado.success;
  } catch {
    return false;
  }
}
