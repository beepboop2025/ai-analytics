import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "relative overflow-hidden rounded-md bg-accent/60",
        "before:absolute before:inset-0 before:animate-shimmer",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
