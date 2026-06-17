import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  Curso,
  CursoPayload,
  CursoUpdatePayload,
  Disciplina,
  DisciplinaPayload,
} from "../types/academic";
import { createCurso, createDisciplina, getCursos, updateCurso } from "../services/api";

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
        err?.response?.data?.message ||
          err?.response?.data?.mensagem ||
          "Não foi possível carregar os cursos.",
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
        err?.response?.data?.message ||
        err?.response?.data?.mensagem ||
        "Não foi possível salvar o curso.";
      setError(message);
      throw new Error(message);
    } finally {
      setSubmitting(false);
    }
  }, []);

  const updateCursoAction = useCallback(
    async (idCurso: string, payload: CursoUpdatePayload) => {
      try {
        setSubmitting(true);
        setError(null);
        const curso = await updateCurso(idCurso, payload);
        setCursos((prev) => {
          const next = [...prev.filter((item) => item.idCurso !== curso.idCurso), curso];
          return next.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
        });
        return curso;
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err?.response?.data?.mensagem ||
          "Não foi possível atualizar o curso.";
        setError(message);
        throw new Error(message);
      } finally {
        setSubmitting(false);
      }
    },
    [],
  );

  const createDisciplinaAction = useCallback(
    async (idCurso: string, payload: DisciplinaPayload) => {
      try {
        setSubmitting(true);
        setError(null);
        const disciplina = await createDisciplina(idCurso, payload);
        setCursos((prev) =>
          prev.map((curso) => {
            if (curso.idCurso !== idCurso) {
              return curso;
            }

            const nextDisciplinas: Disciplina[] = [
              ...curso.disciplinas.filter(
                (item) => item.idDisciplina !== disciplina.idDisciplina,
              ),
              disciplina,
            ].sort((a, b) => {
              const semestreCompare = a.semestre - b.semestre;
              return semestreCompare !== 0
                ? semestreCompare
                : a.nome.localeCompare(b.nome, "pt-BR");
            });

            return { ...curso, disciplinas: nextDisciplinas };
          }),
        );
        return disciplina;
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err?.response?.data?.mensagem ||
          "Não foi possível adicionar a disciplina.";
        setError(message);
        throw new Error(message);
      } finally {
        setSubmitting(false);
      }
    },
    [],
  );

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
    updateCurso: updateCursoAction,
    createDisciplina: createDisciplinaAction,
    getCursosMap,
  };
}
