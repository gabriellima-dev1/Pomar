import type { Metadata, Viewport } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["500", "600"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "800"],
});

export const metadata: Metadata = {
  title: { default: "Pomar", template: "%s · Pomar" },
  description: "Estude no ritmo do Pomodoro e veja seu pomar crescer.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // O modo escuro é opcional (tema automático); o padrão é o Clássico.
  themeColor: "#fbf6ec",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${fredoka.variable} ${nunito.variable} h-full antialiased`}
      // O tema do usuário entra no `data-theme` antes da hidratação (components/theme).
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
