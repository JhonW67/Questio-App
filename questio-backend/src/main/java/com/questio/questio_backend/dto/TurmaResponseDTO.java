package com.questio.questio_backend.dto;

import java.util.List;
import java.util.UUID;

public record TurmaResponseDTO(
        UUID idTurma,
        UUID idCurso,
        String nomeCurso,
        String nome,
        Integer semestre,
        boolean ativa,
        List<TurmaOfertaResponseDTO> ofertas
) {}

