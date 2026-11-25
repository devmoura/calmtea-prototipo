import { useEffect, useRef, useState } from "react";
import {
  AppHeader,
  Button,
  DeviceStatus,
  HeaderLabelsProvider,
  Icon,
  IconButton,
  PersonAvatar,
  SectionTitle,
  StatusLabel,
  StepNavigation,
  Toggle,
  VirtualFriendAvatar,
  type AvatarAccessory,
  type AvatarPalette,
  type AvatarVariant,
  type VirtualFriendState,
  type VirtualFriendStyle,
} from "./components";
import {
  backOneLevel,
  closeFlow,
  openScreen,
  parentScreen,
  screenShortTitles,
  setupScreens,
  supportJourneyScreens,
  supportScreens,
  type NavigationState,
  type Screen,
} from "./navigation";
import { qaRegistry, screenRegistry } from "./screenRegistry";
import { audioTracks, audioTrackById, audioPath, type AudioTrackId } from "./audioLibrary";
import { EditorialIllustration, type IllustrationKind } from "./Illustrations";
import {
  createSessionId,
  joinOzSession,
  parseSessionId,
  participantSessionUrl,
  type OzCommandType,
  type OzConnection,
  type OzMessage,
} from "./ozRemote";

type AcousticMode = "off" | "sim_on" | "unavailable";
type Feedback = { tone: "info" | "success"; text: string } | null;
type StrategyId = "pause" | "breath" | "music" | "space" | "pairs" | "path" | "guide" | "stories" | "outside";
type BreathState = "idle" | "active" | "paused";
type AudioState = "idle" | "playing" | "paused" | "error";
type SceneKind = "planta" | "mesa" | "luz" | "almofada" | "poltrona" | "livro" | "tapete" | "quadro" | "luminaria";
type PermissionDemoState = "off" | "granted-demo" | "denied-demo";
type VoiceCallDemo = "off" | "sim_on" | "unavailable";
type StoryId = "sons" | "mudanca" | "frustracao" | "social" | "medo" | "raiva" | "cansaco" | "dor";
type AvatarChoice = "none" | AvatarVariant;
type SensoryValue = "tenho" | "nao_tenho" | "nao_sei";
type SetupOrigin = "T24" | "T34";
type SetupScreen = "T25" | "T26" | "T27" | "T28" | "T29" | "T30" | "T31";
type SetupState = "not_started" | "partial" | "done";
type PaletteChoice = AvatarPalette;
type AccessoryChoice = AvatarAccessory;
type DemoSession = "SEM_PERFIL" | "SILENCIO" | "MUSICA";

const paletteOptions: Array<[PaletteChoice, string]> = [
  ["brisa", "Brisa"],
  ["folha", "Folha"],
  ["lavanda", "Lavanda"],
];

const accessoryOptions: Array<[AccessoryChoice, string]> = [
  ["none", "Sem acessório"],
  ["faixa", "Faixa"],
  ["ponto", "Detalhe"],
];
const friendStyleOptions: Array<[VirtualFriendStyle, string]> = [
  ["neutro","Padrão"],
  ["portrait01","Tranças"],
  ["portrait02","Afro curto"],
  ["portrait03","Cachos"],
  ["portrait04","Ruivo"],
  ["portrait05","Cabelo longo"],
  ["portrait06","Com óculos"],
  ["portrait07","Raspado"],
  ["portrait08","Loiro"],
  ["portrait09","Cachos curtos"],
  ["portrait10","Afro volumoso"],
  ["portrait11","Castanho"],
  ["portrait12","Cabelo curto"],
];

const paletteLabels: Record<PaletteChoice, string> = Object.fromEntries(paletteOptions) as Record<
  PaletteChoice,
  string
>;
const accessoryLabels: Record<AccessoryChoice, string> = Object.fromEntries(
  accessoryOptions,
) as Record<AccessoryChoice, string>;
const demoSessionLabels: Record<DemoSession, string> = {
  SEM_PERFIL: "Sem perfil",
  SILENCIO: "Silêncio",
  MUSICA: "Música",
};

type SetupDraft = {
  interests: string[];
  sensory: Record<string, SensoryValue>;
  silence: boolean;
  genres: string[];
  tracks: string[];
  games: string[];
  avatar: AvatarChoice;
  avatarName: string;
  avatarPalette: PaletteChoice;
  avatarAccessory: AccessoryChoice;
  friendName: string;
  friendStyle: VirtualFriendStyle;
  friendPalette: PaletteChoice;
  friendAccessory: AccessoryChoice;
};

type PersonalStrategy = {
  id: string;
  title: string;
  description: string;
  contexts: string[];
};

type SceneItem = {
  id: string;
  kind: SceneKind;
  x: number;
  y: number;
};

type AppState = {
  currentScreen: Screen;
  history: Screen[];
  acousticMode: AcousticMode;
  acousticConsentDemo: boolean;
  invitesEnabled: boolean;
  inviteVisible: boolean;
  soundEnabled: boolean;
  reduceMotion: boolean;
  contrastMode: boolean;
  textScale: 0 | 1 | 2;
  checkinChoice: string;
  checkinOther: string;
  context: string;
  contextOther: string;
  friendName: string;
  selfReport: string;
  favorites: StrategyId[];
  personalStrategies: PersonalStrategy[];
  breathState: BreathState;
  audioState: AudioState;
  audioVolume: number;
  audioTrackId: AudioTrackId;
  audioFavoriteIds: AudioTrackId[];
  mediaAvailable: boolean;
  sceneItems: SceneItem[];
  sceneUndoStack: SceneItem[][];
  selectedSceneId: string | null;
  permissionVisible: boolean;
  permissionDemoState: PermissionDemoState;
  voiceCallDemo: VoiceCallDemo;
  friendConfigured: boolean;
  guideStep: number;
  storyId: StoryId;
  storyScene: number;
  selectedAvatar: AvatarChoice;
  avatarName: string;
  profileInterests: string[];
  sensoryResources: Record<string, SensoryValue>;
  prefSilence: boolean;
  prefGenres: string[];
  prefTracks: string[];
  favGames: string[];
  avatarPalette: PaletteChoice;
  avatarAccessory: AccessoryChoice;
  friendStyle: VirtualFriendStyle;
  friendPalette: PaletteChoice;
  friendAccessory: AccessoryChoice;
  demoSession: DemoSession;
  setupState: SetupState;
  setupOrigin: SetupOrigin;
  setupEntryScreen: SetupScreen;
  setupPreviousState: SetupState;
  setupDraft: SetupDraft;
  matchSelected: string[];
  matchedPairs: string[];
  matchFeedback: string;
  pathStep: number;
};

const initialState: AppState = {
  currentScreen: "T24",
  history: [],
  acousticMode: "off",
  acousticConsentDemo: false,
  invitesEnabled: true,
  inviteVisible: false,
  soundEnabled: true,
  reduceMotion: false,
  contrastMode: false,
  textScale: 0,
  checkinChoice: "",
  checkinOther: "",
  context: "",
  contextOther: "",
  friendName: "Calma",
  selfReport: "",
  favorites: [],
  personalStrategies: [],
  breathState: "idle",
  audioState: "idle",
  audioVolume: 45,
  audioTrackId: "chuva",
  audioFavoriteIds: [],
  mediaAvailable: true,
  sceneItems: [],
  sceneUndoStack: [],
  selectedSceneId: null,
  permissionVisible: false,
  permissionDemoState: "off",
  voiceCallDemo: "off",
  friendConfigured: false,
  guideStep: 0,
  storyId: "sons",
  storyScene: 0,
  selectedAvatar: "none",
  avatarName: "",
  profileInterests: [],
  sensoryResources: {
    fones: "nao_sei",
    objeto: "nao_sei",
    tranquilo: "nao_sei",
    outro: "nao_sei",
  },
  prefSilence: false,
  prefGenres: [],
  prefTracks: [],
  favGames: [],
  avatarPalette: "brisa",
  avatarAccessory: "none",
  friendStyle: "neutro",
  friendPalette: "brisa",
  friendAccessory: "none",
  demoSession: "SEM_PERFIL",
  setupState: "not_started",
  setupOrigin: "T24",
  setupEntryScreen: "T25",
  setupPreviousState: "not_started",
  setupDraft: {
    interests: [],
    sensory: { fones: "nao_sei", objeto: "nao_sei", tranquilo: "nao_sei", outro: "nao_sei" },
    silence: false,
    genres: [],
    tracks: [],
    games: [],
    avatar: "none",
    avatarName: "",
    avatarPalette: "brisa",
    avatarAccessory: "none",
    friendName: "",
    friendStyle: "neutro",
    friendPalette: "brisa",
    friendAccessory: "none",
  },
  matchSelected: [],
  matchedPairs: [],
  matchFeedback: "",
  pathStep: 0,
};

function createDemoSessionState(demoSession: DemoSession): AppState {
  const base: AppState = {
    ...initialState,
    currentScreen: "T01",
    history: [],
    demoSession,
    sensoryResources: { ...initialState.sensoryResources },
    setupDraft: {
      ...initialState.setupDraft,
      sensory: { ...initialState.setupDraft.sensory },
    },
  };

  if (demoSession === "SILENCIO") {
    const sensory = { ...base.sensoryResources, fones: "tenho" as const };
    return {
      ...base,
      soundEnabled: false,
      profileInterests: ["Ficar em silêncio"],
      sensoryResources: sensory,
      prefSilence: true,
      setupState: "done",
      setupDraft: {
        ...base.setupDraft,
        interests: ["Ficar em silêncio"],
        sensory,
        silence: true,
      },
    };
  }

  if (demoSession === "MUSICA") {
    const genres = ["Instrumental"];
    const tracks = ["Som de chuva suave"];
    return {
      ...base,
      profileInterests: ["Ouvir música"],
      prefGenres: genres,
      prefTracks: tracks,
      setupState: "done",
      setupDraft: {
        ...base.setupDraft,
        interests: ["Ouvir música"],
        genres,
        tracks,
      },
    };
  }

  return base;
}

const stateKey = "v41-participant-state";

function loadPersistedAudio(): { audioFavoriteIds: AudioTrackId[]; audioVolume: number; audioTrackId: AudioTrackId } {
  let stored: { audioFavoriteIds?: string[]; audioVolume?: number; audioTrackId?: string } = {};
  try { stored = JSON.parse(localStorage.getItem("calmtea-audio-preferences") || "{}"); } catch { /* preferências opcionais */ }
  const volume = Number(stored.audioVolume);
  return {
    audioFavoriteIds: (stored.audioFavoriteIds ?? []).filter((id): id is AudioTrackId => audioTracks.some((track) => track.id === id)),
    audioVolume: Number.isFinite(volume) ? Math.min(100, Math.max(0, volume)) : 45,
    audioTrackId: audioTracks.some((track) => track.id === stored.audioTrackId) ? stored.audioTrackId as AudioTrackId : "chuva",
  };
}

function loadState() {
  try {
    const saved = sessionStorage.getItem(stateKey);
    if (!saved) return { ...initialState, ...loadPersistedAudio() };
    // Sessões anteriores guardavam apenas uma tela de retorno; ela vira o primeiro item do histórico.
    const {
      returnScreen: legacyReturnScreen,
      setupReturnScreen: _legacySetupReturnScreen,
      ...savedState
    } = JSON.parse(saved) as Partial<AppState> & {
      returnScreen?: Screen;
      setupReturnScreen?: Screen;
    };
    const legacyHistory =
      legacyReturnScreen && legacyReturnScreen !== savedState.currentScreen
        ? [legacyReturnScreen]
        : [];
    const savedAudio = loadPersistedAudio();
    return {
      ...initialState,
      ...savedState,
      audioFavoriteIds: savedAudio.audioFavoriteIds.length ? savedAudio.audioFavoriteIds : (savedState.audioFavoriteIds ?? []),
      audioVolume: savedAudio.audioVolume,
      audioTrackId: savedAudio.audioTrackId,
      history: Array.isArray(savedState.history) ? savedState.history : legacyHistory,
      sensoryResources: {
        ...initialState.sensoryResources,
        ...(savedState.sensoryResources ?? {}),
      },
      personalStrategies: (savedState.personalStrategies ?? []).map((strategy) => ({
        ...strategy,
        contexts: strategy.contexts ?? [],
      })),
      setupEntryScreen: savedState.setupEntryScreen ?? "T25",
      setupPreviousState: savedState.setupPreviousState ?? savedState.setupState ?? "not_started",
      setupDraft: {
        ...initialState.setupDraft,
        ...(savedState.setupDraft ?? {}),
        sensory: {
          ...initialState.setupDraft.sensory,
          ...(savedState.setupDraft?.sensory ?? {}),
        },
      },
    };
  } catch {
    return initialState;
  }
}

type SupportSuggestion = [title: string, reason: string, category: string];

/** Fotos locais para as sugestões; não são resultados clínicos, apenas referências visuais. */
const contextThumbnailPaths: Record<string, string> = {
  Barulho: "/images/support/context-barulho.webp",
  Mudança: "/images/support/context-mudanca.webp",
  Frustração: "/images/support/context-frustracao.webp",
  "Situação social": "/images/support/context-social.webp",
  Medo: "/images/support/context-medo.webp",
  Raiva: "/images/support/context-raiva.webp",
  Cansaço: "/images/support/context-cansaco.webp",
  Dor: "/images/support/context-dor.webp",
};

function suggestionThumbnail(title: string, context: string): string {
  if (title === "História contextual") return contextThumbnailPaths[context] ?? "/images/support/context-social.webp";
  if (title === "Pausa silenciosa") return "/images/banners/pause.webp";
  if (title === "Músicas e sons") return "/images/banners/music.webp";
  if (title === "Apoio fora da tela") return "/images/support/context-cansaco.webp";
  if (title === "Respiração guiada" || title === "Respiração voluntária") return "/images/support/context-medo.webp";
  if (title === "Monte seu espaço") return "/images/support/context-mudanca.webp";
  if (title === "Orientação breve") return "/images/support/context-social.webp";
  return "/images/support/context-cansaco.webp";
}

function supportSuggestions(
  state: Pick<
    AppState,
    | "context"
    | "prefSilence"
    | "prefGenres"
    | "prefTracks"
    | "sensoryResources"
    | "personalStrategies"
  >,
): SupportSuggestion[] {
  const availableResource = Object.entries(state.sensoryResources).find(
    ([, value]) => value === "tenho",
  )?.[0];
  const resourceLabels: Record<string, string> = {
    fones: "fones ou abafadores",
    objeto: "objeto tátil",
    tranquilo: "lugar tranquilo",
    outro: "outro recurso",
  };
  const resourceNote = availableResource
    ? ` Você informou ${resourceLabels[availableResource]} como disponível.`
    : "";
  const catalog: SupportSuggestion = ["Catálogo completo", "Veja todas as possibilidades de apoio reunidas em um só lugar.", "Todas"];
  const pause: SupportSuggestion = ["Pausa silenciosa", `Reduza os estímulos por um momento.${resourceNote}`, "Pausa"];
  const breath: SupportSuggestion = ["Respiração guiada", "Acompanhe um ritmo visual suave para inspirar e expirar.", "Respiração"];
  const music: SupportSuggestion = ["Músicas e sons", state.prefTracks.length
    ? `Que tal ouvir ${state.prefTracks[0]}? Sua música favorita está aqui.`
    : state.prefGenres.length
      ? `Explore uma trilha de ${state.prefGenres[0]} ou descubra outros sons.`
      : "Descubra um som ou uma música que combine com este instante.", "Música"];

  const general = [
    pause,
    breath,
    state.prefSilence || (!state.prefGenres.length && !state.prefTracks.length) ? catalog : music,
  ];
  const byContext: Record<string, SupportSuggestion[]> = {
    Barulho: [
      ["Pausa silenciosa", `O ambiente está barulhento? Comece reduzindo os sons ao seu redor.${resourceNote}`, "Pausa"],
      ["História contextual", "Veja uma história sobre ambientes barulhentos e maneiras de encontrar mais conforto.", "Histórias"],
      ["Apoio fora da tela", "Talvez se afastar um pouco do celular seja o primeiro passo que você precisa.", "Orientações"],
    ],
    Mudança: [
      ["Orientação breve", "Quando algo muda sem aviso, ajuda entender primeiro o que será diferente.", "Orientações"],
      ["História contextual", "Leia uma situação parecida e veja ideias para lidar com a mudança.", "Histórias"],
      pause,
    ],
    Frustração: [
      [
        "Pausa silenciosa",
        "Antes de tentar resolver tudo, encontre um momento para respirar e reorganizar as ideias.",
        "Pausa",
      ],
      ["História contextual", "Uma história sobre reconhecer a frustração e encontrar um próximo passo possível.", "Histórias"],
      ["Monte seu espaço", "Concentre-se em organizar um espaço visual do seu jeito.", "Jogos"],
    ],
    "Situação social": [
      ["História contextual", "Entenda possibilidades para uma conversa que não saiu como esperado.", "Histórias"],
      [
        "Apoio fora da tela",
        "Às vezes, dividir o que sente com alguém conhecido ajuda a tornar o momento mais leve.",
        "Orientações",
      ],
      catalog,
    ],
    Medo: [
      [
        "Pausa silenciosa",
        "Diminua os estímulos ao redor e dê tempo às suas ideias.",
        "Pausa",
      ],
      [
        "História contextual",
        "Conhecer os próximos passos pode ajudar em momentos de incerteza.",
        "Histórias",
      ],
      ["Apoio fora da tela", "Lembre-se de quem pode estar por perto para oferecer companhia.", "Orientações"],
    ],
    Raiva: [
      ["Pausa silenciosa", "Vamos diminuir a intensidade antes de seguir.", "Pausa"],
      ["História contextual", "Uma história sobre irritação, espaço pessoal e formas seguras de se expressar.", "Histórias"],
      ["Orientação breve", "Vamos encontrar uma ação simples para este momento.", "Orientações"],
    ],
    Cansaço: [
      ["Apoio fora da tela", "Seu corpo pode estar pedindo um intervalo longe das telas.", "Orientações"],
      ["História contextual", "Leia sobre reconhecer o cansaço e fazer uma pausa quando precisar.", "Histórias"],
      pause,
    ],
    Dor: [
      ["Apoio fora da tela", "Se há desconforto, priorize uma pausa e considere pedir ajuda.", "Orientações"],
      ["História contextual", "Uma história sobre comunicar o desconforto e procurar apoio adequado.", "Histórias"],
      pause,
    ],
  };
  const matchingPersonalStrategy = state.context
    ? state.personalStrategies.find((strategy) => strategy.contexts.includes(state.context))
    : undefined;
  const personalSuggestion: SupportSuggestion[] = matchingPersonalStrategy
    ? [
        [
          matchingPersonalStrategy.title,
          `Você já conhece este recurso e o marcou para situações como ${state.context}.`,
          "Pessoais",
        ],
      ]
    : [];
  return [...personalSuggestion, ...(byContext[state.context] ?? general)].slice(0, 3);
}

/** Ao sair de uma tela, encerra o que estava em andamento nela e descarta rascunhos não confirmados. */
function settleLeavingState(previous: AppState, next: AppState): AppState {
  const leaving = previous.currentScreen;
  if (leaving === next.currentScreen) return next;
  return {
    ...next,
    ...(leaving === "T07" ? { breathState: "idle" as const } : {}),
    ...(leaving === "T09" ? { audioState: "idle" as const } : {}),
    ...(leaving === "T11" ? { guideStep: 0 } : {}),
    ...(leaving === "T12" && !supportScreens.includes(next.currentScreen)
      ? { checkinChoice: "", checkinOther: "" }
      : {}),
  };
}

