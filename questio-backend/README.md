# Questio Backend

Backend gamificado para estudantes universitários (API REST).

## Stack

- Java 21
- Spring Boot (WebMVC, Validation, Security)
- Spring Data JPA + Hibernate
- PostgreSQL (dev) + H2 (apenas testes)
- JWT (jjwt)
- Swagger UI (springdoc-openapi)

## Como rodar (desenvolvimento)

### 1) Subir o banco (PostgreSQL)

Na raiz do projeto:

```bash
docker compose up -d
```

> O `docker-compose.yml` sobe um PostgreSQL em `localhost:5433` com DB `questio_db`, usuário `postgres`, senha `root` (porta externa 5433 para evitar conflitos locais).

### 2) Rodar a aplicação

```bash
./mvnw spring-boot:run
```

Aplicação: `http://localhost:8080`  
Swagger UI: `http://localhost:8080/swagger-ui.html`

## Perfis e configuração

- Perfil padrão: `dev`
- Produção: `SPRING_PROFILES_ACTIVE=prod`
- Arquivo de exemplo para variáveis: `.env.example`

### Arquivos de configuração

- Compartilhado: `src/main/resources/application.properties`
- Desenvolvimento: `src/main/resources/application-dev.properties`
- Produção: `src/main/resources/application-prod.properties`
- Testes: `src/test/resources/application.properties`

## Como rodar (produção)

### 1) Preparar variáveis

Crie um arquivo `.env` no diretório do backend a partir de `.env.example` e preencha:

- banco
- JWT
- Brevo API
- URL do frontend
- CORS permitido

### 2) Build e deploy com Docker

```bash
docker compose -f docker-compose.prod.yml --env-file .env up -d --build
```

### 3) Subir sem Docker

```bash
SPRING_PROFILES_ACTIVE=prod ./mvnw spring-boot:run
```

## Deploy no Render

O projeto ja possui `render.yaml` na raiz do repositório com a configuracao inicial do serviço.

### Resumo do serviço

- tipo: `web`
- runtime: `java`
- rootDir: `questio-backend - Copia`
- buildCommand: `./mvnw clean package -DskipTests`
- startCommand: `java -Dspring.profiles.active=prod -jar target/questio-backend-0.0.1-SNAPSHOT.jar`
- healthcheck: `/actuator/health`

### Variáveis que precisam ser configuradas

- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `API_SECURITY_TOKEN_SECRET`
- `APP_FRONTEND_URL`
- `APP_PASSWORD_RESET_URL`
- `APP_CORS_ALLOWED_ORIGINS`
- `APP_MAIL_FROM`
- `APP_MAIL_FROM_NAME`
- `BREVO_API_KEY`
- `BREVO_API_BASE_URL` (opcional, padrão `https://api.brevo.com/v3`)

### Observação importante para o app mobile

Se o reset de senha for aberto direto no aplicativo, use:

```text
APP_PASSWORD_RESET_URL=questio-app://screens/(Authenticator)/ResetPassWord
```

## Requisitos de produção

- `API_SECURITY_TOKEN_SECRET` deve ser um segredo forte em Base64
- `APP_CORS_ALLOWED_ORIGINS` deve conter apenas os domínios reais do frontend
- `APP_MAIL_FROM` deve ser um remetente válido/verificado no Brevo
- `BREVO_API_KEY` deve ser uma chave de API transacional válida
- Swagger fica desabilitado em `prod`
- O backend expõe health/info via actuator

## Estrutura do projeto (o que já existe)

- `config/`
  - `CorsConfig.java`, `SecurityConfig.java`, `SecurityFilter.java` (filtro JWT)
- `controller/` (camada HTTP)
  - `AuthController` (cadastro/login)
  - `UserController` (perfil/ranking)
  - `CoordinationController` + `DashboardController` (rotas de coordenação)
  - `TaskController` (tarefas/submissões)
- `service/` (regras de negócio)
  - `UserServiceImpl` (cadastro/login + perfil básico)
  - `GamificationServiceImpl` (XP/nível/streak/atividade)
  - `TaskService` (criação/submissão/listagem de tarefas)
  - `ClassService` (criação de turma + matrícula)
  - `DashboardServiceImpl` (resumo + cursos)
