
ALTER TABLE usuarios
    ADD COLUMN IF NOT EXISTS acesso_bloqueado BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE usuarios
    ADD COLUMN IF NOT EXISTS ultima_atividade_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE usuarios
    ADD COLUMN IF NOT EXISTS ultimo_checkin_em TIMESTAMP NULL;

ALTER TABLE usuarios
    ALTER COLUMN tipo TYPE VARCHAR(50) USING tipo::text;

ALTER TABLE tarefas
    ALTER COLUMN status TYPE VARCHAR(50) USING status::text;
ALTER TABLE tarefas
    ALTER COLUMN status SET DEFAULT 'Pendente';

ALTER TABLE submissao_tarefas
    ALTER COLUMN status TYPE VARCHAR(50) USING status::text;
ALTER TABLE submissao_tarefas
    ALTER COLUMN status SET DEFAULT 'Pendente';

