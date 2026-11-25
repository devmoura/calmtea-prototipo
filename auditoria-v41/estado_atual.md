# Linha de Base e Estado Atual do Projeto — Auditoria P00 (V41)

> **Escopo desta auditoria (P00):** levantamento estático integral do código-fonte, checagem de compilação/tipos e inspeção somente-leitura da aba ativa do Preview, **sem modificar nenhum arquivo de código de produção** (`src/*`, `index.html`, `package.json`, `vite.config.ts`, `tsconfig.json`).

---

## 1. Taxonomia de Evidências Utilizada

Todas as ocorrências desta auditoria são classificadas estritamente em uma ou mais das quatro categorias exigidas:

- **`EXISTE NO CÓDIGO`**: estrutura, rota, componente, estado, regra, handler ou defeito verificado diretamente por inspeção estática nos arquivos do repositório (`/workspaces/default/code`) e/ou por ferramentas estáticas somente-leitura (`vite build`, `tsc --noEmit`).
- **`OBSERVADO NO PREVIEW`**: comportamento verificado diretamente na aba ativa do Preview do Figma Make em modo somente-leitura, sem cliques mutantes para preservar a linha de base (especificamente: carregamento inicial de `/` renderizando `T24` com `<h1>Bem-vindo(a)!</h1>`, botões `"Usar agora"` e `"Configurar"`, e console Vite conectado sem erros de runtime).
- **`RELATADO PELO AUTOR`**: especificação normativa constante do `Prompt_Mestre_Prototipo_Figma_ProtoPie_V41` (`e572dd7b_PROMPT_MESTRE_FIGMA_MAKE_V41_COMPLETO.md`), `03_DESIGN_TOKENS_V41.json`, pranchas visuais de referência ou resumo histórico de turnos anteriores.
- **`NÃO TESTADO`**: fluxos interativos, cliques, arrastes em canvas, transições multi-etapas, sincronização com `/operador` e os 35 cenários `Q01`–`Q35` que **não foram exercitados interativamente no Preview** (registrados também em `src/screenRegistry.ts` como `PENDENTE DE EXECUÇÃO NO PREVIEW`).

---

## 2. Controle de Versão, Histórico e Como Criar Cópia de Segurança / Checkpoint Antes do P01

### 2.1 Situação verificada do controle de versão

| Item                                                                             | Situação                                                                                                                            | Classificação         |
| -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| Repositório Git local (`.git` na raiz)                                           | Ativo na branch `main`                                                                                                              | `EXISTE NO CÓDIGO`    |
| Commit de partida do workspace antes do P00                                      | `8ec0592f4c0ab43cabc6cb716ab1abe5c86d43c2` (`prompt: 110`) contendo os 30 arquivos materializados no container atual                | `EXISTE NO CÓDIGO`    |
| Remoto Git gerenciado pelo Figma Make                                            | `origin` apontando para o repositório Make do arquivo (`https://api.figma.com/git/make/file/...`)                                   | `EXISTE NO CÓDIGO`    |
| Integração de versões do Figma Make                                              | CLI `figma make versions create --commit` cria simultaneamente um commit Git local e uma versão numerada no histórico do Figma Make | `EXISTE NO CÓDIGO`    |
| Histórico evolutivo anterior (10 versões anteriores até unificação dos avatares) | Relatado no histórico do projeto e consolidado no estado atual de `src/` no commit `8ec0592`                                        | `RELATADO PELO AUTOR` |

### 2.2 Como duplicar o projeto ou criar checkpoint seguro antes de aplicar o P01

1. **Duplicar o projeto inteiro no Figma Make (recomendado para isolamento total):**
   - No cabeçalho do arquivo no Figma Make, abra o menu do projeto (ao lado do título do arquivo) e selecione **Duplicate** (_Duplicar_).
   - Renomeie a cópia para `V41 — Linha de Base P00 (Congelada)` e aplique o `P01` apenas no arquivo de trabalho principal. Assim, a linha de base permanece intacta e navegável em paralelo.
2. **Usar o Histórico de Versões nativo do Figma Make (checkpoint imediato):**
   - Ao final desta execução P00 é gerado um checkpoint Make específico contendo apenas os 5 arquivos em `auditoria-v41/` e **zero alterações** em `src/`.
   - No painel do Figma Make, é possível abrir **Version history** (_Histórico de versões_) a qualquer momento para inspecionar ou restaurar esta versão exata anterior ao `P01`.
