package com.questio.questio_backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "tarefa_materiais")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskMaterial {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_material")
    private UUID idMaterial;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_tarefa", nullable = false)
    private Task tarefa;

    @Column(name = "arquivo_nome", nullable = false, length = 255)
    private String arquivoNome;

    @Column(name = "arquivo_url", nullable = false, columnDefinition = "text")
    private String arquivoUrl;

    @Builder.Default
    @Column(name = "enviado_em", nullable = false)
    private LocalDateTime enviadoEm = LocalDateTime.now();
}

