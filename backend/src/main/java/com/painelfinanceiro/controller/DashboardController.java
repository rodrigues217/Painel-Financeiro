package com.painelfinanceiro.controller;

import com.painelfinanceiro.dto.DashboardResponse;
import com.painelfinanceiro.dto.TotalCategoriaDTO;
import com.painelfinanceiro.repository.DespesaRepository;
import com.painelfinanceiro.repository.ReceitaRepository;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final ReceitaRepository receitaRepository;
    private final DespesaRepository despesaRepository;

    public DashboardController(ReceitaRepository receitaRepository, DespesaRepository despesaRepository) {
        this.receitaRepository = receitaRepository;
        this.despesaRepository = despesaRepository;
    }

    /**
     * Resumo do período. Se "inicio"/"fim" não forem informados, usa o mês atual.
     * Ex: GET /api/dashboard?inicio=2026-08-01&fim=2026-08-31
     */
    @GetMapping
    public DashboardResponse resumo(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim) {

        if (inicio == null || fim == null) {
            YearMonth mesAtual = YearMonth.now();
            inicio = mesAtual.atDay(1);
            fim = mesAtual.atEndOfMonth();
        }

        BigDecimal totalReceita = receitaRepository.somarPorPeriodo(inicio, fim).orElse(BigDecimal.ZERO);
        BigDecimal totalDespesa = despesaRepository.somarPorPeriodo(inicio, fim).orElse(BigDecimal.ZERO);

        List<TotalCategoriaDTO> porCategoria = despesaRepository.somarPorCategoriaNoPeriodo(inicio, fim)
                .stream()
                .map(row -> new TotalCategoriaDTO(row.getCategoria(), row.getTotal()))
                .toList();

        return new DashboardResponse(inicio, fim, totalReceita, totalDespesa, porCategoria);
    }
}
