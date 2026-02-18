import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "next-themes"
import { Toaster } from "@/components/ui/sonner"
import { AnalyticsProvider } from "@/lib/analytics/provider"
import { GTMScript, GTMNoScript } from "@/components/shared/gtm"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: {
    default: "DataLens AI — AI-Powered Data Analytics",
    template: "%s | DataLens AI",
  },
  description:
    "Upload datasets, analyze with AI, and generate insights in seconds. Natural language data analysis for everyone.",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "DataLens AI",
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
      <body className={`${inter.variable} font-sans antialiased`}>
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
