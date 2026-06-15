import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const getDefaultApiUrl = () => {
  if (__DEV__) {
    return Platform.OS === "android"
      ? "http://10.0.2.2:8080/api"
      : "http://localhost:8080/api";
  }

  return "https://questio-backend.onrender.com/api";
};

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL?.trim() || getDefaultApiUrl();

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync("@Questio:token");

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

export default api;
