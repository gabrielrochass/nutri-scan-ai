import type { Metadata } from "next";
import Link from "next/link";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Presença Geo · Verificação espacial de presença acadêmica",
  description:
    "Plataforma de controle de presença para o ambiente acadêmico, com validação por geofence, QR Code dinâmico, impressão digital de dispositivo e exportação para o SIGAA.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
          <div className="container mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div
                aria-hidden
                className="grid size-8 place-items-center rounded-md bg-primary text-primary-foreground font-heading text-sm font-semibold tracking-tight"
              >
                PG
              </div>
              <div className="grid leading-tight">
                <span className="font-heading text-sm font-semibold tracking-tight">
                  Presença Geo
                </span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Verificação espacial · acadêmico
                </span>
              </div>
            </Link>
            <nav className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors">
                Painel
              </Link>
              <Link
                href="/sessions/new"
                className="hover:text-foreground transition-colors"
              >
                Nova sessão
              </Link>
              <Link
                href="/docs"
                className="hover:text-foreground transition-colors"
              >
                Documentação
              </Link>
            </nav>
          </div>
        </header>
        {children}
        <footer className="border-t border-border bg-muted/30 py-6">
          <div className="container mx-auto grid max-w-6xl gap-1 px-4 text-center text-xs text-muted-foreground sm:flex sm:items-center sm:justify-between sm:text-left">
            <span>
              QR dinâmico · Geofence Haversine · Impressão digital de
              dispositivo · Exportação SIGAA
            </span>
            <span className="text-muted-foreground/80">
              Conforme LGPD · coleta episódica e descarte pós-aula
            </span>
          </div>
        </footer>
        <Toaster richColors closeButton position="top-right" />
      </body>
    </html>
  );
}
