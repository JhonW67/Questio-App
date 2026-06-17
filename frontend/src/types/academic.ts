export interface Disciplina {
  idDisciplina: string;
  idCurso: string;
  nome: string;
  semestre: number;
  cargaHoraria: number | null;
  ativa: boolean;
}

export interface Curso {
  idCurso: string;
  nome: string;
  descricao: string | null;
  cargaHoraria: number | null;
  vagas: number | null;
  ativo: boolean;
  disciplinas: Disciplina[];
}

export interface Turma {
  idTurma: string;
  idCurso: string | null;
  idDisciplina: string | null;
  idProfessor: string | null;
  nome: string;
  nomeCurso: string | null;
  nomeDisciplina: string | null;
  nomeProfessor: string | null;
  semestre: number | null;
  ativa: boolean;
}

export interface Professor {
  idUsuario: string;
  nome: string;
  email: string;
}

export interface Aluno {
  idUsuario: string;
  nome: string;
  email: string;
}

export interface SemestreOption {
  value: number;
  label: string;
}

export interface CursoPayload {
  nome: string;
  descricao?: string;
  cargaHoraria?: number;
  vagas?: number;
  disciplinas?: DisciplinaPayload[];
}

export interface DisciplinaPayload {
  nome: string;
  semestre: number;
  cargaHoraria: number;
}

export interface TurmaPayload {
  nome: string;
  idProfessor: string;
  idCurso: string;
  idDisciplina: string;
  semestre: number;
}

export interface MatriculaPayload {
  idTurma: string;
  idsAlunos: string[];
}

export interface RegisterPayload {
  nome: string;
  email: string;
  senha: string;
  curso: string;
  tipoUsuario: "ALUNO" | "PROFESSOR" | "COORDENACAO";
}

export interface CreateTaskPayload {
  titulo: string;
  descricao: string;
  prazo: string;
  pontos: number;
  idTurma: string;
}

export interface StudentTask {
  id: string;
  titulo: string;
  objetivo: string;
  dataEntrega: string;
  concluida: boolean;
  pontos: number | null;
  categoria?: string | null;
  resposta: string | null;
  statusSubmissao: string | null;
  enviadoEm: string | null;
  arquivoNome: string | null;
  arquivoUrl: string | null;
}

export interface PerformanceTurma {
  idTurma: string;
  nome: string;
}

export interface PerformancePendingSubmission {
  idSubmissao: string;
  idTarefa: string;
  titulo: string;
  dataEntrega: string | null;
  enviadoEm: string | null;
  status: string | null;
  nota: number | null;
  feedback: string | null;
  resposta: string | null;
  arquivoNome: string | null;
  arquivoUrl: string | null;
}

export interface PerformanceStudent {
  idAluno: string;
  nome: string;
  tarefasConcluidas: number;
  tarefasTotal: number;
  entregasPendentesAvaliacao: number;
  tarefasSemEntrega: number;
  mediaNotas: number | null;
  pendenciasAvaliacao: PerformancePendingSubmission[];
}

export interface AcademicEvent {
  id: string;
  idProfessor: string | null;
  nomeProfessor: string | null;
  idTurma: string | null;
  nomeTurma: string | null;
  idDisciplina: string | null;
  nomeDisciplina: string | null;
  idAluno: string | null;
  nomeAluno: string | null;
  tituloEvento: string;
  descricaoEvento: string;
  dataEvento: string;
  tipo: "reuniao" | "aviso" | "comunicado" | "importante";
  lido: boolean;
}

export interface AcademicEventPayload {
  idProfessor: string;
  idTurma?: string | null;
  idDisciplina?: string | null;
  idAluno?: string | null;
  tituloEvento: string;
  descricaoEvento: string;
  dataEvento: string;
  tipo: "reuniao" | "aviso" | "comunicado" | "importante";
}

export const SEMESTRE_OPTIONS: SemestreOption[] = Array.from(
  { length: 10 },
  (_, index) => ({
    value: index + 1,
    label: `${index + 1}º Semestre`,
  }),
);

export function normalizeDisciplina(raw: any): Disciplina {
  return {
    idDisciplina: String(raw?.idDisciplina ?? raw?.id ?? ""),
    idCurso: String(raw?.idCurso ?? raw?.curso?.idCurso ?? ""),
    nome: String(raw?.nome ?? ""),
    semestre: Number(raw?.semestre ?? 1),
    cargaHoraria:
      raw?.cargaHoraria === null || raw?.cargaHoraria === undefined
        ? null
        : Number(raw.cargaHoraria),
    ativa: Boolean(raw?.ativa ?? true),
  };
}

