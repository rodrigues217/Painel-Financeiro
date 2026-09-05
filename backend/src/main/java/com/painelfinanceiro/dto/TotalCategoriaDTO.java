package com.painelfinanceiro.dto;

import java.math.BigDecimal;

public class TotalCategoriaDTO {
    private String categoria;
    private BigDecimal total;

    public TotalCategoriaDTO(String categoria, BigDecimal total) {
        this.categoria = categoria;
        this.total = total;
    }

    public String getCategoria() { return categoria; }
    public BigDecimal getTotal() { return total; }
}
