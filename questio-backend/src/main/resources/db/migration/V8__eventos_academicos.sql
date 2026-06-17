CREATE TABLE IF NOT EXISTS eventos_academicos (
    id_evento UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_professor UUID NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    id_turma UUID REFERENCES turmas(id_turma) ON DELETE SET NULL,
    id_disciplina UUID REFERENCES disciplinas(id_disciplina) ON DELETE SET NULL,
    id_aluno UUID REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
    titulo VARCHAR(160) NOT NULL,
    descricao TEXT NOT NULL,
    data_evento TIMESTAMP NOT NULL,
    tipo VARCHAR(30) NOT NULL,
    lido BOOLEAN NOT NULL DEFAULT FALSE,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_eventos_academicos_professor
    ON eventos_academicos (id_professor, data_evento DESC);