- `entity/` + `repository/`
  - Entidades principais: `User`, `Class` (turma), `Task`, `SubmitTask`, `Curso`
  - Repositórios: `UserRepository`, `ClassRepository`, `TaskRepository`, `SubmitRepository`, `CursoRepository`

## Autenticação (JWT)

O login retorna um token JWT.

Para acessar rotas que dependem do usuário logado, envie:

```
Authorization: Bearer <token>
```

Perfis (enum `TipoUsuario`):
- `ALUNO`
- `PROFESSOR`
- `COORDENACAO`

## Endpoints (para o Front)

Base URL (local): `http://localhost:8080`

### Autenticação

#### `POST /api/auth/register`
Cria um usuário.

Body (JSON):
```json
{
  "nome": "João",
  "email": "joao@email.com",
  "senha": "minhasenha123",
  "curso": "Sistemas de Informação",
  "tipoUsuario": "ALUNO",
  "termoAceito": true
}
```

Resposta: `UserResponseDTO` (em caso de erro, vem `mensagem` preenchida).

> Observação (fase 3): após cadastrar, o usuário precisa **confirmar o e-mail** para conseguir fazer login.

#### `POST /api/auth/login`
Login do usuário.

Body (JSON):
```json
{ "email": "joao@email.com", "senha": "minhasenha123" }
```

Resposta:
```json
{ "token": "<jwt>", "mensagem": "Login bem-sucedido!" }
```

#### `GET /api/auth/verificar-email?token=...`
Endpoint chamado pelo link enviado por e-mail no cadastro. Ativa a conta do usuário.

Resposta: texto simples (`"Conta ativada com sucesso! Você já pode fazer login."`).

#### `POST /api/auth/forgot-password`
Solicita link/token de redefinição de senha por e-mail.

Body (JSON):
```json
{ "email": "joao@email.com" }
```

Resposta: texto simples (por segurança a mensagem é genérica).

#### `POST /api/auth/reset-password`
Redefine senha usando token gerado no “forgot-password”.

Body (JSON):
```json
{ "token": "<token>", "novaSenha": "NovaSenha123" }
```

Resposta: texto simples (`"Senha redefinida com sucesso!"`).

### Usuário

#### `GET /api/user/me`
Retorna o perfil do usuário autenticado.

Resposta: `UserResponseDTO`.

#### `GET /api/user/ranking`
Ranking do usuário.

Resposta: `UserRankingResponseDTO`.

#### `GET /api/user/professores`
Lista professores cadastrados.

Permissão:
- `COORDENACAO`
- `PROFESSOR`

#### `GET /api/user/alunos`
Lista alunos cadastrados.

Permissão:
- `COORDENACAO`

### Coordenação / Turmas

#### `POST /api/coordenacao/turmas`
Cria uma turma.

Body (JSON):
```json
{ "nome": "Turma A", "idProfessor": "UUID_DO_PROFESSOR" }
```

Resposta: `ClassResponseDTO`.

#### `GET /api/coordenacao/turmas`
Lista turmas visíveis para o usuário autenticado.

- Coordenação: vê todas
- Professor: vê apenas as próprias

Resposta: `List<ClassResponseDTO>`.

#### `DELETE /api/coordenacao/turmas/{idTurma}`
Remove uma turma.

Permissão:
- `COORDENACAO`

#### `POST /api/coordenacao/matricular-alunos`
Matricula alunos em uma turma.

Body (JSON):
```json
{
  "idTurma": "UUID_DA_TURMA",
  "idsAlunos": ["UUID_ALUNO_1", "UUID_ALUNO_2"]
}
```

Resposta: string (`"Alunos matriculados com sucesso na turma!"`).

#### `PATCH /api/coordenacao/usuarios/{idUsuario}/acesso`
Bloqueia/libera o acesso do usuário às rotas (ex.: tarefas).

Body (JSON):
```json
{ "acessoBloqueado": true }
```

Resposta: `UserResponseDTO` (com `acessoBloqueado` e `mensagem`).

### Coordenação / Dashboard

#### `GET /api/coordenacao/dashboard/resumo`
Retorna totais para dashboard.

Resposta:
```json
{ "totalAlunos": 0, "totalProfessores": 0, "totalCursosAtivos": 0 }
```

