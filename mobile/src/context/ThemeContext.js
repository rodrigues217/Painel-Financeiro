import React, { createContext, useContext, useEffect, useState } from "react";
import { paletaClara, paletaEscura, fontes } from "../theme";
import { armazenamento } from "../storage";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [modo, setModo] = useState("escuro");
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    armazenamento.lerTema().then((valor) => {
      setModo(valor === "claro" ? "claro" : "escuro");
      setPronto(true);
    });
  }, []);

  async function alternarTema() {
    const novo = modo === "escuro" ? "claro" : "escuro";
    setModo(novo);
    await armazenamento.salvarTema(novo);
  }

  const cores = modo === "claro" ? paletaClara : paletaEscura;

  return (
    <ThemeContext.Provider value={{ cores, fontes, modo, alternarTema, pronto }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTema() {
  const contexto = useContext(ThemeContext);
  if (!contexto) throw new Error("useTema precisa estar dentro de ThemeProvider");
  return contexto;
}
