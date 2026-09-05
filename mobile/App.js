import React, { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer, DarkTheme, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import * as SplashScreen from "expo-splash-screen";
import {
  useFonts as useFraunces,
  Fraunces_500Medium,
  Fraunces_600SemiBold,
} from "@expo-google-fonts/fraunces";
import {
  useFonts as useInter,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";

import DashboardScreen from "./src/screens/DashboardScreen";
import ReceitasScreen from "./src/screens/ReceitasScreen";
import DespesasScreen from "./src/screens/DespesasScreen";
import CategoriasScreen from "./src/screens/CategoriasScreen";
import ProdutosScreen from "./src/screens/ProdutosScreen";
import AjustesScreen from "./src/screens/AjustesScreen";
import TelaBloqueio from "./src/TelaBloqueio";
import { ThemeProvider, useTema } from "./src/context/ThemeContext";
import { armazenamento } from "./src/storage";

SplashScreen.preventAutoHideAsync().catch(() => {});

const Tab = createBottomTabNavigator();

const ICONES = {
  Dashboard: "sparkles-outline",
  Receitas: "trending-up-outline",
  Despesas: "receipt-outline",
  Categorias: "pricetag-outline",
  Produtos: "flask-outline",
  Ajustes: "settings-outline",
};

function AppInterno() {
  const { cores, fontes, pronto } = useTema();
  const [fontesFrauncesCarregadas] = useFraunces({ Fraunces_500Medium, Fraunces_600SemiBold });
  const [fontesInterCarregadas] = useInter({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold });
  const [verificandoPin, setVerificandoPin] = useState(true);
  const [bloqueado, setBloqueado] = useState(false);

  const fontesProntas = fontesFrauncesCarregadas && fontesInterCarregadas && pronto;

  useEffect(() => {
    armazenamento.lerPin().then((pin) => {
      setBloqueado(!!pin);
      setVerificandoPin(false);
    });
  }, []);

  const aoLayoutRaiz = useCallback(async () => {
    if (fontesProntas && !verificandoPin) {
      await SplashScreen.hideAsync();
    }
  }, [fontesProntas, verificandoPin]);

  if (!fontesProntas || verificandoPin) {
    return <View style={{ flex: 1, backgroundColor: cores.fundo }} />;
  }

  if (bloqueado) {
    return <TelaBloqueio onDesbloquear={() => setBloqueado(false)} />;
  }

  const temaNavegacao = {
    ...(cores.statusBar === "light" ? DarkTheme : DefaultTheme),
    colors: {
      ...(cores.statusBar === "light" ? DarkTheme.colors : DefaultTheme.colors),
      background: cores.fundo,
      card: cores.superficie,
      text: cores.creme,
      border: cores.borda,
      primary: cores.dourado,
    },
  };

  return (
    <NavigationContainer theme={temaNavegacao} onReady={aoLayoutRaiz}>
      <StatusBar style={cores.statusBar} />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerStyle: { backgroundColor: cores.fundo, shadowOpacity: 0, elevation: 0 },
          headerTitleStyle: { color: cores.creme, fontFamily: fontes.display, fontSize: 19 },
          headerTintColor: cores.creme,
          tabBarStyle: {
            backgroundColor: cores.superficie,
            borderTopColor: cores.borda,
            height: 64,
            paddingBottom: 10,
            paddingTop: 6,
          },
          tabBarLabelStyle: { fontFamily: fontes.textoMedio, fontSize: 10 },
          tabBarActiveTintColor: cores.dourado,
          tabBarInactiveTintColor: cores.textoSecundario,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={ICONES[route.name]} size={size - 4} color={color} />
          ),
        })}
      >
        <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: "Painel Financeiro" }} />
        <Tab.Screen name="Receitas" component={ReceitasScreen} />
        <Tab.Screen name="Despesas" component={DespesasScreen} />
        <Tab.Screen name="Produtos" component={ProdutosScreen} />
        <Tab.Screen name="Categorias" component={CategoriasScreen} />
        <Tab.Screen name="Ajustes" component={AjustesScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppInterno />
    </ThemeProvider>
  );
}
