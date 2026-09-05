import { CATEGORIAS_DEMO, RECEITAS_DEMO, DESPESAS_DEMO, PRODUTOS_DEMO } from "./dadosDemo";

// Ative para ver o app funcionando com dados de exemplo, sem precisar
// rodar o backend (Java/Maven). Volte para "false" quando o backend
// estiver rodando e você quiser usar dados reais.
const MODO_DEMO = true;

// Ajuste este endereço conforme onde o backend estiver rodando (só importa
// quando MODO_DEMO = false).
// - Emulador Android: use 10.0.2.2 no lugar de localhost
// - Celular físico: use o IP da sua máquina na rede local (ex: 192.168.0.10)
export const API_BASE = "http://10.0.2.2:8080/api";

function aguardar(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function requisitar(caminho, opcoes = {}) {
  const resposta = await fetch(`${API_BASE}${caminho}`, {
    headers: { "Content-Type": "application/json" },
    ...opcoes,
  });
  if (!resposta.ok) {
    const texto = await resposta.text().catch(() => "");
    throw new Error(texto || `Erro na requisição (${resposta.status})`);
  }
  if (resposta.status === 204) return null;
  return resposta.json();
}

const apiReal = {
  // Dashboard
  buscarDashboard: (inicio, fim) =>
    requisitar(`/dashboard?inicio=${inicio}&fim=${fim}`),

  // Categorias
  listarCategorias: () => requisitar("/categorias"),
  criarCategoria: (nome) =>
    requisitar("/categorias", { method: "POST", body: JSON.stringify({ nome }) }),
  editarCategoria: (id, nome) =>
    requisitar(`/categorias/${id}`, { method: "PUT", body: JSON.stringify({ nome }) }),
  excluirCategoria: (id) => requisitar(`/categorias/${id}`, { method: "DELETE" }),

  // Produtos
  listarProdutos: () => requisitar("/produtos"),
  criarProduto: (dados) => requisitar("/produtos", { method: "POST", body: JSON.stringify(dados) }),
  editarProduto: (id, dados) => requisitar(`/produtos/${id}`, { method: "PUT", body: JSON.stringify(dados) }),
  excluirProduto: (id) => requisitar(`/produtos/${id}`, { method: "DELETE" }),

  // Receitas
  listarReceitas: () => requisitar("/receitas"),
  criarReceita: (dados) =>
    requisitar("/receitas", { method: "POST", body: JSON.stringify(dados) }),
  editarReceita: (id, dados) =>
    requisitar(`/receitas/${id}`, { method: "PUT", body: JSON.stringify(dados) }),
  excluirReceita: (id) => requisitar(`/receitas/${id}`, { method: "DELETE" }),

  // Despesas
  listarDespesas: () => requisitar("/despesas"),
  criarDespesa: (dados) =>
    requisitar("/despesas", { method: "POST", body: JSON.stringify(dados) }),
  editarDespesa: (id, dados) =>
    requisitar(`/despesas/${id}`, { method: "PUT", body: JSON.stringify(dados) }),
  excluirDespesa: (id) => requisitar(`/despesas/${id}`, { method: "DELETE" }),
};

// Versão "de mentira" da API: em memória, some ao recarregar o app.
// Serve só pra você navegar pelas telas e ver o funcionamento.
let categorias = [...CATEGORIAS_DEMO];
let produtos = [...PRODUTOS_DEMO];
let receitas = [...RECEITAS_DEMO];
let despesas = [...DESPESAS_DEMO];
let proximoId = 100;

const apiDemo = {
  buscarDashboard: async (inicio, fim) => {
    await aguardar(150);
    const dentroDoPeriodo = (data) => (!inicio || data >= inicio) && (!fim || data <= fim);
    const receitasPeriodo = receitas.filter((r) => dentroDoPeriodo(r.dataReceita));
    const despesasPeriodo = despesas.filter((d) => dentroDoPeriodo(d.dataDespesa));
    const totalReceita = receitasPeriodo.reduce((s, r) => s + r.valor, 0);
    const totalDespesa = despesasPeriodo.reduce((s, d) => s + d.valor, 0);
    const porCategoria = categorias
      .map((c) => ({
        categoria: c.nome,
        total: despesasPeriodo.filter((d) => d.categoria.id === c.id).reduce((s, d) => s + d.valor, 0),
      }))
      .filter((c) => c.total > 0);
    return { totalReceita, totalDespesa, margemLucro: totalReceita - totalDespesa, despesasPorCategoria: porCategoria };
  },

  listarCategorias: async () => { await aguardar(200); return categorias; },
  criarCategoria: async (nome) => {
    await aguardar(200);
    const nova = { id: proximoId++, nome };
    categorias = [...categorias, nova];
    return nova;
  },
  editarCategoria: async (id, nome) => {
    await aguardar(200);
    categorias = categorias.map((c) => (c.id === id ? { ...c, nome } : c));
    return categorias.find((c) => c.id === id);
  },
  excluirCategoria: async (id) => {
    await aguardar(200);
    if (despesas.some((d) => d.categoria.id === id)) {
      throw new Error("Não é possível excluir: existem despesas vinculadas a essa categoria.");
    }
    categorias = categorias.filter((c) => c.id !== id);
  },

  listarProdutos: async () => { await aguardar(200); return produtos; },
  criarProduto: async (dados) => {
    await aguardar(200);
    const novo = { id: proximoId++, nome: dados.nome, custoUnitario: dados.custoUnitario || null };
    produtos = [...produtos, novo];
    return novo;
  },
  editarProduto: async (id, dados) => {
    await aguardar(200);
    produtos = produtos.map((p) => (p.id === id ? { ...p, nome: dados.nome, custoUnitario: dados.custoUnitario || null } : p));
    return produtos.find((p) => p.id === id);
  },
  excluirProduto: async (id) => {
    await aguardar(200);
    if (receitas.some((r) => r.produto && r.produto.id === id)) {
      throw new Error("Não é possível excluir: existem receitas vinculadas a esse produto.");
    }
    produtos = produtos.filter((p) => p.id !== id);
  },

  listarReceitas: async () => { await aguardar(200); return [...receitas].sort((a, b) => (a.dataReceita < b.dataReceita ? 1 : -1)); },
  criarReceita: async (dados) => {
    await aguardar(200);
    const produto = produtos.find((p) => p.id === dados.produtoId) || null;
    const nova = { id: proximoId++, valor: dados.valor, descricao: dados.descricao, dataReceita: dados.dataReceita, produto };
    receitas = [...receitas, nova];
    return nova;
  },
  editarReceita: async (id, dados) => {
    await aguardar(200);
    const produto = produtos.find((p) => p.id === dados.produtoId) || null;
    receitas = receitas.map((r) => (r.id === id ? { ...r, valor: dados.valor, descricao: dados.descricao, dataReceita: dados.dataReceita, produto } : r));
    return receitas.find((r) => r.id === id);
  },
  excluirReceita: async (id) => { await aguardar(200); receitas = receitas.filter((r) => r.id !== id); },

  listarDespesas: async () => { await aguardar(200); return [...despesas].sort((a, b) => (a.dataDespesa < b.dataDespesa ? 1 : -1)); },
  criarDespesa: async (dados) => {
    await aguardar(200);
    const categoria = categorias.find((c) => c.id === dados.categoriaId);
    const nova = { id: proximoId++, valor: dados.valor, descricao: dados.descricao, dataDespesa: dados.dataDespesa, categoria };
    despesas = [...despesas, nova];
    return nova;
  },
  editarDespesa: async (id, dados) => {
    await aguardar(200);
    const categoria = categorias.find((c) => c.id === dados.categoriaId);
    despesas = despesas.map((d) => (d.id === id ? { ...d, valor: dados.valor, descricao: dados.descricao, dataDespesa: dados.dataDespesa, categoria } : d));
    return despesas.find((d) => d.id === id);
  },
  excluirDespesa: async (id) => { await aguardar(200); despesas = despesas.filter((d) => d.id !== id); },
};

export const api = MODO_DEMO ? apiDemo : apiReal;
