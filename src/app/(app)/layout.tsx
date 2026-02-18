import { Sidebar } from "@/components/shared/sidebar"
import { UserMenu } from "@/components/shared/user-menu"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { MobileSidebar } from "@/components/shared/mobile-sidebar"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b px-4 md:px-6">
          <MobileSidebar />
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <UserMenu />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
