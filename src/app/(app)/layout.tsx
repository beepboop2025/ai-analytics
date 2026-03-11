import { EmailVerificationBanner } from "@/components/shared/email-banner"
import { MobileSidebar } from "@/components/shared/mobile-sidebar"
import { Sidebar } from "@/components/shared/sidebar"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { UserMenu } from "@/components/shared/user-menu"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/40 bg-background/60 px-4 backdrop-blur-2xl shadow-[0_1px_3px_0_rgba(30,58,138,0.02)] md:px-6">
          <MobileSidebar />
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <UserMenu />
          </div>
        </header>
        <EmailVerificationBanner />
        <main className="flex-1 overflow-y-auto px-4 py-5 md:px-6 md:py-6">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
