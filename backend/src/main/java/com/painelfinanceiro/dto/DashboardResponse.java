package com.painelfinanceiro.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class DashboardResponse {

    private LocalDate periodoInicio;
    private LocalDate periodoFim;
    private BigDecimal totalReceita;
    private BigDecimal totalDespesa;
    private BigDecimal margemLucro;
    private List<TotalCategoriaDTO> despesasPorCategoria;

    public DashboardResponse(LocalDate periodoInicio, LocalDate periodoFim, BigDecimal totalReceita,
                              BigDecimal totalDespesa, List<TotalCategoriaDTO> despesasPorCategoria) {
        this.periodoInicio = periodoInicio;
        this.periodoFim = periodoFim;
        this.totalReceita = totalReceita;
        this.totalDespesa = totalDespesa;
        this.margemLucro = totalReceita.subtract(totalDespesa);
        this.despesasPorCategoria = despesasPorCategoria;
    }

    public LocalDate getPeriodoInicio() { return periodoInicio; }
    public LocalDate getPeriodoFim() { return periodoFim; }
    public BigDecimal getTotalReceita() { return totalReceita; }
    public BigDecimal getTotalDespesa() { return totalDespesa; }
    public BigDecimal getMargemLucro() { return margemLucro; }
    public List<TotalCategoriaDTO> getDespesasPorCategoria() { return despesasPorCategoria; }
}
