package com.questio.questio_backend.dto;

import java.util.List;
import java.util.UUID;

public record CursoResponseDTO(
        UUID idCurso,
        String nome,
        String descricao,
        Integer cargaHoraria,
        Integer vagas,
        boolean ativo,
        List<DisciplinaResponseDTO> disciplinas
) {}
