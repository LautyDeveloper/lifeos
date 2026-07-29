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
  title: {
    default: "Life OS",
    template: "%s | Life OS",
  },
  description:
    "A minimal operating system for your personal life: capture, organize, plan, and execute without friction.",
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
