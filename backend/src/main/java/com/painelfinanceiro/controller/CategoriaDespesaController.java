package com.painelfinanceiro.controller;

import com.painelfinanceiro.model.CategoriaDespesa;
import com.painelfinanceiro.repository.CategoriaDespesaRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categorias")
public class CategoriaDespesaController {

    private final CategoriaDespesaRepository repository;

    public CategoriaDespesaController(CategoriaDespesaRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<CategoriaDespesa> listar() {
        return repository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> criar(@Valid @RequestBody CategoriaDespesa categoria) {
        if (repository.existsByNomeIgnoreCase(categoria.getNome())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Já existe uma categoria com esse nome.");
        }
        return ResponseEntity.ok(repository.save(categoria));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> editar(@PathVariable Long id, @Valid @RequestBody CategoriaDespesa dados) {
        return repository.findById(id)
                .map(categoria -> {
                    categoria.setNome(dados.getNome());
                    return ResponseEntity.ok(repository.save(categoria));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> excluir(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        try {
            repository.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            // Provavelmente existem despesas vinculadas a essa categoria.
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Não é possível excluir: existem despesas vinculadas a essa categoria.");
        }
    }
}
