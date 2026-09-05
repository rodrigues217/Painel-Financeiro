package com.painelfinanceiro.controller;

import com.painelfinanceiro.model.Produto;
import com.painelfinanceiro.repository.ProdutoRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/produtos")
public class ProdutoController {

    private final ProdutoRepository repository;

    public ProdutoController(ProdutoRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Produto> listar() {
        return repository.findAll();
    }

    @PostMapping
    public Produto criar(@Valid @RequestBody Produto produto) {
        produto.setId(null);
        return repository.save(produto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> editar(@PathVariable Long id, @Valid @RequestBody Produto dados) {
        return repository.findById(id)
                .map(produto -> {
                    produto.setNome(dados.getNome());
                    produto.setCustoUnitario(dados.getCustoUnitario());
                    return ResponseEntity.ok(repository.save(produto));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> excluir(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
