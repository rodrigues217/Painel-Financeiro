-- Script de referência: o Hibernate (ddl-auto=update) já cria essas tabelas
-- automaticamente ao rodar a aplicação. Use este script apenas se quiser
-- criar o banco manualmente antes de subir o backend.

CREATE DATABASE IF NOT EXISTS painel_financeiro
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE painel_financeiro;

CREATE TABLE IF NOT EXISTS categorias_despesa (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(80) NOT NULL UNIQUE,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS produtos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    custo_unitario DECIMAL(10,2) NULL,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS despesas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    categoria_id INT NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    descricao VARCHAR(255) NULL,
    data_despesa DATE NOT NULL,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_despesa_categoria FOREIGN KEY (categoria_id) REFERENCES categorias_despesa(id)
);

CREATE TABLE IF NOT EXISTS receitas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    valor DECIMAL(10,2) NOT NULL,
    produto_id INT NULL,
    descricao VARCHAR(255) NULL,
    data_receita DATE NOT NULL,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_receita_produto FOREIGN KEY (produto_id) REFERENCES produtos(id)
);

INSERT IGNORE INTO categorias_despesa (nome) VALUES
    ('Custo de Produto'),
    ('Logística/Frete'),
    ('Funcionário'),
    ('Outros');
