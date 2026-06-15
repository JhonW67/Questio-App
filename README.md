# Questio (Clone) — Guia Completo

Projeto full-stack (backend Spring Boot + frontend Expo Router + PostgreSQL) para gamificação acadêmica com perfis: Aluno, Professor e Coordenação.

## Estrutura

- Backend: `questio-backend - Copia/`
- Frontend (Expo): `frontend/`

## Requisitos

- Node.js (recomendado LTS)
- Java 21 (Eclipse Temurin/Adoptium)
- Docker + Docker Compose

## Subindo o Banco (PostgreSQL)

No diretório do backend:

```bash
docker compose up -d
```

Por padrão:

- Host: `localhost`
- Porta: `5433`
- DB: `questio_db`
- User: `postgres`
- Password: `root`

## Subindo o Backend

No diretório `questio-backend - Copia/`:

```bash
./mvnw spring-boot:run
```

Backend padrão:

- Base URL: `http://localhost:8080`
- API: `http://localhost:8080/api`
- OpenAPI: `http://localhost:8080/v3/api-docs`
- Swagger UI: `http://localhost:8080/swagger-ui.html`

### Variáveis de ambiente (Backend)

O backend usa variáveis com fallback (veja `src/main/resources/application.properties`):

- `SPRING_DATASOURCE_URL` (ex.: `jdbc:postgresql://localhost:5433/questio_db`)
- `SPRING_DATASOURCE_USERNAME` (ex.: `postgres`)
- `SPRING_DATASOURCE_PASSWORD` (ex.: `root`)
- `API_SECURITY_TOKEN_SECRET` (obrigatório em produção; em dev há fallback não-secreto)
- `APP_FRONTEND_URL` (ex.: `http://localhost:8082`)
- `APP_MAIL_FROM`, `APP_MAIL_FROM_NAME`, `BREVO_API_KEY`

## Subindo o Frontend (Expo)

No diretório `frontend/`:

```bash
npm install
npx expo start
```

### Web

```bash
npx expo start --web --port 8082
```

Observação: no Android emulador, o backend deve ser acessado via `http://10.0.2.2:8080/api` (já configurado em `frontend/src/services/api.ts`).

## Autenticação e perfis

O login retorna um JWT e o frontend injeta automaticamente o header:

```
Authorization: Bearer <token>
```

Perfis:

- `Aluno` → acessa listagem/conclusão de tarefas do aluno
- `Professor` → cria tarefas e consulta suas turmas
- `Coordenacao` → cria/lista turmas e lista professores/alunos para gestão

## Endpoints principais (Backend)

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`

### Usuário

- `GET /api/user/me`
- `GET /api/user/ranking`
- `GET /api/user/professores` (Coordenação e Professor)
- `GET /api/user/alunos` (Coordenação)

### Turmas (Coordenação/Professor)

- `POST /api/coordenacao/turmas` (Coordenação)
- `GET /api/coordenacao/turmas` (Coordenação vê todas; Professor vê as próprias)
- `DELETE /api/coordenacao/turmas/{idTurma}` (Coordenação)

### Tarefas

- `POST /api/tarefas/criar` (Professor e Coordenação)
- `GET /api/tarefas` (Aluno)
- `PATCH /api/tarefas/{id}/concluir` (Aluno)

## O que foi corrigido (principais bugs)

### 403 por token ausente (frontend)

O projeto tinha múltiplas chaves de armazenamento e fontes de token divergentes, causando requests sem `Authorization` e resultando em 403.

Correções:

- Interceptor do Axios passou a ler o token da sessão do app (usuário salvo) em [api.ts](file:///c:/Users/joaoo/OneDrive/Documentos/Univag/projetos/clone%20questio/frontend/src/services/api.ts).
- Login passou a salvar também chaves auxiliares e logout limpar tudo em [AuthContext.ts](file:///c:/Users/joaoo/OneDrive/Documentos/Univag/projetos/clone%20questio/frontend/src/context/AuthContext.ts).
- Splash passou a restaurar sessão a partir do mesmo storage (`@Questio:user`) em [index.tsx](file:///c:/Users/joaoo/OneDrive/Documentos/Univag/projetos/clone%20questio/frontend/src/app/index.tsx).

### Criar tarefa (Professor) e listar turmas

- O frontend já chama `GET /api/coordenacao/turmas` e `POST /api/tarefas/criar`; o backend agora expõe `GET /api/coordenacao/turmas` e filtra por professor automaticamente.

### Coordenador: “criar turma” sem professores reais

- A tela tinha um fluxo provisório criando um “professor automático” e mantendo turmas apenas em memória.
- Agora a tela consulta professores reais do backend e lista turmas persistidas, com exclusão real.

## Testes

### Backend

No diretório `questio-backend - Copia/`:

```bash
./mvnw test
```

### Frontend

No diretório `frontend/`:

```bash
npm run typecheck
```

## Deploy do backend no Render

- Arquivo pronto: `render.yaml`
- Serviço esperado: `questio-backend`
- Root do serviço: `questio-backend - Copia/`
- Healthcheck: `GET /actuator/health`

### Variáveis obrigatórias no Render

- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `API_SECURITY_TOKEN_SECRET`
- `APP_FRONTEND_URL`
- `APP_CORS_ALLOWED_ORIGINS`
- `APP_MAIL_FROM`
- `APP_MAIL_FROM_NAME`
- `BREVO_API_KEY`

### Observações de produção

- O backend deve rodar com perfil `prod`.
- Swagger fica desabilitado em produção.
- O link de reset mobile pode usar `questio-app://screens/(Authenticator)/ResetPassWord`.
- A URL pública do backend deve ser refletida em `EXPO_PUBLIC_API_URL` no app.
- O envio de e-mails em produção usa a API HTTP do Brevo, evitando dependência de SMTP no Render.

## Build do APK / Android App Bundle

No diretório `frontend/`:

```bash
npm install
npm install -g eas-cli
eas login
```

### APK de homologação ou distribuição interna

```bash
npm run build:apk:preview
```

### APK de produção

```bash
npm run build:apk:production
```

### AAB para Play Store

```bash
npm run build:aab:production
```

### Configuração esperada

- `app.json` já contém `android.package`, `versionCode`, `scheme` e plugins necessários.
- `eas.json` já possui perfis `preview`, `production-apk` e `production`.
- `frontend/.env.example` documenta a `EXPO_PUBLIC_API_URL` usada no app.

## UI e aderência visual

- O shell principal do app foi ajustado para o padrão escuro com destaque ciano, cards com borda suave e navegação inferior em estilo dock.
- A `Home` do aluno foi alinhada ao painel visual principal usado como referência no Figma.
- O fluxo está pronto para build mobile, mas vale fazer uma revisão visual final em dispositivo real depois do primeiro APK gerado.

## Dicas de troubleshooting

- Se o backend não subir por “porta 8080 em uso”, finalize a instância anterior ou rode com `server.port=8083`.
- Se o Docker acusar conflito de container, rode `docker ps` e remova/pare containers antigos.
- Para Android emulator, use `10.0.2.2` como host do backend.
