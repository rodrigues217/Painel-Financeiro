package com.painelfinanceiro.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "despesas")
public class Despesa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "A categoria é obrigatória")
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "categoria_id", nullable = false)
    private CategoriaDespesa categoria;

    @NotNull(message = "O valor é obrigatório")
    @DecimalMin(value = "0.01", message = "O valor deve ser maior que zero")
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal valor;

    @Column(length = 255)
    private String descricao;

    @NotNull(message = "A data da despesa é obrigatória")
    @Column(name = "data_despesa", nullable = false)
    private LocalDate dataDespesa;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @PrePersist
    protected void aoCriar() {
        this.criadoEm = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public CategoriaDespesa getCategoria() { return categoria; }
    public void setCategoria(CategoriaDespesa categoria) { this.categoria = categoria; }

    public BigDecimal getValor() { return valor; }
    public void setValor(BigDecimal valor) { this.valor = valor; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public LocalDate getDataDespesa() { return dataDespesa; }
    public void setDataDespesa(LocalDate dataDespesa) { this.dataDespesa = dataDespesa; }

    public LocalDateTime getCriadoEm() { return criadoEm; }
    public void setCriadoEm(LocalDateTime criadoEm) { this.criadoEm = criadoEm; }
}
