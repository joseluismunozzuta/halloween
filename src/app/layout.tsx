import type { Metadata, Viewport } from "next";
import { Alfa_Slab_One, Share_Tech_Mono } from "next/font/google";
import "./globals.css";
import { EVENT_NAME } from "@/lib/event-config";

// Dos familias, ninguna más. El slab es la voz del cartel de circo; la mono es
// la voz del visor de la cámara, y se usa también para los textos de lectura:
// acá no hay párrafos largos, hay horas, nombres y frases cortas.
const alfaSlab = Alfa_Slab_One({
  variable: "--font-alfa-slab",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const shareMono = Share_Tech_Mono({
  variable: "--font-share-mono",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: `${EVENT_NAME} — 31 de octubre`,
  description:
    "Función única. Seis entran. Uno gana. Casa de Alexandra, 7:00 pm.",
};

export const viewport: Viewport = {
  themeColor: "#07070a",
  // El sitio es siempre oscuro; esto evita que el navegador pinte de blanco
  // los bordes al rebotar el scroll en iOS.
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      data-scroll-behavior="smooth"
      className={`${alfaSlab.variable} ${shareMono.variable} antialiased`}
    >
      <body className="bg-tape text-bone">{children}</body>
    </html>
  );
}
