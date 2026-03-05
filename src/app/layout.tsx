import type { Metadata } from "next"
import { IBM_Plex_Mono, Manrope } from "next/font/google"
import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "next-themes"
import { Toaster } from "@/components/ui/sonner"
import { AnalyticsProvider } from "@/lib/analytics/provider"
import { GTMScript, GTMNoScript } from "@/components/shared/gtm"
import "./globals.css"

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" })
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-plex-mono",
})

export const metadata: Metadata = {
  title: {
    default: "DataLens AI | Decision Intelligence for Ops Teams",
    template: "%s | DataLens AI",
  },
  description:
    "Upload operational datasets, ask questions in plain English, and turn raw exports into executive-ready summaries, charts, and reports.",
  keywords: [
    "AI analytics",
    "decision intelligence",
    "business analytics software",
    "operations dashboard",
    "dataset analysis",
    "report automation",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "DataLens AI",
    title: "DataLens AI | Decision Intelligence for Ops Teams",
    description:
      "A production-ready analytics workspace for finance, revenue ops, and product teams working from exports and operational data.",
  },
  twitter: {
    card: "summary_large_image",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <GTMScript />
      </head>
      <body className={`${manrope.variable} ${plexMono.variable} font-sans antialiased`}>
        <GTMNoScript />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SessionProvider>
            <AnalyticsProvider>
              {children}
              <Toaster richColors position="bottom-right" />
            </AnalyticsProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
