package com.painelfinanceiro.config;

import com.painelfinanceiro.model.CategoriaDespesa;
import com.painelfinanceiro.repository.CategoriaDespesaRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Garante que as categorias padrão existam ao subir a aplicação,
 * sem duplicar caso já tenham sido criadas.
 */
@Component
public class DadosIniciais implements CommandLineRunner {

    private final CategoriaDespesaRepository categoriaDespesaRepository;

    public DadosIniciais(CategoriaDespesaRepository categoriaDespesaRepository) {
        this.categoriaDespesaRepository = categoriaDespesaRepository;
    }

    @Override
    public void run(String... args) {
        List<String> padrao = List.of("Custo de Produto", "Logística/Frete", "Funcionário", "Outros");
        for (String nome : padrao) {
            if (!categoriaDespesaRepository.existsByNomeIgnoreCase(nome)) {
                categoriaDespesaRepository.save(new CategoriaDespesa(nome));
            }
        }
    }
}
