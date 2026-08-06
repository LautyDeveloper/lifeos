import type { Metadata } from "next"
import { JetBrains_Mono, Manrope } from "next/font/google"

import "./globals.css"

const sans = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
})

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "Life OS",
    template: "%s | Life OS",
  },
  description:
    "Tu sistema personal para capturar, decidir y avanzar con claridad.",
  openGraph: {
    title: "Life OS",
    description: "Capturá, organizá y ejecutá con foco.",
    type: "website",
    locale: "es_AR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Life OS",
    description: "Capturá, organizá y ejecutá con foco.",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${sans.variable} ${mono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full bg-background font-sans text-foreground">
        {children}
      </body>
    </html>
  )
}
