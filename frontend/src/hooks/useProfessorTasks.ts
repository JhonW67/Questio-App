import { useCallback, useMemo, useState } from "react";
import type { DocumentPickerAsset } from "expo-document-picker";
import { createTask, uploadTaskMaterials } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useTurmas } from "./useTurmas";

interface DisciplinaProfessorOption {
  idDisciplina: string;
  nome: string;
  semestre: number | null;
  turmasIds: string[];
}

interface CreateProfessorTaskPayload {
  titulo: string;
  descricao: string;
  prazo: string;
  pontos: number;
  idTurma: string;
  idDisciplina: string;
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
        user?.idUsuario
          ? turma.ofertas.some((oferta) => oferta.idProfessor === user.idUsuario)
          : false,
      ),
    [turmas, user?.idUsuario],
  );

  const disciplinas = useMemo<DisciplinaProfessorOption[]>(() => {
    const unique = new Map<string, DisciplinaProfessorOption>();

    turmasDoProfessor.forEach((turma) => {
      turma.ofertas.forEach((oferta) => {
        if (
          !oferta.idDisciplina ||
          !oferta.nomeDisciplina ||
          oferta.idProfessor !== user?.idUsuario
        ) {
          return;
        }

        const current = unique.get(oferta.idDisciplina);
        if (!current) {
          unique.set(oferta.idDisciplina, {
            idDisciplina: oferta.idDisciplina,
            nome: oferta.nomeDisciplina,
            semestre: turma.semestre,
            turmasIds: [turma.idTurma],
          });
          return;
        }

        if (!current.turmasIds.includes(turma.idTurma)) {
          current.turmasIds.push(turma.idTurma);
        }
      });
    });

    return Array.from(unique.values()).sort((a, b) =>
      a.nome.localeCompare(b.nome, "pt-BR"),
    );
  }, [turmasDoProfessor, user?.idUsuario]);

  const turmasDaDisciplina = useMemo(() => {
    if (!disciplinaSelecionadaId) {
      return [];
    }

    return turmasDoProfessor.filter(
      (turma) =>
        turma.ofertas.some(
          (oferta) =>
            oferta.idDisciplina === disciplinaSelecionadaId &&
            oferta.idProfessor === user?.idUsuario,
        ),
    );
  }, [disciplinaSelecionadaId, turmasDoProfessor, user?.idUsuario]);

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
