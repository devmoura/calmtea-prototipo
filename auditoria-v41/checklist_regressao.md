# Checklist de Regressão da Linha de Base — V41 (P00 → P01+)

> Documento de referência para validar qualquer alteração subsequente (`P01` em diante) contra a linha de base congelada em `P00`. Não confundir presença no código (`EXISTE NO CÓDIGO`) com teste interativo executado (`OBSERVADO NO PREVIEW` vs `NÃO TESTADO`).

---

## 1. Verificações Técnicas e Estruturais Obrigatórias

| ID      | Verificação                                 | Comando / Método                                                               | Resultado na Linha de Base P00                                                                                               | Critério para P01+                                                      |
| ------- | ------------------------------------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `VR-01` | Código de produção intacto em P00           | `git status --short src/ index.html package.json vite.config.ts tsconfig.json` | **PASSOU** (nenhum arquivo de produção modificado)                                                                           | Em P01+, alterar apenas arquivos estritamente no escopo autorizado      |
| `VR-02` | Build de produção Vite                      | `pnpm build`                                                                   | **PASSOU** (`exit 0`, bundle gerado em `dist/`, aviso não bloqueante >500 kB)                                                | Deve permanecer `exit 0`                                                |
| `VR-03` | Checagem estática TypeScript                | `pnpm exec tsc --noEmit`                                                       | **FALHOU NA LINHA DE BASE (`exit 2`)**: `TS2339` em `src/App.tsx:509` (`B02`) e `TS2304` em `src/App.tsx:1322` (`B01`)       | Corrigir quando autorizado e manter `exit 0` sem introduzir novos erros |
| `VR-04` | Carregamento inicial do Preview (`/`)       | Leitura de URL, árvore DOM/a11y e console                                      | **PASSOU (`OBSERVADO NO PREVIEW`)**: `T24` renderizada (`Bem-vindo(a)!`, `Usar agora`, `Configurar`) e zero erros no console | Zero erro uncaught no console ao carregar `/` e `/operador`             |
| `VR-05` | Inventário `T01`–`T37` completo e sem `T38` | Conferir `type Screen`, overlays `T19`/`T21` e busca por `T38`                 | **PASSOU (`EXISTE NO CÓDIGO`)**: 35 telas em `Screen` + 2 overlays (`T19`, `T21`) = 37 IDs; `T38` ausente                    | Nunca criar `T38`; nunca converter `T19`/`T21` em rotas independentes   |
| `VR-06` | Separação de `OP01`                         | Conferir `window.location.pathname === "/operador"` e `BottomNav`              | **PASSOU (`EXISTE NO CÓDIGO`)**: `OP01` isolado em `/operador`, ausente na `BottomNav`                                       | Manter `OP01` fora da navegação da participante                         |

---

## 2. Invariantes Éticas, Sensoriais e Normativas (Invioláveis em Todas as Etapas)

- [ ] **Sem captação real:** nenhuma chamada a `navigator.mediaDevices.getUserMedia`, `SpeechRecognition`, `WebRTC` ou APIs de geolocalização (`RF07`, `RF08`, `RF34`, `RNF04`).
- [ ] **Sem inferência emocional ou clínica:** nenhum texto afirma emoção detectada, desregulação, crise, diagnóstico ou eficácia terapêutica (`RNF03`, `RNF07`).
- [ ] **Sem comunicação externa automática:** nenhuma ligação, SMS, WhatsApp, e-mail ou alerta a familiares/profissionais (`RF18`, `RNF05`, `RNF09`).
- [ ] **Zero autoplay sensorial:** nenhum áudio ou animação inicia automaticamente ao abrir telas; `.reduce-motion` remove transições opcionais (`RNF01`).
- [ ] **Sem pressão ou gamificação punitiva:** zero cronômetro regressivo, pontuação, vidas, ranking, derrota ou ritmo respiratório imposto em `T05`, `T06`, `T07`, `T10`, `T22` e `T23` (`RF05`, `RF19`, `RF23`–`RF25`).
- [ ] **Autonomia e reversibilidade:** toda entrada em apoio, autorrelato, história, música, jogo e configuração é voluntária, com saída/cancelamento visível; cancelar autorrelato (`T12`) ou rascunho (`setupDraft` / `T04`) não grava alterações (`RF02`, `RF10`, `RF13`, `RF26`).
- [ ] **Regras de avatar e amigo virtual:** avatar pessoal (`PersonAvatar`) permanece opcional com opção `"Nenhum"` funcional; amigo virtual (`VirtualFriendAvatar`) permanece no apoio principal sem chave de ocultação global e só aparece nas histórias cujo roteiro declara `hasFriend: true` (`RF16`, `RF17`, `RF30`, `RF31`, `RNF08`).
- [ ] **Acessibilidade textual e visual:** moldura base 390 px (responsiva 360–430 px), margens de 20 px, alvos confortáveis (botões >= 52 px), rótulos textuais visíveis além de cor/ícone, foco `#005FCC`, escalas `0/1/2` e `.contrast-mode` (`RF12`, `RF22`, `RNF02`, `RNF10`).

