export type Screen =
  | "T01"
  | "T02"
  | "T03"
  | "T04"
  | "T05"
  | "T06"
  | "T07"
  | "T08"
  | "T09"
  | "T10"
  | "T11"
  | "T12"
  | "T13"
  | "T14"
  | "T15"
  | "T16"
  | "T17"
  | "T18"
  | "T20"
  | "T22"
  | "T23"
  | "T24"
  | "T25"
  | "T26"
  | "T27"
  | "T28"
  | "T29"
  | "T30"
  | "T31"
  | "T32"
  | "T33"
  | "T34"
  | "T35"
  | "T36"
  | "T37";

/** Pilha de navegação: a tela atual e as telas que levaram até ela, da mais antiga à mais recente. */
export type NavigationState = { currentScreen: Screen; history: Screen[] };

export const setupScreens: readonly Screen[] = ["T25", "T26", "T27", "T28", "T29", "T30", "T31"];
export const supportScreens: readonly Screen[] = ["T12", "T32", "T33"];
export const settingsScreens: readonly Screen[] = ["T17", "T18", "T20", "T34", "T36", "T37"];

/** Telas percorridas durante um apoio; "Encerrar apoio" retorna à tela anterior a todas elas. */
export const supportJourneyScreens: readonly Screen[] = [
  "T02",
  "T03",
  "T04",
  "T05",
  "T06",
  "T07",
  "T08",
  "T09",
  "T10",
  "T11",
  "T12",
  "T13",
  "T14",
  "T15",
  "T16",
  "T22",
  "T23",
  "T32",
  "T33",
  "T35",
];

/**
 * Recursos compostos por mais de uma tela. "Fechar" encerra o recurso inteiro e retorna à tela
 * que o abriu; telas fora destes grupos são recursos de uma tela só.
 */
const flowGroups: ReadonlyArray<readonly Screen[]> = [
  ["T06", "T07"],
  ["T08", "T09"],
  ["T14", "T15", "T35"],
  supportScreens,
  setupScreens,
  settingsScreens,
];

/** Origem usada apenas quando não há histórico (por exemplo, sessão restaurada ou evento do OP01). */
export const parentScreen: Record<Screen, Screen> = {
  T01: "T24",
  T02: "T01",
  T03: "T02",
  T04: "T02",
  T05: "T02",
  T06: "T02",
  T07: "T06",
  T08: "T02",
  T09: "T08",
  T10: "T02",
  T11: "T02",
  T12: "T01",
  T13: "T01",
  T14: "T02",
  T15: "T14",
  T16: "T02",
  T17: "T01",
  T18: "T17",
  T20: "T17",
  T22: "T02",
  T23: "T02",
  T24: "T24",
  T25: "T24",
  T26: "T25",
  T27: "T26",
  T28: "T27",
  T29: "T28",
  T30: "T29",
  T31: "T30",
  T32: "T12",
  T33: "T32",
  T34: "T17",
  T35: "T14",
  T36: "T17",
  T37: "T34",
};

export const screenShortTitles: Record<Screen, string> = {
  T01: "Início",
  T02: "Apoio",
  T03: "Preferidas",
  T04: "Minhas estratégias",
  T05: "Pausa silenciosa",
  T06: "Respiração",
  T07: "Respiração em andamento",
  T08: "Músicas e sons",
  T09: "Reprodutor",
  T10: "Monte seu espaço",
  T11: "Orientações breves",
  T12: "Como me sinto?",
  T13: "Confirmação",
  T14: "Histórias sociais",
  T15: "Leitura de história",
  T16: "Apoio fora da tela",
  T17: "Ajustes",
  T18: "Acompanhamento e convites",
  T20: "Aparência",
  T22: "Combine os pares",
  T23: "Desenhe o caminho",
  T24: "Boas-vindas",
  T25: "Meus interesses",
  T26: "Recursos sensoriais",
  T27: "Preferências musicais",
  T28: "Escolher os jogos",
  T29: "Avatar pessoal",
  T30: "Meu amigo virtual",
  T31: "Concluir configuração",
  T32: "Contexto",
  T33: "Sugestões",
  T34: "Meu perfil",
  T35: "História contextual",
  T36: "Acesso pelo nome",
  T37: "Detalhes do amigo",
};

export function flowOf(screen: Screen): readonly Screen[] {
  return flowGroups.find((group) => group.includes(screen)) ?? [screen];
}

export function fallbackOutside(screen: Screen, flow: readonly Screen[] = flowOf(screen)): Screen {
  let candidate = parentScreen[screen];
  for (let guard = 0; flow.includes(candidate) && guard < 10; guard += 1) {
    candidate = parentScreen[candidate];
  }
  return candidate;
}

/**
 * Abre uma tela. Se ela já estiver no histórico, retorna até ela em vez de empilhá-la de novo,
 * o que evita ciclos como catálogo → recurso → catálogo → recurso.
 */
export function openScreen(
  navigation: NavigationState,
  screen: Screen,
  replace = false,
): NavigationState {
  if (screen === navigation.currentScreen) {
    return { currentScreen: navigation.currentScreen, history: [...navigation.history] };
  }
  const existing = navigation.history.lastIndexOf(screen);
  if (existing >= 0) {
    return { currentScreen: screen, history: navigation.history.slice(0, existing) };
  }
  return {
    currentScreen: screen,
    history: replace ? [...navigation.history] : [...navigation.history, navigation.currentScreen],
  };
}

/** Voltar: um nível no histórico. */
export function backOneLevel(navigation: NavigationState): NavigationState {
  const previous = navigation.history.at(-1);
  if (previous) {
    return { currentScreen: previous, history: navigation.history.slice(0, -1) };
  }
  return { currentScreen: parentScreen[navigation.currentScreen], history: [] };
}

/** Fechar: encerra o recurso atual e retorna à tela que existia antes dele. */
export function closeFlow(
  navigation: NavigationState,
  flow: readonly Screen[] = flowOf(navigation.currentScreen),
  fallback: Screen = fallbackOutside(navigation.currentScreen, flow),
): NavigationState {
  for (let index = navigation.history.length - 1; index >= 0; index -= 1) {
    if (!flow.includes(navigation.history[index])) {
      return {
        currentScreen: navigation.history[index],
        history: navigation.history.slice(0, index),
      };
    }
  }
  return { currentScreen: fallback, history: [] };
}
