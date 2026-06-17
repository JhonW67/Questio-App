package com.questio.questio_backend.dto;

import java.util.UUID;

public record DisciplinaResponseDTO(
        UUID idDisciplina,
        UUID idCurso,
        String nome,
        Integer semestre,
        Integer cargaHoraria,
        boolean ativa
) {}
