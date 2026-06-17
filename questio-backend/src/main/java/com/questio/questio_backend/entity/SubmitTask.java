package com.questio.questio_backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "submissao_tarefas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubmitTask {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_submissao")
    private UUID idSubmit;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario")
    private User aluno;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tarefa")
    private Task tarefa;

    @Column(columnDefinition = "text")
    private String resposta;
    private String arquivoNome;
    private String arquivoUrl;
    private String status;
    private Float nota;
    @Column(columnDefinition = "text")
    private String feedback;
    private LocalDateTime avaliadoEm;
    private LocalDateTime enviadoEm;
}
