CREATE TABLE IF NOT EXISTS turma_ofertas (
    id_oferta UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_turma UUID NOT NULL,
    id_disciplina UUID NOT NULL,
    id_professor UUID NOT NULL,
    ativa BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_turma_ofertas_turma FOREIGN KEY (id_turma) REFERENCES turmas(id_turma) ON DELETE CASCADE,
    CONSTRAINT fk_turma_ofertas_disciplina FOREIGN KEY (id_disciplina) REFERENCES disciplinas(id_disciplina) ON DELETE RESTRICT,
    CONSTRAINT fk_turma_ofertas_professor FOREIGN KEY (id_professor) REFERENCES usuarios(id_usuario) ON DELETE RESTRICT,
    CONSTRAINT uq_turma_ofertas_turma_disciplina UNIQUE (id_turma, id_disciplina)
);

ALTER TABLE IF EXISTS tarefas
    ADD COLUMN IF NOT EXISTS id_oferta UUID;

ALTER TABLE IF EXISTS tarefas
    ADD CONSTRAINT IF NOT EXISTS fk_tarefas_oferta
    FOREIGN KEY (id_oferta) REFERENCES turma_ofertas(id_oferta) ON DELETE SET NULL;

INSERT INTO turma_ofertas (id_turma, id_disciplina, id_professor, ativa)
SELECT
    t.id_turma,
    t.id_disciplina,
    t.id_professor,
    TRUE
FROM turmas t
WHERE t.id_disciplina IS NOT NULL
  AND t.id_professor IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM turma_ofertas o
      WHERE o.id_turma = t.id_turma
        AND o.id_disciplina = t.id_disciplina
  );

UPDATE tarefas ta
SET id_oferta = o.id_oferta
FROM turmas t
JOIN turma_ofertas o
  ON o.id_turma = t.id_turma
 AND o.id_disciplina = t.id_disciplina
 AND o.id_professor = t.id_professor
WHERE ta.id_oferta IS NULL
  AND ta.id_turma = t.id_turma
  AND ta.id_professor = t.id_professor;

