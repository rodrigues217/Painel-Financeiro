package com.painelfinanceiro.repository;

import com.painelfinanceiro.model.CategoriaDespesa;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CategoriaDespesaRepository extends JpaRepository<CategoriaDespesa, Long> {
    Optional<CategoriaDespesa> findByNomeIgnoreCase(String nome);
    boolean existsByNomeIgnoreCase(String nome);
}
