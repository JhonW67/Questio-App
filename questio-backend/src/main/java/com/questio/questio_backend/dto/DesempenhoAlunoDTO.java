package com.questio.questio_backend.dto;

import java.util.List;
import java.util.UUID;

public record DesempenhoAlunoDTO(
        UUID idAluno,
        String nome,
        int tarefasConcluidas,
        int tarefasTotal,
        int entregasPendentesAvaliacao,
        int tarefasSemEntrega,
        Float mediaNotas,
        List<DesempenhoPendenteDTO> pendenciasAvaliacao
) {
}
