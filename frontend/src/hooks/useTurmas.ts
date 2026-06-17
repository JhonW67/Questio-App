import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createTurma,
  deleteTurma,
  getAlunos,
  getProfessores,
  getTurmas,
  matricularAlunos,
} from "../services/api";
import type {
  Aluno,
  MatriculaPayload,
  Professor,
  Turma,
  TurmaPayload,
} from "../types/academic";

interface UseTurmasOptions {
  idCurso?: string | null;
  idDisciplina?: string | null;
  idProfessor?: string | null;
  semestre?: number | null;
  autoLoad?: boolean;
}

function sortTurmasByName(items: Turma[]) {
  return [...items].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}

export function useTurmas(options: UseTurmasOptions = {}) {
  const {
    idCurso,
    idDisciplina,
    idProfessor,
    semestre,
    autoLoad = true,
  } = options;
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(autoLoad);
  const [loadingProfessores, setLoadingProfessores] = useState(false);
  const [loadingAlunos, setLoadingAlunos] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setTurmas(sortTurmasByName(await getTurmas()));
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Não foi possível carregar as turmas.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const loadProfessores = useCallback(async () => {
    try {
      setLoadingProfessores(true);
      setError(null);
      const data = await getProfessores();
      setProfessores(data);
      return data;
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        "Não foi possível carregar os professores.";
      setError(message);
      return [];
    } finally {
      setLoadingProfessores(false);
    }
  }, []);

  const loadAlunos = useCallback(async () => {
    try {
      setLoadingAlunos(true);
      setError(null);
      const data = await getAlunos();
      setAlunos(data);
      return data;
    } catch (err: any) {
      const message =
        err?.response?.data?.message || "Não foi possível carregar os alunos.";
      setError(message);
      return [];
    } finally {
      setLoadingAlunos(false);
    }
  }, []);

  useEffect(() => {
    if (autoLoad) {
      refresh();
    }
  }, [autoLoad, refresh]);

  const filteredTurmas = useMemo(
    () =>
      sortTurmasByName(
        turmas.filter((turma) => {
        if (idCurso && turma.idCurso !== idCurso) return false;
        if (idDisciplina && turma.idDisciplina !== idDisciplina) return false;
        if (idProfessor && turma.idProfessor !== idProfessor) return false;
        if (semestre && turma.semestre !== semestre) return false;
        return true;
        }),
      ),
    [idCurso, idDisciplina, idProfessor, semestre, turmas],
  );

  const createTurmaAction = useCallback(async (payload: TurmaPayload) => {
    try {
      setSaving(true);
      setError(null);
      const turma = await createTurma(payload);
      setTurmas((prev) => sortTurmasByName([...prev, turma]));
      return turma;
    } catch (err: any) {
      const message =
        err?.response?.data?.message || "Não foi possível criar a turma.";
      setError(message);
      throw new Error(message);
    } finally {
      setSaving(false);
    }
  }, []);

  const matricularAlunosAction = useCallback(
    async (payload: MatriculaPayload) => {
      try {
        setSaving(true);
        setError(null);
        await matricularAlunos(payload);
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          "Não foi possível matricular os alunos.";
        setError(message);
        throw new Error(message);
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  const deleteTurmaAction = useCallback(async (idTurma: string) => {
    try {
      setSaving(true);
      setError(null);
      await deleteTurma(idTurma);
      setTurmas((prev) => prev.filter((item) => item.idTurma !== idTurma));
    } catch (err: any) {
      const message =
        err?.response?.data?.message || "Não foi possível remover a turma.";
      setError(message);
      throw new Error(message);
    } finally {
      setSaving(false);
    }
  }, []);

  return {
    turmas,
    filteredTurmas,
    professores,
    alunos,
    loading,
    loadingProfessores,
    loadingAlunos,
    saving,
    error,
    refresh,
    loadProfessores,
    loadAlunos,
    createTurma: createTurmaAction,
    matricularAlunos: matricularAlunosAction,
    deleteTurma: deleteTurmaAction,
  };
}
