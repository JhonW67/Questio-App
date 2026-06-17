CREATE TABLE IF NOT EXISTS tarefa_materiais (
    id_material UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_tarefa UUID NOT NULL,
    arquivo_nome VARCHAR(255) NOT NULL,
    arquivo_url TEXT NOT NULL,
    enviado_em TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_tarefa_materiais_tarefa FOREIGN KEY (id_tarefa) REFERENCES tarefas(id_tarefa) ON DELETE CASCADE
);

