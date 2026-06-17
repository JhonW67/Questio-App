import { useState, useEffect, useCallback } from "react";
import { completeStudentTask, getStudentTasks, submitStudentTask } from "../services/api";
import type { StudentTask } from "../types/academic";

export function useTarefas() {
  const [tarefas, setTarefas] = useState<StudentTask[]>([]);
  const [loading, setLoading] = useState(true);

  const carregarTarefas = useCallback(async () => {
    try {
      setLoading(true);
      setTarefas(await getStudentTasks());
    } catch (error: any) {
      console.log(error?.response?.data || error);
    } finally {
      setLoading(false);
    }
  }, []);

  const concluirTarefa = useCallback(async (id: string) => {
    try {
      await completeStudentTask(id);
      setTarefas((prev) =>
        prev.map((tarefa) =>
          tarefa.id === id ? { ...tarefa, concluida: true } : tarefa,
        ),
      );
    } catch (error: any) {
      console.log(error?.response?.data || error);
    }
  }, []);

  const enviarTarefa = useCallback(
    async (id: string, resposta?: string) => {
      await submitStudentTask({ idTask: id, resposta });
      await carregarTarefas();
    },
    [carregarTarefas],
  );

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
    enviarTarefa,
  };
}
