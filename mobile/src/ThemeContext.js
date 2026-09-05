import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { paletaEscura, paletaClara } from "./theme";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [modoClaro, setModoClaro] = useState(false);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem("modoClaro").then((valor) => {
      setModoClaro(valor === "true");
      setPronto(true);
    });
  }, []);

  async function alternarTema() {
    const novoValor = !modoClaro;
    setModoClaro(novoValor);
    await AsyncStorage.setItem("modoClaro", String(novoValor));
  }

  const cores = modoClaro ? paletaClara : paletaEscura;

  return (
    <ThemeContext.Provider value={{ cores, modoClaro, alternarTema, pronto }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTema() {
  return useContext(ThemeContext);
}
