import { SignupForm } from "@/components/auth/signup-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create your DataLens AI account and start analyzing data with AI",
}

export default function SignupPage() {
  return <SignupForm />
}
