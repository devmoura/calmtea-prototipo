import { createContext, useContext, type ButtonHTMLAttributes, type ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "tertiary" | "danger";
type IconName =
  | "home"
  | "support"
  | "settings"
  | "back"
  | "close"
  | "heart"
  | "check"
  | "info"
  | "leaf"
  | "wind"
  | "music"
  | "sound"
  | "grid"
  | "bookmark";

export function Icon({ name, size = 24 }: { name: IconName; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  const paths = {
    home: <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10Z" />,
    support: (
      <>
        <path d="M12 21a9 9 0 1 0-9-9c0 2.1.72 4.04 1.92 5.58L4 21l3.5-.92A8.96 8.96 0 0 0 12 21Z" />
        <path d="M8.5 12h.01M12 12h.01M15.5 12h.01" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.55V21h-4v-.08A1.7 1.7 0 0 0 8.97 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15 1.7 1.7 0 0 0 3.08 14H3v-4h.08A1.7 1.7 0 0 0 4.6 8.97a1.7 1.7 0 0 0-.34-1.88L4.2 7.03 7.03 4.2l.06.06a1.7 1.7 0 0 0 1.88.34A1.7 1.7 0 0 0 10 3.08V3h4v.08A1.7 1.7 0 0 0 15.03 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06a1.7 1.7 0 0 0-.34 1.88A1.7 1.7 0 0 0 20.92 10H21v4h-.08A1.7 1.7 0 0 0 19.4 15Z" />
      </>
    ),
    back: <path d="m15 18-6-6 6-6" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    heart: (
      <path d="M20.8 4.9a5.45 5.45 0 0 0-7.7 0L12 6l-1.1-1.1a5.45 5.45 0 0 0-7.7 7.7L12 21l8.8-8.4a5.45 5.45 0 0 0 0-7.7Z" />
    ),
    check: <path d="m5 12 4.2 4.2L19 6.5" />,
    info: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5M12 8h.01" />
      </>
    ),
    leaf: (
      <path d="M20 4C10 4 4 8.5 4 16c0 1.4.6 2.8 1.6 4C13 20 19.5 13.5 20 4ZM4.6 19.4C7 15.9 10.5 13.1 15 11" />
    ),
    wind: (
      <>
        <path d="M4 8h10a2.5 2.5 0 1 0-2.5-2.5" />
        <path d="M3 12h15a2.5 2.5 0 1 1-2.5 2.5" />
        <path d="M6 16h7a2.5 2.5 0 1 1-2.5 2.5" />
      </>
    ),
    music: (
      <>
        <path d="M9 18V5l10-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="16" cy="16" r="3" />
      </>
    ),
    sound: (
      <>
        <path d="M5 10v4h3l4 4V6L8 10H5Z" />
        <path d="M16 9a4.5 4.5 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11" />
      </>
    ),
    grid: (
      <>
        <rect x="4" y="4" width="6" height="6" rx="1" />
        <rect x="14" y="4" width="6" height="6" rx="1" />
        <rect x="4" y="14" width="6" height="6" rx="1" />
        <rect x="14" y="14" width="6" height="6" rx="1" />
      </>
    ),
    bookmark: <path d="M6 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18l-6-4-6 4V4Z" />,
  };

  return <svg {...common}>{paths[name]}</svg>;
}

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  children: ReactNode;
}) {
  return (
    <button className={`C01-Button button button--${variant} ${className}`} {...props}>
      {children}
    </button>
  );
}

type StepNavigationAction = {
  label: string;
  onClick: () => void;
  variant?: ButtonVariant;
};

export function StepNavigation({
  leadingAction,
  trailingAction,
  auxiliaryAction,
}: {
  leadingAction?: StepNavigationAction;
  trailingAction?: StepNavigationAction;
  auxiliaryAction?: StepNavigationAction;
}) {
  return (
    <nav className="C14-StepNavigation step-navigation" aria-label="Ações da etapa de configuração">
      {(leadingAction || trailingAction) && (
        <div className="two-actions">
          {leadingAction ? (
            <Button variant={leadingAction.variant ?? "secondary"} onClick={leadingAction.onClick}>
              {leadingAction.label}
            </Button>
          ) : (
            <span />
          )}
          {trailingAction ? (
            <Button variant={trailingAction.variant} onClick={trailingAction.onClick}>
              {trailingAction.label}
            </Button>
          ) : (
            <span />
          )}
        </div>
      )}
      {auxiliaryAction && (
        <Button variant={auxiliaryAction.variant ?? "tertiary"} onClick={auxiliaryAction.onClick}>
          {auxiliaryAction.label}
        </Button>
      )}
    </nav>
  );
}

export function SectionTitle({
  title,
  helper,
  expanded = false,
}: {
  title: string;
  helper?: string;
  expanded?: boolean;
}) {
  return (
    <div className={`C28-SectionTitle section-title ${expanded ? "section-title--expanded" : ""}`}>
      <h2 className="subheading">{title}</h2>
      {helper && <p>{helper}</p>}
    </div>
  );
}

