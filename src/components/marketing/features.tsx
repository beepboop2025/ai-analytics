import { BarChart3, Brain, FileUp, MessageSquare, FileText, Shield } from "lucide-react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const features = [
  {
    icon: Brain,
    title: "AI-Powered Analysis",
    description:
      "Ask questions about your data in plain English. Get patterns, anomalies, and insights instantly.",
  },
  {
    icon: BarChart3,
    title: "Smart Visualizations",
    description:
      "AI recommends the best chart types. Interactive graphs that tell your data's story clearly.",
  },
  {
    icon: FileUp,
    title: "Multi-Format Upload",
    description:
      "Drop CSV, Excel, or JSON files. Auto-detection of schemas, data types, and structure.",
  },
  {
    icon: MessageSquare,
    title: "Natural Language Queries",
    description:
      'No SQL required. Ask "What\'s the trend in Q4 sales?" and get a comprehensive answer.',
  },
  {
    icon: FileText,
    title: "Report Generation",
    description:
      "Compile analyses into shareable reports. Export as PDF or share via link with your team.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description:
      "Data encryption at rest and in transit. Role-based access control and complete audit logging.",
  },
]

export function Features() {
  return (
    <section id="features" className="px-4 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to analyze data
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            From upload to insight in minutes. No technical skills required.
          </p>
        </div>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="border-0 bg-muted/50 transition-colors hover:bg-muted">
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
