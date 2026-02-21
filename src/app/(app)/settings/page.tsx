"use client"

import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { Loader2, Mail } from "lucide-react"

export default function SettingsPage() {
  const { data: session, update } = useSession()
  const [name, setName] = useState(session?.user?.name || "")
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState("")
  const [deleting, setDeleting] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [resending, setResending] = useState(false)

  const emailVerified = session?.user?.emailVerified

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      })
      if (res.ok) {
        await update({ name })
        toast.success("Profile updated")
      } else {
        toast.error("Failed to update profile")
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (deleteConfirm !== "DELETE") return
    setDeleting(true)
    try {
      const res = await fetch("/api/user/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation: "DELETE" }),
      })
      if (res.ok) {
        toast.success("Account deleted")
        signOut({ callbackUrl: "/" })
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to delete account")
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setDeleting(false)
    }
  }

  async function handleResendVerification() {
    setResending(true)
    try {
      const res = await fetch("/api/auth/verify-email/resend", { method: "POST" })
      if (res.ok) {
        toast.success("Verification email sent!")
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to send verification email")
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="flex items-center gap-2">
                <Input id="email" value={session?.user?.email || ""} disabled className="flex-1" />
                {!emailVerified && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleResendVerification}
                    disabled={resending}
                  >
                    {resending ? (
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    ) : (
                      <Mail className="mr-1 h-3 w-3" />
                    )}
                    Verify
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {emailVerified ? "Email verified" : "Email not verified — check your inbox or click Verify"}
              </p>
            </div>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save changes
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Manage your account settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Account ID</Label>
            <p className="mt-1 font-mono text-sm text-muted-foreground">{session?.user?.id}</p>
          </div>
          <Separator />
          <div>
            <h4 className="text-sm font-medium text-destructive">Danger Zone</h4>
            <p className="mt-1 text-sm text-muted-foreground">
              Permanently delete your account and all associated data.
            </p>
            <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setDeleteConfirm("") }}>
              <DialogTrigger asChild>
                <Button variant="destructive" size="sm" className="mt-3">
                  Delete Account
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Account</DialogTitle>
                  <DialogDescription>
                    This action is irreversible. All your datasets, reports, and subscription will be permanently deleted.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                  <Label htmlFor="delete-confirm">
                    Type <span className="font-mono font-bold">DELETE</span> to confirm
                  </Label>
                  <Input
                    id="delete-confirm"
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                    placeholder="DELETE"
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={deleteConfirm !== "DELETE" || deleting}
                  >
                    {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Permanently Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
