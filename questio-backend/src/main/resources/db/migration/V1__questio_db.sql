create extension if not exists "pgcrypto";

create type tipo_usuario as enum ('Aluno', 'Professor', 'Coordenacao');
create type status_tarefa as enum ('Pendente', 'Enviado', 'Encerrado');
create type status_submissao as enum ('Pendente', 'Concluido');

create table usuarios (
    id_usuario uuid primary key default gen_random_uuid(),
    nome varchar(100) not null,
    email varchar(150) unique not null,
    senha text not null,
    curso varchar(100),
    tipo tipo_usuario not null,
    termo_aceito boolean default false,
    xp_total int default 0,
    nivel int default 1,
    sequencia_dias int default 0,
    criado_em timestamp default current_timestamp
);

create table cursos (
    id_curso uuid primary key default gen_random_uuid(),
    nome varchar(100) not null,
    ativo boolean default true
);

create table grades (
    id_grade uuid primary key default gen_random_uuid(),
    id_curso uuid references cursos(id_curso) on delete cascade,
    semestre int not null
);

create table turmas (
    id_turma uuid primary key default gen_random_uuid(),
    id_professor uuid references usuarios(id_usuario) on delete set null,
    nome varchar(100),
    ativa boolean default true,
    media_engajamento float default 0
);

create table professor_cursos (
    id_relacao uuid primary key default gen_random_uuid(),
    id_professor uuid references usuarios(id_usuario) on delete cascade,
    id_curso uuid references cursos(id_curso) on delete cascade
);

create table acessos (
    id_acesso uuid primary key default gen_random_uuid(),
    id_turma uuid references turmas(id_turma) on delete cascade,
    data_liberacao timestamp
);

create table tarefas (
    id_tarefa uuid primary key default gen_random_uuid(),
    id_turma uuid references turmas(id_turma) on delete cascade,
    id_professor uuid references usuarios(id_usuario) on delete set null,
    titulo varchar(150) not null,
    descricao text,
    prazo timestamp,
    pontos int,
    status status_tarefa default 'Pendente',
    criado_em timestamp default current_timestamp
);

create table submissao_tarefas (
    id_submissao uuid primary key default gen_random_uuid(),
    id_usuario uuid references usuarios(id_usuario) on delete cascade,
    id_tarefa uuid references tarefas(id_tarefa) on delete cascade,
    arquivo_url text,
    status status_submissao default 'Pendente',
    nota float,
    enviado_em timestamp
);

create table insignias (
    id_insignia uuid primary key default gen_random_uuid(),
    titulo varchar(100),
    descricao text,
    pontos_minimos int
);

create table usuario_insignias (
    id_usuario uuid references usuarios(id_usuario) on delete cascade,
    id_insignia uuid references insignias(id_insignia) on delete cascade,
    data_conquista timestamp default current_timestamp,
    primary key (id_usuario, id_insignia)
);

create table eventos (
    id_evento uuid primary key default gen_random_uuid(),
    nome varchar(100),
    descricao text,
    data_evento timestamp,
    pontos_minimos int
);

create table usuario_eventos (
    id_usuario uuid references usuarios(id_usuario) on delete cascade,
    id_evento uuid references eventos(id_evento) on delete cascade,
    participou boolean default false,
    primary key (id_usuario, id_evento)
)