3. **Checkpoint adicional via Git no terminal do workspace (se desejar referência nominal fixa):**
   - Criar tag ou branch imutável antes de editar código em `P01`:
     ```sh
     git branch backup/v41-linha-de-base-p00
     ```
   - Para verificar antes/depois de qualquer lote se algum arquivo de produção foi tocado:
     ```sh
     git diff --stat backup/v41-linha-de-base-p00 -- src/ index.html package.json vite.config.ts tsconfig.json
     ```
   - Para restaurar imediatamente todo o código de produção à linha de base caso ocorra regressão em etapas futuras:
     ```sh
     git checkout backup/v41-linha-de-base-p00 -- src/
     ```

---

## 3. Arquitetura de Entradas, Rotas, 37 Identificadores (`T01`–`T37`), Overlays (`T19`/`T21`) e `OP01`

### 3.1 Entradas HTTP e pontos de montagem (`EXISTE NO CÓDIGO`)

- `index.html` → carrega `/src/main.tsx`.
- `src/main.tsx:6-10` → monta `<App />` em `#root` sob `<React.StrictMode>` e importa `src/index.css`.
- `src/App.tsx:4639-4641` → único seletor de rota HTTP do projeto:
  - `window.location.pathname === "/operador"` → renderiza `<OperatorApp />` (**`OP01`**, fora da moldura móvel de 390 px e fora da `BottomNav`).
  - Qualquer outro caminho (incluindo `"/"`, **`OBSERVADO NO PREVIEW`**) → renderiza `<ParticipantApp />`.

### 3.2 Contabilidade exata dos 37 identificadores V41 (`EXISTE NO CÓDIGO`)

| Grupo arquitetural                                                      |                 Quantidade | Identificadores                                                                  | Como são ativados                                                                                                                                       |
| ----------------------------------------------------------------------- | -------------------------: | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Telas de estado interno (`type Screen` em `src/App.tsx:22-57`)          |                     **35** | `T01`–`T18`, `T20`, `T22`–`T37`                                                  | Renderização condicional `state.currentScreen === "Txx"` dentro de `ParticipantApp` (`src/App.tsx:728-1196`)                                            |
| Overlays modais sobre a tela corrente (**não são rotas independentes**) |                      **2** | `T19` (`SupportInvite`), `T21` (`PermissionSimulation`)                          | Flags booleanas independentes de `currentScreen`: `state.inviteVisible` (`src/App.tsx:1207-1217`) e `state.permissionVisible` (`src/App.tsx:1218-1247`) |
| **Total de identificadores V41 da participante**                        |                     **37** | **`T01`–`T37` completos**                                                        | Todos registrados em `screenRegistry` (`src/screenRegistry.ts:3-226`)                                                                                   |
| Tela `T38`                                                              |                      **0** | Inexistente                                                                      | Confirmada a não criação de `T38`; subnavegação de Ajustes parte de `T17`                                                                               |
| Painel técnico Mágico de Oz separado                                    | **1 (extra-participante)** | `OP01`                                                                           | Rota HTTP `/operador` (`OperatorApp`, `src/App.tsx:4491-4637`)                                                                                          |
| Diálogo auxiliar interno de confirmação                                 |     **1 (componente C19)** | `ConfirmationDialog`                                                             | Estado local `removeId` em `T04` e `confirmClear` em `T10` (`src/App.tsx:1884, 2283, 2453`)                                                             |
| Componentes residuais não referenciados                                 |     **2 (código inativo)** | `PendingScreen` (`src/App.tsx:4367`), `VirtualFriend` (`src/components.tsx:442`) | Declarados no código, sem chamadas na árvore ativa                                                                                                      |

---

## 4. Levantamento dos Subsistemas Solicitados

### 4.1 Os Três Jogos (`J01`/`T10`, `J02`/`T22`, `J03`/`T23`)

