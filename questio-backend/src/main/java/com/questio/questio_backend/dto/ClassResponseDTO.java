package com.questio.questio_backend.dto;

import java.util.UUID;

public record ClassResponseDTO(
        UUID idTurma,
        String nome,
        String nomeProfessor,
        boolean ativa
) {}