---

## 3. Checklist dos Fluxos Normativos V41 (Mantendo as Duas Definições de `F16-P` sem Renumerar)

> Nota: a numeração original da V41 duplica o código `F16-P` e não possui `F18`. Ambas as definições são verificadas separadamente abaixo, sem renumeração.

| Fluxo V41                       | Percurso e Critério de Aceite                                                               | Status Código      | Status Preview                                      | Observação de Regressão                                                                            |
| ------------------------------- | ------------------------------------------------------------------------------------------- | ------------------ | --------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `F01`                           | Acesso manual sem microfone: `T01 → T02 → T05/T06/T08/T10 → T01`                            | `EXISTE NO CÓDIGO` | `NÃO TESTADO`                                       | Verificar também `Achado B01` (header Voltar de `T01`) e `Achado B05` (`returnScreen` em subtelas) |
| `F02`                           | Favoritar / retirar: `T02 → C07 → T03 → T02`                                                | `EXISTE NO CÓDIGO` | `NÃO TESTADO`                                       | Remover em `T03` não deve remover item do catálogo `T02`                                           |
| `F03`                           | Estratégia pessoal: `T03/T04 → formulário → salvar/editar/excluir → T04`                    | `EXISTE NO CÓDIGO` | `NÃO TESTADO`                                       | Título vazio bloqueado; exclusão exige `ConfirmationDialog` (`C19`)                                |
| `F04`                           | Respiração voluntária: `T02 → T06 → T07 → pausa/retoma/sai`                                 | `EXISTE NO CÓDIGO` | `NÃO TESTADO`                                       | Monitorar `Achado B05` (`go('T06','T07')` ao sair de `T07`)                                        |
| `F05`                           | Reprodução voluntária: `T02 → T08 → T09 → reproduz/pausa/para/volume`                       | `EXISTE NO CÓDIGO` | `NÃO TESTADO`                                       | Monitorar `Achados B04` (título fixo em `T09`) e `B05` (`returnScreen` em `T08↔T09`)               |
| `F06`                           | Orientação reversível: `T02 → T11 (1 de 3) → anterior/próximo/sair`                         | `EXISTE NO CÓDIGO` | `NÃO TESTADO`                                       | Voltar na etapa 1 retorna a `T02`                                                                  |
| `F07`                           | Composição livre: `T02 → T10 → adicionar/deslocar/remover → desfazer/limpar/sair`           | `EXISTE NO CÓDIGO` | `NÃO TESTADO`                                       | Limpar exige confirmação em `C19`; sem pontuação                                                   |
| `F08`                           | Autorrelato: `T01 → T12 → escolher → confirmar → T13`                                       | `EXISTE NO CÓDIGO` | `NÃO TESTADO`                                       | `Cancelar`/`Ignorar` em `T12` jamais grava `selfReport`                                            |
| `F09`                           | Consulta de apoio: `T01/T19 → Quero apoio / Estou bem / Agora não`                          | `EXISTE NO CÓDIGO` | `NÃO TESTADO`                                       | `Estou bem` e `Agora não` apenas fecham `T19` sem gravar estado                                    |
| `F10`                           | Acústico simulado: `T18 → ativar simulação → OP01 envia evento → T19`                       | `EXISTE NO CÓDIGO` | `NÃO TESTADO`                                       | Considerar `Achado B06` (`sessionStorage` na mesma aba)                                            |
| `F11`                           | Convites suspensos: `T18 → suspender → OP01 envia evento`                                   | `EXISTE NO CÓDIGO` | `NÃO TESTADO`                                       | `eventAcoustic` ignora quando `invitesEnabled === false`                                           |
| `F12`                           | Permissão negada: `T18 → T21 (negar) → T01 → T02`                                           | `EXISTE NO CÓDIGO` | `NÃO TESTADO`                                       | `acousticMode='unavailable'`; apoio manual intacto                                                 |
| `F13`                           | Personalização visual: `T17/T20 → contraste/fonte/tema → T02`                               | `EXISTE NO CÓDIGO` | `NÃO TESTADO`                                       | Preserva contexto e amigo virtual                                                                  |
| `F14`                           | História social e saída: `T02 → T14 → T15 → fechar`                                         | `EXISTE NO CÓDIGO` | `NÃO TESTADO`                                       | Monitorar `Achado B05` (`returnScreen` após fechar `T15`)                                          |
| `F15`                           | Alternativa não digital: `T02/T05 → T16 → encerrar`                                         | `EXISTE NO CÓDIGO` | `NÃO TESTADO`                                       | Sem envio externo; notar que `T16` hoje abre via `T02`/`T33`                                       |
| **`F16-P` (1ª def. / `F16-C`)** | **Organizar cenário:** `T02 → T10 → escolha de elementos → desfazer/limpar → sair`          | `EXISTE NO CÓDIGO` | `NÃO TESTADO`                                       | 1ª definição do código duplicado `F16-P` na V41 (cenário `J01`)                                    |
| **`F16-P` (2ª def.)**           | **Associar pares sem punição:** `T02 → T22 → tocar 2 cartões → combinar ou desfazer → sair` | `EXISTE NO CÓDIGO` | `NÃO TESTADO`                                       | 2ª definição do código duplicado `F16-P` na V41 (pares `J02`)                                      |
| `F17`                           | Traçar caminho reversível: `T02 → T23 → selecionar trechos → desfazer/reiniciar → sair`     | `EXISTE NO CÓDIGO` | `NÃO TESTADO`                                       | Sem bloqueio temporal ou derrota (`J03`)                                                           |
| `F19`                           | Primeira utilização ignorada: `T24 → T01 → T02`                                             | `EXISTE NO CÓDIGO` | `T24 OBSERVADO NO PREVIEW`; transição `NÃO TESTADO` | Catálogo completo acessível sem perfil                                                             |
| `F20`                           | Configuração gradual: `T24 → T25 → T26 → T27 → T28 → T29 → T30 → T31`                       | `EXISTE NO CÓDIGO` | `T24 OBSERVADO NO PREVIEW`; etapas `NÃO TESTADO`    | Todas as etapas adiáveis e silenciosas                                                             |
| `F21`                           | Perfil atualizado: `T01/Ajustes → T34 → T26/T27/T30 → T34`                                  | `EXISTE NO CÓDIGO` | `NÃO TESTADO`                                       | Cancelar descarta `setupDraft` e mantém estado anterior                                            |
| `F22`                           | Prévia dos jogos: `T28 → J01/J02/J03 → T28`                                                 | `EXISTE NO CÓDIGO` | `NÃO TESTADO`                                       | `Sair do jogo` retorna a `T28` sem perder `setupDraft`                                             |
| `F23`                           | Apoio ativo: `T01 ou T36 (simulado) → T12 → T32 → T33 → T02/estratégia`                     | `EXISTE NO CÓDIGO` | `NÃO TESTADO`                                       | Entrada manual sempre disponível                                                                   |
| `F24`                           | Apoio passivo simulado: `OP01 → T19 → Quero apoio → T12 → T32 → T33`                        | `EXISTE NO CÓDIGO` | `NÃO TESTADO`                                       | Convite sem diagnóstico                                                                            |
| `F25`                           | História contextual: `T33 → T14 → T35 → voltar / fechar`                                    | `EXISTE NO CÓDIGO` | `NÃO TESTADO`                                       | Amigo exibido somente quando `story.hasFriend === true`                                            |
| `F26`                           | Nenhum dado / sem correspondência: `T12 ignorar → T33 (gerais) → T02`                       | `EXISTE NO CÓDIGO` | `NÃO TESTADO`                                       | Oferece Pausa, Respiração e Catálogo sem presumir emoção                                           |

