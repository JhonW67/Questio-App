package com.questio.questio_backend.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record AcademicEventResponseDTO(
        UUID id,
        UUID idProfessor,
        String nomeProfessor,
        UUID idTurma,
        String nomeTurma,
        UUID idDisciplina,
        String nomeDisciplina,
        UUID idAluno,
        String nomeAluno,
        String tituloEvento,
        String descricaoEvento,
        LocalDateTime dataEvento,
        String tipo,
        boolean lido
) {}
