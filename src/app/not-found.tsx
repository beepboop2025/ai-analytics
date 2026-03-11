import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 text-center">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-primary/[0.04] via-transparent to-[oklch(0.72_0.08_200_/_0.04)] animate-gradient" />
      <div className="data-grid pointer-events-none absolute inset-0 -z-10 opacity-20" />
      <div className="animate-fade-in-up">
        <h1 className="text-7xl font-bold text-primary/80">404</h1>
        <p className="mt-4 text-xl font-medium">Page not found</p>
        <p className="mt-2 max-w-md text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button asChild className="btn-gradient">
            <Link href="/">Go Home</Link>
          </Button>
          <Button variant="outline" asChild className="rounded-full">
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