function ParticipantApp() {
  const [state, setState] = useState<AppState>(loadState);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [supportFlow, setSupportFlow] = useState<"support" | "record">("support");
  const [catalogFilter, setCatalogFilter] = useState("Todas");

  // A sessão remota só existe se o participante abriu um link gerado pelo OP01.
  const ozSessionId = parseSessionId(new URLSearchParams(window.location.search).get("sessao"));
  const [ozStatus, setOzStatus] = useState<"conectado" | "conectando" | "erro">("conectando");
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);
  useEffect(() => {
    if (!ozSessionId) return;
    let isConnected = false;
    const sendPresence = () => {
      if (isConnected) void connection.send({ kind: "participante_presente", sentAt: Date.now() });
    };
    const connection = joinOzSession(
      ozSessionId,
      (msg: OzMessage) => {
        if (msg.kind === "pesquisador_presente") {
          sendPresence();
          return;
        }
        if (msg.kind !== "comando") return;
        const validTypes: OzCommandType[] = ["SIM_EVENTO_ACUSTICO", "SIM_EVENTO_NOMINAL", "SIM_INDISPONIVEL", "SIM_RESET"];
        if (!validTypes.includes(msg.type) || !/^[a-f0-9-]{36}$/.test(msg.id)) return;
        const current = stateRef.current;
        let status: "exibido" | "processado" | "ignorado" = "ignorado";
        let reason = "Condição demonstrativa não atendida.";
        if (msg.type === "SIM_EVENTO_ACUSTICO") {
          if (current.acousticMode === "sim_on" && current.acousticConsentDemo && current.invitesEnabled) {
            setState((previous) => ({ ...previous, inviteVisible: true }));
            status = "exibido";
            reason = "Convite T19 mostrado sem modificar a atividade aberta.";
          } else {
            reason = "Participante não habilitou simulação, permissão ou convites.";
          }
        } else if (msg.type === "SIM_EVENTO_NOMINAL") {
          if (current.voiceCallDemo === "sim_on" && current.friendConfigured && current.acousticConsentDemo) {
            setState((previous) => settleLeavingState(previous, {
              ...previous,
              ...openScreen(previous, "T12"),
              inviteVisible: false,
            }));
            status = "processado";
            reason = "Apoio nominal simulado aberto em T12; autorrelato é opcional.";
          } else {
            reason = "Acesso nominal, amigo virtual ou permissão demonstrativa não habilitado.";
          }
        } else if (msg.type === "SIM_INDISPONIVEL") {
          setState((previous) => ({ ...previous, acousticMode: "unavailable", inviteVisible: false }));
          status = "processado";
          reason = "Indisponibilidade simulada; apoio manual continua disponível.";
        } else if (msg.type === "SIM_RESET") {
          setState((previous) => ({ ...previous, inviteVisible: false, permissionVisible: false }));
          status = "processado";
          reason = "Convites e modais de teste fechados; preferências preservadas.";
        }
        void connection.send({ kind: "confirmacao", id: msg.id, status, reason, sentAt: Date.now() });
      },
      (status) => {
        isConnected = status === "conectado";
        setOzStatus(status);
        if (isConnected) sendPresence();
      },
    );
    const pingTimer = window.setInterval(sendPresence, 9_000);
    return () => { window.clearInterval(pingTimer); connection.close(); };
  }, [ozSessionId]);

  useEffect(() => {
    sessionStorage.setItem(stateKey, JSON.stringify(state));
  }, [state]);
  useEffect(() => {
    try {
      localStorage.setItem("calmtea-audio-preferences", JSON.stringify({
        audioFavoriteIds: state.audioFavoriteIds,
        audioVolume: state.audioVolume,
        audioTrackId: state.audioTrackId,
      }));
    } catch { /* o uso do player não depende de armazenamento local */ }
  }, [state.audioFavoriteIds, state.audioVolume, state.audioTrackId]);

  const update = (partial: Partial<AppState>) =>
    setState((previous) => ({ ...previous, ...partial }));
  const message = (text: string, tone: NonNullable<Feedback>["tone"] = "info") => {
    setFeedback({ text, tone });
    window.setTimeout(() => setFeedback(null), 4200);
  };
  const applyNavigation = (
    resolve: (previous: AppState) => NavigationState,
    patch: Partial<AppState> = {},
  ) =>
    setState((previous) =>
      settleLeavingState(previous, { ...previous, ...patch, ...resolve(previous) }),
    );
  const announceInterruption = () => {
    if (state.currentScreen === "T09" && state.audioState !== "idle" && state.mediaAvailable) {
      message("Reprodução interrompida ao sair do reprodutor.");
    } else if (state.currentScreen === "T07" && state.breathState !== "idle") {
      message("Exercício de respiração encerrado.");
    }
  };
  /** Abre uma tela, empilhando a atual no histórico (ou substituindo-a com replace). */
  const navigate = (
    screen: Screen,
    options: { replace?: boolean; patch?: Partial<AppState> } = {},
  ) => {
    announceInterruption();
    applyNavigation((previous) => openScreen(previous, screen, options.replace), options.patch);
  };
  /** Voltar: retorna um nível no histórico. */
  const goBack = () => {
    announceInterruption();
    applyNavigation(backOneLevel);
  };
  /** Fechar / Sair: encerra o recurso atual e retorna à tela que o abriu. */
  const closeCurrent = () => {
    announceInterruption();
    applyNavigation((previous) => closeFlow(previous));
  };
  const navigatePrimary = (screen: "T01" | "T02" | "T17") => {
    announceInterruption();
    setState((previous) =>
      settleLeavingState(previous, {
        ...previous,
        currentScreen: screen,
        history: screen === "T01" ? [] : ["T01"],
        setupState: previous.history.some((item) => setupScreens.includes(item))
          ? previous.setupPreviousState
          : previous.setupState,
      }),
    );
  };
  const toggleFavorite = (id: StrategyId) =>
    setState((previous) => ({
      ...previous,
      favorites: previous.favorites.includes(id)
        ? previous.favorites.filter((favorite) => favorite !== id)
        : [...previous.favorites, id],
    }));
  const savePersonalStrategy = (strategy: PersonalStrategy) =>
    setState((previous) => ({
      ...previous,
      personalStrategies: previous.personalStrategies.some((item) => item.id === strategy.id)
        ? previous.personalStrategies.map((item) => (item.id === strategy.id ? strategy : item))
        : [...previous.personalStrategies, strategy],
    }));
  const removePersonalStrategy = (id: string) =>
    setState((previous) => ({
      ...previous,
      personalStrategies: previous.personalStrategies.filter((item) => item.id !== id),
    }));
  const addSceneItem = (kind: SceneKind) =>
    setState((previous) => {
      const index = previous.sceneItems.length;
      const item: SceneItem = {
        id: `${kind}-${Date.now()}`,
        kind,
        x: 20 + ((index * 36) % 190),
        y: 96 + ((index * 31) % 115),
      };
      return {
        ...previous,
        sceneUndoStack: [...previous.sceneUndoStack, previous.sceneItems],
        sceneItems: [...previous.sceneItems, item],
        selectedSceneId: item.id,
      };
    });
  const moveSceneItem = (id: string, x: number, y: number) =>
    setState((previous) => ({
      ...previous,
      sceneItems: previous.sceneItems.map((item) => (item.id === id ? { ...item, x, y } : item)),
    }));
  const captureSceneForUndo = () =>
    setState((previous) => ({
      ...previous,
      sceneUndoStack: [...previous.sceneUndoStack, previous.sceneItems],
    }));
  const removeSelectedSceneItem = () =>
    setState((previous) => {
      if (!previous.selectedSceneId) return previous;
      return {
        ...previous,
        sceneUndoStack: [...previous.sceneUndoStack, previous.sceneItems],
        sceneItems: previous.sceneItems.filter((item) => item.id !== previous.selectedSceneId),
        selectedSceneId: null,
      };
    });
  const undoScene = () =>
    setState((previous) => {
      const snapshot = previous.sceneUndoStack.at(-1);
      if (!snapshot) return previous;
      return {
        ...previous,
        sceneItems: snapshot,
        sceneUndoStack: previous.sceneUndoStack.slice(0, -1),
        selectedSceneId: null,
      };
    });
  const clearScene = () =>
    setState((previous) => ({
      ...previous,
      sceneUndoStack: [...previous.sceneUndoStack, previous.sceneItems],
      sceneItems: [],
      selectedSceneId: null,
    }));
  const beginSetup = (origin: SetupOrigin, entryScreen: SetupScreen = "T25") =>
    setState((previous) =>
      settleLeavingState(previous, {
        ...previous,
        ...openScreen(previous, entryScreen),
        setupOrigin: origin,
        setupEntryScreen: entryScreen,
        setupPreviousState: previous.setupState,
        setupState: "partial",
        setupDraft: {
          interests: [...previous.profileInterests],
          sensory: { ...previous.sensoryResources },
          silence: previous.prefSilence,
          genres: [...previous.prefGenres],
          tracks: [...previous.prefTracks],
          games: [...previous.favGames],
          avatar: previous.selectedAvatar,
          avatarName: previous.avatarName,
          avatarPalette: previous.avatarPalette,
          avatarAccessory: previous.avatarAccessory,
          friendName: previous.friendConfigured ? previous.friendName : "",
          friendStyle: previous.friendStyle,
          friendPalette: previous.friendPalette,
          friendAccessory: previous.friendAccessory,
        },
      }),
    );
  const updateSetupDraft = (partial: Partial<SetupDraft>) =>
    setState((previous) => ({ ...previous, setupDraft: { ...previous.setupDraft, ...partial } }));
  // Sai da configuração sem aplicar o rascunho e retorna à tela que a abriu (T24, T34 ou T37).
  const cancelSetupState = (previous: AppState): AppState =>
    settleLeavingState(previous, {
      ...previous,
      ...closeFlow(previous, setupScreens, previous.setupOrigin === "T34" ? "T34" : "T24"),
      setupState: previous.setupPreviousState,
    });
  const closeSetup = () => {
    setState(cancelSetupState);
    message("Configuração fechada. Nenhuma alteração foi salva.");
  };
  // Voltar na etapa de entrada sai da configuração; nas demais, retorna à etapa anterior.
  const backSetupStep = () =>
    setState((previous) =>
      previous.currentScreen === previous.setupEntryScreen
        ? cancelSetupState(previous)
        : settleLeavingState(previous, { ...previous, ...backOneLevel(previous) }),
    );
  const finishSetup = () => {
    setState((previous) => {
      const draft = previous.setupDraft;
      const destination: NavigationState =
        previous.setupOrigin === "T34"
          ? closeFlow(previous, setupScreens, "T34")
          : { currentScreen: "T01", history: [] };
      return settleLeavingState(previous, {
        ...previous,
        ...destination,
        profileInterests: [...draft.interests],
        sensoryResources: { ...draft.sensory },
        prefSilence: draft.silence,
        prefGenres: [...draft.genres],
        prefTracks: [...draft.tracks],
        favGames: [...draft.games],
        selectedAvatar: draft.avatar,
        avatarName: draft.avatarName,
        avatarPalette: draft.avatarPalette,
        avatarAccessory: draft.avatarAccessory,
        friendName: draft.friendName.trim() || "Calma",
        friendConfigured: Boolean(draft.friendName.trim()),
        friendStyle: draft.friendStyle,
        friendPalette: draft.friendPalette,
        friendAccessory: draft.friendAccessory,
        setupState: "done",
        setupPreviousState: "done",
      });
    });
    message("Configuração salva nesta sessão.", "success");
  };
  const selectMatchCard = (id: string, pair: string) =>
    setState((previous) => {
      if (previous.matchedPairs.includes(id)) return previous;
      const selected = previous.matchSelected;
      if (selected.includes(id)) return previous;
      if (selected.length >= 2) return { ...previous, matchSelected: [id], matchFeedback: "" };
      const next = [...selected, id];
      if (next.length < 2) return { ...previous, matchSelected: next, matchFeedback: "" };
      const firstPair = matchingCards.find((card) => card.id === next[0])?.pair;
      if (firstPair === pair) {
        return {
          ...previous,
          matchSelected: [],
          matchedPairs: [...previous.matchedPairs, ...next],
          matchFeedback: "Par encontrado. Você pode continuar ou sair.",
        };
      }
      return {
        ...previous,
        matchSelected: next,
        matchFeedback: "Tente outra combinação. Você pode escolher novamente.",
      };
    });
  const resetMatches = () => update({ matchSelected: [], matchedPairs: [], matchFeedback: "" });
  const advancePath = (point: number) => {
    if (point === state.pathStep + 1) update({ pathStep: point });
    else message("Escolha o próximo ponto conectado. Você pode desfazer ou reiniciar.", "info");
  };
  const startSupport = () => {
    setSupportFlow("support");
    navigate("T12", {
      patch: { checkinChoice: "", checkinOther: "", context: "", contextOther: "" },
    });
  };
  /** Recomendações abrem a estratégia específica, sem desvio pelo catálogo. */
  const openRecommendedStrategy = (title: string, category: string) => {
    if (title === "Catálogo completo") {
      setCatalogFilter("Todas");
      navigate("T02");
      return;
    }
    if (title === "Pausa silenciosa") return navigate("T05");
    if (title === "Respiração guiada" || title === "Respiração voluntária") return navigate("T07", { patch: { breathState: "active" } });
    if (title === "Músicas e sons") return navigate("T08");
    if (title === "Monte seu espaço") return navigate("T10");
    if (title === "Apoio fora da tela") return navigate("T16");
    if (title === "Orientação breve") return navigate("T11", { patch: { guideStep: 0 } });
    if (title === "História contextual") {
      const contextStories: Record<string, StoryId> = {
        Barulho: "sons", Mudança: "mudanca", Frustração: "frustracao",
        "Situação social": "social", Medo: "medo", Raiva: "raiva",
        Cansaço: "cansaco", Dor: "dor",
      };
      return navigate("T15", {
        patch: { storyId: contextStories[state.context] ?? "sons", storyScene: 0 },
      });
    }
    // Estratégias pessoais precisam da descrição registrada pelo próprio participante.
    if (category === "Pessoais") return navigate("T04");
    setCatalogFilter(category);
    navigate("T02");
  };
  // Cancelar ou fechar a consulta antes das sugestões descarta o rascunho do autorrelato.
  const leaveSupport = (announce: boolean) => {
    applyNavigation(
      (previous) => closeFlow(previous, supportScreens),
      supportFlow === "support"
        ? { checkinChoice: "", checkinOther: "", context: "", contextOther: "" }
        : { checkinChoice: "", checkinOther: "" },
    );
    if (announce) {
      message(
        supportFlow === "support"
          ? "Consulta cancelada. Nenhuma resposta foi registrada."
          : "Autorrelato cancelado. Nenhuma resposta foi registrada.",
      );
    }
  };
  const endSupport = () => {
    applyNavigation((previous) => closeFlow(previous, supportJourneyScreens, "T01"));
    message("Apoio encerrado. Você pode voltar quando quiser.");
  };
  const finishInvite = (text: string) => {
    update({ inviteVisible: false });
    message(text);
  };

  const rootClass = `participant-app ${state.contrastMode ? "contrast-mode" : ""} ${state.reduceMotion ? "reduce-motion" : ""}`;
  const scale = [1, 1.125, 1.25][state.textScale];
  const backTarget = state.history.at(-1) ?? parentScreen[state.currentScreen];
  const backDestinationLabel = `Voltar para ${screenShortTitles[backTarget]}`;
  const headerLabels = {
    back: backDestinationLabel,
    close: `Fechar e voltar para ${screenShortTitles[closeFlow(state).currentScreen]}`,
  };

  return (
    <div className={rootClass} style={{ "--font-scale": scale } as React.CSSProperties}>
      <main className="mobile-frame" aria-live="polite">
        {ozSessionId && (
          <div className="oz-participant-status" role="status">
            Sessão demonstrativa remota: {ozStatus === "conectado" ? "conectada" : ozStatus === "conectando" ? "conectando…" : "sem conexão"}
          </div>
        )}
        <HeaderLabelsProvider value={headerLabels}>
          {state.currentScreen === "T24" && (
            <WelcomeScreen onUse={() => navigate("T01")} onConfigure={() => beginSetup("T24")} />
          )}
          {state.currentScreen === "T01" && (
            <HomeScreen
              state={state}
              onBack={goBack}
              onSupport={startSupport}
              onCatalog={() => navigate("T02")}
              onProfile={() => navigate("T34")}
              onFavorites={() => navigate("T03")}
              onGuidance={() => navigate("T11", { patch: { guideStep: 0 } })}
              onCheckIn={() => {
                setSupportFlow("record");
                navigate("T12", { patch: { checkinChoice: "", checkinOther: "" } });
              }}
              onToggleAcoustic={() => {
                if (state.acousticMode === "sim_on") {
                  update({ acousticMode: "off", acousticConsentDemo: false, permissionDemoState: "off" });
                  message("Simulação acústica desativada.");
                } else {
                  update({ permissionVisible: true });
                }
              }}
              onToggleInvites={() => update({ invitesEnabled: !state.invitesEnabled })}
              onOpenPermission={() => update({ permissionVisible: true })}
            />
          )}
          {state.currentScreen === "T02" && (
            <CatalogScreen
              filter={catalogFilter}
              onFilter={setCatalogFilter}
              onOpenSupport={startSupport}
              onBack={goBack}
              onClose={closeCurrent}
              favorites={state.favorites}
              onToggleFavorite={toggleFavorite}
              onOpen={(screen) =>
                navigate(screen === "T06" ? "T07" : screen, screen === "T06" ? { patch: { breathState: "active" } } : screen === "T11" ? { patch: { guideStep: 0 } } : {})
              }
              onOpenFavorites={() => navigate("T03")}
              onOpenPersonal={() => navigate("T04")}
            />
          )}
          {state.currentScreen === "T03" && (
            <FavoritesScreen
              favorites={state.favorites}
              onBack={goBack}
              onClose={closeCurrent}
              onToggleFavorite={toggleFavorite}
              onOpen={(screen) => navigate(screen === "T06" ? "T07" : screen, screen === "T06" ? {patch:{breathState:"active"}} : {})}
              onCatalog={() => navigate("T02")}
            />
          )}
          {state.currentScreen === "T04" && (
            <PersonalStrategiesScreen
              strategies={state.personalStrategies}
              onBack={goBack}
              onClose={closeCurrent}
              onCancelEdit={() => message("Edição cancelada. Nada foi alterado.")}
              onSave={(strategy) => {
                savePersonalStrategy(strategy);
                message("Estratégia salva nesta sessão.", "success");
              }}
              onRemove={(id) => {
                removePersonalStrategy(id);
                message("Estratégia excluída desta sessão.", "success");
              }}
            />
          )}
          {state.currentScreen === "T05" && (
            <PauseScreen
              onBack={goBack}
              onClose={closeCurrent}
              onContinue={() => message("Você pode permanecer em pausa pelo tempo que quiser.")}
            />
          )}
          {state.currentScreen === "T06" && (
            <BreathingIntroScreen
              onBack={goBack}
              onClose={closeCurrent}
              onStart={() => navigate("T07", { patch: { breathState: "active" } })}
            />
          )}
          {state.currentScreen === "T07" && (
            <BreathingExerciseScreen
              state={state.breathState}
              onBack={goBack}
              onClose={closeCurrent}
              onToggle={() =>
                update({ breathState: state.breathState === "active" ? "paused" : "active" })
              }
            />
          )}
          {state.currentScreen === "T08" && (
            <MusicLibraryScreen
              prefersSilence={state.prefSilence}
              favoriteIds={state.audioFavoriteIds}
              preferredGenres={state.prefGenres}
              onBack={goBack}
              onClose={closeCurrent}
              backLabel={backDestinationLabel}
              onOpenPlayer={(audioTrackId) =>
                navigate("T09", {
                  patch: {
                    audioTrackId: audioTrackId ?? "chuva",
                    mediaAvailable: audioTrackId !== null,
                    audioState: audioTrackId === null ? "error" : "idle",
                    ...(audioTrackId !== null ? { prefSilence: false } : {}),
                  },
                })
              }
              onFavorite={(id) => update({ audioFavoriteIds:
                state.audioFavoriteIds.includes(id)
                  ? state.audioFavoriteIds.filter((item) => item !== id)
                  : [...state.audioFavoriteIds, id]
              })}
              onSilent={() => {
                const prefersSilence = !state.prefSilence;
                update({ prefSilence: prefersSilence, audioState: "idle" });
                message(
                  prefersSilence
                    ? "Silêncio escolhido. Nenhuma mídia será iniciada."
                    : "A preferência por silêncio foi removida desta sessão.",
                );
              }}
            />
          )}
          {state.currentScreen === "T09" && (
            <PlayerScreen
              state={state}
              onBack={goBack}
              onClose={closeCurrent}
              onAudioState={(audioState) => update({ audioState })}
              onVolume={(audioVolume) => update({ audioVolume })}
              onFavorite={(id) => update({ audioFavoriteIds:
                state.audioFavoriteIds.includes(id)
                  ? state.audioFavoriteIds.filter((item) => item !== id)
                  : [...state.audioFavoriteIds, id]
              })}
            />
          )}
          {state.currentScreen === "T10" && (
            <SpaceGameScreen
              items={state.sceneItems}
              selectedId={state.selectedSceneId}
              canUndo={state.sceneUndoStack.length > 0}
              onBack={goBack}
              onClose={closeCurrent}
              onAdd={addSceneItem}
              onMove={moveSceneItem}
              onStartMove={captureSceneForUndo}
              onSelect={(selectedSceneId) => update({ selectedSceneId })}
              onRemove={removeSelectedSceneItem}
              onUndo={undoScene}
              onClear={clearScene}
            />
          )}
          {state.currentScreen === "T22" && (
            <MatchingGameScreen
              selected={state.matchSelected}
              matched={state.matchedPairs}
              feedback={state.matchFeedback}
              onSelect={selectMatchCard}
              onReset={resetMatches}
              onBack={goBack}
              onClose={closeCurrent}
            />
          )}
          {state.currentScreen === "T23" && (
            <PathGameScreen
              step={state.pathStep}
              onPoint={advancePath}
              onUndo={() => update({ pathStep: Math.max(0, state.pathStep - 1) })}
              onReset={() => update({ pathStep: 0 })}
              onBack={goBack}
              onClose={closeCurrent}
            />
          )}
          {state.currentScreen === "T11" && (
            <GuidanceScreen
              step={state.guideStep}
              friendName={state.friendName}
              friendStyle={state.friendStyle}
              friendPalette={state.friendPalette}
              friendAccessory={state.friendAccessory}
              onBack={goBack}
              onPrevious={() =>
                state.guideStep === 0 ? goBack() : update({ guideStep: state.guideStep - 1 })
              }
              onNext={() =>
                state.guideStep < guidanceSteps.length - 1
                  ? update({ guideStep: state.guideStep + 1 })
                  : closeCurrent()
              }
              onExit={closeCurrent}
            />
          )}
          {state.currentScreen === "T12" && (
            <CheckInScreen
              state={state}
              source={supportFlow}
              onBack={goBack}
              onClose={() => leaveSupport(false)}
              onCancel={() => leaveSupport(true)}
              onChoice={(choice) => update({ checkinChoice: choice })}
              onOther={(checkinOther) => update({ checkinOther })}
              onSkip={() => (supportFlow === "support" ? navigate("T33") : goBack())}
              onContinue={() => {
                if (supportFlow === "support") navigate("T32");
                else if (state.checkinChoice || state.checkinOther.trim()) {
                  // A confirmação substitui o formulário: Voltar em T13 não reabre um relato já registrado.
                  navigate("T13", {
                    replace: true,
                    patch: { selfReport: state.checkinOther.trim() || state.checkinChoice },
                  });
                } else message("Escolha uma opção, escreva outra resposta ou use Ignorar.");
              }}
            />
          )}
          {state.currentScreen === "T13" && (
            <ConfirmationScreen
              onBack={goBack}
              onClose={closeCurrent}
              onHome={() => navigate("T01")}
            />
          )}
          {state.currentScreen === "T14" && (
            <StoryListScreen
              context={state.context}
              onBack={goBack}
              onClose={closeCurrent}
              onOpen={(storyId) =>
                navigate(state.context && state.context !== "Não quero responder" ? "T35" : "T15", {
                  patch: { storyId, storyScene: 0 },
                })
              }
            />
          )}
          {state.currentScreen === "T15" && (
            <StoryReaderScreen
              screen="T15"
              storyId={state.storyId}
              scene={state.storyScene}
              friendName={state.friendName}
              friendStyle={state.friendStyle}
              friendPalette={state.friendPalette}
              friendAccessory={state.friendAccessory}
              onBack={goBack}
              onPrevious={() =>
                state.storyScene === 0 ? goBack() : update({ storyScene: state.storyScene - 1 })
              }
              onNext={() =>
                state.storyScene < storyData[state.storyId].scenes.length - 1
                  ? update({ storyScene: state.storyScene + 1 })
                  : goBack()
              }
              onExit={closeCurrent}
            />
          )}
          {state.currentScreen === "T16" && (
            <OutsideSupportScreen
              onBack={goBack}
              onClose={closeCurrent}
              onEnd={endSupport}
              onCatalog={() => navigate("T02")}
            />
          )}
          {state.currentScreen === "T32" && (
            <ContextScreen
              state={state}
              onBack={goBack}
              onClose={() => leaveSupport(false)}
              onCancel={() => leaveSupport(true)}
              onChoice={(context) => update({ context, contextOther: "" })}
              onOther={(contextOther) =>
                update({
                  context: contextOther.trim() ? "Outra situação" : "",
                  contextOther,
                })
              }
              onContinue={() => navigate("T33")}
            />
          )}
          {state.currentScreen === "T33" && (
            <SuggestionsScreen
              state={state}
              onBack={goBack}
              onClose={closeCurrent}
              onIgnore={closeCurrent}
              onRecommendation={openRecommendedStrategy}
              onCatalog={(filter) => {
                if (filter === "Histórias") {
                  navigate("T14");
                } else if (filter === "Pessoais") {
                  navigate("T04");
                } else {
                  setCatalogFilter(filter);
                  navigate("T02");
                }
              }}
            />
          )}
          {state.currentScreen === "T17" && (
            <SettingsScreen
              state={state}
              onBack={goBack}
              onClose={closeCurrent}
              onUpdate={update}
              onReset={() => {
                update({
                  soundEnabled: true,
                  reduceMotion: false,
                  contrastMode: false,
                  textScale: 0,
                });
                message("Ajustes restaurados para os valores de referência.", "success");
              }}
              onOpenTracking={() => navigate("T18")}
              onOpenVoice={() => navigate("T36")}
              onOpenAppearance={() => navigate("T20")}
              onOpenProfile={() => navigate("T34")}
            />
          )}
          {state.currentScreen === "T18" && (
            <TrackingScreen
              state={state}
              onBack={goBack}
              onClose={closeCurrent}
              onToggleAcoustic={() => {
                if (state.acousticMode === "sim_on") {
                  update({
                    acousticMode: "off",
                    acousticConsentDemo: false,
                    permissionDemoState: "off",
                  });
                  message("Simulação acústica desativada.");
                } else update({ permissionVisible: true });
              }}
              onToggleInvites={() => update({ invitesEnabled: !state.invitesEnabled })}
              onOpenPermission={() => update({ permissionVisible: true })}
              onManualSupport={startSupport}
            />
          )}
          {state.currentScreen === "T20" && (
            <AppearanceScreen
              state={state}
              onBack={goBack}
              onClose={closeCurrent}
              onSave={() => {
                message("Aparência salva nesta sessão.", "success");
                goBack();
              }}
              onSelectTheme={(contrast) => update({ contrastMode: contrast })}
              onSelectAvatar={(selectedAvatar) => update({ selectedAvatar })}
            />
          )}
          {state.currentScreen === "T25" && (
            <SetupInterestsScreen
              draft={state.setupDraft}
              onToggle={(interest) =>
                updateSetupDraft({
                  interests: state.setupDraft.interests.includes(interest)
                    ? state.setupDraft.interests.filter((item) => item !== interest)
                    : [...state.setupDraft.interests, interest],
                })
              }
              onBack={backSetupStep}
              onClose={closeSetup}
              onNext={() => navigate("T26")}
              onSkip={() => navigate("T26")}
              onUseNow={finishSetup}
            />
          )}
          {state.currentScreen === "T26" && (
            <SetupSensoryScreen
              draft={state.setupDraft}
              onSelect={(resource, value) =>
                updateSetupDraft({ sensory: { ...state.setupDraft.sensory, [resource]: value } })
              }
              onBack={backSetupStep}
              onClose={closeSetup}
              onNext={() => navigate("T27")}
            />
          )}
          {state.currentScreen === "T27" && (
            <SetupMusicScreen
              draft={state.setupDraft}
              onSilence={() => updateSetupDraft({ silence: !state.setupDraft.silence })}
              onToggleGenre={(genre) =>
                updateSetupDraft({
                  genres: state.setupDraft.genres.includes(genre)
                    ? state.setupDraft.genres.filter((item) => item !== genre)
                    : [...state.setupDraft.genres, genre],
                })
              }
              onAddTrack={(track) => {
                const normalized = track.trim();
                if (!normalized) return;
                if (
                  state.setupDraft.tracks.some(
                    (savedTrack) =>
                      savedTrack.toLocaleLowerCase() === normalized.toLocaleLowerCase(),
                  )
                ) {
                  message("Essa faixa já está nas preferências.");
                  return;
                }
                updateSetupDraft({ tracks: [...state.setupDraft.tracks, normalized] });
              }}
              onRemoveTrack={(track) =>
                updateSetupDraft({
                  tracks: state.setupDraft.tracks.filter((savedTrack) => savedTrack !== track),
                })
              }
              onBack={backSetupStep}
              onClose={closeSetup}
              onNext={() => navigate("T28")}
            />
          )}
          {state.currentScreen === "T28" && (
            <SetupGamesScreen
              draft={state.setupDraft}
              onToggleGame={(game) =>
                updateSetupDraft({
                  games: state.setupDraft.games.includes(game)
                    ? state.setupDraft.games.filter((item) => item !== game)
                    : [...state.setupDraft.games, game],
                })
              }
              onTry={(screen) => navigate(screen)}
              onBack={backSetupStep}
              onClose={closeSetup}
              onNext={() => navigate("T29")}
              onSkip={() => navigate("T29")}
            />
          )}
          {state.currentScreen === "T29" && (
            <SetupAvatarScreen
              draft={state.setupDraft}
              onName={(avatarName) => updateSetupDraft({ avatarName })}
              onAvatar={(avatar) => updateSetupDraft({ avatar })}
              onPalette={(avatarPalette) => updateSetupDraft({ avatarPalette })}
              onAccessory={(avatarAccessory) => updateSetupDraft({ avatarAccessory })}
              onBack={backSetupStep}
              onClose={closeSetup}
              onNext={() => navigate("T30")}
              onSkip={() => navigate("T30")}
            />
          )}
          {state.currentScreen === "T30" && (
            <SetupFriendScreen
              draft={state.setupDraft}
              onName={(friendName) => updateSetupDraft({ friendName })}
              onStyle={(friendStyle) => updateSetupDraft({ friendStyle })}
              onPalette={(friendPalette) => updateSetupDraft({ friendPalette })}
              onAccessory={(friendAccessory) => updateSetupDraft({ friendAccessory })}
              onBack={backSetupStep}
              onClose={closeSetup}
              onNext={() => navigate("T31")}
              onSkip={() => navigate("T31")}
            />
          )}
          {state.currentScreen === "T31" && (
            <SetupReviewScreen
              draft={state.setupDraft}
              onBack={backSetupStep}
              onClose={closeSetup}
              onCorrect={() => navigate(state.setupEntryScreen)}
              onFinish={finishSetup}
            />
          )}
          {state.currentScreen === "T35" && (
            <StoryReaderScreen
              screen="T35"
              storyId={state.storyId}
              scene={state.storyScene}
              friendName={state.friendName}
              friendStyle={state.friendStyle}
              friendPalette={state.friendPalette}
              friendAccessory={state.friendAccessory}
              onBack={goBack}
              onPrevious={() =>
                state.storyScene === 0 ? goBack() : update({ storyScene: state.storyScene - 1 })
              }
              onNext={() =>
                state.storyScene < storyData[state.storyId].scenes.length - 1
                  ? update({ storyScene: state.storyScene + 1 })
                  : goBack()
              }
              onExit={closeCurrent}
            />
          )}
          {state.currentScreen === "T36" && (
            <VoiceAccessScreen
              state={state}
              onBack={goBack}
              onClose={closeCurrent}
              backLabel={backDestinationLabel}
              onToggle={() => {
                if (!state.friendConfigured)
                  message("Configure o nome do amigo antes de habilitar esta demonstração.");
                else update({ voiceCallDemo: state.voiceCallDemo === "sim_on" ? "off" : "sim_on" });
              }}
              onManualSupport={startSupport}
            />
          )}
          {state.currentScreen === "T34" && (
            <ProfileScreen
              state={state}
              onBack={goBack}
              onClose={closeCurrent}
              backLabel={backDestinationLabel}
              onEdit={(entryScreen) => beginSetup("T34", entryScreen)}
              onFriend={() => navigate("T37")}
              onPersonal={() => navigate("T04")}
              onFavorites={() => navigate("T03")}
            />
          )}
          {state.currentScreen === "T37" && (
            <FriendDetailsScreen
              state={state}
              onBack={goBack}
              onClose={closeCurrent}
              onEdit={() => beginSetup("T34", "T30")}
            />
          )}
        </HeaderLabelsProvider>

        {!["T24", "T25", "T26", "T27", "T28", "T29", "T30", "T31"].includes(
          state.currentScreen,
        ) && <BottomNav current={state.currentScreen} onNavigate={navigatePrimary} />}

        {feedback && (
          <div className={`C20-InlineFeedback feedback feedback--${feedback.tone}`}>
            {feedback.text}
          </div>
        )}
        {state.inviteVisible && (
          <SupportInvite
            onClose={() => finishInvite("Convite fechado. Nenhum estado foi registrado.")}
            onSupport={() => {
              update({ inviteVisible: false });
              startSupport();
            }}
            onWell={() => finishInvite("Você escolheu “Estou bem”. Nenhum estado foi registrado.")}
            onLater={() => finishInvite("Você escolheu “Agora não”. Nenhum estado foi registrado.")}
          />
        )}
        {state.permissionVisible && (
          <PermissionSimulation
            onGrant={() => {
              update({
                permissionVisible: false,
                permissionDemoState: "granted-demo",
                acousticConsentDemo: true,
                acousticMode: "sim_on",
              });
              message(
                "Permissão demonstrativa concedida. Nenhum microfone foi acessado.",
                "success",
              );
            }}
            onDeny={() => {
              update({
                permissionVisible: false,
                permissionDemoState: "denied-demo",
                acousticConsentDemo: false,
                acousticMode: "unavailable",
              });
              message("Permissão demonstrativa negada. O apoio manual continua disponível.");
            }}
            onClose={() => update({ permissionVisible: false })}
            onManualSupport={() => {
              update({ permissionVisible: false });
              startSupport();
            }}
          />
        )}
      </main>
    </div>
  );
}