| Jogo                        | Tela / Função                                          | Estados utilizados                                                                                                 | Handlers e mecânica no código                                                                                                                                                                                                                                                                             | Status                             |
| --------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| **J01 — Monte seu espaço**  | `T10` / `SpaceGameScreen` (`src/App.tsx:2169-2297`)    | `state.sceneItems`, `state.selectedSceneId`, `state.sceneUndoStack`, `confirmClear` (local), `canvasRef`/`dragRef` | Paleta de 4 elementos (`planta`, `mesa`, `luz`, `almofada`); `addSceneItem`, seleção por toque, arraste por `PointerEvent` (`setPointerCapture`, limites do canvas), `removeSelectedSceneItem`, `undoScene`, `clearScene` mediante `ConfirmationDialog` (`C19`) e `goBack`. Sem tempo, pontos ou vitória. | `EXISTE NO CÓDIGO` / `NÃO TESTADO` |
| **J02 — Combine os pares**  | `T22` / `MatchingGameScreen` (`src/App.tsx:2299-2369`) | `state.matchSelected`, `state.matchedPairs`, `state.matchFeedback`                                                 | Grade de 8 cartões (`matchingCards`) com 4 formas (`circle`, `diamond`, `triangle`, `square`) e rótulos textuais (`Círculo`, `Losango`, `Triângulo`, `Quadrado`); `selectMatchCard` exibe `"Par encontrado..."` ou `"Tente outra combinação..."` sem perda de vidas; `resetMatches` e `goBack`.           | `EXISTE NO CÓDIGO` / `NÃO TESTADO` |
| **J03 — Desenhe o caminho** | `T23` / `PathGameScreen` (`src/App.tsx:2371-2429`)     | `state.pathStep` (`0..3`)                                                                                          | Ponto inicial + 3 pontos conectáveis sequencialmente via `advancePath(point)`; fora de ordem exibe mensagem informativa neutra; botões `Desfazer` (`Math.max(0, pathStep - 1)`), `Reiniciar` (`pathStep: 0`) e `Sair do jogo` (`goBack`).                                                                 | `EXISTE NO CÓDIGO` / `NÃO TESTADO` |

### 4.2 Orientações (`T11`) e Histórias (`T14`, `T15`, `T35`)

- **Orientações breves (`T11` / `GuidanceScreen`, `src/App.tsx:2487-2503, 2661-2725`):**
  - 3 etapas em `guidanceSteps` controladas por `state.guideStep` (`0..2`), com barra de progresso, contador `"Etapa X de 3"`, `VirtualFriendAvatar` personalizado em `state="orientacao"`, botões `Anterior`, `Próximo`/`Concluir` e `Sair da orientação`. (`EXISTE NO CÓDIGO` / `NÃO TESTADO`)
- **Lista e Leitura de Histórias (`T14` / `StoryListScreen` e `T15`+`T35` / `StoryReaderScreen`, `src/App.tsx:2505-2659, 2727-2862`):**
  - `storyData` implementa os **8 temas normativos da V41**, cada um com 3 cenas curtas e controle explícito de `hasFriend`:
    - **Com amigo virtual (`hasFriend: true`)**: `mudanca` (_Quando o plano muda_), `social` (_Uma conversa confusa_), `raiva` (_Quando estou irritado_). Renderizam `VirtualFriendAvatar` com nome, estilo, paleta e acessório configurados na sessão.
    - **Sem personagem (`hasFriend: false`)**: `sons` (_Muitos sons ao redor_), `frustracao` (_Quando algo não dá certo_), `medo` (_Quando sinto insegurança_), `cansaco` (_Preciso de um intervalo_), `dor` (_Quando sinto desconforto_ — explicita _"Não há diagnóstico aqui"_). Renderizam ícone neutro `leaf`.
  - Regra de roteamento `T14` → `T15` vs `T35` (`src/App.tsx:931`): se `state.context` está preenchido e é diferente de `"Não quero responder"`, abre `T35` (_História contextual_); caso contrário, abre `T15` (_Leitura de história_). Nenhuma história abre automaticamente. (`EXISTE NO CÓDIGO` / `NÃO TESTADO`)

### 4.3 Ajustes, Aparência, Perfil e Configuração Inicial (`T17`, `T18`, `T20`, `T24`–`T31`, `T34`, `T36`, `T37`)

