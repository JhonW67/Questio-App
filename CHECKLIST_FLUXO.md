# Checklist de Consistência (Coordenador, Professor e Aluno)

## 1) Autenticação e Sessão
- [ ] Login: usuário é redirecionado corretamente por perfil (Aluno/Professor/Coordenação) sem “loop”
- [ ] Token JWT é persistido e reaproveitado corretamente (sem chaves duplicadas no storage)
- [ ] Backend bloqueia login quando `emailVerificado=false` (se essa for a regra)
- [ ] Backend bloqueia acesso quando `acessoBloqueado=true` em todos os perfis
- [ ] Cadastro público não permite auto-cadastro como Professor/Coordenação (evitar escalação de privilégio)

## 2) Fluxo do Coordenador (Acadêmico)
- [ ] Cursos: listar cursos existentes (com status ativo/inativo)
- [ ] Cursos: editar dados do curso (nome/descrição/carga/vagas/ativo)
- [ ] Cursos: adicionar disciplinas em um curso existente
- [ ] Cursos: bloquear disciplina duplicada (mesmo semestre + mesmo nome) no backend e frontend
- [ ] Grade: criar turma exigindo (curso + disciplina + semestre + professor)
- [ ] Grade: listar turmas filtradas por curso/disciplina/semestre sem misturar contexto antigo
- [ ] Grade: matrícula de alunos funciona apenas com turma selecionada
- [ ] Eventos: coordenador cria evento enviando ids reais (idProfessor/idTurma/idDisciplina/idAluno)

## 3) Fluxo do Professor (Operacional)
- [ ] Turmas do professor: professor só enxerga turmas vinculadas a ele
- [ ] Tarefas: professor cria tarefa apenas na própria turma (backend + UI)
- [ ] Tarefas: se UI permitir anexar material, backend precisa armazenar/servir (ou remover da UI)
- [ ] Desempenho: professor enxerga pendências reais por turma e consegue avaliar (nota/feedback)
- [ ] Eventos: professor enxerga eventos criados pela coordenação compatíveis com seu filtro

## 4) Fluxo do Aluno (Entrega)
- [ ] Tarefas: aluno lista tarefas reais do backend
- [ ] Submissão: aluno envia resposta e/ou arquivo; backend bloqueia submissão vazia (exceto compatibilidade “rápida”, se necessário)
- [ ] Anexo: aluno abre/baixa anexo com link temporário (sem expirar enquanto a tela fica aberta)
- [ ] Ranking/Insígnias: ranking identifica usuário por id (não por nome) e filtra apenas alunos
- [ ] Notificações: tela existe e não quebra navegação mesmo sem backend de notificações

## 5) Observabilidade e Erros
- [ ] Erros do backend aparecem de forma consistente no app (mensagem + ação)
- [ ] Rotas públicas no backend são mínimas e justificadas (ex.: download público apenas com token)
- [ ] Logs não imprimem dados sensíveis em produção (ex.: principal/claims)

