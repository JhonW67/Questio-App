import { useCallback, useMemo, useState } from "react";
import type { DocumentPickerAsset } from "expo-document-picker";
import { createTask, uploadTaskMaterials } from "../services/api";
import { useAuth } from "../context/AuthContext";
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
  materiais?: DocumentPickerAsset[];
}

export function useProfessorTasks() {
  const { user } = useAuth();
  const { turmas, loading, error, refresh } = useTurmas();
  const [submitting, setSubmitting] = useState(false);
  const [disciplinaSelecionadaId, setDisciplinaSelecionadaId] = useState<
    string | null
  >(null);

  const turmasDoProfessor = useMemo(
    () =>
      turmas.filter((turma) =>
        user?.idUsuario ? turma.idProfessor === user.idUsuario : false,
      ),
    [turmas, user?.idUsuario],
  );

  const disciplinas = useMemo<DisciplinaProfessorOption[]>(() => {
    const unique = new Map<string, DisciplinaProfessorOption>();

    turmasDoProfessor.forEach((turma) => {
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
  }, [turmasDoProfessor]);

  const turmasDaDisciplina = useMemo(() => {
    if (!disciplinaSelecionadaId) {
      return [];
    }

    return turmasDoProfessor.filter(
      (turma) => turma.idDisciplina === disciplinaSelecionadaId,
    );
  }, [disciplinaSelecionadaId, turmasDoProfessor]);

  const setDisciplinaSelecionada = useCallback((idDisciplina: string | null) => {
    setDisciplinaSelecionadaId(idDisciplina);
  }, []);

  const submitTask = useCallback(async (payload: CreateProfessorTaskPayload) => {
    try {
      setSubmitting(true);
      const created = await createTask(payload);

      if (payload.materiais?.length && created?.id) {
        await uploadTaskMaterials({
          idTask: String(created.id),
          arquivos: payload.materiais,
        });
      }

      return created;
    } finally {
      setSubmitting(false);
    }
  }, []);

  return {
    turmas: turmasDoProfessor,
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
