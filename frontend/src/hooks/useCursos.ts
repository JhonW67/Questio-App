import { useCallback, useEffect, useMemo, useState } from "react";
import type { Curso, CursoPayload } from "../types/academic";
import { createCurso, getCursos } from "../services/api";

export function useCursos(autoLoad = true) {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(autoLoad);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setCursos(await getCursos());
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Não foi possível carregar os cursos.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoLoad) {
      refresh();
    }
  }, [autoLoad, refresh]);

  const createCursoAction = useCallback(async (payload: CursoPayload) => {
    try {
      setSubmitting(true);
      setError(null);
      const curso = await createCurso(payload);
      setCursos((prev) => {
        const next = [...prev.filter((item) => item.idCurso !== curso.idCurso), curso];
        return next.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
      });
      return curso;
    } catch (err: any) {
      const message =
        err?.response?.data?.message || "Não foi possível salvar o curso.";
      setError(message);
      throw new Error(message);
    } finally {
      setSubmitting(false);
    }
  }, []);

  const cursosMap = useMemo(
    () =>
      cursos.reduce<Record<string, Curso>>((acc, curso) => {
        acc[curso.idCurso] = curso;
        return acc;
      }, {}),
    [cursos],
  );

  const getCursosMap = useCallback(() => cursosMap, [cursosMap]);

  return {
    cursos,
    cursosMap,
    loading,
    submitting,
    error,
    refresh,
    createCurso: createCursoAction,
    getCursosMap,
  };
}
