package com.painelfinanceiro.repository;

import com.painelfinanceiro.model.Despesa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface DespesaRepository extends JpaRepository<Despesa, Long> {

    List<Despesa> findByDataDespesaBetweenOrderByDataDespesaDesc(LocalDate inicio, LocalDate fim);

    @Query("SELECT COALESCE(SUM(d.valor), 0) FROM Despesa d WHERE d.dataDespesa BETWEEN :inicio AND :fim")
    Optional<BigDecimal> somarPorPeriodo(@Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);

    @Query("SELECT d.categoria.nome AS categoria, COALESCE(SUM(d.valor), 0) AS total " +
           "FROM Despesa d WHERE d.dataDespesa BETWEEN :inicio AND :fim " +
           "GROUP BY d.categoria.nome ORDER BY total DESC")
    List<TotalPorCategoria> somarPorCategoriaNoPeriodo(@Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);

    interface TotalPorCategoria {
        String getCategoria();
        BigDecimal getTotal();
    }
}
