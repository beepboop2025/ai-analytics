import { pushToDataLayer } from "./gtm"
import { captureEvent } from "./posthog"

export function track(event: string, properties?: Record<string, unknown>) {
  pushToDataLayer(event, properties)
  captureEvent(event, properties)
}

// Typed event helpers
export const events = {
  signupCompleted: (method: "google" | "email") =>
    track("signup_completed", { method }),

  datasetUploaded: (format: string, rowCount: number, fileSize: number) =>
    track("dataset_uploaded", { format, rowCount, fileSize }),

  aiQuerySent: (datasetId: string, promptLength: number) =>
    track("ai_query_sent", { datasetId, promptLength }),

  reportGenerated: (chartCount: number, insightCount: number) =>
    track("report_generated", { chartCount, insightCount }),

  checkoutStarted: (plan: string, price: number) =>
    track("checkout_started", { plan, price }),

  planUpgraded: (fromPlan: string, toPlan: string, value: number) =>
    track("plan_upgraded", { fromPlan, toPlan, value }),

  pageView: (path: string) =>
    track("page_view", { path }),
}
