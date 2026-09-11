package com.painelfinanceiro.controller;

import com.painelfinanceiro.model.Produto;
import com.painelfinanceiro.model.Receita;
import com.painelfinanceiro.repository.ProdutoRepository;
import com.painelfinanceiro.repository.ReceitaRepository;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/receitas")
public class ReceitaController {

    private final ReceitaRepository receitaRepository;
    private final ProdutoRepository produtoRepository;

    public ReceitaController(ReceitaRepository receitaRepository, ProdutoRepository produtoRepository) {
        this.receitaRepository = receitaRepository;
        this.produtoRepository = produtoRepository;
    }

    @GetMapping
    public List<Receita> listar(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim) {
        if (inicio == null) inicio = LocalDate.of(2000, 1, 1);
        if (fim == null) fim = LocalDate.now();
        return receitaRepository.findByDataReceitaBetweenOrderByDataReceitaDesc(inicio, fim);
    }

    @PostMapping
    public ResponseEntity<?> criar(@Valid @RequestBody ReceitaRequest request) {
        Receita receita = new Receita();
        receita.setValor(request.valor());
        receita.setDescricao(request.descricao());
        receita.setCriadoPor(request.criadoPor());
        receita.setDataReceita(request.dataReceita());
        receita.setProduto(buscarProduto(request.produtoId()));
        return ResponseEntity.ok(receitaRepository.save(receita));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> editar(@PathVariable Long id, @Valid @RequestBody ReceitaRequest request) {
        return receitaRepository.findById(id)
                .map(receita -> {
                    receita.setValor(request.valor());
                    receita.setDescricao(request.descricao());
                    receita.setCriadoPor(request.criadoPor());
                    receita.setDataReceita(request.dataReceita());
                    receita.setProduto(buscarProduto(request.produtoId()));
                    return ResponseEntity.ok(receitaRepository.save(receita));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> excluir(@PathVariable Long id) {
        if (!receitaRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        receitaRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private Produto buscarProduto(Long produtoId) {
        if (produtoId == null) return null;
        return produtoRepository.findById(produtoId).orElse(null);
    }

    public record ReceitaRequest(BigDecimal valor, String descricao, String criadoPor, LocalDate dataReceita, Long produtoId) {}
}
