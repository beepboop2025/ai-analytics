import Script from "next/script"
import { GTM_ID } from "@/lib/analytics/gtm"

export function GTMScript() {
  if (!GTM_ID) return null
  return (
    <Script
      id="gtm-script"
      strategy="afterInteractive"
      src={`https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`}
    />
  )
}

export function GTMNoScript() {
  if (!GTM_ID) return null
  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
      />
    </noscript>
  )
}
