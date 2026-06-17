import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import type { DocumentPickerAsset } from "expo-document-picker";
import * as Linking from "expo-linking";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import type {
  AcademicEvent,
  AcademicEventPayload,
  Aluno,
  CoordinationUser,
  CreateTaskPayload,
  CreateStaffUserPayload,
  Curso,
  CursoPayload,
  CursoUpdatePayload,
  Disciplina,
  DisciplinaPayload,
  MatriculaPayload,
  PerformanceStudent,
  PerformanceTurma,
  Professor,
  RegisterPayload,
  StudentTask,
  Turma,
  TurmaPayload,
} from "../types/academic";
import {
  normalizeAcademicEvent,
  normalizeAluno,
  normalizeCoordinationUser,
  normalizeCurso,
  normalizeDisciplina,
  normalizePerformanceStudent,
  normalizePerformanceTurma,
  normalizeProfessor,
  normalizeStudentTask,
  normalizeTurma,
} from "../types/academic";

const SECURE_STORE_TOKEN_KEY = "questio_token";

const getDefaultApiUrl = () => {
  if (__DEV__) {
    return Platform.OS === "android"
      ? "http://10.0.2.2:8080/api"
      : "http://localhost:8080/api";
  }

  return "https://questio-app.onrender.com/api";
};

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL?.trim() || getDefaultApiUrl();

const API_ROOT_URL = API_URL.replace(/\/api\/?$/, "");

const api = axios.create({
  baseURL: API_URL,
});

let handlingUnauthorized = false;

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync(SECURE_STORE_TOKEN_KEY);

      if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Erro ao buscar o token salvo localmente", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    if (status === 401 && !handlingUnauthorized) {
      handlingUnauthorized = true;
      try {
        await SecureStore.deleteItemAsync(SECURE_STORE_TOKEN_KEY);
        await AsyncStorage.removeItem("@Questio:user");
        await AsyncStorage.removeItem("token");
        await AsyncStorage.removeItem("tipoUsuario");
        await AsyncStorage.removeItem("@questio:token");
      } catch {
      }

      try {
        router.replace("/screens/(Authenticator)/Login");
      } catch {
      } finally {
        setTimeout(() => {
          handlingUnauthorized = false;
        }, 300);
      }
    }

    return Promise.reject(error);
  },
);

export async function getCursos(): Promise<Curso[]> {
  const { data } = await api.get("/academic/cursos");
  return Array.isArray(data) ? data.map(normalizeCurso) : [];
}

export async function createCurso(payload: CursoPayload): Promise<Curso> {
  const { data } = await api.post("/academic/cursos", payload);
  return normalizeCurso(data);
}

export async function updateCurso(
  idCurso: string,
  payload: CursoUpdatePayload,
): Promise<Curso> {
  const { data } = await api.put(`/academic/cursos/${idCurso}`, payload);
  return normalizeCurso(data);
}

export async function getDisciplinasByCursoSemestre(
  idCurso: string,
  semestre?: number | null,
): Promise<Disciplina[]> {
  const { data } = await api.get(`/academic/cursos/${idCurso}/disciplinas`, {
    params: semestre ? { semestre } : undefined,
  });

  return Array.isArray(data) ? data.map(normalizeDisciplina) : [];
}

export async function createDisciplina(
  idCurso: string,
  payload: DisciplinaPayload,
): Promise<Disciplina> {
  const { data } = await api.post(`/academic/cursos/${idCurso}/disciplinas`, payload);
  return normalizeDisciplina(data);
}

export async function getProfessores(): Promise<Professor[]> {
  const { data } = await api.get("/user/professores");
  return Array.isArray(data) ? data.map(normalizeProfessor) : [];
}

export async function getProfessoresFull(): Promise<CoordinationUser[]> {
  const { data } = await api.get("/user/professores");
  return Array.isArray(data) ? data.map(normalizeCoordinationUser) : [];
}

export async function getAlunos(): Promise<Aluno[]> {
  const { data } = await api.get("/user/alunos");
  return Array.isArray(data) ? data.map(normalizeAluno) : [];
}

export async function getAlunosFull(): Promise<CoordinationUser[]> {
  const { data } = await api.get("/user/alunos");
  return Array.isArray(data) ? data.map(normalizeCoordinationUser) : [];
}

export async function getTurmas(): Promise<Turma[]> {
  const { data } = await api.get("/coordenacao/turmas");
  return Array.isArray(data) ? data.map(normalizeTurma) : [];
}

export async function createTurma(payload: TurmaPayload): Promise<Turma> {
  const { data } = await api.post("/coordenacao/turmas", payload);
  return normalizeTurma(data);
}

export async function addOfertaTurma(
  idTurma: string,
  payload: { idDisciplina: string; idProfessor: string },
) {
  const { data } = await api.post(`/coordenacao/turmas/${idTurma}/ofertas`, payload);
  return data;
}

export async function matricularAlunos(
  payload: MatriculaPayload,
): Promise<void> {
  await api.post("/coordenacao/matricular-alunos", payload);
}

export async function deleteTurma(idTurma: string): Promise<void> {
  await api.delete(`/coordenacao/turmas/${idTurma}`);
}