export function IconButton({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: IconName;
  onClick: () => void;
}) {
  return (
    <button className="C02-IconButton icon-button" onClick={onClick} aria-label={label}>
      <Icon name={icon} />
      <span>{label}</span>
    </button>
  );
}

export function DeviceStatus() {
  return (
    <div className="device-status" aria-hidden="true">
      <span>9:41</span>
      <span className="device-status__signals">
        <i />
        <i />
        <i />
      </span>
    </div>
  );
}

/** Destinos de Voltar e Fechar anunciados pelo cabeçalho; fornecidos pela navegação da participante. */
const HeaderLabelsContext = createContext<{ back?: string; close?: string }>({});
export const HeaderLabelsProvider = HeaderLabelsContext.Provider;

export function AppHeader({
  title,
  onBack,
  onClose,
  backLabel,
  closeLabel,
}: {
  title: string;
  onBack?: () => void;
  onClose?: () => void;
  backLabel?: string;
  closeLabel?: string;
}) {
  const labels = useContext(HeaderLabelsContext);
  const backName = backLabel ?? labels.back ?? "Voltar";
  const closeName = closeLabel ?? labels.close ?? "Fechar";
  return (
    <header className="C03-AppHeader app-header">
      <DeviceStatus />
      <div className="app-header__bar">
        {onBack ? (
          <button className="app-header__back" onClick={onBack} aria-label={backName}>
            <Icon name="back" size={20} />
            <span>Voltar</span>
          </button>
        ) : (
          <span className="header-spacer" />
        )}
        <p>{title}</p>
        {onClose ? (
          <button
            className="app-header__close"
            onClick={onClose}
            aria-label={closeName}
            title={closeName}
          >
            <Icon name="close" size={20} />
          </button>
        ) : (
          <span className="header-spacer" />
        )}
      </div>
    </header>
  );
}

export function StatusLabel({ mode }: { mode: "off" | "sim_on" | "unavailable" }) {
  const copy = {
    off: "Acompanhamento acústico: desativado",
    sim_on: "Acompanhamento acústico: simulação ativa",
    unavailable: "Acompanhamento acústico: indisponível",
  }[mode];
  return (
    <div className={`C09-StatusLabel status-label status-label--${mode}`}>
      <Icon name="info" size={18} />
      <span>{copy}</span>
    </div>
  );
}

export type AvatarVariant = "neutral1" | "neutral2" | "portrait01" | "portrait02" | "portrait03" | "portrait04" | "portrait05" | "portrait06" | "portrait07" | "portrait08" | "portrait09" | "portrait10" | "portrait11" | "portrait12";
export type AvatarPalette = "brisa" | "folha" | "lavanda";
export type AvatarAccessory = "none" | "faixa" | "ponto";
export type VirtualFriendStyle = "neutro" | "acolhimento" | "orientacao" | "portrait01" | "portrait02" | "portrait03" | "portrait04" | "portrait05" | "portrait06" | "portrait07" | "portrait08" | "portrait09" | "portrait10" | "portrait11" | "portrait12";
export type VirtualFriendState = "neutro" | "acolhimento" | "orientacao";
type AvatarSize = "option" | "preview" | "profile" | "home" | "guidance" | "story" | "state";

const avatarVariantLabels: Record<AvatarVariant, string> = {
  neutral1: "variação A",
  neutral2: "cabelo ondulado",
  portrait01: "tranças longas e pele escura",
  portrait02: "cabelo afro curto e pele escura",
  portrait03: "cachos longos e pele morena",
  portrait04: "cabelo ruivo curto e pele clara",
  portrait05: "cabelo preto longo e pele morena",
  portrait06: "cabelo preto curto e óculos",
  portrait07: "cabelo raspado e pele escura",
  portrait08: "cabelo loiro ondulado e pele clara",
  portrait09: "cachos escuros e pele morena",
  portrait10: "cabelo afro volumoso e pele escura",
  portrait11: "cabelo castanho comprido e pele clara",
  portrait12: "cabelo escuro curto e pele morena",
};

const paletteLabels: Record<AvatarPalette, string> = {
  brisa: "Brisa",
  folha: "Folha",
  lavanda: "Lavanda",
};

const accessoryLabels: Record<AvatarAccessory, string> = {
  none: "sem acessório",
  faixa: "faixa",
  ponto: "detalhe circular",
};

const friendStyleLabels: Record<VirtualFriendStyle, string> = {
  neutro:"padrão",acolhimento:"acolhedora",orientacao:"orientação",
  portrait01:"retrato 1",
  portrait02:"retrato 2",
  portrait03:"retrato 3",
  portrait04:"retrato 4",
  portrait05:"retrato 5",
  portrait06:"retrato 6",
  portrait07:"retrato 7",
  portrait08:"retrato 8",
  portrait09:"retrato 9",
  portrait10:"retrato 10",
  portrait11:"retrato 11",
  portrait12:"retrato 12",
};

const friendStateLabels: Record<VirtualFriendState, string> = {
  neutro: "neutro",
  acolhimento: "de acolhimento",
  orientacao: "de orientação",
};

