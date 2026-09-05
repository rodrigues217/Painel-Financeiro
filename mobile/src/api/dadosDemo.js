// Dados fixos usados apenas quando MODO_DEMO está ativo em client.js,
// para visualizar o app sem precisar rodar o backend. As datas são
// calculadas em relação a hoje, pra sempre caírem dentro do "mês atual"
// que o dashboard mostra por padrão.

function diasAtras(quantidade) {
  const hoje = new Date();
  // Trava o recuo para não ultrapassar o primeiro dia do mês atual
  // (evita que os dados de exemplo "vazem" pro mês anterior nos primeiros dias do mês).
  const recuo = Math.min(quantidade, hoje.getDate() - 1);
  const data = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - recuo);
  return data.toISOString().slice(0, 10);
}

export const CATEGORIAS_DEMO = [
  { id: 1, nome: "Custo de Produto" },
  { id: 2, nome: "Logística/Frete" },
  { id: 3, nome: "Funcionário" },
  { id: 4, nome: "Outros" },
];

export const PRODUTOS_DEMO = [
  { id: 1, nome: "Kaiak 100ml", custoUnitario: 60.0 },
  { id: 2, nome: "Egeo 90ml", custoUnitario: 40.0 },
  { id: 3, nome: "Malbec 100ml", custoUnitario: 70.0 },
];

export const RECEITAS_DEMO = [
  { id: 1, valor: 180.0, dataReceita: diasAtras(1), descricao: "Venda balcão", produto: PRODUTOS_DEMO[0] },
  { id: 2, valor: 95.5, dataReceita: diasAtras(2), descricao: "Venda online", produto: PRODUTOS_DEMO[1] },
  { id: 3, valor: 220.0, dataReceita: diasAtras(3), descricao: "Venda balcão", produto: PRODUTOS_DEMO[2] },
];

export const DESPESAS_DEMO = [
  { id: 1, valor: 320.0, categoria: CATEGORIAS_DEMO[0], dataDespesa: diasAtras(2), descricao: "Compra de lote de perfumes" },
  { id: 2, valor: 45.0, categoria: CATEGORIAS_DEMO[1], dataDespesa: diasAtras(1), descricao: "Frete dos correios" },
  { id: 3, valor: 60.0, categoria: CATEGORIAS_DEMO[3], dataDespesa: diasAtras(4), descricao: "Embalagens" },
];
