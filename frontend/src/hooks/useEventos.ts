import { useCallback, useEffect, useState } from "react";
import {
  createAcademicEvent,
  getAcademicEvents,
  getProfessorEvents,
  markAcademicEventAsRead,
} from "../services/api";
import type { AcademicEvent, AcademicEventPayload } from "../types/academic";

interface UseEventosOptions {
  mode: "coordenacao" | "professor";
}

export function useEventos({ mode }: UseEventosOptions) {
  const [eventos, setEventos] = useState<AcademicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data =
        mode === "coordenacao"
          ? await getAcademicEvents()
          : await getProfessorEvents();
      setEventos(data);
      return data;
    } catch (err: any) {
      const message =
        err?.response?.data?.message || "Não foi possível carregar os eventos.";
      setError(message);
      setEventos([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [mode]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createEvento = useCallback(async (payload: AcademicEventPayload) => {
    try {
      setSaving(true);
      setError(null);
      const evento = await createAcademicEvent(payload);
      setEventos((prev) => [evento, ...prev]);
      return evento;
    } catch (err: any) {
      const message =
        err?.response?.data?.message || "Não foi possível criar o evento.";
      setError(message);
      throw new Error(message);
    } finally {
      setSaving(false);
    }
  }, []);

  const marcarComoLido = useCallback(async (idEvento: string) => {
    try {
      const atualizado = await markAcademicEventAsRead(idEvento);
      setEventos((prev) =>
        prev.map((item) => (item.id === idEvento ? atualizado : item)),
      );
      return atualizado;
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        "Não foi possível atualizar o evento.";
      setError(message);
      throw new Error(message);
    }
  }, []);

  return {
    eventos,
    loading,
    saving,
    error,
    refresh,
    createEvento,
    marcarComoLido,
  };
}
