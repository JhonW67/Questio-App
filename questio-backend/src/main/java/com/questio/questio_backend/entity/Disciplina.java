package com.questio.questio_backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "disciplinas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Disciplina {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_disciplina")
    private UUID idDisciplina;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_curso", nullable = false)
    private Curso curso;

    @Column(nullable = false, length = 120)
    private String nome;

    @Column(nullable = false)
    private Integer semestre;

    @Column(name = "carga_horaria")
    private Integer cargaHoraria;

    @Builder.Default
    @Column(nullable = false)
    private Boolean ativa = true;
}
