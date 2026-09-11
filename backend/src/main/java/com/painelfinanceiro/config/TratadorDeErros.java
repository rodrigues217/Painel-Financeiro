package com.painelfinanceiro.config;

import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;
import java.util.stream.Collectors;

/**
 * Sem isso, qualquer erro (data em formato errado, campo obrigatório faltando,
 * etc.) volta pro app como o JSON cru do Spring:
 * {"timestamp":"...","status":400,"error":"Bad Request","path":"/api/..."}
 *
 * Aqui a resposta vira {"mensagem": "algo que a pessoa entende"}, e o app
 * mostra essa mensagem direto no alerta de erro.
 */
@RestControllerAdvice
public class TratadorDeErros {

    // JSON que não bate com o formato esperado (ex: data em "07/09/2026" em
    // vez de "2026-09-07", texto onde devia ter número, JSON malformado).
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, String>> corpoInvalido(HttpMessageNotReadableException ex) {
        return ResponseEntity.badRequest().body(Map.of(
                "mensagem", "Não foi possível interpretar os dados enviados. Confira se o valor e a data estão preenchidos corretamente."
        ));
    }

    // Falha nas anotações de validação da entidade (@NotNull, @DecimalMin etc.)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> validacaoFalhou(MethodArgumentNotValidException ex) {
        String mensagem = ex.getBindingResult().getFieldErrors().stream()
                .map(erro -> erro.getDefaultMessage())
                .collect(Collectors.joining("; "));
        return ResponseEntity.badRequest().body(Map.of(
                "mensagem", mensagem.isBlank() ? "Dados inválidos." : mensagem
        ));
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Map<String, String>> restricaoViolada(ConstraintViolationException ex) {
        String mensagem = ex.getConstraintViolations().stream()
                .map(v -> v.getMessage())
                .collect(Collectors.joining("; "));
        return ResponseEntity.badRequest().body(Map.of(
                "mensagem", mensagem.isBlank() ? "Dados inválidos." : mensagem
        ));
    }

    // Qualquer outra coisa inesperada: não expõe o stack trace pro app,
    // mas dá pra ver os detalhes de verdade no log do servidor.
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> erroInesperado(Exception ex) {
        ex.printStackTrace();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "mensagem", "Ocorreu um erro inesperado no servidor. Tente novamente em instantes."
        ));
    }
}
