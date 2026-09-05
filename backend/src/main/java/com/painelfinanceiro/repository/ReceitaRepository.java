package com.painelfinanceiro.repository;

import com.painelfinanceiro.model.Receita;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ReceitaRepository extends JpaRepository<Receita, Long> {

    List<Receita> findByDataReceitaBetweenOrderByDataReceitaDesc(LocalDate inicio, LocalDate fim);

    @Query("SELECT COALESCE(SUM(r.valor), 0) FROM Receita r WHERE r.dataReceita BETWEEN :inicio AND :fim")
    Optional<BigDecimal> somarPorPeriodo(@Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);
}
