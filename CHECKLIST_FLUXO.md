# Checklist de Consistência (Coordenador, Professor e Aluno)

## 1) Autenticação e Sessão
- [x] Login: usuário é redirecionado corretamente por perfil (Aluno/Professor/Coordenação) sem “loop”
- [x] Token JWT é persistido e reaproveitado corretamente (sem chaves duplicadas no storage)
- [x] Backend bloqueia login quando `emailVerificado=false` (se essa for a regra)
- [x] Backend bloqueia acesso quando `acessoBloqueado=true` em todos os perfis
- [x] Cadastro público não permite auto-cadastro como Professor/Coordenação (evitar escalação de privilégio)

## 2) Fluxo do Coordenador (Acadêmico)
- [x] Cursos: listar cursos existentes (com status ativo/inativo)
- [x] Cursos: editar dados do curso (nome/descrição/carga/vagas/ativo)
- [x] Cursos: adicionar disciplinas em um curso existente
- [x] Cursos: bloquear disciplina duplicada (mesmo semestre + mesmo nome) no backend e frontend
- [x] Grade: criar turma exigindo (curso + disciplina + semestre + professor)
- [x] Grade: listar turmas filtradas por curso/disciplina/semestre sem misturar contexto antigo
- [x] Grade: matrícula de alunos funciona apenas com turma selecionada
- [x] Eventos: coordenador cria evento enviando ids reais (idProfessor/idTurma/idDisciplina/idAluno)

## 3) Fluxo do Professor (Operacional)
- [x] Turmas do professor: professor só enxerga turmas vinculadas a ele
- [x] Tarefas: professor cria tarefa apenas na própria turma (backend + UI)
- [x] Tarefas: se UI permitir anexar material, backend precisa armazenar/servir (ou remover da UI)
- [x] Desempenho: professor enxerga pendências reais por turma e consegue avaliar (nota/feedback)
- [x] Eventos: professor enxerga eventos criados pela coordenação compatíveis com seu filtro

## 4) Fluxo do Aluno (Entrega)
- [x] Tarefas: aluno lista tarefas reais do backend
- [x] Submissão: aluno envia resposta e/ou arquivo; backend bloqueia submissão vazia (exceto compatibilidade “rápida”, se necessário)
- [x] Anexo: aluno abre/baixa anexo com link temporário (sem expirar enquanto a tela fica aberta)
- [x] Ranking/Insígnias: ranking identifica usuário por id (não por nome) e filtra apenas alunos
- [x] Notificações: tela existe e não quebra navegação mesmo sem backend de notificações

## 5) Observabilidade e Erros
- [x] Erros do backend aparecem de forma consistente no app (mensagem + ação)
- [x] Rotas públicas no backend são mínimas e justificadas (ex.: download público apenas com token)
- [x] Logs não imprimem dados sensíveis em produção (ex.: principal/claims)
