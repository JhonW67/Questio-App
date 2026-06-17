ALTER TABLE cursos
    ADD COLUMN IF NOT EXISTS descricao TEXT,
    ADD COLUMN IF NOT EXISTS carga_horaria INTEGER,
    ADD COLUMN IF NOT EXISTS vagas INTEGER;

CREATE TABLE IF NOT EXISTS disciplinas (
    id_disciplina UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_curso UUID NOT NULL REFERENCES cursos(id_curso) ON DELETE CASCADE,
    nome VARCHAR(120) NOT NULL,
    semestre INTEGER NOT NULL,
    carga_horaria INTEGER,
    ativa BOOLEAN NOT NULL DEFAULT TRUE
);

ALTER TABLE turmas
    ADD COLUMN IF NOT EXISTS id_curso UUID REFERENCES cursos(id_curso) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS id_disciplina UUID REFERENCES disciplinas(id_disciplina) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS semestre INTEGER;
