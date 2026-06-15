package com.questio.questio_backend.dto;

public record DashboardResumoDTO(
        long totalAlunos,
        long totalProfessores,
        long totalCursosAtivos
) {}