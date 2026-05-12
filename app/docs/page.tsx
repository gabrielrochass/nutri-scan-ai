import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertOctagon,
  AlertTriangle,
  BookOpenCheck,
  CheckCircle2,
  Clock,
  Compass,
  Database,
  Download,
  FileSpreadsheet,
  FileText,
  Fingerprint,
  Info,
  KeyRound,
  Layers,
  Lock,
  MapPin,
  QrCode,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  UserCog,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Documentação · Presença Geo",
  description:
    "Manual completo da plataforma Presença Geo: fluxos do docente e do aluno, regras de validação, antifraude, privacidade LGPD e exportação SIGAA.",
};

const sections = [
  { id: "como-funciona", label: "Como funciona", icon: Info },
  { id: "fluxo-docente", label: "Fluxo do docente", icon: UserCog },
  { id: "fluxo-aluno", label: "Fluxo do aluno", icon: Smartphone },
  { id: "regras", label: "Regras de validação", icon: ShieldCheck },
  { id: "rejeicoes", label: "Códigos de rejeição", icon: ShieldAlert },
  { id: "antifraude", label: "Antifraude técnico", icon: Fingerprint },
  { id: "privacidade", label: "Privacidade e LGPD", icon: Lock },
  { id: "exportacao", label: "Exportação SIGAA", icon: FileSpreadsheet },
  { id: "boas-praticas", label: "Boas práticas", icon: BookOpenCheck },
  { id: "limitacoes", label: "Limitações", icon: AlertTriangle },
  { id: "faq", label: "Dúvidas frequentes", icon: AlertOctagon },
];

