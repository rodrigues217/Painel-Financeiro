package com.painelfinanceiro.controller;

import com.painelfinanceiro.model.Cobranca;
import com.painelfinanceiro.repository.CobrancaRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/cobrancas")
public class CobrancaController {

    private final CobrancaRepository cobrancaRepository;

    public CobrancaController(CobrancaRepository cobrancaRepository) {
        this.cobrancaRepository = cobrancaRepository;
    }

    @GetMapping
    public List<Cobranca> listar() {
        return cobrancaRepository.findAllByOrderByDataPrevistaAsc();
    }

    @PostMapping
    public ResponseEntity<?> criar(@Valid @RequestBody CobrancaRequest request) {
        Cobranca cobranca = new Cobranca();
        cobranca.setNomePessoa(request.nomePessoa());
        cobranca.setValor(request.valor());
        cobranca.setDataPrevista(request.dataPrevista());
        cobranca.setDescricao(request.descricao());
        return ResponseEntity.ok(cobrancaRepository.save(cobranca));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> editar(@PathVariable Long id, @Valid @RequestBody CobrancaRequest request) {
        return cobrancaRepository.findById(id)
                .map(cobranca -> {
                    cobranca.setNomePessoa(request.nomePessoa());
                    cobranca.setValor(request.valor());
                    cobranca.setDataPrevista(request.dataPrevista());
                    cobranca.setDescricao(request.descricao());
                    return ResponseEntity.ok(cobrancaRepository.save(cobranca));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Alterna (ou define) se já foi pago, sem precisar reenviar o resto dos dados.
    @PatchMapping("/{id}/pago")
    public ResponseEntity<?> marcarPago(@PathVariable Long id, @RequestBody(required = false) MarcarPagoRequest request) {
        return cobrancaRepository.findById(id)
                .map(cobranca -> {
                    boolean novoValor = (request != null) ? request.pago() : !cobranca.isPago();
                    cobranca.setPago(novoValor);
                    return ResponseEntity.ok(cobrancaRepository.save(cobranca));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> excluir(@PathVariable Long id) {
        if (!cobrancaRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        cobrancaRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    public record CobrancaRequest(String nomePessoa, BigDecimal valor, LocalDate dataPrevista, String descricao) {}
    public record MarcarPagoRequest(boolean pago) {}
}
