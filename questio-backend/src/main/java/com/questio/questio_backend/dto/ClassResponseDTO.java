package com.questio.questio_backend.dto;

import java.util.UUID;

public record ClassResponseDTO(
        UUID idTurma,
        UUID idCurso,
        UUID idDisciplina,
        UUID idProfessor,
        String nome,
        String nomeCurso,
        String nomeDisciplina,
        String nomeProfessor,
        Integer semestre,
        boolean ativa
) {}
