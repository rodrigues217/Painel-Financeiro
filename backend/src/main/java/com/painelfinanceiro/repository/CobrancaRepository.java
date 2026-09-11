package com.painelfinanceiro.repository;

import com.painelfinanceiro.model.Cobranca;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CobrancaRepository extends JpaRepository<Cobranca, Long> {
    List<Cobranca> findAllByOrderByDataPrevistaAsc();
}
