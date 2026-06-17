ALTER TABLE submissao_tarefas
    ADD COLUMN IF NOT EXISTS feedback TEXT;

ALTER TABLE submissao_tarefas
    ADD COLUMN IF NOT EXISTS avaliado_em TIMESTAMP;
