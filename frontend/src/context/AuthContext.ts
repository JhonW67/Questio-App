import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { API_URL } from "../services/api";

export interface UsuarioLogado {
  idUsuario: string;
  nome: string;
  email: string;
  token: string;
  tipoUsuario: "Aluno" | "Professor" | "Coordenacao";
}

export interface AuthContextData {
  signed: boolean;
  loading: boolean;
  user: UsuarioLogado | null;
  login(email: string, senha: string): Promise<UsuarioLogado>;
  logout(): Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);
const SECURE_STORE_TOKEN_KEY = "questio_token";

function extrairDadosDoToken(token: string) {
  try {
    const partes = token.split(".");
    if (partes.length !== 3) return null;

    const base64Url = partes[1].replace(/-/g, "+").replace(/_/g, "/");
    const caracteres =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let output = "";
    let buffer = 0;
    let bits = 0;

    for (let i = 0; i < base64Url.length; i++) {
      const char = base64Url.charAt(i);
      if (char === "=") break;
      const valor = caracteres.indexOf(char);
      if (valor === -1) continue;
      buffer = (buffer << 6) | valor;
      bits += 6;
      if (bits >= 8) {
        bits -= 8;
        output += String.fromCharCode((buffer >> bits) & 0xff);
      }
    }

    const jsonStr = decodeURIComponent(
      output
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Erro ao ler token:", error);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UsuarioLogado | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarSessao() {
      try {
        const storedUser = await AsyncStorage.getItem("@Questio:user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error("Erro ao carregar dados locais", e);
      } finally {
        setLoading(false);
      }
    }
    carregarSessao();
  }, []);

  async function login(email: string, senha: string): Promise<UsuarioLogado> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.mensagem || data?.message || "Erro ao fazer login");
    }

    const decoded = extrairDadosDoToken(data.token);

    const profileResponse = await fetch(`${API_URL}/user/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${data.token}`,
      },
    });

    const profileData = profileResponse.ok ? await profileResponse.json() : null;

    const dadosUsuario: UsuarioLogado = {
      idUsuario: profileData?.idUsuario || decoded?.idUsuario || email,
      nome: profileData?.nome || data.nome || decoded?.nome || "Usuário",
      email: profileData?.email || email,
      token: data.token,
      tipoUsuario: (profileData?.tipoUsuario ||
        data.tipoUsuario ||
        decoded?.tipo ||
        "Aluno") as
        | "Aluno"
        | "Professor"
        | "Coordenacao",
    };

    setUser(dadosUsuario);
    await AsyncStorage.setItem("@Questio:user", JSON.stringify(dadosUsuario));
    await SecureStore.setItemAsync(SECURE_STORE_TOKEN_KEY, dadosUsuario.token);
    await AsyncStorage.setItem("token", dadosUsuario.token);
    await AsyncStorage.setItem("tipoUsuario", dadosUsuario.tipoUsuario);

    return dadosUsuario;
  }

  async function logout() {
    setUser(null);
    await AsyncStorage.removeItem("@Questio:user");
    await SecureStore.deleteItemAsync(SECURE_STORE_TOKEN_KEY);
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("tipoUsuario");
    await AsyncStorage.removeItem("@questio:token");
  }

  return React.createElement(
    AuthContext.Provider,
    { value: { signed: !!user, loading, user, login, logout } },
    children,
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
