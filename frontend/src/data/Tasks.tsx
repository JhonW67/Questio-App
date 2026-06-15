export interface Tarefa {
  id: string;
  titulo: string;
  concluida: boolean;
  prazo?: string;
  categoria?: string;
}

export const TAREFAS_INICIAIS: Tarefa[] = [
  { id: '1', titulo: 'Quiz – Normalização de banco', concluida: false, prazo: '23 Mar', categoria: 'Banco de Dados' },
  { id: '2', titulo: 'Entregar diagrama UML', concluida: false, prazo: '25 Mar', categoria: 'Eng. de Software' },
  { id: '3', titulo: 'Lista de integrais duplas', concluida: true, prazo: '28 Mar', categoria: 'Cálculo II' },
];

export const DISCIPLINAS = ['Banco de Dados', 'Eng. de Software', 'Cálculo II', 'Redes', 'IA', 'Ética'];

export const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];