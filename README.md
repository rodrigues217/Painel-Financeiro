# Painel Financeiro - Controle de Vendas de Perfumes

Projeto baseado nos requisitos enviados: backend em **Spring Boot** (Java 17)
e app mobile em **React Native (Expo)**, rodando em Android e iOS a partir do
mesmo código.

## Estrutura

```
painel-financeiro/
├── backend/        -> API REST (Spring Boot + JPA)
│   └── scripts/schema.sql  -> script SQL de referência (opcional)
└── mobile/         -> App React Native (Expo)
```

## O que tem no app

- **Dashboard**: margem de lucro, receita/despesa do período, meta de lucro
  mensal (toque no card pra definir), comparativo dos últimos 6 meses e
  exportação do relatório do período (abre o menu de compartilhar do celular
  com um resumo em CSV).
- **Receitas**: cadastro com vínculo opcional a um produto, busca por
  descrição/produto.
- **Despesas**: cadastro por categoria, opção "repetir automaticamente no mês
  seguinte" (cria uma cópia com a mesma categoria/valor/descrição pro próximo
  mês), busca por descrição/categoria.
- **Produtos**: cadastro de produtos com custo unitário opcional; a lista
  mostra quantas vendas e quanto de receita cada um gerou, com lucro estimado
  quando o custo foi informado.
- **Categorias**: igual antes.
- **Ajustes**: modo claro/escuro, lembrete de fim de mês (notificação local
  todo dia 28) e travar o app com PIN (ou biometria, se o celular tiver).

## Só quer ver como fica (sem backend)?

O app já vem com **modo demo ativado**, usando dados de exemplo fixos em
`mobile/src/api/dadosDemo.js` — não precisa rodar o backend, nem instalar
Java ou Maven. Só isso:
```bash
cd mobile
npm install
npx expo start
```
E escaneia o QR code com o Expo Go, ou roda `npx expo start --web` pra abrir
no navegador do PC. Dá pra navegar por todas as telas e até cadastrar/editar/
excluir — só que os dados ficam só na memória do app e somem ao recarregar.

Quando quiser conectar no backend de verdade (Spring Boot + banco), abra
`mobile/src/api/client.js` e troque `const MODO_DEMO = true` para `false`.
Aí sim os passos abaixo do backend passam a valer.

## Como rodar o backend

Pré-requisitos: Java 17 e Maven instalados.

### Opção 1 - Rápida, sem instalar MySQL (banco H2 em memória)
```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=h2
```
Os dados somem quando a aplicação é reiniciada (bom só para testar).

### Opção 2 - Com MySQL local (uso normal)
1. Tenha um MySQL rodando localmente (usuário `root`, sem senha, por padrão).
2. Ajuste `backend/src/main/resources/application.properties` se seu usuário/senha
   forem diferentes.
3. Rode:
```bash
cd backend
mvn spring-boot:run
```
O banco `painel_financeiro` e as tabelas são criados automaticamente
(`ddl-auto=update`), e as 4 categorias padrão já entram cadastradas.

A API sobe em `http://localhost:8080/api`.

## Como rodar o app mobile (React Native / Expo)

Pré-requisitos: Node.js instalado, e o app **Expo Go** no seu celular
(Android/iOS) — ou um emulador Android/simulador iOS configurado.

```bash
cd mobile
npm install
npx expo start
```
Isso abre um QR code no terminal/navegador: escaneie com o app Expo Go no
celular para abrir o app de verdade, sem precisar compilar nada.

**Importante — endereço da API:** ajuste `API_BASE` em `mobile/src/api/client.js`
conforme onde você testar:
- Emulador Android: `http://10.0.2.2:8080/api` (já é o valor padrão)
- Simulador iOS: `http://localhost:8080/api`
- Celular físico (via Expo Go): use o IP da sua máquina na rede local, ex.
  `http://192.168.0.10:8080/api` (celular e computador precisam estar na
  mesma rede Wi-Fi)

Quando quiser gerar o `.apk`/`.aab` (Android) ou `.ipa` (iOS) para instalar
fora do Expo Go, use o [EAS Build](https://docs.expo.dev/build/introduction/)
(`npx eas build`), que compila o app de verdade na nuvem da Expo.

## Endpoints principais

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/dashboard?inicio=YYYY-MM-DD&fim=YYYY-MM-DD` | Totais do período + despesas por categoria |
| GET/POST | `/api/receitas` | Listar / cadastrar receita |
| PUT/DELETE | `/api/receitas/{id}` | Editar / excluir receita |
| GET/POST | `/api/despesas` | Listar / cadastrar despesa |
| PUT/DELETE | `/api/despesas/{id}` | Editar / excluir despesa |
| GET/POST | `/api/categorias` | Listar / cadastrar categoria |
| PUT/DELETE | `/api/categorias/{id}` | Editar / excluir categoria |

## Observações

- Excluir uma categoria que já tem despesas vinculadas retorna erro 409
  (a chave estrangeira no banco impede a exclusão), conforme previsto nos
  requisitos.
- O CORS já está liberado para qualquer origem (`config/CorsConfig.java`),
  então o app mobile pode chamar a API de qualquer endereço local.
- Este projeto não tem relação com o Marmitech — é um sistema novo e
  independente, embora siga o mesmo padrão de perfis H2 (teste) / MySQL
  (produção) que você já usa lá.