function WelcomeScreen({ onUse, onConfigure }: { onUse: () => void; onConfigure: () => void }) {
  return (
    <section className="T24-Welcome welcome-screen">
      <DeviceStatus />
      <div className="welcome-art" aria-hidden="true">
        <span className="welcome-sun" />
        <span className="welcome-hill welcome-hill--back" />
        <span className="welcome-hill welcome-hill--front" />
      </div>
      <h1>Bem-vindo(a)!</h1>
      <p className="lead">
        Um lugar para reorganizar as ideias, encontrar conforto e seguir com mais leveza.
      </p>
      <div className="welcome-preview-list">
        <div>
          <span>
            <Icon name="support" />
          </span>
          <p>
            <b>Estratégias de apoio</b>
            <small>Recursos simples e variados para diferentes momentos.</small>
          </p>
        </div>
        <div>
          <span>
            <Icon name="settings" />
          </span>
          <p>
            <b>Personalização</b>
            <small>Ajuste a experiência conforme as suas preferências.</small>
          </p>
        </div>
        <div>
          <span>
            <Icon name="info" />
          </span>
          <p>
            <b>Uso voluntário</b>
            <small>Você escolhe o que usar, quando e como.</small>
          </p>
        </div>
      </div>
      <div className="welcome-actions">
        <Button onClick={onUse}>Usar agora</Button>
        <Button variant="tertiary" onClick={onConfigure}>
          Configurar
        </Button>
      </div>
    </section>
  );
}

function HomeScreen({
  state,
  onBack,
  onSupport,
  onCatalog,
  onProfile,
  onFavorites,
  onCheckIn,
  onGuidance,
  onToggleAcoustic,
  onToggleInvites,
  onOpenPermission,
}: {
  state: AppState;
  onBack: () => void;
  onSupport: () => void;
  onCatalog: () => void;
  onProfile: () => void;
  onFavorites: () => void;
  onCheckIn: () => void;
  onGuidance: () => void;
  onToggleAcoustic: () => void;
  onToggleInvites: () => void;
  onOpenPermission: () => void;
}) {
  const [orientationIndex, setOrientationIndex] = useState(0);
  const orientationSteps = [
    {title:"Comece pelo que está ao alcance",text:"Um minuto em um lugar mais tranquilo pode ajudar a reorganizar as ideias."},
    {title:"Diminua os estímulos",text:"Se o ambiente estiver intenso, experimente reduzir luz, ruídos ou movimento ao seu redor."},
    {title:"Busque algo familiar",text:"Uma música conhecida, um objeto confortável ou uma pessoa de confiança podem trazer segurança."},
  ];
  useEffect(()=>{
    const media=window.matchMedia("(prefers-reduced-motion: reduce)");
    if(media.matches || state.reduceMotion)return;
    const id=window.setInterval(()=>setOrientationIndex(i=>(i+1)%orientationSteps.length),15000);
    return()=>window.clearInterval(id);
  },[state.reduceMotion]);
  const orientation=orientationSteps[orientationIndex];
  return (
    <section className="T01-Home screen">
      <AppHeader title="Início" onBack={onBack} />
      <div className="screen-content home-content">
        <div>
          <h1>Olá!</h1>
          <p className="lead">
            Que bom ter você por aqui.
            <br />
            Vamos encontrar um pouco de espaço para você hoje.
          </p>
        </div>
        <div className="home-companion">
          <img className="home-hero-photo" src="/images/avatars/portrait-03.webp" alt="Retrato ilustrativo de pessoa jovem com cabelos cacheados" />
          <div className="home-hero-copy"><span>Um espaço de apoio</span><strong>Um passo de cada vez.</strong><p>Comece pelo que pode trazer conforto agora.</p></div>
        </div>
        <div className="home-main-actions">
          <Button onClick={onSupport}>
            <Icon name="leaf" size={22} />
            Quero apoio<small>Acessar estratégias agora</small>
          </Button>
          <Button variant="secondary" onClick={onCatalog}>
            <Icon name="grid" size={22} />
            Explorar estratégias<small>Ver todas as opções disponíveis</small>
          </Button>
        </div>
        <div className="quick-access">
          <b>Acesso rápido</b>
          <div>
            <button onClick={onProfile}>
              <Icon name="bookmark" />
              <span>
                Minhas
                <br />
                preferências
              </span>
            </button>
            <button onClick={onFavorites}>
              <Icon name="heart" />
              <span>
                Atividades
                <br />
                favoritas
              </span>
            </button>
            <button onClick={onCheckIn}>
              <Icon name="info" />
              <span>
                Como me
                <br />
                sinto?
              </span>
            </button>
          </div>
        </div>
        <section className="home-orientations" aria-label="Orientações breves, atualizadas automaticamente">
          <div className="home-orientations__heading"><h2>Orientações breves</h2><span>{orientationIndex+1} de {orientationSteps.length}</span></div>
          <div className="home-orientations__card"><EditorialIllustration kind="outside" compact />
            <div><b>{orientation.title}</b><p>{orientation.text}</p></div></div>
          <button type="button" className="home-orientations__cta" onClick={onGuidance}>Ver mais orientações <span aria-hidden="true">→</span></button>
        </section>
        <div className="home-demo-settings" aria-label="Configurações rápidas dos convites de apoio">
          <h2>Convites de apoio durante a demonstração</h2>
          <p>Você escolhe se deseja participar da simulação. Nenhum microfone é utilizado.</p>
          <div className="home-demo-settings__row">
            <div>
              <b>Habilitar simulação acústica</b>
              <small>Autoriza o recebimento de sinais simulados, após sua permissão.</small>
            </div>
            <button
              type="button"
              role="switch"
              className={`switch ${state.acousticMode === "sim_on" ? "switch--on" : ""}`}
              aria-checked={state.acousticMode === "sim_on"}
              aria-label="Habilitar simulação acústica"
              onClick={onToggleAcoustic}
            ><span /></button>
          </div>
          <div className="home-demo-settings__row">
            <div>
              <b>Receber convites de apoio</b>
              <small>Você pode suspender os convites a qualquer momento.</small>
            </div>
            <button
              type="button"
              role="switch"
              className={`switch ${state.invitesEnabled ? "switch--on" : ""}`}
              aria-checked={state.invitesEnabled}
              aria-label="Receber convites de apoio"
              onClick={onToggleInvites}
            ><span /></button>
          </div>
          <button type="button" className="home-demo-settings__permission" onClick={onOpenPermission}>
            {state.permissionDemoState === "granted-demo" ? "Permissão demonstrativa concedida — revisar" : "Configurar permissão demonstrativa"}
            <Icon name="back" size={16} />
          </button>
          <StatusLabel mode={state.acousticMode} />
        </div>
      </div>
    </section>
  );
}

const categories = [
  "Todas",
  "Pausa",
  "Respiração",
  "Música",
  "Jogos",
  "Orientações",
  "Histórias",
  "Preferidas",
  "Pessoais",
];
type CatalogItem = {
  id: StrategyId;
  title: string;
  description: string;
  category: string;
  screen?: Screen;
};

const catalogItems: CatalogItem[] = [
  {
    id: "pause",
    title: "Pausa silenciosa",
    description: "Encontre um lugar confortável e diminua os estímulos por alguns instantes.",
    category: "Pausa",
    screen: "T05",
  },
  {
    id: "breath",
    title: "Respiração",
    description: "Acompanhe o círculo e faça algumas respirações suaves.",
    category: "Respiração",
    screen: "T06",
  },
  {
    id: "music",
    title: "Músicas e sons",
    description: "Encontre uma trilha que combine com seu momento.",
    category: "Música",
    screen: "T08",
  },
  {
    id: "space",
    title: "Monte seu espaço",
    description: "Crie seu cantinho ideal, peça por peça.",
    category: "Jogos",
    screen: "T10",
  },
  {
    id: "pairs",
    title: "Combine os pares",
    description: "Encontre os pares e concentre-se em uma escolha de cada vez.",
    category: "Jogos",
    screen: "T22",
  },
  {
    id: "path",
    title: "Desenhe o caminho",
    description: "Conecte os pontos e descubra um novo percurso.",
    category: "Jogos",
    screen: "T23",
  },
  {
    id: "guide",
    title: "Orientações breves",
    description: "Ideias práticas para quando tudo parece intenso demais.",
    category: "Orientações",
    screen: "T11",
  },
  {
    id: "stories",
    title: "Histórias sociais",
    description: "Cenas do cotidiano que ajudam a compreender situações e possibilidades.",
    category: "Histórias",
    screen: "T14",
  },
  {
    id: "outside",
    title: "Apoio fora da tela",
    description: "Pequenas atitudes que podem ajudar longe das telas.",
    category: "Orientações",
    screen: "T16",
  },
];
const catalogIcons = {
  Pausa: "leaf",
  Respiração: "wind",
  Música: "music",
  Jogos: "grid",
  Orientações: "info",
  Histórias: "bookmark",
} as const;

