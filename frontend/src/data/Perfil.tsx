export const ALL_BADGES = [
  {
    label: "Primeiro Passo",
    icon: "🚀",
    description: "Ganhe seu primeiro XP na plataforma.",
    desbloqueada: false,
  },
  {
    label: "Streak de 7",
    icon: "🔥",
    description: "Mantenha uma ofensiva de 7 dias.",
    desbloqueada: false,
  },
];

import { UsuarioLogado } from "../context/AuthContext";


export function getStats(user: UsuarioLogado | null) {
  return [
    {
      label: "Tipo",
      value: user?.tipoUsuario || "—",
      icon: "person-outline" as const,
      iconColor: "blue" as const,
    },
    {
      label: "Email",
      value: user?.email || "—",
      icon: "mail-outline" as const,
      iconColor: "purple" as const,
      smallValue: true,  // ← ativa fonte menor
    },
    {
      label: "Nível",
      value: user?.nivel ?? 1,
      icon: "star-outline" as const,
      iconColor: "amber" as const,
    },
    {
      label: "XP",
      value: user?.xpTotal ?? 0,
      icon: "trophy-outline" as const,
      iconColor: "green" as const,
    },
    {
      label: "Ofensiva",
      value: user?.streakAtual ?? 0,
      icon: "flame-outline" as const,
      iconColor: "purple" as const,
    },
    {
      label: "Maior Streak",
      value: user?.maiorStreak ?? 0,
      icon: "flash-outline" as const,
      iconColor: "blue" as const,
    },
  ];
}