export async function registerUser(payload: RegisterPayload) {
  const { data } = await api.post("/auth/register", payload);
  return data;
}

export async function createStaffUser(
  payload: CreateStaffUserPayload,
): Promise<CoordinationUser> {
  const { data } = await api.post("/coordenacao/usuarios", payload);
  return normalizeCoordinationUser(data);
}

export async function setUserAccess(payload: {
  idUsuario: string;
  acessoBloqueado: boolean;
}): Promise<CoordinationUser> {
  const { data } = await api.patch(
    `/coordenacao/usuarios/${payload.idUsuario}/acesso`,
    {
      acessoBloqueado: payload.acessoBloqueado,
    },
  );
  return normalizeCoordinationUser(data);
}

export async function createTask(payload: CreateTaskPayload) {
  const { data } = await api.post("/tarefas/criar", {
    titulo: payload.titulo,
    descricao: payload.descricao,
    prazo: payload.prazo,
    pontos: payload.pontos,
    idTurma: payload.idTurma,
    idDisciplina: payload.idDisciplina,
  });

  return data;
}

export async function uploadTaskMaterials(payload: {
  idTask: string;
  arquivos: DocumentPickerAsset[];
}): Promise<void> {
  if (!payload.arquivos?.length) {
    return;
  }

  const formData = new FormData();
  payload.arquivos.forEach((arquivo) => {
    if (!arquivo?.uri) {
      return;
    }

    formData.append("arquivos", {
      uri: arquivo.uri,
      name: arquivo.name ?? "material",
      type: arquivo.mimeType ?? "application/pdf",
    } as any);
  });

  await api.post(`/tarefas/${payload.idTask}/materiais/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

export async function getStudentTasks(): Promise<StudentTask[]> {
  const { data } = await api.get("/tarefas");
  return Array.isArray(data) ? data.map(normalizeStudentTask) : [];
}

export async function completeStudentTask(idTask: string): Promise<string> {
  const { data } = await api.patch(`/tarefas/${idTask}/concluir`);
  return String(data?.mensagem ?? "Tarefa concluida com sucesso.");
}

export async function submitStudentTask(payload: {
  idTask: string;
  resposta?: string;
  arquivo?: DocumentPickerAsset | null;
}): Promise<string> {
  const formData = new FormData();

  if (payload.resposta?.trim()) {
    formData.append("resposta", payload.resposta.trim());
  }

  if (payload.arquivo?.uri) {
    formData.append("arquivo", {
      uri: payload.arquivo.uri,
      name: payload.arquivo.name ?? "anexo",
      type: payload.arquivo.mimeType ?? "application/octet-stream",
    } as any);
  }

  const { data } = await api.post(
    `/tarefas/${payload.idTask}/submissoes/upload`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return String(data?.mensagem ?? "Tarefa enviada com sucesso.");
}

export function resolveApiAssetUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return path.startsWith("/") ? `${API_ROOT_URL}${path}` : `${API_ROOT_URL}/${path}`;
}

export async function openAttachmentUrl(path: string) {
  let nextUrl = path;

  if (/\/tarefas\/(submissoes|materiais)\/.+\/arquivo-link$/i.test(path)) {
    const { data } = await api.get(path);
    nextUrl = String(data?.url ?? "");
  }

  const absoluteUrl = resolveApiAssetUrl(nextUrl);
  await Linking.openURL(absoluteUrl);
}

export async function getPerformanceTurmas(): Promise<PerformanceTurma[]> {
  const { data } = await api.get("/desempenho/turmas");
  return Array.isArray(data) ? data.map(normalizePerformanceTurma) : [];
}

export async function getTurmaPerformance(
  idTurma: string,
): Promise<PerformanceStudent[]> {
  const { data } = await api.get(`/desempenho/turmas/${idTurma}`);
  return Array.isArray(data) ? data.map(normalizePerformanceStudent) : [];
}

export async function evaluateSubmission(payload: {
  idSubmissao: string;
  nota: number;
  feedback?: string;
}) {
  const { data } = await api.patch(
    `/desempenho/submissoes/${payload.idSubmissao}/avaliar`,
    {
      nota: payload.nota,
      feedback: payload.feedback ?? "",
    },
  );
  return data;
}

export async function getAcademicEvents(): Promise<AcademicEvent[]> {
  const { data } = await api.get("/eventos");
  return Array.isArray(data) ? data.map(normalizeAcademicEvent) : [];
}

export async function getProfessorEvents(): Promise<AcademicEvent[]> {
  const { data } = await api.get("/eventos/professor");
  return Array.isArray(data) ? data.map(normalizeAcademicEvent) : [];
}

export async function createAcademicEvent(
  payload: AcademicEventPayload,
): Promise<AcademicEvent> {
  const { data } = await api.post("/eventos", payload);
  return normalizeAcademicEvent(data);
}

export async function markAcademicEventAsRead(
  idEvento: string,
): Promise<AcademicEvent> {
  const { data } = await api.patch(`/eventos/${idEvento}/lido`);
  return normalizeAcademicEvent(data);
}

export default api;