export function normalizeCurso(raw: any): Curso {
  return {
    idCurso: String(raw?.idCurso ?? raw?.id ?? ""),
    nome: String(raw?.nome ?? ""),
    descricao:
      raw?.descricao === null || raw?.descricao === undefined
        ? null
        : String(raw.descricao),
    cargaHoraria:
      raw?.cargaHoraria === null || raw?.cargaHoraria === undefined
        ? null
        : Number(raw.cargaHoraria),
    vagas:
      raw?.vagas === null || raw?.vagas === undefined
        ? null
        : Number(raw.vagas),
    ativo: Boolean(raw?.ativo ?? true),
    disciplinas: Array.isArray(raw?.disciplinas)
      ? raw.disciplinas.map(normalizeDisciplina)
      : [],
  };
}

export function normalizeTurma(raw: any): Turma {
  return {
    idTurma: String(raw?.idTurma ?? raw?.idClass ?? raw?.id ?? ""),
    idCurso:
      raw?.idCurso === null || raw?.idCurso === undefined
        ? null
        : String(raw.idCurso),
    idDisciplina:
      raw?.idDisciplina === null || raw?.idDisciplina === undefined
        ? null
        : String(raw.idDisciplina),
    idProfessor:
      raw?.idProfessor === null || raw?.idProfessor === undefined
        ? null
        : String(raw.idProfessor),
    nome: String(raw?.nome ?? ""),
    nomeCurso:
      raw?.nomeCurso === null || raw?.nomeCurso === undefined
        ? null
        : String(raw.nomeCurso),
    nomeDisciplina:
      raw?.nomeDisciplina === null || raw?.nomeDisciplina === undefined
        ? null
        : String(raw.nomeDisciplina),
    nomeProfessor:
      raw?.nomeProfessor === null || raw?.nomeProfessor === undefined
        ? null
        : String(raw.nomeProfessor),
    semestre:
      raw?.semestre === null || raw?.semestre === undefined
        ? null
        : Number(raw.semestre),
    ativa: Boolean(raw?.ativa ?? true),
  };
}

export function normalizeProfessor(raw: any): Professor {
  return {
    idUsuario: String(raw?.idUsuario ?? raw?.id ?? ""),
    nome: String(raw?.nome ?? ""),
    email: String(raw?.email ?? ""),
  };
}

export function normalizeAluno(raw: any): Aluno {
  return {
    idUsuario: String(raw?.idUsuario ?? raw?.id ?? ""),
    nome: String(raw?.nome ?? ""),
    email: String(raw?.email ?? ""),
  };
}

export function normalizeAcademicEvent(raw: any): AcademicEvent {
  const tipo = String(raw?.tipo ?? "comunicado").toLowerCase();

  return {
    id: String(raw?.id ?? raw?.idEvento ?? ""),
    idProfessor:
      raw?.idProfessor === null || raw?.idProfessor === undefined
        ? null
        : String(raw.idProfessor),
    nomeProfessor:
      raw?.nomeProfessor === null || raw?.nomeProfessor === undefined
        ? null
        : String(raw.nomeProfessor),
    idTurma:
      raw?.idTurma === null || raw?.idTurma === undefined
        ? null
        : String(raw.idTurma),
    nomeTurma:
      raw?.nomeTurma === null || raw?.nomeTurma === undefined
        ? null
        : String(raw.nomeTurma),
    idDisciplina:
      raw?.idDisciplina === null || raw?.idDisciplina === undefined
        ? null
        : String(raw.idDisciplina),
    nomeDisciplina:
      raw?.nomeDisciplina === null || raw?.nomeDisciplina === undefined
        ? null
        : String(raw.nomeDisciplina),
    idAluno:
      raw?.idAluno === null || raw?.idAluno === undefined
        ? null
        : String(raw.idAluno),
    nomeAluno:
      raw?.nomeAluno === null || raw?.nomeAluno === undefined
        ? null
        : String(raw.nomeAluno),
    tituloEvento: String(raw?.tituloEvento ?? raw?.titulo ?? ""),
    descricaoEvento: String(raw?.descricaoEvento ?? raw?.descricao ?? ""),
    dataEvento: String(raw?.dataEvento ?? ""),
    tipo:
      tipo === "reuniao" ||
      tipo === "aviso" ||
      tipo === "comunicado" ||
      tipo === "importante"
        ? tipo
        : "comunicado",
    lido: Boolean(raw?.lido ?? false),
  };
}

