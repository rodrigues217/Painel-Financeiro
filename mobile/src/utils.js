export function formatarMoeda(valor) {
  const numero = Number(valor || 0);
  return numero.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function primeiroEUltimoDiaDoMesAtual() {
  const hoje = new Date();
  return primeiroEUltimoDiaDoMes(hoje.getFullYear(), hoje.getMonth());
}

export function primeiroEUltimoDiaDoMes(ano, mesIndice) {
  const inicio = new Date(ano, mesIndice, 1);
  const fim = new Date(ano, mesIndice + 1, 0);
  const paraISO = (d) => d.toISOString().slice(0, 10);
  return [paraISO(inicio), paraISO(fim)];
}

// Retorna os últimos `quantidade` meses (mais antigo primeiro), cada um com
// label curto ("mai/26") e o período (início/fim) pra consultar o dashboard.
export function ultimosMeses(quantidade = 6) {
  const hoje = new Date();
  const meses = [];
  for (let i = quantidade - 1; i >= 0; i--) {
    const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    const [inicio, fim] = primeiroEUltimoDiaDoMes(data.getFullYear(), data.getMonth());
    const label = data.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }).replace(".", "");
    meses.push({ label, inicio, fim });
  }
  return meses;
}

function linhaCsv(campos) {
  return campos.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(";");
}

export function montarRelatorioCsv({ periodoLabel, receitas, despesas, totalReceita, totalDespesa }) {
  const linhas = [];
  linhas.push(`Relatório financeiro - ${periodoLabel}`);
  linhas.push("");
  linhas.push("Receitas");
  linhas.push(linhaCsv(["Data", "Valor", "Descrição"]));
  receitas.forEach((r) => linhas.push(linhaCsv([r.dataReceita, r.valor, r.descricao || ""])));
  linhas.push(linhaCsv(["", "Total", totalReceita.toFixed(2)]));
  linhas.push("");
  linhas.push("Despesas");
  linhas.push(linhaCsv(["Data", "Categoria", "Valor", "Descrição"]));
  despesas.forEach((d) => linhas.push(linhaCsv([d.dataDespesa, d.categoria?.nome || "", d.valor, d.descricao || ""])));
  linhas.push(linhaCsv(["", "", "Total", totalDespesa.toFixed(2)]));
  linhas.push("");
  linhas.push(linhaCsv(["Margem de lucro", (totalReceita - totalDespesa).toFixed(2)]));
  return linhas.join("\n");
}