- **Ajustes de conforto e leitura (`T17` / `SettingsScreen`):** controla `reduceMotion` (classe `.reduce-motion`), `soundEnabled`, `textScale` (`0 | 1 | 2` → `--font-scale: 1 | 1.125 | 1.25`), `contrastMode` (classe `.contrast-mode`), `Restaurar padrões` e cartões para `T18`, `T36`, `T20` e `T34`. (`EXISTE NO CÓDIGO` / `NÃO TESTADO`)
- **Acompanhamento e convites (`T18` / `TrackingScreen`) + Overlay `T21` (`PermissionSimulation`):** alterna simulação acústica (`off` / `sim_on` / `unavailable`) e `invitesEnabled`, abrindo `T21` sem pedir permissão real ao navegador/SO, mantendo botão `"Usar apoio manual"`. (`EXISTE NO CÓDIGO` / `NÃO TESTADO`)
- **Acesso pelo nome (`T36` / `VoiceAccessScreen`):** demonstração Mágico de Oz de `voiceCallDemo` (`off` / `sim_on`), bloqueando ativação enquanto `friendConfigured === false` (nome do amigo não definido) e mantendo `"Abrir apoio manual"`. (`EXISTE NO CÓDIGO` / `NÃO TESTADO`)
- **Aparência (`T20` / `AppearanceScreen`):** alterna tema Neutro / Alto contraste e `selectedAvatar` (`none`, `neutral1`, `neutral2`), exibindo prévia `PersonAvatar` vinculada a `avatarName`, `avatarPalette` e `avatarAccessory` salvos, sem ocultar o amigo virtual. (`EXISTE NO CÓDIGO` / `NÃO TESTADO`)
- **Configuração em 7 etapas (`T25`–`T31`) + Perfil (`T34`) + Detalhes do Amigo (`T37`):**
  - Opera sobre `state.setupDraft`, preservando `setupOrigin` (`T24` | `T34`), `setupEntryScreen` (`T25`..`T31`), `setupReturnScreen` (ex.: `T24`, `T34` ou `T37`) e `setupPreviousState`.
  - Cancelar na etapa de entrada descarta `setupDraft` e restaura a tela de origem; confirmar em `T31` (`finishSetup`) grava os valores na sessão.
  - Avatares humanizados compartilhados (`PersonAvatar` e `VirtualFriendAvatar` em `src/components.tsx:351-440` + CSS `.human-avatar` em `src/index.css:4241-4627`) propagam forma/estilo, paleta (`brisa`, `folha`, `lavanda`) e acessório (`none`, `faixa`, `ponto`) para `T01`, `T11`, `T15`, `T20`, `T29`, `T30`, `T34`, `T35` e `T37`. (`EXISTE NO CÓDIGO` / `NÃO TESTADO`)

### 4.4 Painel Técnico `OP01` (`/operador` — `OperatorApp`, `src/App.tsx:4491-4637`)

- Isolado em `window.location.pathname === "/operador"`.
- Oferece os **3 modos de sessão demonstrativa** da Seção M da V41 (`createDemoSessionState`, `src/App.tsx:275-325`):
  1. `SEM_PERFIL`: estado limpo, `currentScreen: "T01"`, amigo padrão.
  2. `SILENCIO`: `soundEnabled: false`, `prefSilence: true`, `sensoryResources.fones: "tenho"`, interesse `"Ficar em silêncio"`, `setupState: "done"`.
  3. `MUSICA`: `prefGenres: ["Instrumental"]`, `prefTracks: ["Som de chuva suave"]`, interesse `"Ouvir música"`, `setupState: "done"`.
- Botões de simulação Mágico de Oz:
  - `Habilitar simulação acústica` (`acousticMode: "sim_on"`, `acousticConsentDemo: true`)
  - `Suspender convites` / `Retomar convites` (`invitesEnabled`)
  - `Enviar SIM_EVENTO_ACUSTICO` (`eventAcoustic`: exige `acousticMode === "sim_on" && acousticConsentDemo && invitesEnabled`; grava `inviteVisible: true, currentScreen: "T01"`)
  - `Enviar SIM_EVENTO_NOMINAL` (`eventNominal`: exige `voiceCallDemo === "sim_on" && friendConfigured && acousticConsentDemo`; grava `currentScreen: "T12", returnScreen: "T01", inviteVisible: false`)
  - `Enviar SIM_INDISPONIVEL` (`acousticMode: "unavailable", inviteVisible: false`)
  - `Enviar SIM_RESET` (restaura `createDemoSessionState("SEM_PERFIL")`)