export default function DocsPage() {
  return (
    <main className="container mx-auto max-w-6xl flex-1 px-4 py-8 sm:py-12">
      <header className="grid gap-3 pb-8">
        <Badge variant="outline" className="w-fit text-[10px] uppercase tracking-wider">
          Documentação
        </Badge>
        <h1 className="font-heading text-3xl tracking-tight sm:text-4xl">
          Manual da plataforma Presença Geo
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Este manual descreve, em detalhe técnico e operacional, tudo o que a
          plataforma <strong>permite</strong> e tudo o que ela{" "}
          <strong>bloqueia</strong>. Leia-o antes de abrir a primeira sessão e
          deixe-o disponível para os alunos consultarem em caso de dúvida.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-20 lg:h-fit">
          <nav className="rounded-lg border bg-card p-3 text-sm">
            <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Conteúdo
            </p>
            <ol className="grid gap-0.5">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <s.icon className="size-3.5 text-muted-foreground" />
                    <span className="text-[13px]">{s.label}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>

        <article className="grid gap-10">
          <Section id="como-funciona" icon={Info} title="Como funciona, em 30 segundos">
            <p>
              A plataforma substitui a chamada manual por uma validação espacial
              automatizada. O docente cria uma sessão, configura o ponto central
              da sala e um raio de tolerância em metros. O sistema gera um QR
              Code com validade limitada. O aluno escaneia o QR Code e a página
              que abre solicita três coisas: <strong>nome</strong>,{" "}
              <strong>matrícula</strong> e <strong>consentimento</strong> para
              capturar localização e identificadores técnicos do dispositivo.
              Após o envio, três validações independentes acontecem no servidor:
            </p>
            <ol className="grid list-decimal gap-2 pl-5 text-sm leading-relaxed">
              <li>
                A distância em linha reta entre o aluno e o ponto central da
                sala é calculada pela <strong>fórmula de Haversine</strong>. Se
                exceder o raio, a presença é rejeitada.
              </li>
              <li>
                Uma <strong>impressão digital</strong> do dispositivo
                (combinação de userAgent, hardware, tela, fuso horário e
                renderização canvas) é confrontada com o banco. Se o mesmo
                dispositivo já registrou outra matrícula nesta sessão, a
                presença é rejeitada.
              </li>
              <li>
                A <strong>matrícula</strong> é verificada. Se já consta como
                presente, a presença é rejeitada.
              </li>
            </ol>
            <p>
              Passando nas três validações, a presença é registrada, aparece em
              tempo real no painel do docente (lista e mapa 3D) e fica
              disponível para exportação em planilha pronta para o SIGAA.
            </p>
          </Section>

          <Section id="fluxo-docente" icon={UserCog} title="Fluxo do docente">
            <Step
              n={1}
              icon={Compass}
              title="Abra o painel"
              body={
                <>
                  Acesse a página inicial. Você verá um cabeçalho com a métrica
                  de sessões ativas, sessões registradas, presenças
                  contabilizadas e sessões encerradas. As abas{" "}
                  <strong>Ativas</strong> e <strong>Histórico</strong> separam o
                  que está acontecendo agora do que já foi encerrado.
                </>
              }
            />
            <Step
              n={2}
              icon={QrCode}
              title="Crie uma nova sessão"
              body={
                <>
                  Clique em <strong>Abrir nova sessão</strong>. Preencha:
                  <ul className="mt-2 grid list-disc gap-1 pl-5">
                    <li>
                      <strong>Turma</strong> — nome ou código que identifica a
                      aula no painel.
                    </li>
                    <li>
                      <strong>Latitude e longitude</strong> da sala. Use o botão{" "}
                      <em>&ldquo;Usar minha localização&rdquo;</em> dentro da sala para
                      capturar via GPS, ou digite manualmente as coordenadas se
                      já souber.
                    </li>
                    <li>
                      <strong>Raio (m)</strong> — distância máxima aceita.
                      Padrão 50 m. Para salas pequenas, 30 m é suficiente; para
                      auditórios grandes, 80–100 m.
                    </li>
                    <li>
                      <strong>Validade (min)</strong> — quanto tempo o QR Code
                      permanece aceitando presenças. Padrão 5 min. Recomendado
                      manter curto para evitar compartilhamento do link.
                    </li>
                    <li>
                      <strong>Docente</strong> (opcional) — texto livre para
                      identificar a sessão no histórico.
                    </li>
                  </ul>
                </>
              }
            />
            <Step
              n={3}
              icon={QrCode}
              title="Projete o QR Code"
              body={
                <>
                  Após criar a sessão, o painel exibe o QR Code, o link
                  completo, dois botões e a lista ao vivo. Projete o QR Code na
                  TV/projetor da sala. <strong>Não compartilhe o link</strong>{" "}
                  por mensagem — o token presente na URL é o que dá acesso à
                  página de presença.
                </>
              }
            />
            <Step
              n={4}
              icon={Layers}
              title="Acompanhe a presença em tempo real"
              body={
                <>
                  À medida que os alunos escaneiam e validam, dois componentes
                  atualizam imediatamente:
                  <ul className="mt-2 grid list-disc gap-1 pl-5">
                    <li>
                      A <strong>lista de presença</strong> ganha uma nova linha
                      com nome, matrícula, distância apurada e horário.
                    </li>
                    <li>
                      O <strong>mapa de densidade 3D</strong> faz surgir
                      hexágonos cuja altura é proporcional ao número de alunos
                      em cada microrregião. Cores variam do creme ao vermelho
                      profundo conforme a concentração aumenta.
                    </li>
                  </ul>
                  Tentativas rejeitadas aparecem em um sub-painel com a razão
                  (fora do raio, dispositivo duplicado, etc.).
                </>
              }
            />
            <Step
              n={5}
              icon={XCircle}
              title="Encerre a sessão"
              body={
                <>
                  Quando o tempo terminar, a sessão é encerrada automaticamente.
                  Você também pode encerrar manualmente clicando em{" "}
                  <strong>Encerrar sessão</strong>. Após encerrada, nenhuma nova
                  presença é aceita; tentativas retornam <code>410 CLOSED</code>{" "}
                  e ficam registradas como tentativa de fraude.
                </>
              }
            />
            <Step
              n={6}
              icon={Download}
              title="Exporte para o SIGAA"
              body={
                <>
                  Com pelo menos uma presença registrada, dois botões ficam
                  disponíveis:
                  <ul className="mt-2 grid list-disc gap-1 pl-5">
                    <li>
                      <strong>Exportar SIGAA</strong> — planilha enxuta (4
                      colunas) no formato exato exigido pelo módulo{" "}
                      <em>&ldquo;Lançar Frequência em Planilha&rdquo;</em>.
                    </li>
                    <li>
                      <strong>Relatório completo</strong> — auditoria com 13
                      colunas incluindo coordenadas, IP, fingerprint e
                      timestamps. Para registro interno do docente, nunca para
                      o SIGAA.
                    </li>
                  </ul>
                </>
              }
            />
            <Step
              n={7}
              icon={Clock}
              title="Consulte o histórico"
              body={
                <>
                  Sessões expiradas ou encerradas migram automaticamente para a
                  aba <strong>Histórico</strong> no painel. Você pode entrar,
                  ver a lista final e baixar os CSVs a qualquer momento,
                  inclusive dias depois.
                </>
              }
            />
          </Section>

          <Section id="fluxo-aluno" icon={Smartphone} title="Fluxo do aluno">
            <Step
              n={1}
              icon={QrCode}
              title="Escaneie o QR Code"
              body={
                <>
                  Use a câmera do celular ou um leitor de QR. O navegador
                  abrirá em uma página com o nome da turma, o raio configurado e
                  o horário de expiração.
                </>
              }
            />
            <Step
              n={2}
              icon={ShieldCheck}
              title="Leia o termo de consentimento"
              body={
                <>
                  O termo cita explicitamente quais dados são coletados:
                  geolocalização (GPS/Wi-Fi), precisão do sinal, identificador
                  técnico do aparelho (canvas/WebGL/hardware), user agent e IP
                  de origem. A base legal é a <strong>LGPD, art. 6º</strong>{" "}
                  (necessidade e minimização). Sem a marcação do checkbox, o
                  envio é bloqueado.
                </>
              }
            />
            <Step
              n={3}
              icon={MapPin}
              title="Permita acesso à localização"
              body={
                <>
                  O navegador exibirá um pop-up nativo solicitando permissão.
                  Toque em <strong>Permitir</strong>. Sem isso, o servidor
                  responde com <code>GEO_DENIED</code> e a presença não pode ser
                  registrada — o aluno teria que abrir o link no celular,
                  liberar a permissão no menu do navegador e tentar de novo.
                </>
              }
            />
            <Step
              n={4}
              icon={CheckCircle2}
              title="Aguarde o resultado"
              body={
                <>
                  Em até dois segundos, o cartão de resultado mostra:
                  <ul className="mt-2 grid list-disc gap-1 pl-5">
                    <li>
                      <strong>&ldquo;Presença confirmada&rdquo;</strong> + distância apurada
                      em metros.
                    </li>
                    <li>Ou um cartão de erro com instrução para corrigir.</li>
                  </ul>
                  Não precisa fazer mais nada — a confirmação aparece
                  instantaneamente no painel do docente.
                </>
              }
            />
          </Section>

          <Section id="regras" icon={ShieldCheck} title="Regras de validação">
            <p>
              As cinco regras abaixo são <strong>cumulativas</strong>. A
              presença só é aceita se todas forem satisfeitas. Qualquer falha
              gera um registro na trilha de auditoria.
            </p>

            <RuleCard
              icon={MapPin}
              title="Regra 1 · Geofence (Haversine)"
              level="alta"
              ok="O aluno está a distância ≤ ao raio configurado da sessão."
              ko="O aluno está fora do raio. A distância em linha reta entre as coordenadas do aluno e o centro da sala excede o raio."
              detail={
                <>
                  Distância calculada pela <strong>fórmula de Haversine</strong>{" "}
                  no servidor, com raio da Terra de 6.371.000 m. O cliente
                  envia lat/lon, mas o servidor sempre recalcula — nunca confia
                  no que o aluno diz da posição dele.
                </>
              }
            />
            <RuleCard
              icon={Fingerprint}
              title="Regra 2 · Impressão digital única por sessão"
              level="alta"
              ok="O dispositivo do aluno nunca foi usado nesta sessão para registrar outra matrícula."
              ko={
                <>
                  Este dispositivo já foi usado para registrar uma matrícula
                  diferente. <strong>Um dispositivo, uma presença.</strong>
                </>
              }
              detail={
                <>
                  A impressão digital é uma chave SHA-256 (64 caracteres hex)
                  gerada a partir de userAgent, número de núcleos lógicos,
                  memória do dispositivo, resolução, fuso horário, idioma e da
                  imagem renderizada por um canvas HTML5. A unicidade é
                  garantida no banco pela constraint{" "}
                  <code>@@unique([sessionId, fingerprintHash])</code>.
                </>
              }
            />
            <RuleCard
              icon={KeyRound}
              title="Regra 3 · Matrícula única por sessão"
              level="alta"
              ok="Esta matrícula ainda não foi registrada como presente."
              ko="Esta matrícula já foi registrada nesta sessão (em outro dispositivo, em outro horário). Não há como marcar presença duas vezes."
              detail={
                <>
                  Garantida pela constraint{" "}
                  <code>@@unique([sessionId, matricula])</code>. Esta regra
                  protege contra o caso em que dois dispositivos diferentes
                  tentariam enviar a mesma matrícula (por exemplo, se um aluno
                  reaproveitasse o tablet de outro).
                </>
              }
            />
            <RuleCard
              icon={Clock}
              title="Regra 4 · Validade do QR Code"
              level="média"
              ok="A submissão ocorreu dentro da janela de validade configurada (por padrão, 5 minutos)."
              ko="O QR Code já expirou. Mesmo com link válido, presença não é mais aceita."
              detail={
                <>
                  O servidor compara <code>session.expiresAt</code> com o
                  relógio do próprio servidor. O cliente não pode estender a
                  janela. Janelas curtas dificultam o repasse do link por
                  WhatsApp.
                </>
              }
            />
            <RuleCard
              icon={Lock}
              title="Regra 5 · Token íntegro"
              level="alta"
              ok="O token na URL foi assinado pelo servidor e não foi adulterado."
              ko="O token foi modificado em qualquer caractere. Verificação HMAC falha."
              detail={
                <>
                  O token tem formato <code>nonce.assinatura</code>. A
                  assinatura é um HMAC-SHA256 do nonce com um segredo do
                  servidor (variável de ambiente{" "}
                  <code>ATTENDANCE_SECRET</code>). Mesmo conhecendo a estrutura,
                  um atacante não consegue forjar um token sem o segredo. O
                  banco armazena apenas o SHA-256 do token bruto, então um
                  vazamento do banco também não revela tokens utilizáveis.
                </>
              }
            />
          </Section>

          <Section id="rejeicoes" icon={ShieldAlert} title="Códigos de rejeição">
            <p>
              Quando alguma regra falha, o servidor responde com um código HTTP
              específico e grava um <code>RejectedAttempt</code> com o motivo.
              Use esta tabela para identificar a causa.
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>HTTP</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Significado</TableHead>
                  <TableHead>Ação corretiva</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {REJECTIONS.map((r) => (
                  <TableRow key={r.reason}>
                    <TableCell className="font-mono text-xs">{r.status}</TableCell>
                    <TableCell className="font-medium">{r.reason}</TableCell>
                    <TableCell className="text-sm">{r.meaning}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {r.action}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Section>

          <Section
            id="antifraude"
            icon={Fingerprint}
            title="Antifraude — explicação técnica"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Por que três regras independentes?
                </CardTitle>
                <CardDescription>
                  Cada regra cobre uma classe diferente de fraude. Combinadas,
                  bloqueiam todas as fraudes triviais de chamada acadêmica.
                </CardDescription>
              </CardHeader>
              <Separator />
              <CardContent className="grid gap-4">
                <FraudCase
                  title="Cenário A · Aluno em casa, pede para colega marcar"
                  attack="Aluno ausente compartilha o link com o colega presente. Colega tenta marcar a matrícula do ausente do próprio celular."
                  defense={
                    <>
                      <strong>Bloqueado pela Regra 2.</strong> O celular do
                      colega já registrou a própria presença →{" "}
                      <code>DUPLICATE_FINGERPRINT</code>.
                    </>
                  }
                />
                <FraudCase
                  title="Cenário B · Aluno em casa, próprio celular"
                  attack="Aluno em casa abre o link compartilhado por WhatsApp e tenta marcar do próprio celular."
                  defense={
                    <>
                      <strong>Bloqueado pela Regra 1.</strong> GPS retorna
                      coordenadas distantes da sala → <code>OUT_OF_RANGE</code>.
                    </>
                  }
                />
                <FraudCase
                  title="Cenário C · VPN ou spoofing de IP"
                  attack="Aluno tenta mascarar a localização via VPN ou alterar o IP."
                  defense={
                    <>
                      <strong>Indiferente.</strong> A validação espacial nunca
                      usa o IP — usa coordenadas GPS reais do hardware do
                      celular. O IP só entra na trilha forense.
                    </>
                  }
                />
                <FraudCase
                  title="Cenário D · Mesmo aparelho, abas anônimas"
                  attack="Aluno presente tenta marcar três matrículas usando o navegador anônimo e a câmera privada."
                  defense={
                    <>
                      <strong>Bloqueado pela Regra 2.</strong> A impressão
                      digital ignora cookies e localStorage; ela depende do
                      hardware e da renderização canvas, que não mudam entre
                      modos. Após a primeira presença, qualquer tentativa do
                      mesmo aparelho cai em <code>DUPLICATE_FINGERPRINT</code>.
                    </>
                  }
                />
                <FraudCase
                  title="Cenário E · Adulteração do token no link"
                  attack="Aluno tenta gerar um token válido modificando a URL."
                  defense={
                    <>
                      <strong>Bloqueado pela Regra 5.</strong> A assinatura HMAC
                      falha sem conhecimento do segredo do servidor →{" "}
                      <code>INVALID_TOKEN</code>.
                    </>
                  }
                />
                <FraudCase
                  title="Cenário F · Coordenadas fabricadas via DevTools"
                  attack="Aluno usa o emulador de Sensors do Chrome para enviar coordenadas falsas dentro do raio."
                  defense={
                    <>
                      <strong>Mitigação parcial.</strong> A plataforma pode
                      aceitar a presença porque a posição informada está dentro
                      do raio. Contramedida: as coordenadas ficam gravadas no{" "}
                      <em>Relatório completo</em>, e divergências grosseiras
                      (latitude com 1 casa decimal exata, sem variação entre
                      alunos) ficam evidentes na auditoria. Em ambiente móvel
                      real, esse ataque exige privilégios de root/jailbreak.
                    </>
                  }
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Como a impressão digital é construída
                </CardTitle>
              </CardHeader>
              <Separator />
              <CardContent className="grid gap-3 text-sm">
                <p>
                  A impressão digital combina sinais passivos do
                  hardware/software do dispositivo. Nenhuma permissão extra é
                  solicitada — todos os vetores estão disponíveis pelo padrão
                  da web.
                </p>
                <ul className="grid list-disc gap-1.5 pl-5">
                  <li>
                    <code>navigator.userAgent</code> · versão do navegador, OS,
                    arquitetura.
                  </li>
                  <li>
                    <code>navigator.hardwareConcurrency</code> · número de
                    núcleos lógicos.
                  </li>
                  <li>
                    <code>navigator.deviceMemory</code> · RAM aproximada.
                  </li>
                  <li>
                    <code>screen.width × screen.height</code> · resolução
                    física.
                  </li>
                  <li>
                    <code>screen.colorDepth</code> · profundidade de cor.
                  </li>
                  <li>
                    <code>Intl.DateTimeFormat().resolvedOptions().timeZone</code>{" "}
                    · fuso horário.
                  </li>
                  <li>
                    <code>navigator.language</code> · idioma preferencial.
                  </li>
                  <li>
                    <strong>Hash canvas</strong> · uma string desenhada em um{" "}
                    <code>&lt;canvas&gt;</code> invisível e convertida para
                    Base64. Pequenas diferenças entre GPUs, drivers e fontes
                    instaladas produzem bytes finais distintos.
                  </li>
                </ul>
                <p>
                  Todos os vetores são concatenados com <code>|</code> e
                  passados por <code>crypto.subtle.digest(&quot;SHA-256&quot;, ...)</code>
                  . O resultado tem 64 caracteres hexadecimais. O hash é
                  gravado no banco; <strong>os vetores brutos não são</strong>.
                </p>
              </CardContent>
            </Card>
          </Section>

          <Section id="privacidade" icon={Lock} title="Privacidade e LGPD">
            <p>
              A plataforma opera sob <strong>Lei nº 13.709/2018 (LGPD),
              art. 6º</strong> — princípios de necessidade e minimização. Toda
              coleta é episódica e justificada por finalidade clara.
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <PrincipleCard
                icon={Database}
                title="O que é coletado"
                body={
                  <ul className="grid list-disc gap-1 pl-5">
                    <li>Nome completo (declarado pelo aluno)</li>
                    <li>Matrícula (declarada pelo aluno)</li>
                    <li>Latitude e longitude</li>
                    <li>Precisão do GPS</li>
                    <li>Impressão digital do dispositivo (hash SHA-256)</li>
                    <li>User agent</li>
                    <li>Endereço IP (bruto e hash salgado)</li>
                  </ul>
                }
              />
              <PrincipleCard
                icon={XCircle}
                title="O que NÃO é coletado"
                body={
                  <ul className="grid list-disc gap-1 pl-5">
                    <li>Histórico de localização (apenas o ponto único)</li>
                    <li>Lista de contatos, fotos, microfone, câmera</li>
                    <li>Cookies de terceiros / publicidade</li>
                    <li>Identificadores de Apple/Google (IDFA/AAID)</li>
                    <li>Biometria facial ou digital do aluno</li>
                    <li>Acesso ao Wi-Fi / Bluetooth nominal</li>
                  </ul>
                }
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <PolicyCard
                title="Finalidade"
                body="Validar presença em uma única aula. Nenhuma análise de
                comportamento, perfil, ou cruzamento com outras bases."
              />
              <PolicyCard
                title="Base legal"
                body="Consentimento explícito (LGPD art. 7º, I) + execução de
                política institucional acadêmica (art. 7º, IV)."
              />
              <PolicyCard
                title="Retenção"
                body="Coleta episódica. Coordenadas e IP bruto devem ser
                anonimizados após a exportação da sessão. Apenas o bit
                presente/ausente é necessário a longo prazo."
              />
            </div>

            <Card className="border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ShieldCheck className="size-4 text-primary" />
                  Um dispositivo, uma presença
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-relaxed">
                Este princípio é a <strong>única razão</strong> pela qual a
                plataforma coleta um identificador técnico do dispositivo. Sem
                ele, qualquer aluno presente poderia marcar a presença de
                terceiros ausentes. O identificador é session-scoped — nunca é
                usado para reconhecer o aluno entre disciplinas, entre
                semestres ou entre instituições.
              </CardContent>
            </Card>
          </Section>

          <Section
            id="exportacao"
            icon={FileSpreadsheet}
            title="Exportação SIGAA"
          >
            <p>
              Dois formatos de CSV são oferecidos no botão de download da
              sessão. Use cada um conforme a necessidade.
            </p>

            <div className="grid gap-3 lg:grid-cols-2">
              <ExportFormatCard
                icon={FileSpreadsheet}
                title="Formato SIGAA"
                badge="Padrão"
                purpose="Importar diretamente no módulo Diário Eletrônico → Lançar Frequência em Planilha."
                columns={["Matricula", "Nome_Discente", "Faltas", "Assinatura"]}
                technical={
                  <>
                    UTF-8 com BOM · delimitador <code>;</code> (ponto-e-vírgula,
                    convenção pt-BR) · quebra de linha <code>CRLF</code> ·
                    células com aspas, ponto-e-vírgula ou quebras de linha são
                    automaticamente escapadas conforme RFC 4180.
                  </>
                }
                note="O SIGAA rejeita o arquivo se a contagem de colunas, o delimitador ou a codificação divergirem. Não edite o CSV no Excel antes de importar — algumas versões removem o BOM ao salvar."
              />
              <ExportFormatCard
                icon={FileText}
                title="Relatório completo"
                badge="Auditoria"
                purpose="Registro forense interno do docente. Não importar no SIGAA — o arquivo tem mais colunas do que o SIGAA aceita."
                columns={[
                  "Matricula",
                  "Nome_Discente",
                  "Data_Assinatura",
                  "Hora_Assinatura",
                  "Registrado_Em_ISO",
                  "Distancia_Metros",
                  "Precisao_GPS_Metros",
                  "Latitude",
                  "Longitude",
                  "IP_Dispositivo",
                  "User_Agent",
                  "Fingerprint_SHA256",
                  "ID_Registro",
                ]}
                technical={
                  <>
                    Mesma codificação e delimitador da planilha SIGAA. Números
                    decimais com vírgula (convenção pt-BR). Coordenadas com 6
                    casas (~0,1 m de precisão). Datas no padrão{" "}
                    <code>dd/mm/aaaa</code>.
                  </>
                }
                note="Mantenha este arquivo em local seguro. Ele contém dados pessoais (IP, fingerprint) que devem ser tratados como confidenciais."
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Passo a passo da importação no SIGAA
                </CardTitle>
              </CardHeader>
              <Separator />
              <CardContent className="grid gap-2 text-sm">
                <ol className="grid list-decimal gap-1.5 pl-5">
                  <li>Baixe o CSV no formato <strong>SIGAA</strong>.</li>
                  <li>
                    Acesse o Portal do Docente → <em>Diário Eletrônico</em>.
                  </li>
                  <li>
                    Menu <em>&ldquo;Lançar Frequência em Planilha&rdquo;</em> ou{" "}
                    <em>&ldquo;Importação de Dados&rdquo;</em>.
                  </li>
                  <li>Selecione a turma e a aula correspondente.</li>
                  <li>Faça upload do arquivo CSV exatamente como baixado.</li>
                  <li>Confirme os dados na visualização prévia.</li>
                  <li>Clique em <strong>Salvar</strong>.</li>
                </ol>
              </CardContent>
            </Card>
          </Section>

          <Section id="boas-praticas" icon={BookOpenCheck} title="Boas práticas">
            <Tip
              icon={MapPin}
              title="Capture a localização dentro da sala"
              body="No momento de criar a sessão, use o botão Usar minha localização posicionado próximo ao centro físico da sala. Coordenadas capturadas no corredor ou na entrada podem deixar alunos legítimos fora do raio."
            />
            <Tip
              icon={Compass}
              title="Calibre o raio segundo a sala"
              body="Salas até 60 m² → 30 m. Salas maiores ou laboratórios em L → 50 m. Auditórios → 80–100 m. Raios muito grandes (>150 m) facilitam fraude em corredores e prédios vizinhos."
            />
            <Tip
              icon={Clock}
              title="Use janelas curtas (5 minutos)"
              body="Quanto menor a janela, mais difícil o aluno presente repassar o link para colega ausente em tempo hábil. Em aulas longas, é mais seguro abrir uma segunda sessão no meio do encontro do que estender uma única."
            />
            <Tip
              icon={QrCode}
              title="Projete o QR Code, não envie o link"
              body="O link inclui o token que valida a sessão. Compartilhar o link no grupo da turma anula parte da proteção espacial — embora a Regra 1 ainda bloqueie quem estiver fora da sala. Projetar é a única forma de garantir que a posse do link foi adquirida fisicamente."
            />
            <Tip
              icon={Download}
              title="Exporte e confira antes de fechar o sistema"
              body="Baixe ambos os CSVs ao final da aula. O SIGAA pode ficar indisponível em horários de pico — ter o arquivo local evita retrabalho. O relatório completo é sua trilha de auditoria caso alguma presença seja contestada."
            />
            <Tip
              icon={Database}
              title="Verifique o histórico periodicamente"
              body="Sessões encerradas seguem disponíveis na aba Histórico. Use o painel para acompanhar a evolução da frequência ao longo do semestre."
            />
          </Section>

          <Section id="limitacoes" icon={AlertTriangle} title="Limitações conhecidas">
            <LimitCard
              title="Não há autenticação de docente no protótipo"
              body="Qualquer pessoa com o id de uma sessão pode encerrá-la via API. Aceitável para apresentação acadêmica; obrigatório resolver antes de uso institucional. Versão futura usará SSO/CAS da UFPE."
            />
            <LimitCard
              title="Navegadores de privacidade afetam a impressão digital"
              body="Brave Shields e Firefox com resistFingerprinting habilitado randomizam o canvas a cada visita. Isso anula a regra do dispositivo único, mas a Regra 3 (matrícula única) continua protegendo. O aluno verá Permissão de localização funcionando normalmente."
            />
            <LimitCard
              title="GPS indoor tem precisão limitada"
              body="Em prédios sem visada para o céu, o sinal de GPS é fraco. O navegador combina com Wi-Fi e torres de celular, mas a precisão pode cair para 20–40 m. Em prédios densos, considere aumentar o raio em 10–20 m."
            />
            <LimitCard
              title="Job automatizado de purga LGPD não está implementado"
              body="A política de descarte está definida no termo de consentimento, mas a anonimização das coordenadas e do IP após a exportação ainda é manual. O job automatizado é o próximo passo no roadmap."
            />
            <LimitCard
              title="Sem suporte multi-instância em produção"
              body="A entrega de eventos em tempo real (SSE) usa um EventEmitter em memória. Para escalar com múltiplos processos Node, será necessário trocar por Redis pub/sub ou similar."
            />
            <LimitCard
              title="Coordenadas falsificadas via DevTools"
              body="Um aluno com conhecimento técnico pode usar as ferramentas de desenvolvedor do Chrome para informar coordenadas fabricadas dentro do raio. Em celulares reais, isso exige privilégios de root. As coordenadas brutas ficam no relatório completo para auditoria posterior."
            />
          </Section>

          <Section id="faq" icon={AlertOctagon} title="Dúvidas frequentes">
            <Faq
              q="O aluno pode marcar presença pelo navegador do desktop?"
              a="Tecnicamente sim, desde que a página seja servida em HTTPS e o desktop forneça coordenadas via GPS/Wi-Fi do dispositivo. Na prática, recomenda-se o uso do celular — a precisão é maior e o aluno está fisicamente próximo do QR Code."
            />
            <Faq
              q="O que acontece se o aluno fechar o navegador antes de ver o resultado?"
              a="A submissão ao servidor já terá ocorrido. A presença será registrada se passou nas regras. O aluno pode reabrir o link para conferir, mas a tentativa subsequente cairá em DUPLICATE_FINGERPRINT — comportamento esperado, presença já foi gravada."
            />
            <Faq
              q="O aluno pode marcar presença duas vezes na mesma aula?"
              a="Não. As regras 2 e 3 bloqueiam: a impressão digital do aparelho fica vinculada à matrícula na primeira submissão, e a matrícula fica vinculada à sessão. Qualquer nova tentativa retorna erro."
            />
            <Faq
              q="O que acontece se a permissão de localização for negada?"
              a="O servidor não recebe coordenadas e registra um RejectedAttempt com motivo GEO_DENIED. O aluno precisa reativar a permissão de localização nas configurações do navegador (no celular: ícone do cadeado na barra de endereço) e tentar novamente."
            />
            <Faq
              q="O sistema funciona offline?"
              a="Não. A submissão exige conexão para validar Haversine e gravar no banco. O aluno precisa estar em uma rede (Wi-Fi institucional ou dados móveis) no momento da marcação."
            />
            <Faq
              q="Quanto tempo o QR Code dura?"
              a="O padrão é 5 minutos, configurável de 1 a 180 minutos no momento de criação da sessão. Após o tempo, qualquer submissão retorna EXPIRED, mesmo se o link for compartilhado depois."
            />
            <Faq
              q="Posso exportar a planilha depois que a sessão for encerrada?"
              a="Sim. Sessões encerradas ou expiradas permanecem disponíveis na aba Histórico do painel. Os dois botões de exportação continuam funcionando indefinidamente — não há data de validade para o download."
            />
            <Faq
              q="O servidor armazena meu token do QR Code?"
              a="Não. O servidor armazena apenas o SHA-256 do token. O token bruto vive somente na URL e na sua tela durante a sessão. Mesmo um vazamento completo do banco de dados não permitiria a um atacante reconstruir tokens válidos."
            />
            <Faq
              q="Por que a Regra 1 não usa o IP do aluno?"
              a="Geolocalização por IP é trivialmente burlável com VPN ou proxy, e a precisão chega no máximo ao nível de cidade. Para validar presença em uma sala específica, é necessária a coordenada real do hardware, obtida via API de Geolocation do navegador."
            />
            <Faq
              q="O sistema considera atrasos como faltas?"
              a="Não. A coluna Faltas do CSV é sempre 0 para alunos presentes. Aluno que tentou marcar depois da expiração simplesmente não aparece na planilha SIGAA — o docente lança a falta manualmente conforme política da disciplina."
            />
          </Section>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
            <Link
              href="/"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              ← Voltar ao painel
            </Link>
            <Link
              href="/sessions/new"
              className={cn(buttonVariants({ size: "sm" }))}
            >
              <QrCode /> Abrir nova sessão
            </Link>
          </div>
        </article>
      </div>
    </main>
  );
}

const REJECTIONS = [
  {
    status: "401",
    reason: "INVALID_TOKEN",
    meaning: "Token adulterado ou assinatura HMAC inválida.",
    action: "Solicitar novo QR Code ao docente.",
  },
  {
    status: "409",
    reason: "DUPLICATE_FINGERPRINT",
    meaning: "Este dispositivo já registrou outra matrícula na sessão.",
    action: "Cada aluno marca presença no próprio celular.",
  },
  {
    status: "409",
    reason: "DUPLICATE_MATRICULA",
    meaning: "Esta matrícula já consta como presente.",
    action: "Conferir se a matrícula foi digitada corretamente.",
  },
  {
    status: "410",
    reason: "EXPIRED",
    meaning: "QR Code passou da validade.",
    action: "Solicitar novo QR Code ao docente.",
  },
  {
    status: "410",
    reason: "CLOSED",
    meaning: "Sessão foi encerrada manualmente pelo docente.",
    action: "Não é mais possível marcar nesta sessão.",
  },
  {
    status: "422",
    reason: "OUT_OF_RANGE",
    meaning: "Posição GPS fora do raio configurado.",
    action: "Aproximar-se do ponto central da sala.",
  },
  {
    status: "—",
    reason: "GEO_DENIED",
    meaning: "Permissão de localização foi negada no navegador.",
    action: "Liberar a permissão nas configurações e tentar novamente.",
  },
];

function Section({
  id,
  icon: Icon,
  title,
  children,
}: {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 grid gap-4">
      <div className="flex items-center gap-3 border-b border-border pb-3">
        <div className="grid size-8 place-items-center rounded-md bg-primary/10 text-primary">
          <Icon className="size-4" />
        </div>
        <h2 className="font-heading text-xl tracking-tight sm:text-2xl">
          {title}
        </h2>
      </div>
      <div className="grid gap-3 text-sm leading-relaxed text-foreground/85">
        {children}
      </div>
    </section>
  );
}

function Step({
  n,
  icon: Icon,
  title,
  body,
}: {
  n: number;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: React.ReactNode;
}) {
  return (
    <div className="grid gap-1 rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="grid size-5 place-items-center rounded-full bg-primary/10 font-mono text-[10px] font-semibold text-primary">
          {n}
        </span>
        <Icon className="size-3.5" />
        <span className="font-medium text-foreground">{title}</span>
      </div>
      <div className="pt-1 text-sm leading-relaxed text-foreground/85">
        {body}
      </div>
    </div>
  );
}

function RuleCard({
  icon: Icon,
  title,
  level,
  ok,
  ko,
  detail,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  level: "alta" | "média" | "baixa";
  ok: React.ReactNode;
  ko: React.ReactNode;
  detail: React.ReactNode;
}) {
  const levelVariant =
    level === "alta"
      ? ("destructive" as const)
      : level === "média"
        ? ("secondary" as const)
        : ("outline" as const);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Icon className="size-4 text-primary" />
            {title}
          </CardTitle>
          <Badge variant={levelVariant} className="text-[10px] uppercase">
            Severidade {level}
          </Badge>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="grid gap-3 text-sm">
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="grid gap-1 rounded-md border border-primary/20 bg-primary/5 p-3">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary">
              <CheckCircle2 className="size-3.5" /> Permitido
            </span>
            <span className="leading-relaxed">{ok}</span>
          </div>
          <div className="grid gap-1 rounded-md border border-destructive/30 bg-destructive/5 p-3">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-destructive">
              <XCircle className="size-3.5" /> Bloqueado
            </span>
            <span className="leading-relaxed">{ko}</span>
          </div>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          <strong className="text-foreground/80">Detalhe técnico — </strong>
          {detail}
        </p>
      </CardContent>
    </Card>
  );
}

function FraudCase({
  title,
  attack,
  defense,
}: {
  title: string;
  attack: string;
  defense: React.ReactNode;
}) {
  return (
    <div className="grid gap-2 rounded-md border bg-muted/20 p-3 text-sm">
      <p className="font-medium">{title}</p>
      <p className="leading-relaxed text-muted-foreground">
        <strong className="text-foreground/80">Tentativa — </strong>
        {attack}
      </p>
      <p className="leading-relaxed">
        <strong className="text-foreground/80">Defesa — </strong>
        {defense}
      </p>
    </div>
  );
}

function PrincipleCard({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="size-4 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm leading-relaxed">{body}</CardContent>
    </Card>
  );
}

function PolicyCard({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="grid gap-1 rounded-md border bg-card p-3">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </span>
      <p className="text-sm leading-relaxed">{body}</p>
    </div>
  );
}

function ExportFormatCard({
  icon: Icon,
  title,
  badge,
  purpose,
  columns,
  technical,
  note,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  badge: string;
  purpose: string;
  columns: string[];
  technical: React.ReactNode;
  note: string;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Icon className="size-4 text-primary" />
            {title}
          </CardTitle>
          <Badge variant="secondary" className="text-[10px] uppercase">
            {badge}
          </Badge>
        </div>
        <CardDescription>{purpose}</CardDescription>
      </CardHeader>
      <Separator />
      <CardContent className="grid gap-3 text-sm">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Colunas
          </span>
          <div className="mt-1 flex flex-wrap gap-1">
            {columns.map((c) => (
              <Badge key={c} variant="outline" className="font-mono text-[10px]">
                {c}
              </Badge>
            ))}
          </div>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          <strong className="text-foreground/80">Padrão técnico — </strong>
          {technical}
        </p>
        <p className="rounded-md bg-muted/40 p-2 text-xs leading-relaxed">
          <strong>Atenção — </strong>
          {note}
        </p>
      </CardContent>
    </Card>
  );
}

function Tip({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
}) {
  return (
    <div className="grid gap-1 rounded-md border bg-card p-3">
      <div className="flex items-center gap-2">
        <Icon className="size-4 text-primary" />
        <span className="font-medium text-sm">{title}</span>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}

function LimitCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="grid gap-1 rounded-md border border-dashed bg-muted/20 p-3">
      <span className="text-sm font-medium">{title}</span>
      <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <div className="grid gap-1 border-b border-border pb-3 last:border-b-0">
      <p className="font-medium text-sm">{q}</p>
      <p className="text-sm leading-relaxed text-muted-foreground">{a}</p>
    </div>
  );
}