---

## 4. Matriz de Regressão dos 35 Cenários QA (`Q01`–`Q35`)

Todos os cenários abaixo encontram-se implementados em código (`EXISTE NO CÓDIGO`) e honestamente classificados como **`NÃO TESTADO`** em execução interativa no Preview na linha de base `P00`:

| ID    | Cenário                          | Telas envolvidas                                | Cobertura                | Status na Linha de Base P00                              |
| ----- | -------------------------------- | ----------------------------------------------- | ------------------------ | -------------------------------------------------------- |
| `Q01` | Apoio sem microfone              | `T01`, `T02`, `T05`                             | `RF01 RF09 RF10`         | `EXISTE NO CÓDIGO` / `NÃO TESTADO`                       |
| `Q02` | Convite dispensado               | `T19`                                           | `RF02 RF14`              | `EXISTE NO CÓDIGO` / `NÃO TESTADO`                       |
| `Q03` | Suspensão de convites            | `T18`, `OP01`, `T02`                            | `RF03 RF11`              | `EXISTE NO CÓDIGO` / `NÃO TESTADO`                       |
| `Q04` | Favoritos                        | `T02`, `T03`                                    | `RF04`                   | `EXISTE NO CÓDIGO` / `NÃO TESTADO`                       |
| `Q05` | Catálogo e jogos                 | `T02`, `T05`, `T06`, `T08`, `T10`, `T22`, `T23` | `RF05`                   | `EXISTE NO CÓDIGO` / `NÃO TESTADO`                       |
| `Q06` | Sensibilidade                    | `T17`                                           | `RF06 RNF01`             | `EXISTE NO CÓDIGO` / `NÃO TESTADO`                       |
| `Q07` | Acústico negado                  | `T18`, `T21`, `T02`                             | `RF07 RF08 RF09 RNF04`   | `EXISTE NO CÓDIGO` / `NÃO TESTADO`                       |
| `Q08` | Evento remoto habilitado         | `T18`, `OP01`, `T19`                            | `RF11 RF14 RNF03`        | `EXISTE NO CÓDIGO` / `NÃO TESTADO`                       |
| `Q09` | Autorrelato                      | `T01`, `T12`, `T13`                             | `RF13 RNF10`             | `EXISTE NO CÓDIGO` / `NÃO TESTADO`                       |
| `Q10` | Orientação guiada                | `T11`, `T02`                                    | `RF15 RNF06`             | `EXISTE NO CÓDIGO` / `NÃO TESTADO`                       |
| `Q11` | Conteúdo opcional                | `T14`, `T15`, `T35`                             | `RF16 RNF07`             | `EXISTE NO CÓDIGO` / `NÃO TESTADO`                       |
| `Q12` | Aparência                        | `T20`, `T01`                                    | `RF17 RNF08`             | `EXISTE NO CÓDIGO` / `NÃO TESTADO`                       |
| `Q13` | Alternativa fora da tela         | `T16`                                           | `RF18 RNF05 RNF09`       | `EXISTE NO CÓDIGO` / `NÃO TESTADO`                       |
| `Q14` | Respiração                       | `T06`, `T07`                                    | `RF19`                   | `EXISTE NO CÓDIGO` / `NÃO TESTADO`                       |
| `Q15` | Estratégias pessoais             | `T04`                                           | `RF20`                   | `EXISTE NO CÓDIGO` / `NÃO TESTADO`                       |
| `Q16` | Player e falha                   | `T08`, `T09`                                    | `RF21 RNF01`             | `EXISTE NO CÓDIGO` / `NÃO TESTADO`                       |
| `Q17` | Legibilidade                     | `T17`                                           | `RF22 RNF02`             | `EXISTE NO CÓDIGO` / `NÃO TESTADO`                       |
| `Q18` | Atividade lúdica                 | `T10`                                           | `RF05 RF10 RF23`         | `EXISTE NO CÓDIGO` / `NÃO TESTADO`                       |
| `Q19` | Rótulos e feedback               | Transversal (`T01`–`T37`)                       | `RF12 RNF02 RNF10`       | `EXISTE NO CÓDIGO` / `NÃO TESTADO`                       |
| `Q20` | Composição de cenário            | `T10`                                           | `RF23 RNF01 RNF08 RNF10` | `EXISTE NO CÓDIGO` / `NÃO TESTADO`                       |
| `Q21` | Seleção de jogo                  | `T02`, `T10`, `T22`, `T23`                      | `RF05 RF23 RF24 RF25`    | `EXISTE NO CÓDIGO` / `NÃO TESTADO`                       |
| `Q22` | Associação sem derrota           | `T22`                                           | `RF24 RNF01 RNF10`       | `EXISTE NO CÓDIGO` / `NÃO TESTADO`                       |
| `Q23` | Traçado reversível               | `T23`                                           | `RF25 RNF01 RNF02`       | `EXISTE NO CÓDIGO` / `NÃO TESTADO`                       |
| `Q24` | Primeiro acesso sem perfil       | `T24`, `T01`, `T02`                             | `RF01 RF26`              | `T24 OBSERVADO NO PREVIEW`; fluxo completo `NÃO TESTADO` |
| `Q25` | Alteração de recursos sensoriais | `T26`, `T31`, `T33`                             | `RF27 RF33`              | `EXISTE NO CÓDIGO` / `NÃO TESTADO`                       |
| `Q26` | Preferência por silêncio         | `T27`, `T08`, `T33`                             | `RF21 RF28 RF33`         | `EXISTE NO CÓDIGO` / `NÃO TESTADO`                       |
| `Q27` | Prévia e favorita de jogo        | `T28`, `T22`                                    | `RF24 RF29`              | `EXISTE NO CÓDIGO` / `NÃO TESTADO`                       |
| `Q28` | Avatar oculto                    | `T20`, `T29`, `T34`                             | `RF17 RF30`              | `EXISTE NO CÓDIGO` / `NÃO TESTADO`                       |
| `Q29` | Amigo e história sem personagem  | `T30`, `T01`, `T14`, `T15`/`T35`                | `RF16 RF31`              | `EXISTE NO CÓDIGO` / `NÃO TESTADO`                       |
| `Q30` | Convite acústico recusado        | `OP01`, `T19`                                   | `RF11 RF14 RF32`         | `EXISTE NO CÓDIGO` / `NÃO TESTADO`                       |
| `Q31` | Contexto não informado           | `T12`, `T32`, `T33`, `T02`                      | `RF32 RF33`              | `EXISTE NO CÓDIGO` / `NÃO TESTADO`                       |
| `Q32` | Contexto e restrição             | `T27`, `T32`, `T33`                             | `RF27 RF32 RF33`         | `EXISTE NO CÓDIGO` / `NÃO TESTADO`                       |
| `Q33` | Acionamento nominal simulado     | `T30`, `T36`, `OP01`, `T12`                     | `RF34`                   | `EXISTE NO CÓDIGO` / `NÃO TESTADO`                       |
| `Q34` | Acionamento nominal indisponível | `T36`, `T12`                                    | `RF09 RF34`              | `EXISTE NO CÓDIGO` / `NÃO TESTADO`                       |
| `Q35` | História contextual reversível   | `T32`, `T33`, `T14`, `T35`                      | `RF16 RF31 RF32`         | `EXISTE NO CÓDIGO` / `NÃO TESTADO`                       |

