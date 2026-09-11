package com.painelfinanceiro.controller;

import com.painelfinanceiro.model.CategoriaDespesa;
import com.painelfinanceiro.model.Despesa;
import com.painelfinanceiro.repository.CategoriaDespesaRepository;
import com.painelfinanceiro.repository.DespesaRepository;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/despesas")
public class DespesaController {

    private final DespesaRepository despesaRepository;
    private final CategoriaDespesaRepository categoriaDespesaRepository;

    public DespesaController(DespesaRepository despesaRepository,
                              CategoriaDespesaRepository categoriaDespesaRepository) {
        this.despesaRepository = despesaRepository;
        this.categoriaDespesaRepository = categoriaDespesaRepository;
    }

    @GetMapping
    public List<Despesa> listar(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim) {
        if (inicio == null) inicio = LocalDate.of(2000, 1, 1);
        if (fim == null) fim = LocalDate.now();
        return despesaRepository.findByDataDespesaBetweenOrderByDataDespesaDesc(inicio, fim);
    }

    @PostMapping
    public ResponseEntity<?> criar(@Valid @RequestBody DespesaRequest request) {
        CategoriaDespesa categoria = categoriaDespesaRepository.findById(request.categoriaId())
                .orElse(null);
        if (categoria == null) {
            return ResponseEntity.badRequest().body("Categoria informada nao existe.");
        }
        Despesa despesa = new Despesa();
        despesa.setCategoria(categoria);
        despesa.setValor(request.valor());
        despesa.setDescricao(request.descricao());
        despesa.setCriadoPor(request.criadoPor());
        despesa.setDataDespesa(request.dataDespesa());
        return ResponseEntity.ok(despesaRepository.save(despesa));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> editar(@PathVariable Long id, @Valid @RequestBody DespesaRequest request) {
        return despesaRepository.findById(id)
                .map(despesa -> {
                    CategoriaDespesa categoria = categoriaDespesaRepository.findById(request.categoriaId())
                            .orElse(null);
                    if (categoria == null) {
                        return ResponseEntity.badRequest().body("Categoria informada nao existe.");
                    }
                    despesa.setCategoria(categoria);
                    despesa.setValor(request.valor());
                    despesa.setDescricao(request.descricao());
                    despesa.setCriadoPor(request.criadoPor());
                    despesa.setDataDespesa(request.dataDespesa());
                    return ResponseEntity.ok(despesaRepository.save(despesa));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> excluir(@PathVariable Long id) {
        if (!despesaRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        despesaRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    public record DespesaRequest(Long categoriaId, java.math.BigDecimal valor, String descricao, String criadoPor, LocalDate dataDespesa) {}
}
