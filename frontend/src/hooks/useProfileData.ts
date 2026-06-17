import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export function useProfileData() {
  const { user } = useAuth();
  const [perfil, setPerfil] = useState<any>(user);
  const [loadingPerfil, setLoadingPerfil] = useState(true);
  const [refreshingPerfil, setRefreshingPerfil] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setRefreshingPerfil(true);
      const { data } = await api.get("/user/me");
      setPerfil(data);
      return data;
    } catch (error) {
      setPerfil(user);
      return user;
    } finally {
      setLoadingPerfil(false);
      setRefreshingPerfil(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  return {
    perfil,
    loadingPerfil,
    refreshingPerfil,
    refreshPerfil: refresh,
  };
}
