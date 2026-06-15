import { useState, useEffect, useCallback } from "react";
import api from "../services/api";

export interface Tarefa {
  id: string;
  titulo: string;
  objetivo: string;
  dataEntrega: string;
  concluida: boolean;
  pontos?: number;
  categoria?: string;
}

export function useTarefas() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [loading, setLoading] = useState(true);

  const carregarTarefas = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/tarefas");
      setTarefas(data);
    } catch (error: any) {
      console.log(error?.response?.data || error);
    } finally {
      setLoading(false);
    }
  }, []);

  const concluirTarefa = useCallback(async (id: string) => {
    try {
      await api.patch(`/tarefas/${id}/concluir`);
      setTarefas((prev) =>
        prev.map((tarefa) =>
          tarefa.id === id ? { ...tarefa, concluida: !tarefa.concluida } : tarefa
        )
      );
    } catch (error: any) {
      console.log(error?.response?.data || error);
    }
  }, []);

  useEffect(() => {
    carregarTarefas();
  }, [carregarTarefas]);

  const tarefasPendentes = tarefas.filter((t) => !t.concluida);
  const tarefasConcluidas = tarefas.filter((t) => t.concluida);
  const totalTarefas = tarefas.length;
  const totalConcluidas = tarefasConcluidas.length;
  const progressoSemanal = totalTarefas > 0 ? totalConcluidas / totalTarefas : 0;

  return {
    tarefas,
    tarefasPendentes,
    tarefasConcluidas,
    totalTarefas,
    totalConcluidas,
    progressoSemanal,
    loading,
    carregarTarefas,
    concluirTarefa,
  };
}