export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      {/* Animated gradient background */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-primary/[0.06] via-muted/30 to-[oklch(0.72_0.08_200_/_0.06)] animate-gradient" />
      <div className="pointer-events-none absolute -left-32 -top-32 -z-10 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,_oklch(0.78_0.06_240_/_0.30),transparent_70%)] blur-3xl animate-float" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 -z-10 h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,_oklch(0.82_0.05_200_/_0.25),transparent_70%)] blur-3xl animate-float [animation-delay:2s]" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 -z-10 h-[20rem] w-[20rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_oklch(0.78_0.05_280_/_0.12),transparent_70%)] blur-3xl animate-float [animation-delay:4s]" />
      <div className="data-grid pointer-events-none absolute inset-0 -z-10 opacity-[0.15]" />

      <div className="w-full max-w-md animate-fade-in-up">{children}</div>
    </div>
  )
}
