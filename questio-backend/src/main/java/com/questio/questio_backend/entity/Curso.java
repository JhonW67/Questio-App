package com.questio.questio_backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "cursos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Curso {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_curso")
    private UUID idCurso;

    @Column(nullable = false, length = 100)
    private String nome;

    @Builder.Default
    @Column(nullable = false)
    private Boolean ativo = true;
}