function CatalogScreen({
  filter,
  onFilter,
  onOpenSupport,
  onBack,
  onClose,
  favorites,
  onToggleFavorite,
  onOpen,
  onOpenFavorites,
  onOpenPersonal,
}: {
  filter: string;
  onFilter: (filter: string) => void;
  onOpenSupport: () => void;
  onBack: () => void;
  onClose: () => void;
  favorites: StrategyId[];
  onToggleFavorite: (id: StrategyId) => void;
  onOpen: (screen: Screen) => void;
  onOpenFavorites: () => void;
  onOpenPersonal: () => void;
}) {
  const shown =
    filter === "Todas" ? catalogItems : catalogItems.filter((item) => item.category === filter);
  return (
    <section className="T02-Catalog screen">
      <AppHeader title="Catálogo de apoio" onBack={onBack} onClose={onClose} />
      <div className="screen-content catalog-content">
        <div>
          <h1>Apoio</h1>
          <p className="lead">Encontre um apoio para o momento que está vivendo. Comece por algo simples.</p>
        </div>
        <div className="chip-list" aria-label="Filtros de categoria">
          {categories.map((category) => (
            <button
              key={category}
              className={`C06-CategoryChip category-chip ${filter === category ? "category-chip--selected" : ""}`}
              onClick={() => {
                if (category === "Preferidas") onOpenFavorites();
                else if (category === "Pessoais") onOpenPersonal();
                else onFilter(category);
              }}
              aria-pressed={filter === category}
            >
              {category}
            </button>
          ))}
        </div>
        {shown.length ? (
          <div className="catalog-list">
            {shown.map((item) => (
              <div
                className={`C05-StrategyCard strategy-card ${item.screen ? "" : "strategy-card--pending"}`}
                key={item.id}
              >
                <button
                  className="strategy-card__open"
                  onClick={() => item.screen && onOpen(item.screen)}
                  disabled={!item.screen}
                  aria-label={
                    item.screen ? `Abrir ${item.title}` : `${item.title}: pendente nesta etapa`
                  }
                >
                  <span className="strategy-icon strategy-icon--editorial">
                    {item.id === "pause" || item.id === "music" ?
                      <img className="catalog-real-photo" src={`/images/banners/${item.id}.webp`} alt="" loading="lazy" /> :
                      <EditorialIllustration compact kind={
                        item.id === "breath" ? "breath" : item.id === "space" ? "space" :
                        item.id === "pairs" || item.id === "path" ? "game" :
                        item.id === "stories" ? "social" : item.id === "outside" ? "outside" : "home"
                      } /> }
                  </span>
                  <span className="strategy-card__copy">
                    <b>{item.title}</b>
                    <small>{item.description}</small>
                    {!item.screen && <em>Disponível na próxima etapa</em>}
                  </span>
                  <span className="strategy-arrow" aria-hidden="true">
                    ›
                  </span>
                </button>
                {item.screen && (
                  <button
                    className={`C07-FavoriteToggle favorite-toggle ${favorites.includes(item.id) ? "favorite-toggle--on" : ""}`}
                    onClick={() => onToggleFavorite(item.id)}
                    aria-label={
                      favorites.includes(item.id)
                        ? `Remover ${item.title} das preferidas`
                        : `Adicionar ${item.title} às preferidas`
                    }
                  >
                    <Icon name="heart" size={19} />
                    <span>
                      {favorites.includes(item.id) ? "Preferida" : "Favoritar"}
                    </span>
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h2>Nenhuma opção nesta categoria</h2>
            <p>Veja outras possibilidades. Talvez uma delas ajude agora.</p>
            <Button variant="secondary" onClick={() => onFilter("Todas")}>
              Ver todas as opções
            </Button>
          </div>
        )}
        <div className="catalog-footer">
          <p>Quer uma sugestão para começar?</p>
          <Button variant="secondary" onClick={onOpenSupport}>
            Receber uma sugestão
          </Button>
        </div>
      </div>
    </section>
  );
}

const favoriteDetails: Record<
  StrategyId,
  { title: string; description: string; screen: Screen; icon: Parameters<typeof Icon>[0]["name"] }
> = {
  pause: {
    title: "Pausa silenciosa",
    description: "Sem som, sem tempo e sem exigência.",
    screen: "T05",
    icon: "leaf",
  },
  breath: {
    title: "Respiração",
    description: "Orientação disponível por escolha.",
    screen: "T06",
    icon: "wind",
  },
  music: {
    title: "Músicas e sons",
    description: "Seleção voluntária e alternativa de silêncio.",
    screen: "T08",
    icon: "music",
  },
  space: {
    title: "Monte seu espaço",
    description: "Crie e organize um ambiente visual.",
    screen: "T10",
    icon: "grid",
  },
  pairs: {title:"Combine os pares", description:"Encontre formas iguais, um par de cada vez.", screen:"T22", icon:"grid"},
  path: {title:"Desenhe o caminho", description:"Trace um caminho visual.", screen:"T23", icon:"grid"},
  guide: {title:"Orientações breves", description:"Uma sequência de ideias práticas para este momento.", screen:"T11", icon:"leaf"},
  stories: {title:"Histórias sociais", description:"Situações cotidianas em cenas curtas.", screen:"T14", icon:"bookmark"},
  outside: {title:"Apoio fora da tela", description:"Um próximo passo no ambiente ao seu redor.", screen:"T16", icon:"leaf"},
};

function FavoritesScreen({
  favorites,
  onBack,
  onClose,
  onToggleFavorite,
  onOpen,
  onCatalog,
}: {
  favorites: StrategyId[];
  onBack: () => void;
  onClose: () => void;
  onToggleFavorite: (id: StrategyId) => void;
  onOpen: (screen: Screen) => void;
  onCatalog: () => void;
}) {
  return (
    <section className="T03-Favorites screen">
      <AppHeader title="Preferidas" onBack={onBack} onClose={onClose} />
      <div className="screen-content resource-content">
        <div>
          <h1>Preferidas</h1>
          <p className="lead">Guarde seus apoios preferidos e encontre-os rapidamente quando precisar.</p>
        </div>
        {favorites.length === 0 ? (
          <div className="C26-EmptyState favorites-empty">
            <span className="large-symbol">
              <Icon name="heart" size={42} />
            </span>
            <h2>Nenhuma preferida ainda</h2>
            <p>Guarde aqui o que funcionou bem. Assim, fica fácil encontrar da próxima vez.</p>
            <Button onClick={onCatalog}>Explorar estratégias</Button>
          </div>
        ) : (
          <>
            <div className="section-row">
              <h2>Minhas opções</h2>
              <span>
                {favorites.length} {favorites.length === 1 ? "estratégia" : "estratégias"}
              </span>
            </div>
            <div className="simple-list">
              {favorites.map((id) => {
                const strategy = favoriteDetails[id];
                return (
                  <article className="favorite-row" key={id}>
                    <button
                      onClick={() => onOpen(strategy.screen)}
                      aria-label={`Abrir ${strategy.title}`}
                    >
                      <span className="strategy-icon">
                        <Icon name={strategy.icon} />
                      </span>
                      <span>
                        <b>{strategy.title}</b>
                        <small>{strategy.description}</small>
                      </span>
                    </button>
                    <button
                      className="favorite-toggle favorite-toggle--on"
                      onClick={() => onToggleFavorite(id)}
                      aria-label={`Remover ${strategy.title} das preferidas`}
                    >
                      <Icon name="heart" size={22} />
                      <span>Remover</span>
                    </button>
                  </article>
                );
              })}
            </div>
            <div className="information-note">
              <Icon name="info" size={18} />
              Toque em “Remover” para tirar uma opção das preferidas.
            </div>
            <Button variant="secondary" onClick={onCatalog}>
              Explorar estratégias
            </Button>
          </>
        )}
      </div>
    </section>
  );
}

function PersonalStrategiesScreen({
  strategies,
  onBack,
  onClose,
  onCancelEdit,
  onSave,
  onRemove,
}: {
  strategies: PersonalStrategy[];
  onBack: () => void;
  onClose: () => void;
  onCancelEdit: () => void;
  onSave: (strategy: PersonalStrategy) => void;
  onRemove: (id: string) => void;
}) {
  const [draft, setDraft] = useState<PersonalStrategy | null>(null);
  const [error, setError] = useState("");
  const [removeId, setRemoveId] = useState<string | null>(null);
  const isEditing = draft !== null;
  const discardDraft = () => {
    setDraft(null);
    setError("");
  };
  const contexts = [
    "Barulho",
    "Mudança",
    "Frustração",
    "Situação social",
    "Medo",
    "Raiva",
    "Cansaço",
    "Dor",
  ];

  const submit = () => {
    if (!draft?.title.trim()) {
      setError("O título é obrigatório.");
      return;
    }
    onSave({
      ...draft,
      title: draft.title.trim(),
      description: draft.description.trim(),
      contexts: [...draft.contexts],
    });
    setDraft(null);
    setError("");
  };

  return (
    <section className="T04-PersonalStrategies screen">
      <AppHeader
        title="Minhas estratégias"
        onBack={isEditing ? discardDraft : onBack}
        backLabel={isEditing ? "Voltar para a lista sem salvar" : undefined}
        onClose={
          isEditing
            ? () => {
                discardDraft();
                onClose();
              }
            : onClose
        }
        closeLabel={isEditing ? "Fechar Minhas estratégias sem salvar" : undefined}
      />
      <div className="screen-content resource-content">
        {isEditing ? (
          <>
            <div>
              <h1>
                {strategies.some((strategy) => strategy.id === draft.id)
                  ? "Editar estratégia"
                  : "Nova estratégia"}
              </h1>
              <p className="lead">
                Registre uma ideia que costuma ajudar — por exemplo, ouvir uma música familiar ou fazer uma pausa.
              </p>
            </div>
            <div className="strategy-form">
              <label className="C18-TextField text-field">
                <span>Título *</span>
                <input
                  value={draft.title}
                  onChange={(event) => {
                    setDraft({ ...draft, title: event.target.value });
                    setError("");
                  }}
                  placeholder="Digite aqui"
                />
                {error && <em className="field-error">{error}</em>}
              </label>
              <label className="C18-TextField text-field">
                <span>Descrição</span>
                <textarea
                  value={draft.description}
                  onChange={(event) => setDraft({ ...draft, description: event.target.value })}
                  placeholder="Escreva mais detalhes (opcional)"
                  rows={3}
                />
              </label>
              <div className="personal-context-picker">
                <div>
                  <h2>Quando esta estratégia pode ajudar?</h2>
                  <p>Escolha contextos apenas se quiser. Eles não são inferidos pelo aplicativo.</p>
                </div>
                <div className="personal-context-options">
                  {contexts.map((context) => (
                    <button
                      className={draft.contexts.includes(context) ? "selected" : ""}
                      key={context}
                      onClick={() =>
                        setDraft({
                          ...draft,
                          contexts: draft.contexts.includes(context)
                            ? draft.contexts.filter((item) => item !== context)
                            : [...draft.contexts, context],
                        })
                      }
                      aria-pressed={draft.contexts.includes(context)}
                    >
                      {context}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <Button onClick={submit}>Salvar estratégia</Button>
            <Button
              variant="tertiary"
              onClick={() => {
                discardDraft();
                onCancelEdit();
              }}
            >
              Cancelar
            </Button>
          </>
        ) : (
          <>
            <div>
              <h1>Minhas estratégias</h1>
              <p className="lead">Crie seu próprio conjunto de apoios para consultar quando precisar.</p>
            </div>
            {strategies.length ? (
              <div className="simple-list">
                {strategies.map((strategy) => (
                  <article className="personal-row" key={strategy.id}>
                    <span className="strategy-icon">
                      <Icon name="info" />
                    </span>
                    <div>
                      <b>{strategy.title}</b>
                      <small>{strategy.description || "Sem descrição."}</small>
                      {strategy.contexts.length > 0 && (
                        <small>Contextos: {strategy.contexts.join(", ")}</small>
                      )}
                    </div>
                    <button
                      onClick={() => setDraft(strategy)}
                      aria-label={`Editar ${strategy.title}`}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => setRemoveId(strategy.id)}
                      aria-label={`Excluir ${strategy.title}`}
                    >
                      Excluir
                    </button>
                  </article>
                ))}
              </div>
            ) : (
              <div className="resource-empty">
                <p>Nenhuma estratégia pessoal foi registrada ainda.</p>
              </div>
            )}
            <Button
              variant="secondary"
              onClick={() =>
                setDraft({ id: `strategy-${Date.now()}`, title: "", description: "", contexts: [] })
              }
            >
              Adicionar estratégia
            </Button>
          </>
        )}
      </div>
      {removeId && (
        <ConfirmationDialog
          title="Excluir esta estratégia?"
          description="Esta escolha remove apenas a estratégia desta sessão de demonstração."
          confirmLabel="Excluir estratégia"
          onConfirm={() => {
            onRemove(removeId);
            setRemoveId(null);
          }}
          onCancel={() => setRemoveId(null)}
        />
      )}
    </section>
  );
}

function PauseScreen({
  onBack,
  onClose,
  onContinue,
}: {
  onBack: () => void;
  onClose: () => void;
  onContinue: () => void;
}) {
  return (
    <section className="T05-Pause screen">
      <AppHeader title="Pausa silenciosa" onBack={onBack} onClose={onClose} />
      <div className="screen-content pause-content resource-content">
        <div>
          <h1>Pausa silenciosa</h1>
          <p className="lead">Você já fez bastante por agora. Encontre um instante de tranquilidade.</p>
        </div>
        <img className="resource-photo" src="/images/banners/pause.webp" alt="Praia tranquila iluminada pela luz do entardecer" />
        <div className="centered-copy">
          <h2>Dê a si mesmo este intervalo</h2>
          <p>Olhe ao redor, encontre um ponto de conforto e perceba como você se sente. A pausa está acontecendo.</p>
        </div>
        <div className="resource-actions">
          <Button variant="secondary" onClick={onContinue}>
            Estou bem aqui
          </Button>
          <Button onClick={onClose}>Sair da pausa</Button>
        </div>
        <div className="information-note">
          <Icon name="info" size={18} />
          Esta atividade não reproduz sons nem animações.
        </div>
      </div>
    </section>
  );
}

function BreathingVisual() {
  return (
    <div className="breathing-editorial"><EditorialIllustration kind="breath" /></div>
  );
}

function BreathingIntroScreen({
  onBack,
  onClose,
  onStart,
}: {
  onBack: () => void;
  onClose: () => void;
  onStart: () => void;
}) {
  return (
    <section className="T06-BreathingIntro screen">
      <AppHeader title="Respiração" onBack={onBack} onClose={onClose} />
      <div className="screen-content resource-content breathing-content">
        <div>
          <h1>Respiração</h1>
          <p className="lead">Vamos fazer algumas respirações juntos.</p>
        </div>
        <BreathingVisual />
        <div className="quiet-card">
          <h2>Respire no seu ritmo</h2>
          <p>
            Acompanhe a animação: inspire suavemente e solte o ar devagar. Não precisa forçar a respiração.
          </p>
        </div>
        <div className="information-note">
          <Icon name="info" size={18} />
          O círculo começa a guiar o ritmo automaticamente quando você iniciar.
        </div>
        <Button onClick={onStart}>Iniciar exercício</Button>
      </div>
    </section>
  );
}

function BreathingExerciseScreen({state,onBack,onClose,onToggle}:{
  state:BreathState; onBack:()=>void; onClose:()=>void; onToggle:()=>void;
}) {
  const active=state==="active";
  const [elapsed,setElapsed]=useState(0);
  const [reducedMotion,setReducedMotion]=useState(false);
  useEffect(()=>{
    const media=window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync=()=>setReducedMotion(media.matches);
    sync();media.addEventListener("change",sync);
    return()=>media.removeEventListener("change",sync);
  },[]);
  useEffect(()=>{
    if(!active)return;
    const timer=window.setInterval(()=>setElapsed(v=>v+1),1000);
    return()=>window.clearInterval(timer);
  },[active]);
  const cycle=elapsed%10;
  const inhaling=cycle<4;
  const phase=inhaling?"Inspire":"Expire";
  const remaining=inhaling?4-cycle:10-cycle;
  const rounds=Math.floor(elapsed/10);
  return <section className="T07-BreathingExercise screen">
    <AppHeader title="Respiração guiada" onBack={onBack} onClose={onClose}/>
    <div className="screen-content resource-content guided-breath-screen">
      <div><h1>Vamos respirar juntos</h1><p className="lead">Acompanhe o círculo: o ar entra suavemente e sai sem pressa.</p></div>
      <div className="breath-cycle" role="group" aria-label="Guia visual de respiração">
        <span className="breath-cycle__ambient" aria-hidden="true"/>
        <div className={`breath-cycle__orb ${active ? (inhaling?"breath-cycle__orb--inhale":"breath-cycle__orb--exhale") : "breath-cycle__orb--paused"} ${reducedMotion?"breath-cycle__orb--static":""}`}>
          <span className="breath-cycle__phase" aria-live="off">{active?phase:"Pausa"}</span>
          <strong className="breath-cycle__seconds" aria-label={`${remaining} segundos`}>{active ? remaining : "—"}</strong>
          <span className="breath-cycle__unit">{active?"segundos":"sem pressa"}</span>
        </div>
        <div className="breath-cycle__progress" aria-hidden="true"><span style={{width:`${(cycle/10)*100}%`}} /></div>
      </div>
      <div className="breath-guidance" aria-live="polite">
        <h2>{!active?"Vamos no seu tempo.":inhaling?"Puxe o ar com suavidade.":"Agora solte o ar devagar."}</h2>
        <p>{inhaling?"Deixe os ombros relaxados e sinta o ar entrando.":"Relaxe a mandíbula e deixe o corpo encontrar seu conforto."}</p>
      </div>
      <p className="breath-progress-text">{rounds ? `${rounds} ${rounds===1?"ciclo concluído":"ciclos concluídos"} · `:""}Tempo de prática: {Math.floor(elapsed/60)}:{String(elapsed%60).padStart(2,"0")}</p>
      <div className="information-note"><Icon name="info" size={18}/>Use o ritmo como referência, nunca como obrigação. Se sentir tontura ou desconforto, volte à sua respiração habitual e encerre.</div>
      <div className="resource-actions"><Button onClick={onToggle}>{active?"Pausar respiração":"Continuar respiração"}</Button><Button variant="secondary" onClick={onClose}>Encerrar exercício</Button></div>
    </div>
  </section>;
}

function MusicLibraryScreen({
  prefersSilence,
  favoriteIds,
  preferredGenres,
  onBack,
  onClose,
  backLabel,
  onOpenPlayer,
  onSilent,
  onFavorite,
}: {
  prefersSilence: boolean;
  favoriteIds: AudioTrackId[];
  preferredGenres: string[];
  onBack: () => void;
  onClose: () => void;
  backLabel: string;
  onOpenPlayer: (trackId: AudioTrackId | null) => void;
  onSilent: () => void;
  onFavorite: (id: AudioTrackId) => void;
}) {
  const [category, setCategory] = useState("Todas");
  const [genre, setGenre] = useState("Todos os gêneros");
  const genres = ["Todos os gêneros", ...Array.from(new Set(audioTracks.map((track) => track.genre)))];
  const relevantTracks = audioTracks.filter((track) => {
    if (category === "Favoritas" && !favoriteIds.includes(track.id)) return false;
    if (category !== "Todas" && category !== "Favoritas" && track.category !== category) return false;
    if (genre !== "Todos os gêneros" && track.genre !== genre) return false;
    return true;
  });
  return (
    <section className="T08-Music screen">
      <AppHeader title="Músicas e sons" onBack={onBack} onClose={onClose} />
      <div className="screen-content resource-content audio-library">
        <div>
          <h1>Escolha o que ouvir</h1>
          <p className="lead">Uma biblioteca para acompanhar diferentes momentos. Encontre uma faixa e ajuste o volume ao seu conforto.</p>
        </div>
        <div className="audio-library-banner" aria-hidden="true">
          <svg viewBox="0 0 350 125" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
            <defs><linearGradient id="audioBanner" x1="0" x2="1"><stop stopColor="#d9eef0"/><stop offset="1" stopColor="#b1d8db"/></linearGradient></defs>
            <rect width="350" height="125" rx="18" fill="url(#audioBanner)"/>
            <path d="M0 83 Q35 61 70 83 T140 83 T210 83 T280 83 T350 83 L350 125H0Z" fill="#94c9d0" opacity=".7"/>
            <path d="M0 102 Q45 77 90 102 T180 102 T270 102 T360 102" fill="none" stroke="#f8fcfc" strokeWidth="4" opacity=".9"/>
            <circle cx="265" cy="47" r="27" fill="#f6faf5" opacity=".95"/>
            <path d="M255 55V38l16-4v19" fill="none" stroke="#155e75" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="252" cy="56" r="5" fill="#155e75"/><circle cx="268" cy="53" r="5" fill="#155e75"/>
            <path d="M40 53q13-25 26 0t26 0t26 0" stroke="#155e75" strokeWidth="3" fill="none" strokeLinecap="round" opacity=".55"/>
          </svg>
        </div>
        <button className={`music-option ${prefersSilence ? "music-option--selected" : ""}`} onClick={onSilent} aria-pressed={prefersSilence}>
          <span className="strategy-icon"><Icon name="sound" /></span>
          <span><b>Prefiro silêncio</b><small>Áudio é opcional. Não tocar nada por enquanto.</small></span>
          <span aria-hidden="true">{prefersSilence ? "✓" : "›"}</span>
        </button>
        <div className="audio-filter-row" role="group" aria-label="Filtrar por tipo de áudio">
          {["Todas", "Ambientes", "Músicas", "Favoritas"].map((item) => (
            <button key={item} className={category === item ? "audio-chip audio-chip--active" : "audio-chip"} onClick={() => setCategory(item)} aria-pressed={category === item}>{item}</button>
          ))}
        </div>
        <label className="audio-genre-filter">
          <span>Gênero ou tipo de som</span>
          <select value={genre} onChange={(event) => setGenre(event.target.value)}>
            {genres.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        {!!preferredGenres.length && <p className="audio-preference-note">Seus gêneros escolhidos na personalização: {preferredGenres.join(" · ")}. Você pode ouvir qualquer gênero.</p>}
        <div className="audio-track-list">
          {relevantTracks.length ? relevantTracks.map((track) => {
            const isFavorite = favoriteIds.includes(track.id);
            return (
              <div className="audio-track-card" key={track.id}>
                <button className="audio-track-main" onClick={() => onOpenPlayer(track.id)} aria-label={`Selecionar ${track.title}`}>
                  <span className={`audio-track-illustration audio-track-illustration--${track.id}`} aria-hidden="true"><Icon name={track.category === "Músicas" ? "music" : "sound"} /></span>
                  <span className="audio-track-copy"><b>{track.title}</b><small>{track.genre} · {track.author}</small><small>{track.note}</small></span>
                  <span className="audio-track-enter" aria-hidden="true">›</span>
                </button>
                <button className={`audio-favorite-button ${isFavorite ? "audio-favorite-button--saved" : ""}`} aria-label={`${isFavorite ? "Remover" : "Adicionar"} ${track.title} ${isFavorite ? "dos" : "aos"} favoritos`} aria-pressed={isFavorite} onClick={() => onFavorite(track.id)} title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}>
                  <span aria-hidden="true">{isFavorite ? "♥" : "♡"}</span>
                </button>
              </div>
            );
          }) : <p className="audio-empty">Nenhuma faixa nesse filtro. Escolha outro gênero ou veja todas as faixas.</p>}
        </div>
        <button className="music-option" onClick={() => onOpenPlayer(null)}>
          <span className="strategy-icon"><Icon name="info" /></span>
          <span><b>Simular áudio indisponível</b><small>Teste de falha recuperável, sem reproduzir nada.</small></span>
          <span aria-hidden="true">›</span>
        </button>
        <p className="audio-credit">Arquivos instrumentais locais produzidos para este protótipo. Consulte <a href="/audio/LICENCAS_E_FONTES.md" target="_blank" rel="noopener noreferrer">créditos e licenças</a>.</p>
        <Button variant="secondary" onClick={onBack}>{backLabel}</Button>
      </div>
    </section>
  );
}

function formatAudioTime(value: number) {
  if (!Number.isFinite(value)) return "0:00";
  const total = Math.floor(Math.max(0, value));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

function PlayerScreen({
  state,
  onBack,
  onClose,
  onAudioState,
  onVolume,
  onFavorite,
}: {
  state: AppState;
  onBack: () => void;
  onClose: () => void;
  onAudioState: (state: AudioState) => void;
  onVolume: (volume: number) => void;
  onFavorite: (id: AudioTrackId) => void;
}) {
  const track = audioTrackById(state.audioTrackId);
  const unavailable = !state.mediaAvailable || !state.soundEnabled;
  const globallyMuted = !state.soundEnabled;
  const favorite = state.audioFavoriteIds.includes(track.id);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = state.audioVolume / 100;
  }, [state.audioVolume]);
  useEffect(() => {
    // Ao trocar a fonte ou sair da tela, o elemento de áudio é desmontado e a reprodução cessa.
    setCurrentTime(0); setDuration(0); setError("");
  }, [track.id]);
  const play = async () => {
    if (!audioRef.current || unavailable) return;
    setError("");
    try {
      await audioRef.current.play();
      onAudioState("playing");
    } catch {
      setError("Não foi possível iniciar esta faixa. Verifique o navegador ou escolha outra música.");
      onAudioState("error");
    }
  };
  const pause = () => { audioRef.current?.pause(); onAudioState("paused"); };
  const stop = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
    setCurrentTime(0); onAudioState("idle");
  };
  const seek = (time: number) => {
    if (audioRef.current && Number.isFinite(time)) audioRef.current.currentTime = time;
    setCurrentTime(time);
  };
  return (
    <section className="T09-Player screen">
      <AppHeader title="Reprodutor" onBack={() => { stop(); onBack(); }} onClose={() => { stop(); onClose(); }} />
      <div className="screen-content resource-content player-content">
        <div><h1>{unavailable ? (globallyMuted ? "Som desativado" : "Som indisponível") : track.title}</h1><p className="lead">{unavailable ? (globallyMuted ? "O som está desligado em Ajustes. Você pode reativá-lo quando quiser." : "Você pode continuar sem som ou escolher outra faixa.") : `${track.genre} · ${track.note}`}</p></div>
        <div className={`player-art player-art--${track.id}`} aria-hidden="true">
          <svg viewBox="0 0 340 190" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
            <defs><linearGradient id="playerGradient" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#e4f3f5"/><stop offset="1" stopColor="#8ec5cc"/></linearGradient></defs>
            <rect width="340" height="190" rx="18" fill="url(#playerGradient)"/>
            <circle cx="265" cy="65" r="54" fill="#f3faf8" opacity=".68"/>
            <path d="M10 110C80 50 115 150 176 103S275 65 340 102V190H0V140Z" fill="#87bec6"/>
            <path d="M0 143Q45 110 90 143T180 143T270 143T360 143" fill="none" stroke="white" strokeWidth="4" opacity=".76"/>
            <path d="M52 78q20-45 40 0t40 0" fill="none" stroke="#155e75" strokeWidth="5" strokeLinecap="round" opacity=".55"/>
            <path d="M247 73V48l27-6v27" fill="none" stroke="#155e75" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="241" cy="74" r="9" fill="#155e75"/><circle cx="268" cy="69" r="9" fill="#155e75"/>
          </svg>
        </div>
        <div className="player-track-head">
          <div><b>{unavailable ? "Reprodução indisponível" : track.title}</b><small>{unavailable ? "Sem áudio" : track.author}</small></div>
          {!unavailable && <button className="audio-favorite-button" onClick={() => onFavorite(track.id)} aria-pressed={favorite} aria-label={favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"} title="Favoritar">{favorite ? "♥" : "♡"}</button>}
        </div>
        {unavailable || error ? <div className="audio-label audio-label--error" role="alert"><Icon name="info" size={18}/>{error || (globallyMuted ? "Som desligado nas preferências do aplicativo." : "Áudio indisponível nesta demonstração.")}</div>
          : <p className="audio-label" role="status"><Icon name="info" size={18}/>{state.audioState === "playing" ? "Reproduzindo áudio real" : state.audioState === "paused" ? "Pausado" : "Pronto para ouvir — toque em Reproduzir"}</p>}
        {!unavailable && <audio ref={audioRef} src={audioPath(track)} preload="metadata"
          onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
          onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
          onEnded={() => { onAudioState("idle"); setCurrentTime(0); }}
          onError={() => { onAudioState("error"); setError("O arquivo não pôde ser carregado. Escolha outra faixa."); }} />}
        {!unavailable && <div className="audio-progress">
          <div className="audio-progress-label"><span>Progresso</span><span>{formatAudioTime(currentTime)} / {formatAudioTime(duration)}</span></div>
          <input type="range" min={0} max={duration > 0 ? duration : 100} step={1} value={Math.min(currentTime, duration > 0 ? duration : 100)} onChange={(event) => seek(Number(event.target.value))} disabled={!duration} aria-label="Posição na faixa" />
        </div>}
        <div className="player-controls">
          <Button onClick={() => void play()} disabled={unavailable}>Reproduzir</Button>
          <Button variant="secondary" onClick={pause} disabled={unavailable || state.audioState !== "playing"}>Pausar</Button>
          <Button variant="secondary" onClick={stop}>Parar</Button>
        </div>
        {!unavailable && <label className="volume-control">
          <span><b>Volume</b><small>{state.audioVolume}%</small></span>
          <input type="range" min="0" max="100" step="5" value={state.audioVolume} onChange={(event) => onVolume(Number(event.target.value))} aria-label="Volume do áudio"/>
          <div className="volume-presets" aria-label="Níveis rápidos de volume">{[0,25,50,75,100].map((level) => <button key={level} className={state.audioVolume === level ? "audio-chip audio-chip--active" : "audio-chip"} onClick={() => onVolume(level)} aria-pressed={state.audioVolume === level}>{level}%</button>)}</div>
        </label>}
        <Button variant="secondary" onClick={() => { stop(); onBack(); }}>Trocar som ou música</Button>
      </div>
    </section>
  );
}

function SpaceGameScreen({
  items, selectedId, canUndo, onBack, onClose, onAdd, onMove,
  onStartMove, onSelect, onRemove, onUndo, onClear,
}: {
  items: SceneItem[]; selectedId: string | null; canUndo: boolean;
  onBack: () => void; onClose: () => void; onAdd: (kind: SceneKind) => void;
  onMove: (id: string, x: number, y: number) => void; onStartMove: () => void;
  onSelect: (id: string) => void; onRemove: () => void; onUndo: () => void; onClear: () => void;
}) {
  const [confirmClear, setConfirmClear] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [erasing, setErasing] = useState(false);
  const [color, setColor] = useState("#155e75");
  const [strokes, setStrokes] = useState<Array<{color: string; points: Array<[number,number]>}>>([]);
  const [currentStroke, setCurrentStroke] = useState<Array<[number,number]>>([]);
  const canvasRef = useRef<HTMLDivElement>(null);
  const drawingRef = useRef(false);
  const drawnPointsRef = useRef<Array<[number,number]>>([]);
  const dragRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const palette: Array<{kind:SceneKind; label:string}> = [
    {kind:"planta",label:"Planta"},{kind:"mesa",label:"Mesa"},{kind:"luz",label:"Luz"},
    {kind:"almofada",label:"Almofada"},{kind:"poltrona",label:"Poltrona"},
    {kind:"livro",label:"Livro"},{kind:"tapete",label:"Tapete"},
    {kind:"quadro",label:"Quadro"},{kind:"luminaria",label:"Luminária"}
  ];
  const startDrag = (event: React.PointerEvent<HTMLButtonElement>, item: SceneItem) => {
    if (drawing || erasing) return;
    const rect = canvasRef.current?.getBoundingClientRect(); if (!rect) return;
    dragRef.current = {id:item.id, offsetX:event.clientX-rect.left-item.x,offsetY:event.clientY-rect.top-item.y};
    onStartMove(); onSelect(item.id); event.currentTarget.setPointerCapture(event.pointerId);
  };
  const moveDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag=dragRef.current; const rect=canvasRef.current?.getBoundingClientRect();
    if(!drag||!rect||drawing||erasing)return;
    onMove(drag.id,Math.max(0,Math.min(rect.width-56,event.clientX-rect.left-drag.offsetX)),Math.max(0,Math.min(rect.height-56,event.clientY-rect.top-drag.offsetY)));
  };
  const toPoint=(event:React.PointerEvent<SVGSVGElement>):[number,number]=>{
    const rect=event.currentTarget.getBoundingClientRect();
    return [Math.max(0,Math.min(1000,((event.clientX-rect.left)/rect.width)*1000)),
      Math.max(0,Math.min(620,((event.clientY-rect.top)/rect.height)*620))];
  };
  const beginDraw=(event:React.PointerEvent<SVGSVGElement>)=>{
    if(erasing){
      const [px,py]=toPoint(event);
      setStrokes(previous=>{
        let nearest=-1;let distance=Infinity;
        previous.forEach((stroke,index)=>stroke.points.forEach(([x,y])=>{
          const d=Math.hypot(x-px,y-py);if(d<distance){distance=d;nearest=index;}
        }));
        return nearest>=0 && distance<48 ? previous.filter((_,index)=>index!==nearest) : previous;
      });
      return;
    }
    if(!drawing)return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drawingRef.current=true;drawnPointsRef.current=[toPoint(event)];setCurrentStroke(drawnPointsRef.current);
  };
  const moveDraw=(event:React.PointerEvent<SVGSVGElement>)=>{
    if(!drawingRef.current)return;
    drawnPointsRef.current=[...drawnPointsRef.current,toPoint(event)];
    setCurrentStroke(drawnPointsRef.current);
  };
  const endDraw=()=>{
    if(!drawingRef.current)return;
    drawingRef.current=false;
    const points=drawnPointsRef.current;
    if(points.length)setStrokes(prev=>[...prev,{color,points}]);
    drawnPointsRef.current=[];setCurrentStroke([]);
  };
  const asPolyline=(points:Array<[number,number]>)=>points.map(([x,y])=>`${x},${y}`).join(" ");
  return (
    <section className="T10-SpaceGame screen">
      <AppHeader title="Monte seu espaço" onBack={onBack} onClose={onClose}/>
      <div className="screen-content resource-content game-content">
        <div><h1>Monte seu espaço</h1><p className="lead">Solte a criatividade: combine objetos, desenhe e monte um lugar com a sua cara.</p></div>
        <div className="scene-canvas" ref={canvasRef} onPointerMove={moveDrag}
          onPointerUp={()=>{dragRef.current=null;}} onPointerCancel={()=>{dragRef.current=null;}}>
          {items.length===0 && strokes.length===0 && !currentStroke.length && <p>Adicione objetos ou escolha Desenhar para começar.</p>}
          {items.map(item=><button key={item.id}
            className={`C29-SceneObject scene-object scene-object--${item.kind} ${selectedId===item.id?"scene-object--selected":""}`}
            style={{left:item.x,top:item.y}} onClick={()=>!drawing&&!erasing&&onSelect(item.id)}
            onPointerDown={event=>startDrag(event,item)}
            aria-label={`${item.kind}, ${selectedId===item.id?"selecionado":"selecionar"}`}/>) }
          <svg className={`scene-draw-layer ${drawing||erasing?"scene-draw-layer--active":""}`}
            viewBox="0 0 1000 620" preserveAspectRatio="none"
            onPointerDown={beginDraw} onPointerMove={moveDraw} onPointerUp={endDraw} onPointerCancel={endDraw}
            aria-label="Área de desenho livre" role="img">
            {strokes.map((stroke,index)=><polyline key={index} fill="none" stroke={stroke.color} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" points={asPolyline(stroke.points)}/>) }
            {currentStroke.length>0 && <polyline fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" points={asPolyline(currentStroke)}/>}
          </svg>
        </div>
        <div className="draw-controls">
          <button type="button" className={drawing?"draw-mode draw-mode--active":"draw-mode"} onClick={()=>{setDrawing(prev=>!prev);setErasing(false);}} aria-pressed={drawing}>
            {drawing?"✓ Lápis ativo":"✎ Lápis"}
          </button>
          <button type="button" className={erasing?"draw-mode draw-mode--active":"draw-mode"} onClick={()=>{setErasing(prev=>!prev);setDrawing(false);}} aria-pressed={erasing}>Borracha</button>
          <div className="draw-colors" aria-label="Cor do lápis">
            {[["#155e75","Azul"],["#467565","Verde"],["#806d54","Marrom"],["#9d2f38","Vermelho"]].map(([value,label])=><button key={value} type="button" style={{background:value}} className={color===value?"draw-color draw-color--selected":"draw-color"} onClick={()=>{setColor(value);setDrawing(true);setErasing(false);}} aria-label={`Lápis ${label}`} aria-pressed={color===value}/>) }
          </div>
          <button type="button" className="draw-undo" onClick={()=>setStrokes(prev=>prev.slice(0,-1))} disabled={!strokes.length}>Desfazer traço</button>
        </div>
        <div className="scene-heading"><h2>Escolha elementos</h2><span>Toque para adicionar · Arraste para mover</span></div>
        <div className="scene-palette">
          {palette.map(({kind,label})=><button key={kind} type="button" onClick={()=>{setDrawing(false);setErasing(false);onAdd(kind);}}>
            <span className={`palette-shape palette-shape--${kind}`}/>{label}
          </button>)}
        </div>
        <div className="game-actions">
          <Button variant="secondary" onClick={onUndo} disabled={!canUndo}>Desfazer objeto</Button>
          <Button variant="secondary" onClick={onRemove} disabled={!selectedId}>Remover objeto</Button>
          <Button variant="secondary" onClick={()=>setConfirmClear(true)} disabled={items.length===0&&strokes.length===0}>Limpar espaço</Button>
          <Button onClick={onClose}>Sair do jogo</Button>
        </div>
        <div className="information-note"><Icon name="info" size={18}/>Limpar exige confirmação. Use Borracha para apagar um traço tocando nele. Desenho e objetos são independentes; não há tempo ou pontuação.</div>
      </div>
      {confirmClear && <ConfirmationDialog title="Limpar o espaço?"
        description="Os objetos e desenhos serão removidos desta atividade. Você pode cancelar."
        confirmLabel="Limpar espaço" onConfirm={()=>{onClear();setStrokes([]);setCurrentStroke([]);setConfirmClear(false);}}
        onCancel={()=>setConfirmClear(false)}/>}
    </section>
  );
}

const matchingCards = [
  {id:"circle-a",pair:"circle",label:"Círculo",shape:"circle"},
  {id:"diamond-a",pair:"diamond",label:"Losango",shape:"diamond"},
  {id:"triangle-a",pair:"triangle",label:"Triângulo",shape:"triangle"},
  {id:"square-a",pair:"square",label:"Quadrado",shape:"square"},
  {id:"triangle-b",pair:"triangle",label:"Triângulo",shape:"triangle"},
  {id:"square-b",pair:"square",label:"Quadrado",shape:"square"},
  {id:"circle-b",pair:"circle",label:"Círculo",shape:"circle"},
  {id:"diamond-b",pair:"diamond",label:"Losango",shape:"diamond"},
  {id:"oval-a",pair:"oval",label:"Oval",shape:"oval"},
  {id:"oval-b",pair:"oval",label:"Oval",shape:"oval"},
  {id:"star-a",pair:"star",label:"Estrela",shape:"star"},
  {id:"star-b",pair:"star",label:"Estrela",shape:"star"},
  {id:"hex-a",pair:"hex",label:"Hexágono",shape:"hex"},
  {id:"hex-b",pair:"hex",label:"Hexágono",shape:"hex"},
  {id:"bar-a",pair:"bar",label:"Barra",shape:"bar"},
  {id:"bar-b",pair:"bar",label:"Barra",shape:"bar"},
] as const;

function shuffledMatchingCards(pairCount: 4 | 6 | 8) {
  const pairs=["circle","diamond","triangle","square","oval","star","hex","bar"].slice(0,pairCount);
  const cards=matchingCards.filter(card=>pairs.includes(card.pair));
  const deck=[...cards];
  for(let i=deck.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}
  return deck;
}

function MatchingGameScreen({
  selected,
  matched,
  feedback,
  onSelect,
  onReset,
  onBack,
  onClose,
}: {
  selected: string[];
  matched: string[];
  feedback: string;
  onSelect: (id: string, pair: string) => void;
  onReset: () => void;
  onBack: () => void;
  onClose: () => void;
}) {
  const [difficulty, setDifficulty] = useState<4 | 6 | 8>(4);
  const [deck, setDeck] = useState(() => shuffledMatchingCards(4));
  const startNewRound=(count:4|6|8)=>{setDifficulty(count); setDeck(shuffledMatchingCards(count)); onReset();};
  return (
    <section className="T22-MatchingGame screen">
      <AppHeader title="Combine os pares" onBack={onBack} onClose={onClose} />
      <div className="screen-content resource-content game-content">
        <div>
          <h1>Combine os pares</h1>
          <p className="lead">Observe as formas e descubra os pares correspondentes.</p>
        </div>
        <div className="matching-note">Sem limite de tentativas, tempo ou pontuação.</div>
        <div className="game-difficulty" role="group" aria-label="Escolha a dificuldade, sem progressão obrigatória">
          {([4,6,8] as const).map(count=><button key={count} type="button"
            className={difficulty===count?"difficulty-chip difficulty-chip--selected":"difficulty-chip"}
            aria-pressed={difficulty===count} onClick={()=>startNewRound(count)}>{count} pares</button>)}
        </div>
        <div className="matching-grid">
          {deck.map((card) => {
            const isMatched = matched.includes(card.id);
            const isSelected = selected.includes(card.id);
            return (
              <button
                key={card.id}
                className={`C31-MatchingGame matching-card ${isSelected ? "matching-card--selected" : ""} ${isMatched ? "matching-card--matched" : ""}`}
                onClick={() => onSelect(card.id, card.pair)}
                aria-pressed={isSelected}
                aria-label={`${card.label}${isMatched ? ", par encontrado" : isSelected ? ", selecionado" : ", selecionar"}`}
              >
                <span className={`match-shape match-shape--${card.shape}`} />
                <small>{isMatched ? "Par" : isSelected ? "Selecionado" : "Selecionar"}</small>
              </button>
            );
          })}
        </div>
        {matched.length === deck.length && <div className="match-feedback match-feedback--success" role="status">Todos os pares foram encontrados. Você pode embaralhar novamente ou sair.</div>}
        {feedback && (
          <div
            className={`match-feedback ${feedback.startsWith("Par") ? "match-feedback--success" : ""}`}
          >
            <Icon name="info" size={18} />
            {feedback}
          </div>
        )}
        <div className="two-actions">
          <Button variant="secondary" onClick={()=>startNewRound(difficulty)}>
            Embaralhar e recomeçar
          </Button>
          <Button onClick={onClose}>Sair do jogo</Button>
        </div>
      </div>
    </section>
  );
}

function PathGameScreen({
  step, onPoint, onUndo, onReset, onBack, onClose,
}: {
  step: number; onPoint: (point: number) => void; onUndo: () => void;
  onReset: () => void; onBack: () => void; onClose: () => void;
}) {
  const paths: Array<Array<{x:number;y:number}>> = [
    [{x:45,y:263},{x:116,y:221},{x:228,y:147},{x:275,y:67}],
    [{x:42,y:255},{x:100,y:170},{x:205,y:216},{x:283,y:80}],
    [{x:59,y:262},{x:170,y:224},{x:117,y:112},{x:277,y:65}],
    [{x:40,y:260},{x:137,y:185},{x:232,y:227},{x:283,y:79}],
  ];
  const [layoutIndex,setLayoutIndex]=useState(()=>Math.floor(Math.random()*paths.length));
  const positions=paths[layoutIndex];
  const stateLabel=step>=3?"Caminho completo":step?"Caminho em construção":"Toque no ponto 1 para começar";
  const restart=()=>{setLayoutIndex(index=>(index+1+Math.floor(Math.random()*(paths.length-1)))%paths.length);onReset();};
  return (
    <section className="T23-PathGame screen">
      <AppHeader title="Desenhe o caminho" onBack={onBack} onClose={onClose} />
      <div className="screen-content resource-content game-content">
        <div><h1>Desenhe o caminho</h1><p className="lead">Comece pelo primeiro ponto e acompanhe o caminho que se forma.</p></div>
        <div className="path-canvas path-canvas--svg">
          <span className="path-label" role="status">{stateLabel}</span>
          <svg className="path-svg" viewBox="0 0 320 320" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 277Q70 240 115 281T320 253" stroke="#bdd5d4" strokeWidth="2" fill="none" />
            {positions.slice(1).map((point,index)=><line key={index}
              x1={positions[index].x} y1={positions[index].y} x2={point.x} y2={point.y}
              stroke={step>=index+1?"#155e75":"#afc7cd"} strokeWidth={step>=index+1?"6":"2"}
              strokeDasharray={step>=index+1?undefined:"5 8"} strokeLinecap="round"/>)}
          </svg>
          {positions.map((point,index)=>index===0?(
            <span key="start" className="path-start-label" style={{left:`${point.x/320*100}%`,top:`${point.y/320*100}%`}} aria-label="Início do caminho">Início</span>
          ):(
            <button type="button" key={index} className={`path-point path-point--svg ${step>=index?"path-point--active":""}`}
              style={{left:`${point.x/320*100}%`,top:`${point.y/320*100}%`}}
              onClick={()=>onPoint(index)} aria-label={`Conectar ponto ${index}`} aria-pressed={step>=index}>
              {index}
            </button>
          ))}
        </div>
        <div className="two-actions"><Button variant="secondary" onClick={onUndo} disabled={step===0}>Desfazer</Button>
          <Button variant="secondary" onClick={restart}>Novo percurso</Button></div>
        <Button onClick={onClose}>Sair do jogo</Button>
        <div className="information-note"><Icon name="info" size={18}/>As linhas acompanham os pontos em qualquer largura de tela. Sem tempo, metas ou punições.</div>
      </div>
    </section>
  );
}

function ConfirmationScreen({
  onBack,
  onClose,
  onHome,
}: {
  onBack: () => void;
  onClose: () => void;
  onHome: () => void;
}) {
  return (
    <section className="T13-Confirmation screen">
      <AppHeader title="Confirmação de registro" onBack={onBack} onClose={onClose} />
      <div className="screen-content confirmation-content">
        <span className="confirmation-icon">
          <Icon name="check" size={54} />
        </span>
        <h1>Registrado</h1>
        <p className="lead">
          Seu registro está salvo nesta demonstração. Agora você pode seguir para o que for mais útil.
        </p>
        <div className="quiet-card">
          <h2>Você mantém o controle.</h2>
          <p>Nenhuma informação é enviada a outras pessoas.</p>
        </div>
        <Button onClick={onHome}>Voltar ao início</Button>
      </div>
    </section>
  );
}

function ConfirmationDialog({
  title,
  description,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="C19-ConfirmationDialog modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-title"
    >
      <section className="confirmation-dialog">
        <h2 id="confirmation-title">{title}</h2>
        <p>{description}</p>
        <Button variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </section>
    </div>
  );
}

const guidanceSteps = [
  { label: "Primeiro passo", title: "Encontre um ponto de conforto.", text: "Percebeu muitos estímulos? Afaste-se um pouco do barulho ou da luz, se for possível. Um passo pequeno já ajuda a organizar o momento." },
  { label: "Agora, observe", title: "Dê espaço ao que está sentindo.", text: "Repare se os ombros, mãos ou mandíbula estão tensos. Solte essa tensão aos poucos, sem se cobrar uma mudança imediata." },
  { label: "Próximo passo", title: "Escolha uma coisa que pode ajudar.", text: "Uma música conhecida, uma pausa ou uma pessoa de confiança podem ser bons pontos de partida. Comece com o que estiver ao seu alcance." },
];

type StoryData = {
  title: string;
  summary: string;
  tag: string;
  hasFriend: boolean;
  art: IllustrationKind;
  scenes: Array<{ heading: string; text: string }>;
};

// Texto fechado (V43 / P11-R3). Não substituir por geração automática ou resumo.
const storyData: Record<StoryId, StoryData> = {
  sons: {
    title: "Muitos sons ao redor", summary: "Quando um lugar tem muitos sons",
    tag: "BARULHO E ESTÍMULOS", hasFriend: false, art: "sounds",
    scenes: [
      { heading: "Em alguns ambientes, vários sons podem acontecer ao mesmo tempo.", text: "O mesmo conjunto de sons pode ser confortável para algumas pessoas e desconfortável para outras." },
      { heading: "Em determinados lugares, há espaços com menos ruído.", text: "Fones ou abafadores, quando disponíveis e confortáveis, podem reduzir parte do som." },
      { heading: "Se eu desejar, posso procurar uma pausa ou um lugar menos barulhento.", text: "Eu posso decidir se quero retornar à atividade ou continuar a pausa." },
    ],
  },
  mudanca: {
    title: "Quando o plano muda", summary: "Quando o plano do dia muda",
    tag: "MUDANÇA INESPERADA", hasFriend: true, art: "change",
    scenes: [
      { heading: "Às vezes, uma atividade prevista é alterada.", text: "Nem sempre sei antecipadamente por que o plano mudou." },
      { heading: "Uma mudança pode acontecer por causa do horário, do local ou de outra necessidade.", text: "Uma explicação pode esclarecer o que permanece igual e o que será diferente." },
      { heading: "Se eu quiser, posso pedir que me expliquem as opções disponíveis.", text: "Posso fazer uma pausa antes de decidir o que fazer em seguida." },
    ],
  },
  frustracao: {
    title: "Quando algo não dá certo", summary: "Quando as coisas não saem como eu esperava",
    tag: "FRUSTRAÇÃO", hasFriend: false, art: "anger",
    scenes: [
      { heading: "Quando algo não acontece como eu esperava, posso sentir frustração.", text: "Isso pode acontecer diante de uma espera, uma mudança ou de uma dificuldade no dia a dia." },
      { heading: "Posso reconhecer o que me incomodou antes de decidir como agir.", text: "Uma pausa, um ambiente mais tranquilo ou uma conversa podem me ajudar a organizar o próximo passo." },
      { heading: "Depois de um intervalo, posso tentar outro caminho ou pedir ajuda.", text: "Não preciso resolver tudo de uma vez. Posso voltar ao assunto quando estiver em melhores condições." },
    ],
  },
  social: {
    title: "Uma conversa confusa", summary: "Situação social",
    tag: "SITUAÇÃO SOCIAL", hasFriend: true, art: "social",
    scenes: [
      { heading: "Em uma conversa, algumas frases podem ter mais de um significado.", text: "Eu e outra pessoa podemos compreender a mesma frase de modos diferentes." },
      { heading: "Uma pergunta curta pode esclarecer uma informação que ficou incompleta.", text: "Em alguns momentos, uma pausa na conversa também é possível." },
      { heading: "Se eu quiser, posso pedir que a pessoa repita ou explique de outra maneira.", text: "Também posso escolher não continuar a conversa naquele momento." },
    ],
  },
  medo: {
    title: "Quando sinto insegurança", summary: "Medo e insegurança",
    tag: "MEDO E INSEGURANÇA", hasFriend: false, art: "fear",
    scenes: [
      { heading: "Quando uma situação é pouco conhecida, algumas informações podem estar faltando.", text: "Nem sempre consigo prever o que acontecerá em seguida." },
      { heading: "Informações sobre o lugar, as pessoas e os próximos passos podem tornar a situação mais compreensível.", text: "Em alguns contextos, existe alguém de confiança com quem posso conversar." },
      { heading: "Se eu quiser, posso pedir uma explicação ou companhia.", text: "Uma pausa também é possível quando as condições do lugar permitem." },
    ],
  },
  raiva: {
    title: "Quando estou irritado", summary: "Raiva e irritação",
    tag: "RAIVA E IRRITAÇÃO", hasFriend: true, art: "anger",
    scenes: [
      { heading: "Em alguns momentos, posso perceber que estou irritado.", text: "Sentir irritação em um momento não define quem eu sou." },
      { heading: "Barulho, mudanças e outras situações podem coincidir com a irritação, mas isso varia entre pessoas.", text: "Um espaço com menos estímulos pode estar disponível em algumas situações." },
      { heading: "Se eu quiser, posso sinalizar que preciso de espaço.", text: "Posso continuar, pausar ou sair da atividade no aplicativo." },
    ],
  },
  cansaco: {
    title: "Preciso de um intervalo", summary: "Cansaço",
    tag: "CANSAÇO", hasFriend: false, art: "tired",
    scenes: [
      { heading: "Algumas atividades exigem atenção ou esforço por bastante tempo.", text: "Depois de um período de esforço, posso perceber sinais de cansaço." },
      { heading: "O cansaço pode variar de intensidade ao longo do dia.", text: "Em alguns momentos, há opções de pausa ou de menos estímulos." },
      { heading: "Se eu quiser, posso interromper a atividade.", text: "As opções de apoio podem continuar disponíveis quando eu decidir voltar." },
    ],
  },
  dor: {
    title: "Quando sinto desconforto", summary: "Dor ou mal-estar",
    tag: "DOR OU MAL-ESTAR", hasFriend: false, art: "pain",
    scenes: [
      { heading: "Dor e mal-estar podem ter diferentes causas.", text: "Uma história no aplicativo não identifica a causa do desconforto." },
      { heading: "Eu posso comunicar que sinto dor ou desconforto sem explicar tudo.", text: "Em algumas situações, a avaliação de um profissional de saúde pode ser necessária." },
      { heading: "Se eu quiser, posso interromper o uso da tela e pedir ajuda.", text: "Quando a dor é intensa, piora ou persiste, procurar atendimento de saúde é importante." },
    ],
  },
};

const storyMentorTips: Record<StoryId, string[]> = {
  sons: ["Quando muitos sons se misturam, vale perceber o que mais incomoda e o que ajuda você a se sentir melhor.", "Se houver fones ou um canto menos movimentado, experimente esse recurso para reduzir estímulos.", "Você pode se afastar por alguns instantes e decidir depois se deseja retornar."],
  mudanca: ["Mudanças inesperadas podem ser difíceis de acompanhar. Comece identificando o que realmente mudou.", "Perguntar o que vai acontecer agora ajuda a tornar a situação mais previsível.", "Peça uma explicação curta ou alguns minutos para se reorganizar."],
  frustracao: ["Quando algo não sai como você imaginou, procure identificar o que aconteceu. A frustração é uma reação possível a esse momento.", "Você pode se afastar um instante, respirar com conforto ou conversar com alguém. Comece pelo que estiver ao seu alcance.", "Escolha um próximo passo pequeno. Pedir ajuda, experimentar outra abordagem ou deixar para depois são possibilidades válidas."],
  social: ["É comum uma mensagem soar diferente para pessoas diferentes. Não é preciso adivinhar tudo.", "Uma pergunta direta pode evitar confusões: ‘Você pode explicar de outro jeito?’", "Se a conversa estiver pesada, você pode retomá-la em outro momento."],
  medo: ["O desconhecido pode trazer muitas perguntas. Procure uma informação concreta sobre o que virá.", "Saber quem estará presente e qual é o próximo passo pode trazer mais segurança.", "Se precisar, peça companhia a alguém de confiança."],
  raiva: ["Sentir raiva é uma experiência humana. O importante é encontrar uma forma segura de atravessar esse momento.", "Diminua os estímulos ao redor, se possível, e perceba o que está aumentando a tensão.", "Você pode avisar que precisa de espaço antes de continuar a conversa ou a atividade."],
  cansaco: ["Seu corpo pode estar pedindo uma pausa. Observe os sinais que aparecem depois de muito esforço.", "Um intervalo breve, água ou menos estímulos podem ajudar a recuperar energia.", "Retomar depois é uma possibilidade. Descansar não significa desistir."],
  dor: ["Dor e mal-estar merecem atenção. O aplicativo não identifica suas causas.", "Você pode pedir ajuda dizendo onde dói, mesmo sem explicar todos os detalhes.", "Se a dor for intensa, piorar ou persistir, procure avaliação de um profissional de saúde."],
};

function GuidanceScreen({
  step,
  friendName,
  friendStyle,
  friendPalette,
  friendAccessory,
  onBack,
  onPrevious,
  onNext,
  onExit,
}: {
  step: number;
  friendName: string;
  friendStyle: VirtualFriendStyle;
  friendPalette: PaletteChoice;
  friendAccessory: AccessoryChoice;
  onBack: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onExit: () => void;
}) {
  const current = guidanceSteps[step];
  return (
    <section className="T11-Guidance screen">
      <AppHeader title="Orientações breves" onBack={onBack} onClose={onExit} />
      <div className="screen-content resource-content guidance-content">
        <div>
          <h1>Orientações breves</h1>
          <p className="lead">Vamos resolver uma coisa de cada vez. Você não precisa dar conta de tudo agora.</p>
        </div>
        <div className="story-progress">
          <span style={{ width: `${((step + 1) / guidanceSteps.length) * 100}%` }} />
        </div>
        <p className="scene-count">
          Etapa {step + 1} de {guidanceSteps.length}
        </p>
        <article className="guidance-card">
          <div className="guidance-avatar-frame">
            <VirtualFriendAvatar
              name={friendName}
              style={friendStyle}
              palette={friendPalette}
              accessory={friendAccessory}
              state="orientacao"
              size="guidance"
            />
          </div>
          <p>{current.label}</p>
          <h2>{current.title}</h2>
          <span>{current.text}</span>
          <small>Você pode sair sem concluir.</small>
        </article>
        <div className="two-actions">
          <Button variant="secondary" onClick={onPrevious}>
            {step === 0 ? "Voltar" : "Anterior"}
          </Button>
          <Button onClick={onNext}>
            {step === guidanceSteps.length - 1 ? "Concluir" : "Próximo"}
          </Button>
        </div>
        <Button variant="tertiary" onClick={onExit}>
          Sair da orientação
        </Button>
      </div>
    </section>
  );
}

function StoryListScreen({
  context,
  onBack,
  onClose,
  onOpen,
}: {
  context: string;
  onBack: () => void;
  onClose: () => void;
  onOpen: (storyId: StoryId) => void;
}) {
  const stories = Object.entries(storyData) as Array<[StoryId, StoryData]>;
  return (
    <section className="T14-StoryList screen">
      <AppHeader title="Histórias sociais" onBack={onBack} onClose={onClose} />
      <div className="screen-content resource-content">
        <div>
          <h1>Histórias sociais</h1>
          <p className="lead">
            {context && context !== "Não quero responder"
              ? `Vamos olhar com calma para situações relacionadas a ${context.toLowerCase()}.`
              : "Algumas situações ficam mais claras quando conhecemos os próximos passos."}
          </p>
        </div>
        <EditorialIllustration kind="change" compact />
        <div className="simple-list story-list">
          {stories.map(([id, story]) => (
            <button className="story-row" key={id} onClick={() => onOpen(id)}>
              <span className="strategy-icon">
                <Icon name="bookmark" />
              </span>
              <span>
                <b>{story.title}</b>
                <small>{story.summary}</small>
              </span>
              <span aria-hidden="true">›</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function StoryReaderScreen({
  screen,
  storyId,
  scene,
  friendName,
  friendStyle,
  friendPalette,
  friendAccessory,
  onBack,
  onPrevious,
  onNext,
  onExit,
}: {
  screen: "T15" | "T35";
  storyId: StoryId;
  scene: number;
  friendName: string;
  friendStyle: VirtualFriendStyle;
  friendPalette: PaletteChoice;
  friendAccessory: AccessoryChoice;
  onBack: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onExit: () => void;
}) {
  const story = storyData[storyId];
  const current = story.scenes[scene];
  const displayFriend = story.hasFriend;
  return (
    <section className={`${screen}-StoryReader screen`}>
      <AppHeader
        title={screen === "T35" ? "História contextual" : "Leitura de história"}
        onBack={onBack}
        onClose={onExit}
      />
      <div className="screen-content resource-content story-reader">
        <div>
          <h1>{screen === "T35" ? "História contextual" : "Leitura de história"}</h1>
          <p className="lead">{story.summary}</p>
        </div>
        <div className="story-progress">
          <span style={{ width: `${((scene + 1) / story.scenes.length) * 100}%` }} />
        </div>
        <p className="scene-count">
          Cena {scene + 1} de {story.scenes.length} ·{" "}
          {displayFriend ? `Com ${friendName}` : "Sem personagem"}
        </p>
        <div
          className={`story-art ${displayFriend ? "story-art--friend" : ""}`}
          aria-label={
            displayFriend
              ? `${friendName} aparece neste roteiro`
              : "Este roteiro não usa personagem"
          }
        >
          {displayFriend ? (
            <div className="story-avatar-frame">
              <VirtualFriendAvatar
                name={friendName}
                style={friendStyle}
                palette={friendPalette}
                accessory={friendAccessory}
                state={scene === 0 ? "neutro" : scene === 1 ? "orientacao" : "acolhimento"}
                size="story"
              />
            </div>
          ) : null}
          {storyId === "frustracao" ? (
            <img className="story-editorial-photo" src="/images/support/context-frustracao.webp" alt="Pessoa refletindo em um ambiente acolhedor" />
          ) : (
            <EditorialIllustration kind={story.art} scene={scene} className="story-editorial" />
          )}
        </div>
        <article className="story-copy">
          <p>{story.tag}</p>
          <h2>{current.heading}</h2>
          <span>{current.text}</span>
        </article>
        <div className="mentor-tip"><b>Para levar deste momento</b><p>{storyMentorTips[storyId][scene] ?? "Uma escolha pequena pode ajudar neste momento."}</p></div>
        <div className="two-actions">
          <Button variant="secondary" onClick={onPrevious}>
            {scene === 0 ? "Voltar à lista" : "Anterior"}
          </Button>
          <Button onClick={onNext}>
            {scene === story.scenes.length - 1 ? "Concluir" : "Próximo"}
          </Button>
        </div>
        <Button variant="tertiary" onClick={onExit}>
          Fechar história
        </Button>
        {screen === "T35" && (
          <div className="information-note">
            <Icon name="info" size={18} />O amigo só aparece quando o roteiro prevê.
          </div>
        )}
      </div>
    </section>
  );
}

function OutsideSupportScreen({
  onBack,
  onClose,
  onEnd,
  onCatalog,
}: {
  onBack: () => void;
  onClose: () => void;
  onEnd: () => void;
  onCatalog: () => void;
}) {
  const [detail, setDetail] = useState<"break" | "object" | "person" | null>(null);
  const options: Array<{id: "break" | "object" | "person"; title: string; summary: string; art: IllustrationKind; steps: string[]; action: string}> = [
    {id: "break", title: "Fazer uma pausa fora da tela", summary: "Mude de ambiente por alguns instantes e perceba o que fica mais confortável.", art: "outside",
      steps: ["Procure um lugar tranquilo e seguro. Deixe o celular de lado por um instante.", "Observe a luz, os sons e a temperatura do ambiente. Faça um ajuste que melhore seu conforto.", "Quando se sentir pronto, retome o que estava fazendo — ou continue descansando."] , action: "Encerrar minha pausa" },
    {id: "object", title: "Usar um objeto conhecido", summary: "Um objeto familiar pode dar um ponto de apoio ao seu momento.", art: "object",
      steps: ["Olhe ao redor e encontre um objeto conhecido que traga uma sensação agradável.", "Sinta a textura, o peso ou a temperatura do objeto. Foque nesse detalhe por alguns instantes.", "Se isso não ajudar agora, tudo bem: procure outra estratégia."], action: "Concluir orientação" },
    {id: "person", title: "Conversar com alguém de confiança", summary: "Uma pessoa de confiança pode ouvir você, mesmo sem uma explicação longa.", art: "person",
      steps: ["Pense em alguém que costuma ouvir você com respeito.", "Uma frase simples pode ajudar: 'Você pode ficar comigo um pouco?'", "Se estiver difícil conversar, pedir companhia em silêncio também é uma forma de apoio."], action: "Concluir orientação" },
  ];
  const chosen = options.find((option) => option.id === detail);
  return (
    <section className="T16-OutsideSupport screen">
      <AppHeader title="Apoio fora da tela" onBack={chosen ? () => setDetail(null) : onBack} onClose={onClose} />
      <div className="screen-content resource-content outside-support-content">
        {chosen ? (
          <>
            <p className="eyebrow">APOIO FORA DA TELA · OPCIONAL</p>
            <h1>{chosen.title}</h1>
            <p className="lead">{chosen.summary}</p>
            <EditorialIllustration kind={chosen.art} />
            <div className="outside-detail-steps">
              {chosen.steps.map((step, index) => <p key={step}><b>{index + 1}</b><span>{step}</span></p>)}
            </div>
            <div className="information-note"><Icon name="info" size={18} /> Nenhuma chamada ou mensagem será enviada pelo aplicativo.</div>
            <Button onClick={onEnd}>{chosen.action}</Button>
            <Button variant="secondary" onClick={() => setDetail(null)}>Ver outras opções</Button>
          </>
        ) : (
          <>
            <div><h1>Apoio fora da tela</h1><p className="lead">Às vezes, o melhor próximo passo acontece fora do celular. Conheça três ideias simples.</p></div>
            <EditorialIllustration kind="outside" compact />
            <div className="outside-options">
              {options.map(option => (
                <button type="button" className="outside-option-card" key={option.id} onClick={() => setDetail(option.id)}>
                  <EditorialIllustration kind={option.art} compact />
                  <span><b>{option.title}</b><small>{option.summary}</small><em>Ver orientação</em></span>
                  <span className="outside-chevron" aria-hidden="true">›</span>
                </button>
              ))}
            </div>
            <div className="information-note"><Icon name="info" size={18} /> As ideias são orientações práticas, não ações automáticas no ambiente real.</div>
            <Button variant="secondary" onClick={onCatalog}>Voltar ao catálogo</Button>
            <Button variant="tertiary" onClick={onEnd}>Encerrar apoio</Button>
          </>
        )}
      </div>
    </section>
  );
}

function TrackingScreen({
  state,
  onBack,
  onClose,
  onToggleAcoustic,
  onToggleInvites,
  onOpenPermission,
  onManualSupport,
}: {
  state: AppState;
  onBack: () => void;
  onClose: () => void;
  onToggleAcoustic: () => void;
  onToggleInvites: () => void;
  onOpenPermission: () => void;
  onManualSupport: () => void;
}) {
  const permission =
    state.permissionDemoState === "granted-demo"
      ? "concedida"
      : state.permissionDemoState === "denied-demo"
        ? "negada"
        : "não escolhida";
  return (
    <section className="T18-Tracking screen">
      <AppHeader title="Acompanhamento e convites" onBack={onBack} onClose={onClose} />
      <div className="screen-content resource-content">
        <div>
          <h1>Acompanhamento e convites</h1>
          <p className="lead">Estas funções são apenas demonstrativas.</p>
        </div>
        <div className="tracking-status">
          <p>ESTADO DO RECURSO</p>
          <StatusLabel mode={state.acousticMode} />
          <span>Permissão demonstrativa: {permission}. Nenhum microfone está captando áudio.</span>
        </div>
        <div className="tracking-card">
          <span className="strategy-icon">
            <Icon name="support" />
          </span>
          <div>
            <b>Habilitar simulação acústica</b>
            <small>Ativa somente o cenário de demonstração.</small>
          </div>
          <button
            className={`switch ${state.acousticMode === "sim_on" ? "switch--on" : ""}`}
            onClick={onToggleAcoustic}
            role="switch"
            aria-checked={state.acousticMode === "sim_on"}
            aria-label="Habilitar simulação acústica"
          >
            <span />
          </button>
        </div>
        <div className="tracking-card">
          <span className="strategy-icon">
            <Icon name="support" />
          </span>
          <div>
            <b>Receber convites</b>
            <small>Permite suspender ou retomar convites simulados.</small>
          </div>
          <button
            className={`switch ${state.invitesEnabled ? "switch--on" : ""}`}
            onClick={onToggleInvites}
            role="switch"
            aria-checked={state.invitesEnabled}
            aria-label="Receber convites"
          >
            <span />
          </button>
        </div>
        <button className="navigation-card" onClick={onOpenPermission}>
          <span className="strategy-icon">
            <Icon name="info" />
          </span>
          <span>
            <b>Permissão simulada</b>
            <small>Testar autorização, negativa e falha.</small>
          </span>
          <span>›</span>
        </button>
        <div className="information-note">
          <Icon name="info" size={18} />
          Somente o operador OP01 envia eventos de teste. Não existe detecção real.
        </div>
        <Button onClick={onManualSupport}>Usar apoio manual</Button>
      </div>
    </section>
  );
}

function VoiceAccessScreen({
  state,
  onBack,
  onClose,
  backLabel,
  onToggle,
  onManualSupport,
}: {
  state: AppState;
  onBack: () => void;
  onClose: () => void;
  backLabel: string;
  onToggle: () => void;
  onManualSupport: () => void;
}) {
  const unavailable = !state.friendConfigured;
  const stateCopy = unavailable
    ? "Indisponível"
    : state.voiceCallDemo === "sim_on"
      ? "Simulação habilitada"
      : "Desativado";
  return (
    <section className="T36-VoiceAccess screen">
      <AppHeader title="Acesso pelo nome" onBack={onBack} onClose={onClose} />
      <div className="screen-content resource-content">
        <div>
          <h1>Acesso pelo nome</h1>
          <p className="lead">Demonstração de acionamento nominal, sem escuta real.</p>
        </div>
        <div className={`voice-status ${unavailable ? "voice-status--unavailable" : ""}`}>
          <p>SITUAÇÃO DEMONSTRATIVA</p>
          <span>
            <Icon name="support" size={17} />
            {stateCopy}
          </span>
          <small>
            Nome do amigo: {state.friendConfigured ? state.friendName : "não configurado"}.
          </small>
        </div>
        <div className="tracking-card">
          <span className="strategy-icon">
            <Icon name="support" />
          </span>
          <div>
            <b>Habilitar simulação</b>
            <small>Permite somente evento do operador de teste.</small>
          </div>
          <button
            className={`switch ${state.voiceCallDemo === "sim_on" ? "switch--on" : ""}`}
            onClick={onToggle}
            role="switch"
            aria-checked={state.voiceCallDemo === "sim_on"}
            aria-label="Habilitar simulação de acesso pelo nome"
          >
            <span />
          </button>
        </div>
        <div className="navigation-card">
          <span className="strategy-icon">
            <Icon name="info" />
          </span>
          <span>
            <b>Como o teste funciona?</b>
            <small>O operador OP01 envia evento fictício; nenhum microfone é usado.</small>
          </span>
        </div>
        <div className="information-note">
          <Icon name="info" size={18} />É uma demonstração Mágico de Oz. Não identifica a fala de
          ninguém.
        </div>
        <Button onClick={onManualSupport}>Abrir apoio manual</Button>
        <Button variant="secondary" onClick={onBack}>
          {backLabel}
        </Button>
      </div>
    </section>
  );
}

function PermissionSimulation({
  onGrant,
  onDeny,
  onClose,
  onManualSupport,
}: {
  onGrant: () => void;
  onDeny: () => void;
  onClose: () => void;
  onManualSupport: () => void;
}) {
  return (
    <div
      className="C24-PermissionSimulation modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="permission-title"
    >
      <section className="permission-dialog">
        <span className="permission-dialog__icon">
          <Icon name="info" size={28} />
        </span>
        <p className="eyebrow">DEMONSTRAÇÃO</p>
        <h2 id="permission-title">Permissão simulada</h2>
        <p>Esta tela representa autorização ou falha. Nenhuma permissão real será solicitada.</p>
        <div className="permission-state">Escolha um estado demonstrativo.</div>
        <Button onClick={onGrant}>Conceder na demonstração</Button>
        <Button variant="secondary" onClick={onDeny}>
          Negar na demonstração
        </Button>
        <Button variant="secondary" onClick={onManualSupport}>
          Usar apoio manual
        </Button>
        <Button variant="tertiary" onClick={onClose}>
          Fechar
        </Button>
      </section>
    </div>
  );
}

function SetupMeta({ step }: { step: number }) {
  return (
    <div className="C33-SetupStepHeader setup-meta">
      <span>CONFIGURAÇÃO OPCIONAL</span>
      <b>Etapa {step} de 7</b>
    </div>
  );
}

function SetupInterestsScreen({
  draft,
  onToggle,
  onBack,
  onClose,
  onNext,
  onSkip,
  onUseNow,
}: {
  draft: SetupDraft;
  onToggle: (interest: string) => void;
  onBack: () => void;
  onClose: () => void;
  onNext: () => void;
  onSkip: () => void;
  onUseNow: () => void;
}) {
  const interests = [
    ["Ler", "bookmark"],
    ["Ouvir música", "music"],
    ["Desenhar", "info"],
    ["Jogos leves", "grid"],
    ["Organizar", "home"],
    ["Ficar em silêncio", "sound"],
  ] as const;
  return (
    <section className="T25-Interests screen">
      <AppHeader
        title="Configurar"
        onBack={onBack}
        onClose={onClose}
        closeLabel="Fechar configuração sem salvar"
      />
      <div className="screen-content resource-content setup-content">
        <SetupMeta step={1} />
        <div>
          <h1>Meus interesses</h1>
          <p className="lead">Selecione apenas o que quiser compartilhar.</p>
        </div>
        <h2 className="subheading">Atividades de interesse</h2>
        <div className="interest-grid">
          {interests.map(([interest, icon]) => (
            <button
              key={interest}
              className={
                draft.interests.includes(interest)
                  ? "interest-card interest-card--selected"
                  : "interest-card"
              }
              onClick={() => onToggle(interest)}
              aria-pressed={draft.interests.includes(interest)}
            >
              <Icon name={icon} />
              <b>{interest}</b>
              {draft.interests.includes(interest) && <Icon name="check" size={16} />}
            </button>
          ))}
        </div>
        <div className="information-note">
          <Icon name="info" size={18} />
          Escolhas opcionais. É possível avançar sem marcar nada.
        </div>
        <StepNavigation
          leadingAction={{ label: "Ignorar", onClick: onSkip }}
          trailingAction={{ label: "Próximo", onClick: onNext }}
        />
        <Button variant="tertiary" onClick={onUseNow}>
          Usar agora
        </Button>
      </div>
    </section>
  );
}

const sensoryDefinitions = [
  ["fones", "Fones ou abafadores"],
  ["objeto", "Objeto tátil"],
  ["tranquilo", "Lugar tranquilo"],
  ["outro", "Outro recurso"],
] as const;

function SetupSensoryScreen({
  draft,
  onSelect,
  onBack,
  onClose,
  onNext,
}: {
  draft: SetupDraft;
  onSelect: (resource: string, value: SensoryValue) => void;
  onBack: () => void;
  onClose: () => void;
  onNext: () => void;
}) {
  const labels: Record<SensoryValue, string> = {
    tenho: "Tenho",
    nao_tenho: "Não tenho",
    nao_sei: "Não sei",
  };
  return (
    <section className="T26-Sensory screen">
      <AppHeader
        title="Configurar"
        onBack={onBack}
        onClose={onClose}
        closeLabel="Fechar configuração sem salvar"
      />
      <div className="screen-content resource-content setup-content">
        <SetupMeta step={2} />
        <div>
          <h1>Recursos disponíveis</h1>
          <p className="lead">Pense nos recursos que já fazem parte do seu dia. Eles podem ser úteis nos momentos mais intensos.</p>
        </div>
        <div className="sensory-list">
          {sensoryDefinitions.map(([id, label]) => (
            <article className="sensory-card" key={id}>
              <b>{label}</b>
              <div>
                {(["tenho", "nao_tenho", "nao_sei"] as SensoryValue[]).map((value) => (
                  <button
                    className={draft.sensory[id] === value ? "selected" : ""}
                    key={value}
                    onClick={() => onSelect(id, value)}
                    aria-pressed={draft.sensory[id] === value}
                  >
                    {labels[value]}
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>
        <div className="information-note">
          <Icon name="info" size={18} />
          Sugestões não vão presumir a posse de itens não selecionados.
        </div>
        <StepNavigation
          leadingAction={{ label: "Voltar", onClick: onBack }}
          trailingAction={{ label: "Próximo", onClick: onNext }}
          auxiliaryAction={{ label: "Ignorar etapa", onClick: onNext }}
        />
      </div>
    </section>
  );
}

function SetupMusicScreen({
  draft,
  onSilence,
  onToggleGenre,
  onAddTrack,
  onRemoveTrack,
  onBack,
  onClose,
  onNext,
}: {
  draft: SetupDraft;
  onSilence: () => void;
  onToggleGenre: (genre: string) => void;
  onAddTrack: (track: string) => void;
  onRemoveTrack: (track: string) => void;
  onBack: () => void;
  onClose: () => void;
  onNext: () => void;
}) {
  const genres = ["Instrumental", "Ambiente", "Clássica", "Natureza", "Pop", "Rock", "Lo-fi", "Acústico", "Eletrônica", "Outros"];
  const [trackName, setTrackName] = useState("");
  const addTrack = () => {
    const normalized = trackName.trim();
    if (!normalized) return;
    onAddTrack(normalized);
    setTrackName("");
  };
  return (
    <section className="T27-MusicPreferences screen">
      <AppHeader
        title="Configurar"
        onBack={onBack}
        onClose={onClose}
        closeLabel="Fechar configuração sem salvar"
      />
      <div className="screen-content resource-content setup-content">
        <SetupMeta step={3} />
        <div>
          <h1>Preferências musicais</h1>
          <p className="lead">Encontre sons e estilos musicais que combinam com você. O silêncio permanece à disposição.</p>
        </div>
        <button
          className={`silence-choice ${draft.silence ? "silence-choice--selected" : ""}`}
          onClick={onSilence}
          aria-pressed={draft.silence}
        >
          <Icon name="sound" />
          <span>
            <b>Prefiro silêncio</b>
            <small>Não priorizar sugestões de áudio.</small>
          </span>
          {draft.silence && <Icon name="check" />}
        </button>
        <div>
          <SectionTitle title="Gêneros musicais" />
          <div className="genre-list">
            {genres.map((genre) => (
              <button
                key={genre}
                className={draft.genres.includes(genre) ? "selected" : ""}
                onClick={() => onToggleGenre(genre)}
                aria-pressed={draft.genres.includes(genre)}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
        <div className="music-track-picker">
          <label className="C18-TextField text-field">
            <span>Música ou faixa favorita</span>
            <input
              value={trackName}
              onChange={(event) => setTrackName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addTrack();
                }
              }}
              placeholder="Adicionar nome (opcional)"
            />
          </label>
          <Button variant="secondary" type="button" onClick={addTrack} disabled={!trackName.trim()}>
            Adicionar
          </Button>
          {draft.tracks.length > 0 && (
            <div className="music-track-list" aria-label="Faixas favoritas">
              {draft.tracks.map((track) => (
                <span key={track}>
                  {track}
                  <button onClick={() => onRemoveTrack(track)} aria-label={`Remover ${track}`}>
                    Remover
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="information-note">
          <Icon name="info" size={18} />
          Prévia silenciosa. Nada começa a tocar nesta etapa.
        </div>
        <StepNavigation
          leadingAction={{ label: "Voltar", onClick: onBack }}
          trailingAction={{ label: "Próximo", onClick: onNext }}
          auxiliaryAction={{ label: "Ignorar etapa", onClick: onNext }}
        />
      </div>
    </section>
  );
}

function SetupGamesScreen({
  draft,
  onToggleGame,
  onTry,
  onBack,
  onClose,
  onNext,
  onSkip,
}: {
  draft: SetupDraft;
  onToggleGame: (game: string) => void;
  onTry: (screen: "T10" | "T22" | "T23") => void;
  onBack: () => void;
  onClose: () => void;
  onNext: () => void;
  onSkip: () => void;
}) {
  const games: Array<{
    id: string;
    title: string;
    description: string;
    screen: "T10" | "T22" | "T23";
  }> = [
    { id: "J01", title: "Monte seu espaço", description: "Organize livremente.", screen: "T10" },
    {
      id: "J02",
      title: "Combine os pares",
      description: "Encontre figuras iguais.",
      screen: "T22",
    },
    { id: "J03", title: "Desenhe o caminho", description: "Conecte os pontos.", screen: "T23" },
  ];
  return (
    <section className="T28-GamePreferences screen">
      <AppHeader
        title="Configurar"
        onBack={onBack}
        onClose={onClose}
        closeLabel="Fechar configuração sem salvar"
      />
      <div className="screen-content resource-content setup-content">
        <SetupMeta step={4} />
        <div>
          <h1>Escolher os jogos</h1>
          <p className="lead">Conheça os jogos e guarde seus preferidos para encontrar mais rápido depois.</p>
        </div>
        <div className="game-preview-list">
          {games.map((game) => (
            <article className="game-preview-card" key={game.id}>
              <span className={`game-preview-art game-preview-art--${game.id}`} />
              <div>
                <b>{game.title}</b>
                <small>{game.description}</small>
                <span>
                  <button onClick={() => onTry(game.screen)}>Experimentar</button>
                  <button onClick={() => onToggleGame(game.id)}>
                    {draft.games.includes(game.id) ? "Remover favorita" : "Favorito"}
                  </button>
                </span>
              </div>
            </article>
          ))}
        </div>
        <div className="information-note">
          <Icon name="info" size={18} />
          Sem tempo, pontuação ou vitória obrigatória.
        </div>
        <StepNavigation
          leadingAction={{ label: "Voltar", onClick: onBack }}
          trailingAction={{ label: "Próximo", onClick: onNext }}
          auxiliaryAction={{ label: "Ignorar etapa", onClick: onSkip }}
        />
      </div>
    </section>
  );
}

function SetupAvatarScreen({
  draft,
  onName,
  onAvatar,
  onPalette,
  onAccessory,
  onBack,
  onClose,
  onNext,
  onSkip,
}: {
  draft: SetupDraft;
  onName: (name: string) => void;
  onAvatar: (avatar: AvatarChoice) => void;
  onPalette: (palette: PaletteChoice) => void;
  onAccessory: (accessory: AccessoryChoice) => void;
  onBack: () => void;
  onClose: () => void;
  onNext: () => void;
  onSkip: () => void;
}) {
  const choices: Array<[AvatarChoice, string]> = [
    ["none", "Sem avatar"],
    ["portrait01", "Tranças"], ["portrait02", "Afro curto"], ["portrait03", "Cachos"],
    ["portrait04", "Ruivo"], ["portrait05", "Cabelo longo"], ["portrait06", "Com óculos"],
    ["portrait07", "Cabelo raspado"], ["portrait08", "Loiro"], ["portrait09", "Cachos curtos"],
    ["portrait10", "Afro volumoso"], ["portrait11", "Cabelo castanho"], ["portrait12", "Cabelo curto"],
  ];
  return (
    <section className="T29-AvatarSetup screen">
      <AppHeader
        title="Configurar"
        onBack={onBack}
        onClose={onClose}
        closeLabel="Fechar configuração sem salvar"
      />
      <div className="screen-content resource-content setup-content">
        <SetupMeta step={5} />
        <div>
          <h1>Avatar pessoal</h1>
          <p className="lead">Encontre um retrato com o qual você se identifique. Há diferentes tons de pele, cortes e texturas de cabelo.</p>
        </div>
        <div className="avatar-preview">
          <div className="avatar-preview__art">
            <PersonAvatar
              avatar={draft.avatar}
              name={draft.avatarName}
              palette={draft.avatarPalette}
              accessory={draft.avatarAccessory}
              size="preview"
            />
          </div>
          <div>
            <b>Prévia pessoal</b>
            <small>
              {draft.avatar === "none"
                ? "Nenhum avatar pessoal será exibido."
                : "Retrato selecionado para seu perfil"}
            </small>
          </div>
        </div>
        <label className="C18-TextField text-field">
          <span>Nome de exibição</span>
          <input
            value={draft.avatarName}
            onChange={(event) => onName(event.target.value)}
            placeholder="Nome (opcional)"
          />
        </label>
        <div>
          <SectionTitle title="Galeria de retratos" />
          <div className="avatar-options avatar-options--photos">
            {choices.map(([value, label]) => (
              <button
                className={draft.avatar === value ? "selected" : ""}
                key={value}
                onClick={() => onAvatar(value)}
                aria-pressed={draft.avatar === value}
                aria-label={`${label}${draft.avatar === value ? ", selecionado" : ""}`}
              >
                <PersonAvatar
                  avatar={value}
                  palette={draft.avatarPalette}
                  accessory={draft.avatarAccessory}
                  size="option"
                  decorative
                />
                {label}
              </button>
            ))}
          </div>
        </div>
        <p className="avatar-selection-note">A diversidade está nos próprios retratos — não é necessário configurar cores ou acessórios separadamente.</p>
        <StepNavigation
          leadingAction={{ label: "Ignorar", onClick: onSkip }}
          trailingAction={{ label: "Salvar e seguir", onClick: onNext }}
        />
      </div>
    </section>
  );
}

function SetupFriendScreen({
  draft,
  onName,
  onStyle,
  onPalette,
  onAccessory,
  onBack,
  onClose,
  onNext,
  onSkip,
}: {
  draft: SetupDraft;
  onName: (name: string) => void;
  onStyle: (style: VirtualFriendStyle) => void;
  onPalette: (palette: PaletteChoice) => void;
  onAccessory: (accessory: AccessoryChoice) => void;
  onBack: () => void;
  onClose: () => void;
  onNext: () => void;
  onSkip: () => void;
}) {
  return (
    <section className="T30-FriendSetup screen">
      <AppHeader
        title="Configurar"
        onBack={onBack}
        onClose={onClose}
        closeLabel="Fechar configuração sem salvar"
      />
      <div className="screen-content resource-content setup-content">
        <SetupMeta step={6} />
        <div>
          <h1>Meu amigo virtual</h1>
          <p className="lead">Escolha um retrato para representar quem te acompanha nas orientações.</p>
        </div>
        <div className="friend-setup-preview">
          <VirtualFriendAvatar
            name={draft.friendName || "Amigo padrão"}
            style={draft.friendStyle}
            palette={draft.friendPalette}
            accessory={draft.friendAccessory}
            size="preview"
          />
          <div>
            <b>{draft.friendName || "Amigo padrão"}</b>
            <small>
              Retrato do amigo virtual
            </small>
          </div>
        </div>
        <label className="C18-TextField text-field">
          <span>Nome do amigo</span>
          <input
            value={draft.friendName}
            onChange={(event) => onName(event.target.value)}
            placeholder="Escolha um nome (opcional)"
          />
        </label>
        <div>
          <SectionTitle title="Escolha uma aparência" />
          <div className="style-options style-options--photos">
            {friendStyleOptions.map(([style, label]) => (
              <button
                className={draft.friendStyle === style ? "selected" : ""}
                onClick={() => onStyle(style)}
                key={style}
                aria-pressed={draft.friendStyle === style}
                aria-label={`${label}${draft.friendStyle === style ? ", selecionado" : ""}`}
              >
                <VirtualFriendAvatar
                  name={draft.friendName || "Amigo"}
                  style={style}
                  palette={draft.friendPalette}
                  accessory={draft.friendAccessory}
                  size="option"
                  decorative
                />
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="information-note">
          <Icon name="info" size={18} />
          Se ignorar, o amigo padrão permanece no apoio. Esta é apenas uma demonstração, sem uso de microfone.
        </div>
        <StepNavigation
          leadingAction={{ label: "Ignorar", onClick: onSkip }}
          trailingAction={{ label: "Salvar e seguir", onClick: onNext }}
        />
      </div>
    </section>
  );
}

function SetupReviewScreen({
  draft,
  onBack,
  onClose,
  onCorrect,
  onFinish,
}: {
  draft: SetupDraft;
  onBack: () => void;
  onClose: () => void;
  onCorrect: () => void;
  onFinish: () => void;
}) {
  const rows = [
    ["Interesses", draft.interests.length ? `${draft.interests.length} selecionados` : "Nenhum"],
    [
      "Recursos sensoriais",
      `${Object.values(draft.sensory).filter((value) => value === "tenho").length} disponíveis`,
    ],
    [
      "Música",
      draft.silence
        ? "Prefiro silêncio"
        : [...draft.genres, ...draft.tracks].join(", ") || "Sem preferência",
    ],
    [
      "Jogos",
      draft.games.length ? `${draft.games.length} favoritos` : "Nenhum favorito obrigatório",
    ],
    [
      "Avatar pessoal",
      draft.avatar === "none"
        ? "Nenhum"
        : "Retrato selecionado para seu perfil",
    ],
    [
      "Amigo virtual",
      `${draft.friendName || "Amigo padrão"} · ${paletteLabels[draft.friendPalette]}`,
    ],
  ];
  return (
    <section className="T31-SetupReview screen">
      <AppHeader
        title="Configurar"
        onBack={onBack}
        onClose={onClose}
        closeLabel="Fechar configuração sem salvar"
      />
      <div className="screen-content resource-content setup-content">
        <SetupMeta step={7} />
        <div>
          <h1>Concluir configuração</h1>
          <p className="lead">Está quase pronto. Veja como ficou seu espaço e comece a explorar.</p>
        </div>
        <div className="review-list">
          {rows.map(([label, value]) => (
            <div key={label}>
              <b>{label}</b>
              <small>{value}</small>
              <button onClick={onCorrect}>Corrigir</button>
            </div>
          ))}
        </div>
        <div className="information-note">
          <Icon name="info" size={18} />
          Essas escolhas serão mantidas apenas durante a sessão demonstrativa.
        </div>
        <Button onClick={onFinish}>Concluir configuração</Button>
        <StepNavigation
          leadingAction={{ label: "Corrigir", onClick: onCorrect }}
          trailingAction={{ label: "Usar agora", onClick: onFinish, variant: "tertiary" }}
        />
      </div>
    </section>
  );
}

function AppearanceScreen({
  state,
  onBack,
  onClose,
  onSave,
  onSelectTheme,
  onSelectAvatar,
}: {
  state: AppState;
  onBack: () => void;
  onClose: () => void;
  onSave: () => void;
  onSelectTheme: (contrast: boolean) => void;
  onSelectAvatar: (avatar: AvatarChoice) => void;
}) {
  const choices: Array<[AvatarChoice, string]> = [
    ["none", "Sem avatar"],
    ["portrait01", "Tranças"], ["portrait02", "Afro curto"], ["portrait03", "Cachos"],
    ["portrait04", "Ruivo"], ["portrait05", "Cabelo longo"], ["portrait06", "Com óculos"],
    ["portrait07", "Cabelo raspado"], ["portrait08", "Loiro"], ["portrait09", "Cachos curtos"],
    ["portrait10", "Afro volumoso"], ["portrait11", "Cabelo castanho"], ["portrait12", "Cabelo curto"],
  ];
  return (
    <section className="T20-Appearance screen">
      <AppHeader title="Aparência" onBack={onBack} onClose={onClose} />
      <div className="screen-content resource-content">
        <div>
          <h1>Aparência</h1>
          <p className="lead">Deixe o CalmTEA com a sua cara e mais agradável de usar.</p>
        </div>
        <div>
          <SectionTitle title="Temas" />
          <div className="theme-options">
            <button
              className={!state.contrastMode ? "selected" : ""}
              onClick={() => onSelectTheme(false)}
            >
              <span className="theme-preview theme-preview--neutral" />
              Neutro<small>{!state.contrastMode ? "Selecionado" : "Prévia"}</small>
            </button>
            <button
              className={state.contrastMode ? "selected" : ""}
              onClick={() => onSelectTheme(true)}
            >
              <span className="theme-preview theme-preview--contrast" />
              Alto contraste<small>{state.contrastMode ? "Selecionado" : "Prévia"}</small>
            </button>
          </div>
        </div>
        <div>
          <SectionTitle title="Escolha seu retrato" />
          <div className="appearance-avatar-preview">
            <PersonAvatar
              avatar={state.selectedAvatar}
              name={state.avatarName}
              palette={state.avatarPalette}
              accessory={state.avatarAccessory}
              size="preview"
            />
            <div>
              <b>Prévia pessoal</b>
              <small>
                {state.selectedAvatar === "none"
                  ? "Nenhum avatar pessoal selecionado."
                  : "Seu retrato aparece no perfil"}
              </small>
            </div>
          </div>
          <div className="avatar-options avatar-options--photos">
            {choices.map(([value, label]) => (
              <button
                className={state.selectedAvatar === value ? "selected" : ""}
                key={value}
                onClick={() => onSelectAvatar(value)}
                aria-pressed={state.selectedAvatar === value}
                aria-label={`${label}${state.selectedAvatar === value ? ", selecionado" : ""}`}
              >
                <PersonAvatar
                  avatar={value}
                  palette={state.avatarPalette}
                  accessory={state.avatarAccessory}
                  size="option"
                  decorative
                />
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="information-note">
          <Icon name="info" size={18} />O avatar pessoal é opcional e independente do amigo virtual.
        </div>
        <Button onClick={onSave}>Salvar aparência</Button>
      </div>
    </section>
  );
}

function ProfileScreen({
  state,
  onBack,
  onClose,
  backLabel,
  onEdit,
  onFriend,
  onPersonal,
  onFavorites,
}: {
  state: AppState;
  onBack: () => void;
  onClose: () => void;
  backLabel: string;
  onEdit: (entryScreen: SetupScreen) => void;
  onFriend: () => void;
  onPersonal: () => void;
  onFavorites: () => void;
}) {
  const rows: Array<[label: string, value: string, entryScreen: SetupScreen]> = [
    [
      "Interesses",
      state.profileInterests.length ? state.profileInterests.join(", ") : "Nenhum",
      "T25",
    ],
    [
      "Recursos sensoriais",
      `${Object.values(state.sensoryResources).filter((value) => value === "tenho").length} disponíveis`,
      "T26",
    ],
    [
      "Preferências musicais",
      state.prefSilence
        ? "Silêncio"
        : [...state.prefGenres, ...state.prefTracks].join(", ") || "Nenhuma",
      "T27",
    ],
    ["Jogos", state.favGames.length ? `${state.favGames.length} favoritos` : "Nenhum", "T28"],
    [
      "Avatar pessoal",
      state.selectedAvatar === "none"
        ? "Nenhum"
        : "Seu retrato aparece no perfil",
      "T29",
    ],
  ];
  return (
    <section className="T34-Profile screen">
      <AppHeader title="Meu perfil" onBack={onBack} onClose={onClose} />
      <div className="screen-content resource-content">
        <div>
          <h1>Meu perfil</h1>
          <p className="lead">Deixe as atividades e os apoios alinhados às suas preferências.</p>
        </div>
        <div className="profile-identity-preview">
          <div>
            <PersonAvatar
              avatar={state.selectedAvatar}
              name={state.avatarName}
              palette={state.avatarPalette}
              accessory={state.avatarAccessory}
              size="profile"
            />
            <span>
              <b>
                {state.selectedAvatar === "none"
                  ? "Avatar pessoal opcional"
                  : state.avatarName || "Meu avatar"}
              </b>
              <small>
                {state.selectedAvatar === "none"
                  ? "Nenhum avatar selecionado"
                  : "Seu retrato aparece no perfil"}
              </small>
            </span>
          </div>
          <div>
            <VirtualFriendAvatar
              name={state.friendConfigured ? state.friendName : "Amigo padrão"}
              style={state.friendStyle}
              palette={state.friendPalette}
              accessory={state.friendAccessory}
              size="profile"
            />
            <span>
              <b>{state.friendConfigured ? state.friendName : "Amigo padrão"}</b>
              <small>
                Retrato de apoio
              </small>
            </span>
          </div>
        </div>
        <div className="profile-list">
          {rows.map(([label, value, entryScreen]) => (
            <div key={label}>
              <span>
                <b>{label}</b>
                <small>{value}</small>
              </span>
              <button onClick={() => onEdit(entryScreen)}>Editar</button>
            </div>
          ))}
          <div>
            <span>
              <b>Estratégias preferidas</b>
              <small>
                {state.favorites.length ? `${state.favorites.length} selecionadas` : "Nenhuma"}
              </small>
            </span>
            <button onClick={onFavorites}>Ver</button>
          </div>
          <div>
            <span>
              <b>Meu amigo virtual</b>
              <small>
                {state.friendConfigured ? state.friendName : "Padrão"} ·{" "}
                {paletteLabels[state.friendPalette]}
              </small>
            </span>
            <button onClick={onFriend}>Editar</button>
          </div>
          <div>
            <span>
              <b>Minhas estratégias</b>
              <small>{state.personalStrategies.length} registradas</small>
            </span>
            <button onClick={onPersonal}>Editar</button>
          </div>
        </div>
        <div className="information-note">
          <Icon name="info" size={18} />
          Alterações só são aplicadas ao confirmar; cancelar descarta o rascunho.
        </div>
        <Button variant="secondary" onClick={onBack}>
          {backLabel}
        </Button>
      </div>
    </section>
  );
}

function FriendDetailsScreen({
  state,
  onBack,
  onClose,
  onEdit,
}: {
  state: AppState;
  onBack: () => void;
  onClose: () => void;
  onEdit: () => void;
}) {
  const friendName = state.friendConfigured ? state.friendName : "Amigo padrão";
  const visualStates: Array<[VirtualFriendState, string, string]> = [
    ["neutro", "Neutro", "Presença discreta"],
    ["acolhimento", "Acolhimento", "Tom respeitoso"],
    ["orientacao", "Orientação", "Ajuda opcional"],
  ];
  return (
    <section className="T37-FriendDetails screen">
      <AppHeader title="Detalhes e estados do amigo" onBack={onBack} onClose={onClose} />
      <div className="screen-content resource-content">
        <div>
          <h1>Meu amigo virtual</h1>
          <p className="lead">Conheça quem aparece ao seu lado nas orientações e histórias.</p>
        </div>
        <div className="friend-details-card">
          <VirtualFriendAvatar
            name={friendName}
            style={state.friendStyle}
            palette={state.friendPalette}
            accessory={state.friendAccessory}
            size="preview"
          />
          <div>
            <b>{friendName}</b>
            <small>
              Retrato de apoio
            </small>
            <button onClick={onEdit}>Editar nome e aparência</button>
          </div>
        </div>
        <div className="section-row">
          <h2>Estados visuais</h2>
          <span>Prévia estática</span>
        </div>
        <div className="friend-state-list">
          {visualStates.map(([stateName, title, description]) => (
            <div key={title}>
              <VirtualFriendAvatar
                name={friendName}
                style={state.friendStyle}
                palette={state.friendPalette}
                accessory={state.friendAccessory}
                state={stateName}
                size="state"
              />
              <b>{title}</b>
              <small>{description}</small>
            </div>
          ))}
        </div>
        <div className="information-note">
          <Icon name="info" size={18} />O amigo aparece no apoio principal. Nas histórias, depende
          do roteiro.
        </div>
        <Button onClick={onEdit}>Editar amigo virtual</Button>
      </div>
    </section>
  );
}

function CheckInScreen({
  state,
  source,
  onBack,
  onClose,
  onCancel,
  onChoice,
  onOther,
  onSkip,
  onContinue,
}: {
  state: AppState;
  source: "support" | "record";
  onBack: () => void;
  onClose: () => void;
  onCancel: () => void;
  onChoice: (value: string) => void;
  onOther: (value: string) => void;
  onSkip: () => void;
  onContinue: () => void;
}) {
  const selected = state.checkinChoice;
  return (
    <section className="T12-CheckIn screen">
      <AppHeader
        title="Como me sinto?"
        onBack={onBack}
        onClose={onClose}
        closeLabel="Fechar sem registrar resposta"
      />
      <div className="screen-content">
        <p className="eyebrow">AUTORRELATO OPCIONAL</p>
        <h1>Como você está se sentindo?</h1>
        <p className="lead">Reconhecer o que você está sentindo pode ajudar a encontrar o próximo passo.</p>
        <div className="choice-list mood-grid" role="group" aria-label="Como você está se sentindo">
          {([
            ["Mais calmo(a)","😌","Mais tranquilo(a)"],
            ["Mais agitado(a)","😣","Agitado(a)"],
            ["Com foco","🙂","Concentrado(a)"],
            ["Com muita demanda","😮‍💨","Sobrecarregado(a)"],
            ["Precisando de apoio","🥺","Preciso de apoio"],
            ["Prefiro não informar","😶","Prefiro não dizer"],
          ] as const).map(([choice,emoji,label]) => <button key={choice}
            className={`C21-CheckInOption choice-button mood-option ${selected===choice?"choice-button--selected":""}`}
            onClick={()=>onChoice(choice)} aria-pressed={selected===choice} aria-label={label}>
              <span className="mood-option__emoji" aria-hidden="true">{emoji}</span><span>{label}</span>
            </button>)}
        </div>
        <label className="C18-TextField text-field">
          <span>Quer acrescentar algo? (opcional)</span>
          <textarea
            value={state.checkinOther}
            onChange={(event) => onOther(event.target.value)}
            placeholder="Escreva algo sobre o momento, se desejar"
            rows={2}
          />
        </label>
        <div className="screen-actions">
          <Button onClick={onContinue}>{source === "support" ? "Confirmar e continuar" : "Confirmar registro"}</Button>
          <Button variant="secondary" onClick={onSkip}>Pular esta etapa</Button>
        </div>
        <p className="form-note">Sua resposta fica apenas nesta sessão de demonstração.</p>
      </div>
    </section>
  );
}

function ContextScreen({
  state,
  onBack,
  onClose,
  onCancel,
  onChoice,
  onOther,
  onContinue,
}: {
  state: AppState;
  onBack: () => void;
  onClose: () => void;
  onCancel: () => void;
  onChoice: (value: string) => void;
  onOther: (value: string) => void;
  onContinue: () => void;
}) {
  const options = [
    "Barulho",
    "Mudança",
    "Frustração",
    "Situação social",
    "Medo",
    "Raiva",
    "Cansaço",
    "Dor",
  ];
  return (
    <section className="T32-Context screen">
      <AppHeader
        title="Contexto"
        onBack={onBack}
        onClose={onClose}
        closeLabel="Fechar sem registrar resposta"
      />
      <div className="screen-content">
        <p className="eyebrow">CONTEXTO OPCIONAL</p>
        <h1>O que aconteceu?</h1>
        <p className="lead">O que mais pesou neste momento? Isso nos ajuda a encontrar um apoio mais útil.</p>
        <div className="context-grid">
          {options.map((option) => (
            <button
              className={`C40-ContextChoice context-choice ${state.context === option ? "context-choice--selected" : ""}`}
              onClick={() => onChoice(option)}
              aria-pressed={state.context === option}
              key={option}
            >
              {option}
              {state.context === option && <Icon name="check" size={18} />}
            </button>
          ))}
        </div>
        <label className="C18-TextField text-field">
          <span>Outra situação</span>
          <textarea
            value={state.contextOther}
            onChange={(event) => onOther(event.target.value)}
            placeholder="Escreva algo sobre o momento, se desejar"
            rows={2}
          />
        </label>
        <button
          className={`none-choice ${state.context === "Não quero responder" ? "none-choice--selected" : ""}`}
          onClick={() => onChoice("Não quero responder")}
        >
          Não quero responder
        </button>
        <div className="screen-actions">
          <Button onClick={onContinue}>Ver sugestões de apoio</Button>
        </div>
      </div>
    </section>
  );
}

function SuggestionsScreen({
  state,
  onBack,
  onClose,
  onIgnore,
  onCatalog,
  onRecommendation,
}: {
  state: AppState;
  onBack: () => void;
  onClose: () => void;
  onIgnore: () => void;
  onCatalog: (filter: string) => void;
  onRecommendation: (title: string, category: string) => void;
}) {
  const suggestions = supportSuggestions(state);
  const context = state.context === "Outra situação" ? state.contextOther.trim() : state.context;
  return (
    <section className="T33-Suggestions screen">
      <AppHeader title="Opções de apoio" onBack={onBack} onClose={onClose} />
      <div className="screen-content">
        <p className="eyebrow">ESCOLHA LIVRE</p>
        <h1>Sugestões para mim</h1>
        <p className="lead">
          {state.context === "Outra situação" && context
            ? `Você descreveu: ${context}. As opções continuam gerais, sem interpretar esse texto.`
            : context && context !== "Não quero responder"
              ? `Você mencionou ${context}. Aqui estão três caminhos para lidar com esse momento.`
              : "Preparei algumas possibilidades para você começar. Experimente aquela que mais chamar sua atenção."}
        </p>
        <div className="suggestion-list">
          {suggestions.map(([title, reason, category]) => (
            <article className="C41-SupportSuggestionCard suggestion-card" key={title}>
              <img
                className="suggestion-card__thumbnail"
                src={suggestionThumbnail(title, state.context)}
                alt=""
                loading="lazy"
              />
              <div className="suggestion-card__body">
                <h2>{title === "História contextual" ? "História para este momento" : title}</h2>
                <p>{reason}</p>
                <Button variant="secondary" onClick={() => onRecommendation(title, category)}>
                  {title === "Catálogo completo" ? "Explorar catálogo" :
                    title === "Pausa silenciosa" ? "Iniciar pausa" :
                    title === "Respiração guiada" || title === "Respiração voluntária" ? "Começar respiração" :
                    title === "Músicas e sons" ? "Escolher som ou música" :
                    title === "História contextual" ? "Ler história" :
                    title === "Orientação breve" ? "Ver orientação" :
                    title === "Apoio fora da tela" ? "Ver apoio fora da tela" :
                    title === "Monte seu espaço" ? "Abrir jogo" : "Abrir estratégia"}
                </Button>
              </div>
            </article>
          ))}
        </div>
        <Button onClick={() => onCatalog("Todas")}>Explorar todas as estratégias</Button>
        <Button variant="tertiary" onClick={onIgnore}>
          Ignorar sugestões
        </Button>
      </div>
    </section>
  );
}

function SettingsScreen({
  state,
  onBack,
  onClose,
  onUpdate,
  onReset,
  onOpenTracking,
  onOpenVoice,
  onOpenAppearance,
  onOpenProfile,
}: {
  state: AppState;
  onBack: () => void;
  onClose: () => void;
  onUpdate: (partial: Partial<AppState>) => void;
  onReset: () => void;
  onOpenTracking: () => void;
  onOpenVoice: () => void;
  onOpenAppearance: () => void;
  onOpenProfile: () => void;
}) {
  return (
    <section className="T17-Settings screen">
      <AppHeader title="Ajustes" onBack={onBack} onClose={onClose} />
      <div className="screen-content">
        <p className="eyebrow">CONFORTO E LEITURA</p>
        <h1>Deixe a apresentação mais confortável.</h1>
        <p className="lead">
          Ajuste luz, texto e movimento para deixar a leitura mais confortável.
        </p>
        <div className="settings-card">
          <Toggle
            label="Reduzir movimento"
            description="Remove transições opcionais."
            checked={state.reduceMotion}
            onChange={() => onUpdate({ reduceMotion: !state.reduceMotion })}
            icon="wind"
          />
          <Toggle
            label="Sons da interface"
            description="Nenhum som é reproduzido automaticamente."
            checked={state.soundEnabled}
            onChange={() => onUpdate({ soundEnabled: !state.soundEnabled })}
            icon="sound"
          />
          <div className="text-size-block">
            <div>
              <h2>Tamanho do texto</h2>
              <p>A amostra muda antes de você continuar.</p>
            </div>
            <div
              className="C12-SegmentedControl segmented-control"
              role="group"
              aria-label="Tamanho do texto"
            >
              {[
                ["Normal", 0],
                ["Grande", 1],
                ["Extra", 2],
              ].map(([label, scale]) => (
                <button
                  key={String(label)}
                  className={state.textScale === scale ? "selected" : ""}
                  onClick={() => onUpdate({ textScale: scale as 0 | 1 | 2 })}
                  aria-pressed={state.textScale === scale}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <Toggle
            label="Maior contraste"
            description="Usa texto preto, fundo branco e bordas mais visíveis."
            checked={state.contrastMode}
            onChange={() => onUpdate({ contrastMode: !state.contrastMode })}
            icon="info"
          />
        </div>
        <div className="settings-links">
          <button className="navigation-card" onClick={onOpenTracking}>
            <span className="strategy-icon">
              <Icon name="support" />
            </span>
            <span>
              <b>Acompanhamento e convites</b>
              <small>Estados e convites somente em simulação.</small>
            </span>
            <span>›</span>
          </button>
          <button className="navigation-card" onClick={onOpenVoice}>
            <span className="strategy-icon">
              <Icon name="sound" />
            </span>
            <span>
              <b>Acesso pelo nome</b>
              <small>Demonstração sem captação de voz.</small>
            </span>
            <span>›</span>
          </button>
          <button className="navigation-card" onClick={onOpenAppearance}>
            <span className="strategy-icon">
              <Icon name="settings" />
            </span>
            <span>
              <b>Aparência</b>
              <small>Tema e avatar pessoal opcional.</small>
            </span>
            <span>›</span>
          </button>
          <button className="navigation-card" onClick={onOpenProfile}>
            <span className="strategy-icon">
              <Icon name="bookmark" />
            </span>
            <span>
              <b>Meu perfil</b>
              <small>Reveja as escolhas desta sessão.</small>
            </span>
            <span>›</span>
          </button>
        </div>
        <Button variant="secondary" onClick={onReset}>
          Restaurar padrões
        </Button>
      </div>
    </section>
  );
}

function PendingScreen({ onBack }: { onBack: () => void }) {
  const screen = screenRegistry.find((item) => item.id === "T25");
  return (
    <section className="screen pending-screen">
      <AppHeader title={screen?.title ?? "Pendente"} onBack={onBack} />
      <div className="screen-content">
        <p className="eyebrow">PRÓXIMA ETAPA</p>
        <h1>{screen?.id} ainda está pendente.</h1>
        <p className="lead">
          Esta tela está registrada no plano de cobertura V41, mas não é declarada como concluída
          nesta primeira execução.
        </p>
        <Button onClick={onBack}>Voltar sem configurar</Button>
      </div>
    </section>
  );
}

function BottomNav({
  current,
  onNavigate,
}: {
  current: Screen;
  onNavigate: (screen: "T01" | "T02" | "T17") => void;
}) {
  const items: Array<{
    id: "T01" | "T02" | "T17";
    label: string;
    icon: Parameters<typeof Icon>[0]["name"];
  }> = [
    { id: "T01", label: "Início", icon: "home" },
    { id: "T02", label: "Apoio", icon: "support" },
    { id: "T17", label: "Ajustes", icon: "settings" },
  ];
  const selected: "T01" | "T02" | "T17" = [
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
  ].includes(current)
    ? "T02"
    : current === "T17" ||
        current === "T18" ||
        current === "T20" ||
        current === "T34" ||
        current === "T36" ||
        current === "T37"
      ? "T17"
      : "T01";
  return (
    <nav className="C04-BottomNav bottom-nav" aria-label="Navegação principal">
      {items.map((item) => (
        <button
          key={item.id}
          className={selected === item.id ? "active" : ""}
          onClick={() => onNavigate(item.id)}
          aria-current={selected === item.id ? "page" : undefined}
        >
          <Icon name={item.icon} />
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

function SupportInvite({
  onClose,
  onSupport,
  onWell,
  onLater,
}: {
  onClose: () => void;
  onSupport: () => void;
  onWell: () => void;
  onLater: () => void;
}) {
  return (
    <div
      className="C08-SupportInvite modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="invite-title"
    >
      <section className="invite-sheet">
        <div className="sheet-handle" />
        <div className="invite-heading">
          <div>
            <p className="eyebrow">CONVITE OPCIONAL</p>
            <h2 id="invite-title">Quer acessar apoio?</h2>
          </div>
          <IconButton label="Fechar convite" icon="close" onClick={onClose} />
        </div>
        <p>
          Este convite foi aberto por um evento de demonstração. Ele não interpreta como você está.
        </p>
        <Button onClick={onSupport}>Quero apoio</Button>
        <Button variant="secondary" onClick={onWell}>
          Estou bem
        </Button>
        <Button variant="tertiary" onClick={onLater}>
          Agora não
        </Button>
      </section>
    </div>
  );
}

function OperatorApp() {
  const [roomId, setRoomId] = useState<string>(() =>
    parseSessionId(sessionStorage.getItem("oz-operator-session")) ?? "",
  );
  const [status, setStatus] = useState<"conectado" | "conectando" | "erro" | "inativo">("inativo");
  const [lastSeen, setLastSeen] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [log, setLog] = useState<string[]>(["OP01 preparado. Nenhum dado pessoal será enviado."]);
  const connectionRef = useRef<OzConnection | null>(null);
  const pendingRef = useRef(new Map<string, number>());
  const addLog = (item: string) => setLog((items) => [item, ...items].slice(0, 12));

  useEffect(() => {
    const tick = window.setInterval(() => setNow(Date.now()), 4_000);
    return () => window.clearInterval(tick);
  }, []);
  useEffect(() => {
    if (!roomId) return;
    sessionStorage.setItem("oz-operator-session", roomId);
    let active = false;
    const connection = joinOzSession(
      roomId,
      (message: OzMessage) => {
        if (message.kind === "participante_presente") {
          setLastSeen(Date.now());
          return;
        }
        if (message.kind === "confirmacao") {
          const timer = pendingRef.current.get(message.id);
          if (timer !== undefined) window.clearTimeout(timer);
          pendingRef.current.delete(message.id);
          addLog(`Confirmação: ${message.status} — ${message.reason}`);
        }
      },
      (nextStatus) => {
        setStatus(nextStatus);
        active = nextStatus === "conectado";
        if (active) {
          addLog("Canal conectado. Aguardando o participante abrir o link.");
          void connection.send({ kind: "pesquisador_presente", sentAt: Date.now() });
        }
        if (nextStatus === "erro") addLog("Falha de conexão: confira o Realtime e a publicação.");
      },
    );
    connectionRef.current = connection;
    const pingTimer = window.setInterval(() => {
      if (active) void connection.send({ kind: "pesquisador_presente", sentAt: Date.now() });
    }, 9_000);
    return () => {
      window.clearInterval(pingTimer);
      for (const timer of pendingRef.current.values()) window.clearTimeout(timer);
      pendingRef.current.clear();
      connection.close();
      connectionRef.current = null;
    };
  }, [roomId]);

  const participantOnline = status === "conectado" && lastSeen > 0 && now - lastSeen < 25_000;
  const createSession = () => {
    setLastSeen(0);
    setRoomId(createSessionId());
    addLog("Sessão gerada. Compartilhe o link com o participante.");
  };
  const sendEvent = async (type: OzCommandType) => {
    if (!participantOnline || !connectionRef.current) {
      addLog(`${type}: NÃO enviado — participante não conectado.`);
      return;
    }
    const id = crypto.randomUUID();
    const success = await connectionRef.current.send({ kind: "comando", id, type, sentAt: Date.now() });
    if (!success) {
      addLog(`${type}: falha de envio para o servidor.`);
      return;
    }
    addLog(`${type}: enviado; aguardando confirmação do celular...`);
    const timer = window.setTimeout(() => {
      if (pendingRef.current.has(id)) {
        pendingRef.current.delete(id);
        addLog(`${type}: sem confirmação de recebimento pelo celular.`);
      }
    }, 7_000);
    pendingRef.current.set(id, timer);
  };
  const shareUrl = roomId ? participantSessionUrl(roomId) : "";
  return (
    <div className="operator-app">
      <main className="operator-panel">
        <p className="eyebrow">ÁREA TÉCNICA SEPARADA — MÁGICO DE OZ</p>
        <h1>OP01 · Controle remoto</h1>
        <p className="lead">Controle apenas os eventos simulados. A autorização e os convites são configurados pela pessoa no celular. Não há microfone ou detecção real.</p>

        <section className="operator-status" aria-label="Sessão remota">
          <h2>Sessão remota</h2>
          {!roomId ? (
            <Button onClick={createSession}>Criar sessão de teste</Button>
          ) : (
            <>
              <p>Servidor: <b>{status === "conectado" ? "conectado" : status === "conectando" ? "conectando…" : "sem conexão"}</b></p>
              <p>Participante: <b>{participantOnline ? "conectado no celular" : "aguardando conexão"}</b></p>
              <label htmlFor="oz-participant-url"><b>Link para enviar ao participante</b></label>
              <input id="oz-participant-url" className="oz-link-input" value={shareUrl} readOnly onFocus={(event) => event.currentTarget.select()} />
              <div className="oz-controls">
                <Button onClick={() => { void navigator.clipboard.writeText(shareUrl).then(() => addLog("Link copiado para enviar pelo Meet ou WhatsApp.")).catch(() => addLog("Selecione o texto do campo e copie manualmente.")); }}>Copiar link do participante</Button>
                <Button variant="secondary" onClick={createSession}>Nova sessão</Button>
              </div>
              <p className="oz-help">Abra o OP01 neste computador e o link acima em outro celular. Os dois dispositivos devem permanecer conectados à internet.</p>
            </>
          )}
        </section>

        <section className="operator-modes" aria-labelledby="oz-permissions-title">
          <h2 id="oz-permissions-title">Antes de acionar o evento</h2>
          <p>No celular, a pessoa pode habilitar a simulação e os convites na tela inicial ou em Ajustes. A permissão demonstrativa precisa ser concedida por ela. O OP01 não pode autorizar em seu nome.</p>
          <p><b>Acústico:</b> simula um sinal externo e oferece um convite opcional (intervenção passiva). <b>Nominal:</b> simula um pedido voluntário pelo nome do amigo virtual (acesso ativo).</p>
        </section>

        <section aria-label="Comandos demonstrativos" className="operator-actions">
          <Button disabled={!participantOnline} onClick={() => void sendEvent("SIM_EVENTO_ACUSTICO")}>Simular sinal acústico · oferecer apoio</Button>
          <Button disabled={!participantOnline} variant="secondary" onClick={() => void sendEvent("SIM_EVENTO_NOMINAL")}>Simular pedido pelo nome · abrir apoio</Button>
          <Button disabled={!participantOnline} variant="secondary" onClick={() => void sendEvent("SIM_INDISPONIVEL")}>Simular indisponibilidade</Button>
          <Button disabled={!participantOnline} variant="secondary" onClick={() => void sendEvent("SIM_RESET")}>Fechar convites simulados</Button>
        </section>
        <section className="operator-qa" aria-labelledby="operator-qa-title">
          <h2 id="operator-qa-title">Roteiro de validação</h2>
          <p>{qaRegistry.length} cenários documentados. Nenhum é aprovado automaticamente; registre o que foi observado no aparelho real.</p>
          <details>
            <summary>Ver cenários</summary>
            <ol className="operator-qa-list">
              {qaRegistry.map((scenario) => <li key={scenario.id}><b>{scenario.id} · {scenario.title}</b><span>{scenario.behavior}</span><small>{scenario.status}</small></li>)}
            </ol>
          </details>
        </section>
        <section className="tech-log" aria-label="Log técnico">
          <h2>Log de eventos (somente nesta sessão)</h2>
          <ul>{log.map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}</ul>
        </section>
        <a className="operator-link" href={shareUrl || "/"} target="_blank" rel="noreferrer">Abrir interface do participante para conferência</a>
        <p className="oz-help">Canal público temporário para validação técnica, sem transmissão de nomes, respostas ou dados de saúde. Não usar com dados sensíveis sem reforçar a autenticação.</p>
      </main>
    </div>
  );
}

export default function App() {
  return window.location.pathname === "/operador" ? <OperatorApp /> : <ParticipantApp />;
}
