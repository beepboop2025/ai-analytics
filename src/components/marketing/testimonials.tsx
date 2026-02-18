import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const testimonials = [
  {
    quote:
      "DataLens AI replaced our entire BI team's ad-hoc analysis workflow. What used to take hours now takes minutes.",
    name: "Sarah Chen",
    role: "VP of Product, TechFlow",
    initials: "SC",
  },
  {
    quote:
      "I upload our monthly sales CSVs and get instant insights. The AI finds patterns I would have never spotted manually.",
    name: "Marcus Johnson",
    role: "Founder, RetailMetrics",
    initials: "MJ",
  },
  {
    quote:
      "The natural language queries are incredible. I just ask questions and get charts and answers. No SQL, no Python.",
    name: "Emily Rodriguez",
    role: "Business Analyst, DataDriven Co",
    initials: "ER",
  },
]

export function Testimonials() {
  return (
    <section className="bg-muted/30 px-4 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Loved by data teams everywhere
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            See what our users are saying about DataLens AI
          </p>
        </div>
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {testimonials.map((t) => (
            <Card key={t.name} className="border-0 bg-background">
              <CardContent className="pt-6">
                <p className="text-muted-foreground">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-6 flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {t.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-medium">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
