import { useId } from "react";

export type IllustrationKind =
  | "home" | "pause" | "breath" | "rain" | "music" | "space"
  | "outside" | "object" | "person" | "sounds" | "change"
  | "game" | "social" | "fear" | "anger" | "tired" | "pain";

/** Ilustrações vetoriais editoriais originais; elementos decorativos não são controles. */
export function EditorialIllustration({
  kind,
  scene = 0,
  compact = false,
  className = "",
}: {
  kind: IllustrationKind;
  scene?: number;
  compact?: boolean;
  className?: string;
}) {
  const gradientId = useId().replace(/:/g, "");
  const tones: Record<IllustrationKind, [string, string, string]> = {
    home: ["#e3f3f6", "#c1d8dc", "#155e75"],
    pause: ["#e8f1e8", "#b7d3c8", "#467565"],
    breath: ["#e3f3f6", "#b6d7e2", "#326779"],
    rain: ["#e6eef5", "#bbd0e0", "#426c87"],
    music: ["#f0e8f4", "#d7bcd9", "#675c83"],
    space: ["#f5ede0", "#dcd2b7", "#806d54"],
    outside: ["#e8f0e5", "#c0d8cd", "#427a66"],
    object: ["#f0eae2", "#d5c7bb", "#88725f"],
    person: ["#e4edf1", "#cad5e6", "#4a7482"],
    sounds: ["#e3eff2", "#a9c4d4", "#386a7e"],
    change: ["#f5efe5", "#dfc9a2", "#886a4c"],
    game: ["#e9f0e8", "#c6d9c2", "#54765b"],
    social: ["#e8ebf4", "#c9d1e9", "#686886"],
    fear: ["#eeedf3", "#d1d1e0", "#676b86"],
    anger: ["#f6eeea", "#e5c4bb", "#9b665a"],
    tired: ["#eeeaf1", "#d4bdd7", "#7d6884"],
    pain: ["#edf1ee", "#d3dacc", "#687c6e"],
  };
  const [light, mid, dark] = tones[kind];
  const windows = ["home", "pause", "rain", "space", "outside", "tired", "sounds"].includes(kind);
  const living = ["person", "social", "fear", "anger", "pain", "breath"].includes(kind);
  const isMusic = kind === "music";
  const isObject = kind === "object";
  const isChange = kind === "change";
  const isGame = kind === "game";
  const offset = scene % 3;
  return (
    <svg className={`editorial-illustration ${compact ? "editorial-illustration--compact" : ""} ${className}`}
      viewBox="0 0 440 232" role="img" aria-label={
        ({home:"Espaço acolhedor",pause:"Ambiente tranquilo com luz natural",breath:"Respiração representada por linhas suaves",
        rain:"Chuva em uma janela",music:"Instrumentos musicais e ondas de som",space:"Ambiente com móveis e plantas",
        outside:"Jardim com banco",object:"Objetos cotidianos sobre uma mesa",person:"Duas pessoas conversando",
        sounds:"Paisagem com ondas de som",change:"Agenda com planos ajustados",game:"Peças geométricas em uma mesa",
        social:"Duas pessoas em uma conversa",fear:"Caminho e horizonte iluminado",anger:"Espaço reservado e tranquilo",
        tired:"Luz suave ao entardecer",pain:"Ambiente de descanso"} as Record<IllustrationKind,string>)[kind]
      }>
      <defs>
        <linearGradient id={gradientId} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor={light}/><stop offset="100%" stopColor={mid}/>
        </linearGradient>
      </defs>
      <rect width="440" height="232" rx="18" fill={`url(#${gradientId})`}/>
      <path d="M0 187 Q120 153 226 191 T440 175 V232 H0 Z" fill={dark} opacity=".10"/>
      <path d="M0 207 Q130 181 280 210 T440 199 V232 H0 Z" fill="#ffffff" opacity=".37"/>
      <circle cx={offset === 1 ? 355 : 350} cy="52" r="34" fill="#ffffff" opacity=".32"/>
      {windows && <g>
        <rect x="44" y="35" width="168" height="135" rx="12" fill="#fbfcfc" opacity=".76"/>
        <rect x="53" y="44" width="150" height="117" rx="8" fill={mid} opacity=".44"/>
        <path d="M128 44v117M53 105h150" stroke="#ffffff" strokeWidth="7"/>
        <path d="M58 133 Q91 108 126 138T201 130v27H58Z" fill={dark} opacity=".17"/>
      </g>}
      {kind === "rain" && <g stroke={dark} opacity=".55" strokeWidth="2.5" strokeLinecap="round">
        {Array.from({length:13},(_,i)=><path key={i} d={`M${65+(i%5)*30} ${55+Math.floor(i/5)*37} l-5 13`}/>)}
      </g>}
      {(windows || kind === "outside") && <g>
        <path d="M322 194v-63" stroke="#746d5c" strokeWidth="6" strokeLinecap="round"/>
        <path d="M322 164c-40-9-48-38-28-48 14-7 36 5 28 48Z" fill="#669581"/>
        <path d="M322 148c7-40 45-54 56-29 8 18-12 34-56 29Z" fill="#487968"/>
        <path d="M302 187h43l-7 29h-29Z" fill="#c49f8b"/>
      </g>}
      {(kind === "home" || kind === "space" || kind === "pause" || kind === "tired") && <g>
        <rect x="206" y="164" width="156" height="33" rx="12" fill="#faf5ef"/>
        <rect x="215" y="186" width="9" height="25" rx="4" fill="#8a8a82"/>
        <rect x="337" y="186" width="9" height="25" rx="4" fill="#8a8a82"/>
        <rect x="222" y="151" width="57" height="28" rx="10" fill="#91b8bd"/>
      </g>}
      {kind === "outside" && <g>
        <path d="M150 180h160v12H150Z" fill={dark} opacity=".85"/>
        <path d="M164 157h131v11H164ZM170 193v22m117-22v22" stroke={dark} strokeWidth="8" strokeLinecap="round"/>
      </g>}
      {living && <g>
        <path d="M128 204v-42c0-28 17-46 42-46s41 18 41 46v42" fill={dark} opacity=".72"/>
        <path d="M145 130c-11-24 0-55 26-55 28 0 39 35 26 56" fill="#344754"/>
        <ellipse cx="170" cy="111" rx="25" ry="32" fill="#d5a88f"/>
        <path d="M147 100c2-25 38-39 52-10l-3 13c-14-13-30-3-49-3" fill="#344754"/>
        <path d="M160 119h2m17 0h2" stroke="#334b50" strokeWidth="3" strokeLinecap="round"/>
        <path d="M164 130q8 5 15 0" fill="none" stroke="#805f56" strokeWidth="2" strokeLinecap="round"/>
      </g>}
      {(kind === "social" || kind === "person") && <g>
        <path d="M250 204v-35c0-25 16-40 37-40s38 15 38 40v35" fill="#6b8482"/>
        <ellipse cx="288" cy="117" rx="25" ry="30" fill="#b87c68"/>
        <path d="M263 111c-6-21 8-42 29-41 20 2 30 23 24 42-12-10-37-14-53-1" fill="#3a3d49"/>
        <path d="M276 121h2m20 0h2" stroke="#334b50" strokeWidth="3" strokeLinecap="round"/>
        <path d="M281 137q8 4 14-1" stroke="#744a46" strokeWidth="2" fill="none"/>
        <path d="M220 47h117q12 0 12 12v31q0 12-12 12h-56l-15 17 2-17h-48q-10 0-10-12V59q0-12 10-12Z" fill="#ffffff" opacity=".8"/>
        <path d="M238 70h82M238 82h61" stroke={dark} strokeWidth="5" strokeLinecap="round" opacity=".33"/>
      </g>}
      {kind === "breath" && <g fill="none" stroke={dark} strokeLinecap="round" opacity=".55">
        <path d="M218 96Q270 66 308 98T388 100" strokeWidth="4"/>
        <path d="M224 121Q277 91 312 126T398 127" strokeWidth="3"/>
        <path d="M225 145Q265 120 311 153T397 150" strokeWidth="2"/>
      </g>}
      {isMusic && <g>
        <circle cx="198" cy="120" r="69" fill="#304b5a" opacity=".88"/>
        <circle cx="198" cy="120" r="43" stroke="#dae3e7" strokeWidth="2" fill="none" opacity=".5"/>
        <circle cx="198" cy="120" r="17" fill="#e4c2b2"/><circle cx="198" cy="120" r="4" fill="#304b5a"/>
        <path d="M285 80q35-35 75 0v64q-40 38-75 0" fill="none" stroke={dark} strokeWidth="15" strokeLinecap="round"/>
        <path d="M278 107h24v48h-24zM350 107h24v48h-24z" fill={dark} opacity=".8"/>
      </g>}
      {isObject && <g>
        <ellipse cx="237" cy="194" rx="149" ry="20" fill={dark} opacity=".13"/>
        <path d="M128 155h181v45H128Z" fill="#d2b29c"/><path d="M139 165h159v26H139Z" fill="#f7efe8"/>
        <rect x="166" y="88" width="78" height="71" rx="8" fill="#9caeaa"/><path d="M174 98h62v50h-62Z" fill="#edf1e8"/>
        <rect x="257" y="111" width="34" height="42" rx="12" fill="#c79f86"/>
        <path d="M267 95h14v18h-14Z" fill="#dbbba3"/>
      </g>}
      {isChange && <g>
        <rect x="111" y="42" width="222" height="155" rx="15" fill="#fffdf8"/>
        <path d="M111 77h222" stroke={mid} strokeWidth="14"/>
        <path d="M155 35v24m125-24v24" stroke={dark} strokeWidth="9" strokeLinecap="round"/>
        {[0,1,2].map(r=>[0,1,2,3].map(c=><rect key={`${r}-${c}`} x={138+c*46} y={93+r*29} width="31" height="18" rx="5" fill={c===offset ? mid : light}/>))}
      </g>}
      {isGame && <g>
        <rect x="110" y="146" width="220" height="17" rx="8" fill="#a28e71"/>
        <circle cx="171" cy="109" r="25" fill="#77a69a"/>
        <path d="M231 83l29 50h-58Z" fill="#e6bfa3"/>
        <rect x="273" y="94" width="43" height="43" rx="7" fill="#a7accb"/>
      </g>}
      {(kind === "sounds" || kind === "anger") && <g fill="none" stroke={dark} strokeLinecap="round" opacity=".43">
        <path d="M229 74q32-19 62 0m-69 19q40-25 79 0m-83 21q50-33 95 0" strokeWidth="5"/>
      </g>}
      {kind === "fear" && <g>
        <path d="M203 232q43-91 97-101 45-8 83-18v119Z" fill="#fffdf7" opacity=".52"/>
        <path d="M234 232q49-61 83-78" stroke={dark} strokeWidth="3" strokeDasharray="9 10" fill="none" opacity=".6"/>
      </g>}
      {kind === "pain" && <g>
        <rect x="229" y="160" width="171" height="36" rx="12" fill="#ffffff" opacity=".8"/>
        <path d="M255 172h74m-37-11v22" stroke={dark} opacity=".48" strokeWidth="5" strokeLinecap="round"/>
      </g>}
    </svg>
  );
}