type HumanAvatarProps = {
  name: string;
  variant: AvatarVariant;
  palette: AvatarPalette;
  accessory: AvatarAccessory;
  size: AvatarSize;
  subject: "person" | "friend";
  friendStyle?: VirtualFriendStyle;
  friendState?: VirtualFriendState;
  className?: string;
  label: string;
  decorative?: boolean;
};

const portraitImage: Record<AvatarVariant, string> = {
  neutral1: "/images/avatars/portrait-01.webp",
  neutral2: "/images/avatars/portrait-03.webp",
  ...Object.fromEntries(Array.from({length: 12},(_,i) => [
    `portrait${String(i+1).padStart(2,"0")}`,
    `/images/avatars/portrait-${String(i+1).padStart(2,"0")}.webp`,
  ])) as Record<Exclude<AvatarVariant, "neutral1" | "neutral2">, string>,
};

function HumanAvatar({name,variant,palette,size,subject,friendStyle,friendState,className="",label,decorative=false}:HumanAvatarProps) {
  const classes = ["human-avatar", "human-avatar--photo", `human-avatar--size-${size}`, `human-avatar--palette-${palette}`, `human-avatar--${subject}`,friendStyle && `human-avatar--friend-style-${friendStyle}`,friendState && `human-avatar--friend-state-${friendState}`, className].filter(Boolean).join(" ");
  return <span className={classes} data-avatar-name={name}>
    <img className="human-avatar__photo" src={portraitImage[variant]} alt={decorative ? "" : label} loading={size==="option" ? "lazy" : "eager"} />
  </span>;
}

export function PersonAvatar({
  avatar,
  name = "",
  palette = "brisa",
  accessory = "none",
  size = "preview",
  className = "",
  decorative = false,
}: {
  avatar: AvatarVariant | "none";
  name?: string;
  palette?: AvatarPalette;
  accessory?: AvatarAccessory;
  size?: AvatarSize;
  className?: string;
  decorative?: boolean;
}) {
  const displayName = name.trim() || "Avatar pessoal";
  const label =
    avatar === "none"
      ? `${displayName}: nenhum avatar pessoal selecionado`
      : `${displayName}, retrato ilustrativo com ${avatarVariantLabels[avatar]}`;
  const accessibility = decorative
    ? { "aria-hidden": true }
    : { role: "img" as const, "aria-label": label };

  if (avatar === "none") {
    return (
      <span
        className={`human-avatar human-avatar--size-${size} human-avatar--empty human-avatar--palette-${palette} ${className}`}
        {...accessibility}
      >
        <span className="human-avatar__empty-mark" />
      </span>
    );
  }

  return (
    <HumanAvatar
      name={displayName}
      variant={avatar}
      palette={palette}
      accessory={accessory}
      size={size}
      subject="person"
      className={className}
      label={label}
      decorative={decorative}
    />
  );
}

export function VirtualFriendAvatar({
  name = "Amigo",
  style = "neutro",
  palette = "brisa",
  accessory = "none",
  state = "neutro",
  size = "preview",
  className = "",
  decorative = false,
}: {
  name?: string;
  style?: VirtualFriendStyle;
  palette?: AvatarPalette;
  accessory?: AvatarAccessory;
  state?: VirtualFriendState;
  size?: AvatarSize;
  className?: string;
  decorative?: boolean;
}) {
  const displayName = name.trim() || "Amigo";
  const label = `${displayName}, amigo virtual em estado ${friendStateLabels[state]}, retrato ${friendStyleLabels[style]}`;

  return (
    <HumanAvatar
      name={displayName}
      variant={style.startsWith("portrait") ? style as AvatarVariant : style === "orientacao" ? "portrait06" : style === "acolhimento" ? "portrait10" : "portrait02"}
      palette={palette}
      accessory={accessory}
      size={size}
      subject="friend"
      friendStyle={style}
      friendState={state}
      className={className}
      label={label}
      decorative={decorative}
    />
  );
}

export function VirtualFriend({
  name = "Amigo",
  style = "neutro",
  palette = "brisa",
  accessory = "none",
}: {
  name?: string;
  style?: VirtualFriendStyle;
  palette?: AvatarPalette;
  accessory?: AvatarAccessory;
}) {
  return (
    <div className="virtual-friend" aria-label={`${name}, amigo virtual em estado neutro`}>
      <VirtualFriendAvatar
        name={name}
        style={style}
        palette={palette}
        accessory={accessory}
        size="option"
        decorative
      />
      <span>{name}</span>
    </div>
  );
}

export function Toggle({
  label,
  description,
  checked,
  onChange,
  icon,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
  icon?: IconName;
}) {
  return (
    <div className="C10-SettingSwitch setting-switch">
      {icon && (
        <span className="setting-switch__icon">
          <Icon name={icon} size={21} />
        </span>
      )}
      <div>
        <p>{label}</p>
        <span>{description}</span>
      </div>
      <button
        type="button"
        className={`switch ${checked ? "switch--on" : ""}`}
        onClick={onChange}
        role="switch"
        aria-checked={checked}
        aria-label={`${label}: ${checked ? "ativado" : "desativado"}`}
      >
        <span />
        <b>{checked ? "Ativado" : "Desativado"}</b>
      </button>
    </div>
  );
}