- Exibe log técnico mínimo (últimas 5 entradas, sem dados pessoais) e guia colapsado `<details>` listando `Q01`–`Q35` honestamente como `PENDENTE DE EXECUÇÃO NO PREVIEW`. (`EXISTE NO CÓDIGO` / `NÃO TESTADO`)

### 4.5 Estado Central (`AppState`) e Estados Locais (`EXISTE NO CÓDIGO`)

- **Persistência de sessão:** `sessionStorage` sob a chave `"v41-participant-state"` (`loadState()` na montagem + `useEffect` a cada mudança de `state`). Nenhum backend, banco de dados, cookie externo ou chamada de rede para dados da participante.
- **Campos de `AppState` (`src/App.tsx:137-194`):**
  - Navegação: `currentScreen`, `returnScreen`
  - Acústico/convites/permissão/voz simulados: `acousticMode`, `acousticConsentDemo`, `invitesEnabled`, `inviteVisible` (`T19`), `permissionVisible` (`T21`), `permissionDemoState`, `voiceCallDemo`
  - Conforto e aparência: `soundEnabled`, `reduceMotion`, `contrastMode`, `textScale`, `selectedAvatar`, `avatarName`, `avatarPalette`, `avatarAccessory`
  - Amigo virtual: `friendName`, `friendConfigured`, `friendStyle`, `friendPalette`, `friendAccessory`
  - Autorrelato e contexto: `checkinChoice`, `checkinOther`, `selfReport`, `context`, `contextOther`
  - Recursos e estratégias: `favorites`, `personalStrategies`, `breathState`, `audioState`, `audioVolume`, `mediaAvailable`, `guideStep`, `storyId`, `storyScene`
  - Jogos: `sceneItems`, `sceneUndoStack`, `selectedSceneId` (`J01`), `matchSelected`, `matchedPairs`, `matchFeedback` (`J02`), `pathStep` (`J03`)
  - Perfil e rascunho de configuração: `profileInterests`, `sensoryResources`, `prefSilence`, `prefGenres`, `prefTracks`, `favGames`, `demoSession`, `setupState`, `setupOrigin`, `setupEntryScreen`, `setupReturnScreen`, `setupPreviousState`, `setupDraft`
- **Estados locais fora de `sessionStorage`:**
  - `ParticipantApp`: `feedback` (toast temporário de 4.200 ms), `supportFlow` (`"support" | "record"`), `catalogFilter` (`"Todas"` por padrão)
  - `PersonalStrategiesScreen` (`T04`): `draft`, `error`, `removeId`
  - `SpaceGameScreen` (`T10`): `confirmClear`, `canvasRef`, `dragRef`
  - `SetupMusicScreen` (`T27`): `trackName`
  - `OperatorApp` (`OP01`): `log`

---

## 5. Caso de Código de Fluxo Duplicado na V41 (`F16-P`) e Preservação da Numeração Original

Conforme o item 5 do Prompt P00 e a Seção F do Prompt Mestre V41 (`linha 716`), o documento normativo original V41 possui **um código de fluxo duplicado (`F16-P`)** e **não possui o código `F18`** (a numeração salta de `F17` para `F19`).

Nesta auditoria e nos artefatos gerados, **as duas definições são mantidas integralmente sem renumerar nenhum fluxo da série original (`F01`–`F17`, `F19`–`F26`) e sem criar `F18`**:

| Código no documento V41 original | Desambiguação indicada na nota da Seção F do V41                | Título e percurso normativo                                                                 | Critério de aceite V41                                                        | Cobertura no código atual                                                                                | Status no Preview |
| -------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ----------------- |
| **`F16-P` (1ª definição)**       | `F16-C` _(apenas referência de leitura, sem renumerar a lista)_ | **Organizar cenário:** `T02 → T10 → escolha de elementos → desfazer/limpar → sair`          | Nunca impor acerto, tempo ou resultado; desfazer reversível.                  | `CatalogScreen` (`T02`) → `SpaceGameScreen` (`T10`, `src/App.tsx:2169-2297`) — **`EXISTE NO CÓDIGO`**    | **`NÃO TESTADO`** |
| **`F16-P` (2ª definição)**       | `F16-P` _(pares)_                                               | **Associar pares sem punição:** `T02 → T22 → tocar 2 cartões → combinar ou desfazer → sair` | Nenhuma escolha diferente limita tentativas; saída independente do progresso. | `CatalogScreen` (`T02`) → `MatchingGameScreen` (`T22`, `src/App.tsx:2299-2369`) — **`EXISTE NO CÓDIGO`** | **`NÃO TESTADO`** |