---

## 5. Rastreamento dos Achados da Linha de Base para `P01+`

- [ ] **`B01`** (`src/App.tsx:1322`): corrigir `onBack` de `HomeScreen` (`T01`) passando callback via prop em vez de referenciar `go` fora de escopo (`TS2304` / `ReferenceError`).
- [ ] **`B02`** (`src/App.tsx:509`): ajustar tipagem de `tone` em `message(...)` (`NonNullable<Feedback>["tone"]`) para que `pnpm exec tsc --noEmit` passe com `exit 0`.
- [ ] **`B03`** (`src/App.tsx:2894-2903` e `3062-3071`): remover indicador falso de navegação (`›` / aparência de botão clicável) ou tornar explícito o caráter informativo em `T16` e `T36`.
- [ ] **`B04`** (`src/App.tsx:2049-2068` e `2125-2126`): alinhar título/duração exibidos em `T09` à faixa clicada em `T08`.
- [ ] **`B05`** (`src/App.tsx:808, 840, 890, 945, 1157`): evitar que o retorno de subtelas (`T07→T06`, `T09→T08`, `T15/T35→T14`, `T11→T02`) sobrescreva `returnScreen` criando ciclo ao clicar em `Voltar`.
- [ ] **`B06`** (`src/App.tsx:327, 503, 4496`): considerar sincronização entre abas (ou documentar fluxo na mesma aba) entre `/operador` (`OP01`) e `/`.
- [ ] **`B07`** (`.figma/make/site.json`, código residual): revisar `"language": "pt-BR"` e artefatos não referenciados se escopo futuro autorizar.
