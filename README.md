# Presença Geo

> Sistema de verificação espacial de presença acadêmica.
> QR Code dinâmico · Geofence (Haversine) · Impressão digital de dispositivo · Visualização 3D em tempo real · Exportação SIGAA.

Aplicação Next.js para substituir a chamada manual em sala de aula. O docente projeta um QR Code, o aluno escaneia e o servidor valida a presença com base em três sinais independentes: **(1)** posição GPS dentro do raio configurado, **(2)** dispositivo único por sessão (impressão digital de hardware/canvas/WebGL) e **(3)** janela de validade do código. Resultado exportável em planilha pronta para o SIGAA, com relatório forense paralelo para auditoria.

---

## Sumário

- [1. Visão geral](#1-visão-geral)
- [2. Stack técnico](#2-stack-técnico)
- [3. Identidade visual](#3-identidade-visual)
- [4. Funcionalidades implementadas](#4-funcionalidades-implementadas)
- [5. Arquitetura](#5-arquitetura)
- [6. Modelo de dados](#6-modelo-de-dados)
- [7. Referência da API](#7-referência-da-api)
- [8. LGPD e privacidade](#8-lgpd-e-privacidade)
- [9. Como rodar localmente](#9-como-rodar-localmente)
- [10. Roteiro de testes (E2E manual)](#10-roteiro-de-testes-e2e-manual)
- [11. Próximos passos](#11-próximos-passos)
- [12. Backlog de funcionalidades futuras](#12-backlog-de-funcionalidades-futuras)
- [13. Limitações conhecidas](#13-limitações-conhecidas)
- [14. Estrutura do repositório](#14-estrutura-do-repositório)

---

## 1. Visão geral

| Atributo | Descrição |
| --- | --- |
| **Domínio** | Controle de presença em instituições de ensino superior (Brasil) |
| **Usuário primário** | Docente · gerencia sessões, recebe lista e exporta planilha |
| **Usuário secundário** | Aluno · escaneia QR Code e confirma presença em seu dispositivo |
| **Princípio antifraude** | Um dispositivo, uma presença, dentro do raio, antes do código expirar |
| **Saída final** | CSV compatível com a planilha do Diário Eletrônico do SIGAA |
| **Disciplina-mãe** | Tendências em Meios de Interação (CIn-UFPE) |

---

## 2. Stack técnico

| Camada | Tecnologia | Versão |
|---|---|---|
| Framework | Next.js (App Router) | 16.2 |
| Runtime UI | React | 19.2 |
| Linguagem | TypeScript strict | 5.x |
| Estilização | Tailwind CSS | 4 |
| Componentes | shadcn/ui (base-nova) + `@base-ui/react` | — |
| Tipografia | Inter + JetBrains Mono | via `next/font/google` |
| Banco de dados | SQLite via Prisma | Prisma 6 |
| Geofence | Haversine puro (Node + browser) | — |
| QR | `qrcode.react` | 4.x |
| Realtime | Server-Sent Events + `EventEmitter` singleton | Node nativo |
| Visualização 3D | Deck.gl `HexagonLayer` + `ScatterplotLayer` | 9.x |
| Validação | `zod` | 3.x |
| Form | `react-hook-form` | 7.x |
| Toast | `sonner` | 2.x |
| Token de sessão | HMAC-SHA256 (nonce + assinatura) | Node `crypto` |

---

## 3. Identidade visual

Paleta institucional baseada na cor sóbria do CIn-UFPE (`#7D3333`), mapeada em OKLCH para uniformidade perceptual.

| Token | Light | Dark |
|---|---|---|
| `--primary` | `oklch(0.39 0.11 25)` (≈ `#7D3333`) | `oklch(0.62 0.13 25)` |
| `--background` | `oklch(0.992 0.003 30)` (off-white quente) | `oklch(0.148 0.012 25)` |
| `--ring` | `oklch(0.5 0.13 25)` | `oklch(0.62 0.13 25)` |
| `--radius` | `0.5rem` (institucional, menos arredondado) | igual |

**Tipografia:** Inter (sans), JetBrains Mono (identificadores, coordenadas, hashes).
**Charts:** série monocromática vermelho → terracota → areia (sem verdes ou azuis genéricos de IA).
**Deck.gl HexagonLayer:** mesma série, do creme ao vermelho profundo, sobre cena escura.

---

## 4. Funcionalidades implementadas

### 4.1 Painel do docente (`/`)
- Hero com chamada-para-ação principal ("Abrir nova sessão").
- Quatro métricas: sessões ativas, sessões registradas, presenças contabilizadas, sessões encerradas.
- Abas **Ativas** e **Histórico** com contagem por badge.
- Grid responsivo (1 / 2 / 3 colunas) com cards por sessão.
- Hover destaca a borda primária e o título; transição suave.

### 4.2 Criação de sessão (`/sessions/new`)
- Formulário em três seções com legendas tipográficas:
  - **Identificação** (turma, docente opcional).
  - **Ponto central** (lat/lon manual ou botão "Usar minha localização").
  - **Regras de validação** (raio em metros, validade em minutos).
- `zod` valida o payload antes do POST.
- Após criação, redireciona com token na query (`/sessions/[id]?t=<token>`).

### 4.3 Dashboard da sessão (`/sessions/[id]`)
- Cabeçalho com badge de estado (Em andamento · Expirada · Encerrada).
- Grade de **quatro estatísticas**: presenças, rejeitadas, geofence (raio + coordenadas), data de expiração ou encerramento.
- Card de QR Code (só aparece com token na URL — token bruto nunca é persistido).
- Lista ao vivo de presenças (SSE), com sub-painel de tentativas rejeitadas (últimas 8) e razão.
- **Mapa 3D Deck.gl** (`HexagonLayer` + `ScatterplotLayer`) centrado no ponto da sala, zoom calculado em função do raio, pitch 50°, tooltip por aluno.
- Dois botões de exportação: **SIGAA** (4 colunas) e **Relatório completo** (13 colunas).
- Botão "Encerrar sessão" com `Dialog` de confirmação.

### 4.4 Fluxo do aluno (`/attend/[token]`)
- Página responsiva (mobile-first, container `max-w-md`).
- Card resumo da sessão: turma, raio, horário de expiração.
- Máquina de estados (`idle → form → locating → submitting → result`).
- Termo LGPD em destaque com citação ao art. 6º da Lei nº 13.709/2018.
- Callout **"Um dispositivo, uma presença"** explicando o bloqueio antifraude.
- Coleta GPS via `navigator.geolocation` (`enableHighAccuracy: true`, timeout 15 s).
- Calcula impressão digital antes do POST.
- Resultados ilustrados: confirmação, fora do raio, dispositivo já usado, matrícula duplicada, QR expirado, sessão encerrada, link inválido, permissão de localização negada.

### 4.5 Antifraude (servidor + cliente)
- **Geofence:** distância Haversine recomputada no servidor. Cliente nunca é confiável.
- **Token:** HMAC-SHA256 (nonce + assinatura). Banco armazena apenas o SHA-256 do token; o token bruto vive somente na URL do QR Code.
- **Impressão digital:** `userAgent` · `hardwareConcurrency` · `deviceMemory` · `screen` · `timezone` · `language` · `canvas Base64` → SHA-256 (64 chars hex).
- **Unicidade no banco:** `@@unique([sessionId, fingerprintHash])` e `@@unique([sessionId, matricula])`.
- **Trilha de auditoria:** toda rejeição gera `RejectedAttempt` com motivo (`OUT_OF_RANGE`, `DUPLICATE_FINGERPRINT`, `DUPLICATE_MATRICULA`, `EXPIRED`, `CLOSED`, `INVALID_TOKEN`, `GEO_DENIED`).
- **IP:** capturado bruto (`x-forwarded-for` → `x-real-ip`) e também como hash salgado (SHA-256), nunca usado para validar presença, apenas para forense.

### 4.6 Realtime (SSE)
- Endpoint `GET /api/sessions/[id]/stream` retorna `text/event-stream`.
- Eventos: `attendance`, `rejection`, `closed`.
- Heartbeat `: ping` a cada 15 s para sobreviver a proxies.
- `EventEmitter` singleton em `globalThis.__sseBus` resiste ao HMR do Next dev server.
- Cliente subscreve via `EventSource` na tabela de presenças **e** no mapa 3D.

### 4.7 Exportação para o SIGAA
- **Formato `sigaa`** (padrão): `Matricula;Nome_Discente;Faltas;Assinatura`, UTF-8 BOM, CRLF — pronto para o módulo "Lançar Frequência em Planilha".
- **Formato `audit`**: `Matricula;Nome_Discente;Data_Assinatura;Hora_Assinatura;Registrado_Em_ISO;Distancia_Metros;Precisao_GPS_Metros;Latitude;Longitude;IP_Dispositivo;User_Agent;Fingerprint_SHA256;ID_Registro` — relatório forense completo.
- Nome do arquivo: `presenca-<slug-turma>-<id8>-<formato>.csv`.
- Conteúdo escapado conforme RFC 4180 (aspas duplas, delimitador e quebra de linha).

---

## 5. Arquitetura

### 5.1 Fluxo de dados

```
Dispositivo do aluno
   │  1. Lê QR → HTTPS /attend/<token>
   │  2. Resolve PublicSessionDTO (SSR; HMAC verifica token)
   │  3. Formulário · Consent · GPS · Canvas/WebGL fingerprint
   ▼
POST /api/attend/[token]
   │  verifyToken (HMAC) → lookup por hashToken (SHA-256)
   │  expiry / closed check → Haversine → @@unique constraints
   ▼
DB (SQLite via Prisma)
   │  AttendanceRecord  OU  RejectedAttempt
   │  emit em EventEmitter singleton
   ▼
GET /api/sessions/[id]/stream  (SSE)
   │  <LiveAttendanceList/>  +  <Attendance3DMap/>
   ▼
GET /api/sessions/[id]/export?format=sigaa|audit
   │  CSV UTF-8 BOM, ; , CRLF  →  Diário Eletrônico SIGAA
```

### 5.2 Decisões arquiteturais
- **App Router puro** — sem custom server. SSE roda em route handler com `ReadableStream` Node.
- **EventEmitter em vez de Redis pub/sub** — single process basta para sala de aula (≤ 200 alunos). Caminho de escala documentado para multi-instância (swap por Redis).
- **SQLite em vez de Postgres** — zero-config para demo acadêmica. Migração para Postgres não exige mudança de schema (`provider = "sqlite"` → `"postgresql"`).
- **HMAC nonce em vez de JWT** — expiração mora apenas no DB (`Session.expiresAt`), não há dupla fonte de verdade nem dependência de `jsonwebtoken`.
- **Deck.gl sem basemap** — apresentação em sala não precisa de tiles externos (sem token Mapbox / sem custo / sem rede). Hexágonos sobre fundo escuro destacam a densidade.

---

## 6. Modelo de dados

```prisma
model Session {
  id              String   @id @default(cuid())
  className       String
  centerLat       Float
  centerLon       Float
  radiusM         Int      @default(50)
  tokenHash       String   @unique          // SHA-256 do token bruto
  createdAt       DateTime @default(now())
  expiresAt       DateTime
  closedAt        DateTime?
  createdByLabel  String?
  attendances     AttendanceRecord[]
  rejections      RejectedAttempt[]
  @@index([expiresAt])
}

model AttendanceRecord {
  id              String   @id @default(cuid())
  sessionId       String
  name            String
  matricula       String
  lat             Float
  lon             Float
  accuracyM       Float?
  distanceM       Float                      // computado server-side
  fingerprintHash String
  userAgent       String
  ip              String?                    // bruto, para auditoria
  ipHash          String?                    // SHA-256 salgado, soft dedup
  createdAt       DateTime @default(now())
  session         Session  @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  @@unique([sessionId, fingerprintHash])
  @@unique([sessionId, matricula])
  @@index([sessionId, createdAt])
}

model RejectedAttempt {
  id              String   @id @default(cuid())
  sessionId       String
  reason          String                     // enum-like
  name            String?
  matricula       String?
  lat             Float?
  lon             Float?
  distanceM       Float?
  fingerprintHash String?
  userAgent       String?
  createdAt       DateTime @default(now())
  session         Session  @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  @@index([sessionId, createdAt])
}
```

Migrações em `prisma/migrations/`.

---

## 7. Referência da API

| Método | Rota | Descrição | Códigos |
|---|---|---|---|
| `POST` | `/api/sessions` | Cria sessão. Retorna `{ id, token, attendUrl, expiresAt }`. | `201` · `422` |
| `GET` | `/api/sessions/[id]` | Snapshot completo (metadados + presenças). | `200` · `404` |
| `PATCH` | `/api/sessions/[id]` | Body `{ close: true }`. Encerra a sessão. | `200` · `404` |
| `GET` | `/api/sessions/[id]/stream` | SSE (`attendance`, `rejection`, `closed`, heartbeat). | `200` |
| `GET` | `/api/sessions/[id]/export?format=sigaa\|audit` | Download CSV. | `200` · `404` |
| `GET` | `/api/attend/[token]` | Resolve token público (sanitizado). | `200` · `404` |
| `POST` | `/api/attend/[token]` | Submete presença. | `201` · `401` · `409` · `410` · `422` |

### POST `/api/attend/[token]` — códigos de rejeição

| HTTP | `reason` | Quando |
|---|---|---|
| `201` | — | Sucesso |
| `401` | `INVALID_TOKEN` | HMAC inválido ou token adulterado |
| `409` | `DUPLICATE_FINGERPRINT` | Mesmo dispositivo, identidade diferente |
| `409` | `DUPLICATE_MATRICULA` | Mesma matrícula, dispositivo diferente |
| `410` | `EXPIRED` | Após `Session.expiresAt` |
| `410` | `CLOSED` | Docente encerrou a sessão |
| `422` | `OUT_OF_RANGE` | Haversine > `radiusM` |

---

## 8. LGPD e privacidade

O sistema opera sob **Lei nº 13.709/2018, art. 6º** (necessidade e minimização).

- **Dados coletados:** nome, matrícula, latitude, longitude, precisão GPS, hash de fingerprint (SHA-256), user agent, IP bruto, IP hash (SHA-256 salgado).
- **Termo de consentimento:** apresentado antes do envio, enumera explicitamente cada vetor coletado e cita a base legal.
- **Princípio de coleta episódica:** uma única intersecção lat/lon comparada ao geofence. Não há rastreio contínuo.
- **Política de retenção (recomendada / a implementar):** após exportação para o SIGAA, lat/lon devem ser convertidos para o bit binário "presente=true" e o IP bruto removido. Esta política está documentada em comentário em `lib/sigaa-csv.ts` e no termo do aluno; o job automatizado de purga ainda não foi implementado (ver § 11).
- **Fingerprint:** session-scoped. Nunca é reaproveitado entre sessões para identificar o aluno entre disciplinas.
- **IP:** capturado apenas para forense. **Nunca** usado para validar presença (geolocalização por IP é trivialmente burlável com VPN).

---

## 9. Como rodar localmente

### Pré-requisitos
- Node.js 20+
- npm 10+
- (Opcional) `cloudflared` ou `mkcert` para HTTPS em rede local (a API de Geolocation exige contexto seguro fora de `localhost`).

### Instalação

```bash
npm install
cp .env.example .env.local
# Em .env.local, defina ATTENDANCE_SECRET com 64 chars hex:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
npx prisma migrate dev
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

### Scripts disponíveis

| Script | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento (Turbopack) |
| `npm run build` | Build de produção |
| `npm run start` | Inicia o servidor de produção |
| `npm run lint` | ESLint |
| `npm run db:migrate` | `prisma migrate dev` |
| `npm run db:studio` | Prisma Studio (inspetor visual do SQLite) |

### Variáveis de ambiente

```env
DATABASE_URL="file:./dev.db"
ATTENDANCE_SECRET="<32 bytes hex (64 chars)>"
```

### Acessar do celular durante desenvolvimento

A API HTML5 Geolocation requer **contexto seguro** (HTTPS) fora de `localhost`. Três opções:

```bash
# A) Túnel HTTPS público (recomendado)
npx cloudflared tunnel --url http://localhost:3000

# B) HTTPS local com certificado auto-assinado
mkcert -install
next dev --experimental-https

# C) Flag do Chrome no celular
# chrome://flags/#unsafely-treat-insecure-origin-as-secure
# Adicione http://192.168.x.x:3000
```

---

## 10. Roteiro de testes (E2E manual)

1. **Criar sessão.** Acesse `/sessions/new` no desktop, clique "Usar minha localização", defina turma, raio = 50 m, validade = 5 min. Submeter → redireciona para `/sessions/<id>?t=<token>` com QR Code visível.
2. **Marcar presença.** No celular (sob HTTPS), escaneie o QR. Preencha nome + matrícula, marque o consentimento, toque "Marcar presença". Permita localização. Resultado: "Presença confirmada" com a distância.
3. **Dashboard ao vivo.** No desktop, observe a nova linha aparecer na tabela em < 200 ms e o hexágono brotar no mapa 3D.
4. **Antifraude (mesmo dispositivo).** Recarregue a página de presença no celular, preencha matrícula diferente, envie. Resposta esperada: **409 DUPLICATE_FINGERPRINT**.
5. **Antifraude (matrícula duplicada).** Em outro dispositivo (laptop), abra o mesmo QR e use a matrícula já registrada. Resposta esperada: **409 DUPLICATE_MATRICULA**.
6. **Fora do raio.** No DevTools → Sensors → Location, defina coordenadas distantes. Envie. Resposta esperada: **422 OUT_OF_RANGE**, com `RejectedAttempt` gravado.
7. **Expiração.** Aguarde além de `expiresAt` e tente. Resposta esperada: **410 EXPIRED**.
8. **Encerramento manual.** No dashboard, clique "Encerrar sessão" → confirmar. Tentativas subsequentes: **410 CLOSED**.
9. **Token adulterado.** Modifique o último caractere do token na URL. Resposta esperada: **401 INVALID_TOKEN**.
10. **Exportar SIGAA.** Clique "Exportar SIGAA" → abra o CSV no Excel/LibreOffice (UTF-8 BOM + `;` deve renderizar acentos corretamente).
11. **Exportar relatório completo.** Clique "Relatório completo" → confira as 13 colunas e os timestamps.
12. **Histórico.** Volte ao painel, aba **Histórico** → a sessão encerrada deve aparecer com badge "Encerrada".
13. **Prisma Studio.** `npm run db:studio` → verifique `AttendanceRecord` e `RejectedAttempt`.

---

## 11. Próximos passos

| Prioridade | Item | Esforço |
|---|---|---|
| Alta | **Job de purga LGPD** automatizado: após `closedAt + N dias`, anonimizar lat/lon, IP bruto e fingerprint (manter apenas matrícula + faltas). | Médio |
| Alta | **Autenticação do docente** (NextAuth com credencial institucional ou SSO UFPE/CAS). Hoje qualquer um com o id da sessão pode encerrá-la. | Médio |
| Média | **Map picker** no formulário de criação de sessão (Leaflet/MapLibre embutido para selecionar lat/lon visualmente). | Médio |
| Média | **Notificação push/email** para o docente quando a sessão expira ou atinge X presenças. | Baixo |
| Média | **Reabrir / estender sessão** (botão para empurrar `expiresAt` em +5 min). | Baixo |
| Baixa | **Migração para Postgres** + pub/sub via Redis (necessário se escalar para multi-instância). | Médio |
| Baixa | **Testes automatizados** (Vitest + Playwright para o fluxo de presença, Prisma test DB). | Médio |

---

## 12. Backlog de funcionalidades futuras

- **Roster importável.** Importar lista de matrícula da turma (CSV do SIGAA) para validar a matrícula no envio e gerar relatório de **faltas reais** (não só presentes).
- **Calendário recorrente.** Criar sessões para todas as aulas do semestre de uma vez.
- **PWA instalável** para o aluno: ícone na tela inicial, splash screen, fingerprint persistente.
- **Modo offline com sincronização posterior** (raro em sala de aula, mas útil em campo).
- **WebAuthn / passkey** como alternativa à impressão digital de canvas (mais robusto, mais privado).
- **Geofence poligonal** (`shapely`-style) para salas não-circulares (auditórios, laboratórios em L).
- **Heatmap temporal** (Deck.gl `TripsLayer`): visualizar a curva de chegada dos alunos ao longo da janela.
- **Análise no Kepler.gl** embutido para exploração no-code dos dados acumulados do semestre.
- **Webhook de integração SIGAA** (se a UFPE liberar API REST oficial — hoje a importação é via planilha manual).
- **Reconhecimento de rosto opcional** (face match com foto institucional) — discutível por LGPD, exigiria consentimento específico para biometria.
- **QR rotativo** (token novo a cada 15 s) para impedir captura por foto + envio a terceiros remotos.
- **Multi-tenant** (várias instituições no mesmo deploy).
- **Tema dark** ativo (tokens já existem, falta `next-themes` no provider e toggle no header).
- **Internacionalização** (i18n PT-BR / EN para divulgação acadêmica internacional).

---

## 13. Limitações conhecidas

- **Sem autenticação do docente.** Qualquer pessoa com o id de uma sessão pode encerrá-la via `PATCH`. Aceitável para o protótipo acadêmico; obrigatório resolver antes de produção.
- **Fingerprint pode colidir** em pares de dispositivos idênticos (mesmo iPhone, mesma versão de iOS, mesma locale). A constraint `@@unique([sessionId, matricula])` cobre o caso prático.
- **Navegadores de privacidade** (Brave shields, Firefox `resistFingerprinting`) randomizam o canvas → cada submissão gera fingerprint novo, anulando o dedup por dispositivo. A matrícula única ainda protege.
- **EventEmitter é in-process.** Multi-instância (load balancer com 2+ workers Node) quebra a entrega SSE. Documentado; solução = Redis pub/sub.
- **SQLite write contention** em alta carga (200+ envios simultâneos). Migração para Postgres é trivial.
- **HMR no dev derruba listeners SSE** ocasionalmente. Refresh resolve. Em produção (`next start`) é estável.
- **Geolocation requer HTTPS** fora de `localhost`. Em desenvolvimento, usar túnel ou mkcert (documentado no § 9).
- **Job de purga LGPD ainda não implementado.** A política está descrita no termo de consentimento e no comentário do código, mas a execução automatizada é manual por enquanto.

---

## 14. Estrutura do repositório

```
app/
├── layout.tsx                          Inter + JetBrains Mono · header CIn
├── globals.css                         Tokens OKLCH · paleta vermelha sóbria
├── page.tsx                            Painel · abas Ativas/Histórico · 4 métricas
├── sessions/
│   ├── new/page.tsx                    RSC + SessionForm client
│   └── [id]/page.tsx                   Estatísticas · QR · LiveList · Mapa 3D · Export
├── attend/[token]/page.tsx             SSR token verify → AttendFlow client
└── api/
    ├── sessions/route.ts               POST create
    ├── sessions/[id]/route.ts          GET snapshot · PATCH close
    ├── sessions/[id]/stream/route.ts   SSE (EventEmitter singleton)
    ├── sessions/[id]/export/route.ts   ?format=sigaa|audit
    └── attend/[token]/route.ts         GET resolve · POST validate

components/
├── ui/*                                shadcn base-nova (@base-ui/react)
├── sessions/
│   ├── session-form.tsx                react-hook-form com seções
│   ├── session-qr-card.tsx             qrcode.react + copy-link
│   ├── live-attendance-list.tsx        EventSource → Table + rejeições
│   ├── close-session-button.tsx        Dialog confirmação
│   └── attendance-3d-map.tsx           Deck.gl HexagonLayer + Scatterplot
└── attend/
    ├── attend-flow.tsx                 FSM idle → form → locating → submitting → result
    ├── consent-card.tsx                LGPD + callout "Um dispositivo, uma presença"
    ├── location-step.tsx               navigator.geolocation
    └── result-card.tsx                 8 variantes de resultado

lib/
├── prisma.ts                           Prisma singleton (HMR-safe)
├── geo.ts                              Haversine + isWithinGeofence
├── token.ts                            HMAC nonce sign/verify/hash
├── fingerprint.ts                      Canvas/WebGL + UA → SHA-256
├── sse-bus.ts                          EventEmitter singleton (globalThis)
├── validation.ts                       Schemas zod
├── dto.ts                              AttendanceDTO · SessionDTO · PublicSessionDTO
├── sigaa-csv.ts                        toSigaaCsv (4 cols) + toAuditCsv (13 cols)
└── utils.ts                            cn helper (clsx + twMerge)

prisma/
├── schema.prisma                       Session · AttendanceRecord · RejectedAttempt
└── migrations/                         20260512092153_init · 20260512100311_add_attendance_ip
```

---

## Créditos

Projeto acadêmico para a disciplina **Tendências em Meios de Interação** — Centro de Informática, UFPE.

Construído sobre Next.js, shadcn/ui, Prisma, Deck.gl, qrcode.react, sonner e zod.
