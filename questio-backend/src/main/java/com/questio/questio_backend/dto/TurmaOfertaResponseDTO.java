package com.questio.questio_backend.dto;

import java.util.UUID;

public record TurmaOfertaResponseDTO(
        UUID idOferta,
        UUID idDisciplina,
        String nomeDisciplina,
        UUID idProfessor,
        String nomeProfessor,
        Boolean ativa
) {}

