/** Comunicação temporária de Mágico de Oz: sem coleta de dados pessoais. */
import { createClient, type RealtimeChannel } from "@supabase/supabase-js";

// A publishable key é pública por definição; nunca colocar service_role/secret aqui.
const url = import.meta.env.VITE_SUPABASE_URL || "https://mfijwkfrmflthdmjtwkh.supabase.co";
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_9OGa7wM3aHWbHZZEx0Zx9Q_rVq4BGcy";

const supabase = createClient(url, publishableKey, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});

export type OzCommandType =
  | "SIM_EVENTO_ACUSTICO"
  | "SIM_EVENTO_NOMINAL"
  | "SIM_INDISPONIVEL"
  | "SIM_RESET";

export type OzMessage =
  | { kind: "pesquisador_presente"; sentAt: number }
  | { kind: "participante_presente"; sentAt: number }
  | { kind: "comando"; id: string; type: OzCommandType; sentAt: number }
  | { kind: "confirmacao"; id: string; status: "exibido" | "processado" | "ignorado"; reason: string; sentAt: number };

export type OzConnection = {
  send: (message: OzMessage) => Promise<boolean>;
  close: () => void;
};

export function createSessionId(): string {
  // 128 bits aleatórios para evitar colisão/adivinhação casual.
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return [...bytes].map((x) => x.toString(16).padStart(2, "0")).join("");
}

export function parseSessionId(raw: string | null): string | null {
  return raw && /^[a-f0-9]{32}$/.test(raw) ? raw : null;
}

/**
 * Canal público de demonstração. Não transmite PII. Não usar como canal autenticado
 * para pesquisa com dados sensíveis sem implantar Auth + canais privados e políticas RLS.
 */
export function joinOzSession(
  sessionId: string,
  onMessage: (message: OzMessage) => void,
  onStatus: (status: "conectado" | "conectando" | "erro") => void,
): OzConnection {
  let subscribed = false;
  let closed = false;
  const channel: RealtimeChannel = supabase.channel(`oz-${sessionId}`, {
    config: { broadcast: { ack: true, self: false } },
  });
  channel.on("broadcast", { event: "oz" }, ({ payload }: { payload: OzMessage }) => {
    if (closed || !payload || typeof payload !== "object" || !("kind" in payload)) return;
    if ("sentAt" in payload && Math.abs(Date.now() - payload.sentAt) > 120_000) return;
    onMessage(payload);
  });
  onStatus("conectando");
  channel.subscribe((status) => {
    if (closed) return;
    subscribed = status === "SUBSCRIBED";
    if (status === "SUBSCRIBED") onStatus("conectado");
    if (["CHANNEL_ERROR", "TIMED_OUT", "CLOSED"].includes(status)) onStatus("erro");
  });

  return {
    async send(message) {
      if (!subscribed || closed) return false;
      try {
        const result = await channel.send({ type: "broadcast", event: "oz", payload: message });
        return result === "ok";
      } catch {
        return false;
      }
    },
    close() {
      closed = true;
      subscribed = false;
      void supabase.removeChannel(channel);
    },
  };
}

export const participantSessionUrl = (room: string): string =>
  `${window.location.origin}/?sessao=${encodeURIComponent(room)}`;