export function normalizeStudentTask(raw: any): StudentTask {
  return {
    id: String(raw?.id ?? raw?.idTask ?? ""),
    titulo: String(raw?.titulo ?? ""),
    objetivo: String(raw?.objetivo ?? raw?.descricao ?? ""),
    dataEntrega: String(raw?.dataEntrega ?? raw?.prazo ?? ""),
    concluida: Boolean(raw?.concluida ?? false),
    pontos:
      raw?.pontos === null || raw?.pontos === undefined
        ? null
        : Number(raw.pontos),
    resposta:
      raw?.resposta === null || raw?.resposta === undefined
        ? null
        : String(raw.resposta),
    statusSubmissao:
      raw?.statusSubmissao === null || raw?.statusSubmissao === undefined
        ? null
        : String(raw.statusSubmissao),
    enviadoEm:
      raw?.enviadoEm === null || raw?.enviadoEm === undefined
        ? null
        : String(raw.enviadoEm),
    arquivoNome:
      raw?.arquivoNome === null || raw?.arquivoNome === undefined
        ? null
        : String(raw.arquivoNome),
    arquivoUrl:
      raw?.arquivoUrl === null || raw?.arquivoUrl === undefined
        ? null
        : String(raw.arquivoUrl),
    categoria:
      raw?.categoria === null || raw?.categoria === undefined
        ? null
        : String(raw.categoria),
  };
}

export function normalizePerformanceTurma(raw: any): PerformanceTurma {
  return {
    idTurma: String(raw?.idTurma ?? raw?.id ?? ""),
    nome: String(raw?.nome ?? ""),
  };
}

export function normalizePerformancePendingSubmission(
  raw: any,
): PerformancePendingSubmission {
  return {
    idSubmissao: String(raw?.idSubmissao ?? raw?.idSubmit ?? ""),
    idTarefa: String(raw?.idTarefa ?? raw?.idTask ?? ""),
    titulo: String(raw?.titulo ?? ""),
    dataEntrega:
      raw?.dataEntrega === null || raw?.dataEntrega === undefined
        ? null
        : String(raw.dataEntrega),
    enviadoEm:
      raw?.enviadoEm === null || raw?.enviadoEm === undefined
        ? null
        : String(raw.enviadoEm),
    status:
      raw?.status === null || raw?.status === undefined
        ? null
        : String(raw.status),
    nota:
      raw?.nota === null || raw?.nota === undefined ? null : Number(raw.nota),
    feedback:
      raw?.feedback === null || raw?.feedback === undefined
        ? null
        : String(raw.feedback),
    resposta:
      raw?.resposta === null || raw?.resposta === undefined
        ? null
        : String(raw.resposta),
    arquivoNome:
      raw?.arquivoNome === null || raw?.arquivoNome === undefined
        ? null
        : String(raw.arquivoNome),
    arquivoUrl:
      raw?.arquivoUrl === null || raw?.arquivoUrl === undefined
        ? null
        : String(raw.arquivoUrl),
  };
}

export function normalizePerformanceStudent(raw: any): PerformanceStudent {
  return {
    idAluno: String(raw?.idAluno ?? raw?.id ?? ""),
    nome: String(raw?.nome ?? ""),
    tarefasConcluidas: Number(raw?.tarefasConcluidas ?? 0),
    tarefasTotal: Number(raw?.tarefasTotal ?? 0),
    entregasPendentesAvaliacao: Number(raw?.entregasPendentesAvaliacao ?? 0),
    tarefasSemEntrega: Number(raw?.tarefasSemEntrega ?? 0),
    mediaNotas:
      raw?.mediaNotas === null || raw?.mediaNotas === undefined
        ? null
        : Number(raw.mediaNotas),
    pendenciasAvaliacao: Array.isArray(raw?.pendenciasAvaliacao)
      ? raw.pendenciasAvaliacao.map(normalizePerformancePendingSubmission)
      : [],
  };
}
