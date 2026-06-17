import { useCallback, useEffect, useState } from "react";
import { getDisciplinasByCursoSemestre } from "../services/api";
import type { Disciplina } from "../types/academic";

interface UseDisciplinasOptions {
  idCurso?: string | null;
  semestre?: number | null;
  autoLoad?: boolean;
}

export function useDisciplinas(options: UseDisciplinasOptions = {}) {
  const { idCurso, semestre, autoLoad = true } = options;
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!idCurso) {
      setDisciplinas([]);
      setError(null);
      return [];
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getDisciplinasByCursoSemestre(idCurso, semestre);
      setDisciplinas(data);
      return data;
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        "Não foi possível carregar as disciplinas.";
      setError(message);
      setDisciplinas([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [idCurso, semestre]);

  useEffect(() => {
    if (autoLoad) {
      refresh();
    }
  }, [autoLoad, refresh]);

  return {
    disciplinas,
    loading,
    error,
    refresh,
  };
}