#### `GET /api/coordenacao/dashboard/cursos-alunos`
Lista cursos ativos + quantidade de alunos.

Resposta: `List<CursoDashboardDTO>`.

### Tarefas

#### `POST /api/tarefas/criar`
Cria uma tarefa para uma turma.

Body (JSON):
```json
{
  "titulo": "Atividade 1",
  "descricao": "Ler capítulo 3",
  "prazo": "2026-06-01T23:59:00",
  "pontos": 10,
  "idClass": "UUID_DA_TURMA"
}
```

Resposta: `TaskResponseDTO`.

#### `PATCH /api/tarefas/{id}/concluir`
Conclui/submete uma tarefa do aluno autenticado.

Resposta:
```json
{ "mensagem": "Tarefa concluída com sucesso! +10 XP" }
```

#### `GET /api/tarefas`
Lista tarefas do aluno autenticado (baseado nas turmas em que ele está matriculado).

Resposta: `List<TaskResponseDTO>`.

## Testes

Os testes (`./mvnw test`) rodam com banco em memória (H2) via `src/test/resources/application.properties`, então **não precisa** de Postgres rodando para passar o `contextLoads`.

## Migrations (Flyway)

O projeto usa **Flyway** com migrations em `src/main/resources/db/migration` (V1, V2, V3, V4...).

- Por padrão, ao subir a aplicação apontando para o PostgreSQL do `docker-compose.yml`, o Flyway aplica as migrations automaticamente.
- `spring.jpa.hibernate.ddl-auto` está configurado como `validate` para evitar que o Hibernate “crie/alterar” tabelas por conta própria em produção/dev.

## Arquivos removidos

Foram removidos arquivos ociosos/vazios sem uso real no backend, incluindo placeholders de DTO, entidades e repositories que não estavam integrados a nenhuma rota ou regra de negócio.

## Padrão de erros (JSON)

Quando a API lança exceções de validação/negócio, a resposta segue este formato:

```json
{
  "timestamp": "2026-05-18T22:00:00-04:00",
  "status": 400,
  "code": "BAD_REQUEST",
  "message": "mensagem do erro",
  "path": "/api/...",
  "fields": { "campo": "erro" }
}
```

## Documentos do projeto

- Sprint/roadmap: `docs/README_SPRINT_QUESTIO.md`

## Nota sobre SOLID / SRP (gamificação)

O backend separa a lógica de gamificação em um serviço dedicado (`GamificationService`):

- **Streak/atividade**: atualização de sequência de dias e última atividade
- **XP/Nível**: atualização de XP e recálculo de nível

Assim, o `updateStreak(...)` não mistura pontuação/nivelamento com a sequência de dias.

## Streak: onde contabiliza e onde reseta

### Onde a streak é salva

- `User.streakAtual`
- `User.ultimoCheckinEm` (referência para cálculo do streak)
- `User.ultimaAtividadeEm` (atividade geral no app)

### Onde contabiliza (check-in)

- `service/GamificationServiceImpl.java` → `checkin(UUID userId)`

#### Gatilho atual no backend

- `GET /api/user/me` chama `gamificationService.checkin(...)` automaticamente ao buscar o perfil do usuário autenticado.

#### Regra de negócio (streak)

- **Primeiro check-in**: streak vira **1**
- **Mesmo dia**: mantém o valor
- **Dia seguinte (ontem)**: incrementa (`+1`)
- **Ficou 1+ dia sem entrar (último check-in < ontem)**: **reseta para 0 imediatamente** (antes de “informar o streak”) e registra o check-in do dia atual para evitar reset repetido no mesmo dia.

### Onde registra atividade (última atividade)

- Login: `service/UserServiceImpl.java` → `login(...)`
- Submeter tarefa: `service/TaskService.java` → `gamificationService.touchActivity(...)`
- Check-in (`/api/user/me`): o `checkin(...)` também atualiza `ultimaAtividadeEm`

### Onde reseta automaticamente

- `service/ResetStreakScheduler.java` (job agendado)
- Habilita com: `questio.scheduling.reset-streak.enabled=true`
- Critério do job: usuários com `ultimoCheckinEm` antigo e `streakAtual > 0`
