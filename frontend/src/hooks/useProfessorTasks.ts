import { useCallback, useMemo, useState } from "react";
import { createTask } from "../services/api";
import { useTurmas } from "./useTurmas";

interface DisciplinaProfessorOption {
  idDisciplina: string;
  nome: string;
  semestre: number | null;
}

interface CreateProfessorTaskPayload {
  titulo: string;
  descricao: string;
  prazo: string;
  pontos: number;
  idTurma: string;
}

export function useProfessorTasks() {
  const { turmas, loading, error, refresh } = useTurmas();
  const [submitting, setSubmitting] = useState(false);
  const [disciplinaSelecionadaId, setDisciplinaSelecionadaId] = useState<
    string | null
  >(null);

  const disciplinas = useMemo<DisciplinaProfessorOption[]>(() => {
    const unique = new Map<string, DisciplinaProfessorOption>();

    turmas.forEach((turma) => {
      if (!turma.idDisciplina || !turma.nomeDisciplina) {
        return;
      }

      if (!unique.has(turma.idDisciplina)) {
        unique.set(turma.idDisciplina, {
          idDisciplina: turma.idDisciplina,
          nome: turma.nomeDisciplina,
          semestre: turma.semestre,
        });
      }
    });

    return Array.from(unique.values()).sort((a, b) =>
      a.nome.localeCompare(b.nome, "pt-BR"),
    );
  }, [turmas]);

  const turmasDaDisciplina = useMemo(() => {
    if (!disciplinaSelecionadaId) {
      return [];
    }

    return turmas.filter((turma) => turma.idDisciplina === disciplinaSelecionadaId);
  }, [disciplinaSelecionadaId, turmas]);

  const setDisciplinaSelecionada = useCallback((idDisciplina: string | null) => {
    setDisciplinaSelecionadaId(idDisciplina);
  }, []);

  const submitTask = useCallback(async (payload: CreateProfessorTaskPayload) => {
    try {
      setSubmitting(true);
      return await createTask(payload);
    } finally {
      setSubmitting(false);
    }
  }, []);

  return {
    turmas,
    disciplinas,
    turmasDaDisciplina,
    disciplinaSelecionadaId,
    setDisciplinaSelecionada,
    loading,
    submitting,
    error,
    refresh,
    submitTask,
  };
}