**Resumo completo dos 26 fluxos normativos da V41 (sem renumeração):**

- `F01` a `F15`: 15 fluxos (`EXISTE NO CÓDIGO` / `NÃO TESTADO`, com ressalvas de navegação detalhadas na Seção 7).
- `F16-P` (1ª definição — cenário / `F16-C`) e `F16-P` (2ª definição — pares): 2 fluxos (`EXISTE NO CÓDIGO` / `NÃO TESTADO`).
- `F17`: 1 fluxo — Traçar caminho reversível em `T23` (`EXISTE NO CÓDIGO` / `NÃO TESTADO`).
- `F18`: **inexistente no documento original V41** (preservada a ausência).
- `F19` a `F26`: 8 fluxos (`EXISTE NO CÓDIGO`; apenas a renderização inicial de `T24` no início de `F19`/`F20` foi `OBSERVADO NO PREVIEW`; transições `NÃO TESTADO`).

---

## 6. Cobertura de Componentes (`C01`–`C44`), Requisitos (`RF01`–`RF34`, `RNF01`–`RNF10`), `HU01`–`HU32` e `Q01`–`Q35`

- **Biblioteca `C01`–`C44`:**
  - Todos os 44 componentes estão inventariados em `componentRegistry` (`src/screenRegistry.ts:230-546`) — `EXISTE NO CÓDIGO`.
  - **Exportados em `src/components.tsx` (reutilizáveis entre arquivos):** `Icon`, `Button` (`C01`), `StepNavigation` (`C14`), `SectionTitle` (`C28`), `IconButton` (`C02`), `DeviceStatus`, `AppHeader` (`C03`), `StatusLabel` (`C09`), `PersonAvatar` (`C25`/`C38`), `VirtualFriendAvatar` (`C39`/`C42`), `VirtualFriend` (residual não referenciado), `Toggle` (`C10`).
  - **Funções internas compartilhadas em `src/App.tsx`:** `BottomNav` (`C04`), `SupportInvite` (`C08`/`T19`), `ConfirmationDialog` (`C19`), `PermissionSimulation` (`C24`/`T21`), `SetupMeta` (`C33`), `BreathingVisual` (`C15`).
  - **Demais `Cxx` (`C05`–`C07`, `C11`–`C13`, `C16`–`C18`, `C20`–`C23`, `C26`–`C27`, `C29`–`C32`, `C34`–`C37`, `C40`–`C41`, `C43`–`C44`):** implementados como estruturas JSX/CSS locais nas respectivas telas em `src/App.tsx` (`IMPLEMENTADO EM TELA` segundo `componentRegistry`).
- **Requisitos `RF01`–`RF34`, `RNF01`–`RNF10` e Histórias `HU01`–`HU32`:** possuem representação funcional no código (`EXISTE NO CÓDIGO` / `RELATADO PELO AUTOR`), sujeitos às observações técnicas `B01`–`B07` abaixo e ainda `NÃO TESTADO` de ponta a ponta no Preview.
- **Cenários `Q01`–`Q35`:** todos os 35 constam em `qaRegistry` (`src/screenRegistry.ts:550-838`) com status explícito `"PENDENTE DE EXECUÇÃO NO PREVIEW"` (`EXISTE NO CÓDIGO` / `NÃO TESTADO`).

---

## 7. Achados Técnicos e Divergências da Linha de Base (Sem Alterar Código em P00)

A verificação estática (`pnpm exec tsc --noEmit` e leitura linha a linha) revelou 7 pontos concretos na linha de base atual que devem ser conhecidos antes do `P01`:

