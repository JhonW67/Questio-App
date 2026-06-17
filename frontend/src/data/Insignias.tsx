export const CATEGORIES = [
  { key: "todas", label: "Todas" },
  { key: "academico", label: "Acadêmico" },
  { key: "eventos", label: "Eventos" },
  { key: "projetos", label: "Projetos" },
];

export interface Badge {
  id: string;
  title: string;
  icon: string;
  category: string;
  description: string;
  check: (user: any) => boolean;
}

const streakAtual = (user: any) =>
  Number(user?.streakAtual ?? user?.streak ?? user?.maiorStreak ?? 0);

const xpTotal = (user: any) => Number(user?.xpTotal ?? 0);

const nivelAtual = (user: any) => Number(user?.nivel ?? 1);

export const BADGES: Badge[] = [
  {
    id: "1",
    title: "Primeiro Passo",
    icon: "🚀",
    category: "academico",
    description: "Conclua sua primeira atividade ou ganhe XP.",
    check: (user) => xpTotal(user) > 0,
  },
  {
    id: "2",
    title: "Streak de 7",
    icon: "🔥",
    category: "academico",
    description: "Alcance uma ofensiva de 7 dias.",
    check: (user) => streakAtual(user) >= 7,
  },
  {
    id: "3",
    title: "Veterano do Clã",
    icon: "🏆",
    category: "eventos",
    description: "Chegue ao nível 3.",
    check: (user) => nivelAtual(user) >= 3,
  },
  {
    id: "4",
    title: "Maratonista",
    icon: "⚡",
    category: "academico",
    description: "Alcance 500 pontos totais.",
    check: (user) => xpTotal(user) >= 500,
  },
  {
    id: "5",
    title: "Nota Máxima",
    icon: "💯",
    category: "academico",
    description: "Alcance 1000 pontos totais.",
    check: (user) => xpTotal(user) >= 1000,
  },
  {
    id: "6",
    title: "Leitor Voraz",
    icon: "📚",
    category: "academico",
    description: "Alcance 1500 pontos totais.",
    check: (user) => xpTotal(user) >= 1500,
  },
  {
    id: "7",
    title: "Mestre Supremo",
    icon: "👑",
    category: "projetos",
    description: "Alcance 3000 pontos totais.",
    check: (user) => xpTotal(user) >= 3000,
  },
  {
    id: "8",
    title: "Streak de 30",
    icon: "⏱️",
    category: "academico",
    description: "Mantenha uma ofensiva de 30 dias.",
    check: (user) => streakAtual(user) >= 30,
  },
];
