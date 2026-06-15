package com.questio.questio_backend.dto;

import java.util.UUID;

public record CursoDashboardDTO(
        UUID idCurso,
        String nomeCurso,
        long quantidadeAlunos
) {}