1. **`B01` [ALTO — Erro de compilação TS + `ReferenceError` latente em `T01`]:**
   - Em `src/App.tsx:1322`, `HomeScreen` (declarada fora de `ParticipantApp`) renderiza `<AppHeader title="Início" onBack={() => go("T24", "T01")} />`.
   - Como `go` é uma constante interna de `ParticipantApp` (`src/App.tsx:513`) e não foi passada por prop para `HomeScreen`, `pnpm exec tsc --noEmit` falha com `error TS2304: Cannot find name 'go'`. O `vite build` transpila sem checar tipos, mas clicar em `"Voltar"` ou `"Fechar"` no cabeçalho de `T01` disparará `ReferenceError: go is not defined` em runtime. (`EXISTE NO CÓDIGO`)
2. **`B02` [MÉDIO — Erro de tipo TypeScript em `message`]:**
   - Em `src/App.tsx:509`, `tone: Feedback["tone"] = "info"` falha no `tsc --noEmit` com `error TS2339: Property 'tone' does not exist on type 'Feedback'`, pois `Feedback` é `{ tone: "info" | "success"; text: string } | null`. Não afeta o bundle JS gerado pelo Vite, mas impede `tsc --noEmit` de retornar código 0. (`EXISTE NO CÓDIGO`)
3. **`B03` [BAIXO/MÉDIO — Elementos informativos com pista visual de link (`›`) sem ação]:**
   - Em `T36` (`src/App.tsx:3062-3071`), o cartão `"Como o teste funciona?"` usa `<div className="navigation-card">` com seta `<span>›</span>`, parecendo clicável sem possuir `onClick`.
   - Em `T16` (`src/App.tsx:2894-2903`), as três linhas `.outside-row` exibem `<span>›</span>` decorativo embora sejam cartões informativos estáticos. (`EXISTE NO CÓDIGO`)
4. **`B04` [BAIXO — Faixa exibida em `T09` é estática]:**
   - Em `T08` (`src/App.tsx:2049-2068`), tocar em `"Som de chuva suave"` ou em `"Ambiente tranquilo"` chama `onOpenPlayer(true)` sem salvar qual faixa foi escolhida; `T09` (`src/App.tsx:2125-2126`) exibe sempre `"Som de chuva suave"` (`3 min 20 s`). (`EXISTE NO CÓDIGO`)
5. **`B05` [MÉDIO — `returnScreen` escalar de 1 nível pode criar ciclo de retorno em subtelas]:**
   - `state.returnScreen` armazena apenas uma tela anterior, e as saídas de `T07` (`go("T06", "T07")`), `T09` (`go("T08", "T09")`), `T15` (`go("T14", "T15")`), `T35` (`go("T14", "T35")`) e `T11` (`go("T02", "T11")`) chamam `go(...)` gravando a subtela recém-fechada como novo `returnScreen`. Assim, após ir `T02 → T08 → T09 → Voltar a T08`, clicar em `"Voltar ao catálogo"` em `T08` (`goBack()`) retorna para `T09` em vez de `T02` (o mesmo ocorre em `T06 ↔ T07` e `T14 ↔ T15/T35`, embora a `BottomNav` continue funcional). (`EXISTE NO CÓDIGO`)
6. **`B06` [MÉDIO — Isolamento de `sessionStorage` entre abas para `OP01`]:**
   - `ParticipantApp` (`/`) e `OperatorApp` (`/operador`) persistem estado em `sessionStorage` (`"v41-participant-state"`), sem `BroadcastChannel` nem `localStorage`. No navegador, `sessionStorage` é isolado por aba: os comandos do `OP01` refletem na interface da participante quando o operador navega para `/` **na mesma aba** (usando o link `"Abrir interface da participante"` em `src/App.tsx:4631`), mas não sincronizam em tempo real entre duas abas abertas lado a lado. (`EXISTE NO CÓDIGO`)
7. **`B07` [BAIXO — Artefatos residuais e idioma do shell HTML]:**
   - `PendingScreen` (`src/App.tsx:4367-4383`) e `VirtualFriend` (`src/components.tsx:442-466`) estão sem uso; há regras CSS legadas acima da linha 4241 de `src/index.css`; `.tmp/avatar-search.txt` veio comitado em `8ec0592`; e `.figma/make/site.json` não declara `"language": "pt-BR"`, fazendo `vite.config.ts:94` injetar `lang="en"` no `<html>` apesar de toda a UI estar em `pt-BR`. (`EXISTE NO CÓDIGO`)
