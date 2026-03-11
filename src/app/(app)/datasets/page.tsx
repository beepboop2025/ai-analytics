"use client"

import { useCallback, useEffect, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { Database, FileUp, Loader2, Trash2, Eye, MessageSquare, Upload, CheckCircle2 } from "lucide-react"
import Link from "next/link"

interface Dataset {
  id: string
  name: string
  fileName: string
  format: string
  rowCount: number
  fileSize: number
  columns: { name: string; type: string }[]
  createdAt: string
}

export default function DatasetsPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [preview, setPreview] = useState<Dataset | null>(null)

  const fetchDatasets = useCallback(async () => {
    try {
      const res = await fetch("/api/datasets")
      if (res.ok) setDatasets(await res.json())
    } catch {
      toast.error("Failed to load datasets")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchDatasets() }, [fetchDatasets])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setUploading(true)
    setUploadProgress(0)
    setUploadSuccess(false)

    // Simulate progress since fetch doesn't expose upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => Math.min(prev + Math.random() * 15, 85))
    }, 300)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/datasets/upload", {
        method: "POST",
        body: formData,
      })
      clearInterval(progressInterval)

      if (res.ok) {
        setUploadProgress(100)
        setUploadSuccess(true)
        toast.success(`"${file.name}" uploaded successfully`)
        fetchDatasets()
        // Reset after showing success
        setTimeout(() => {
          setUploadSuccess(false)
          setUploadProgress(0)
        }, 2000)
      } else {
        const data = await res.json()
        toast.error(data.error || "Upload failed")
        setUploadProgress(0)
      }
    } catch {
      clearInterval(progressInterval)
      toast.error("Upload failed")
      setUploadProgress(0)
    } finally {
      setUploading(false)
    }
  }, [fetchDatasets])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
      "application/json": [".json"],
    },
    maxFiles: 1,
    disabled: uploading,
  })

  async function deleteDataset(id: string) {
    try {
      const res = await fetch(`/api/datasets?id=${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Dataset deleted")
        setDatasets((prev) => prev.filter((d) => d.id !== id))
      } else {
        toast.error("Failed to delete dataset")
      }
    } catch {
      toast.error("Failed to delete dataset")
    }
  }

  function formatBytes(bytes: number) {
    if (bytes <= 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
  }

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold">Datasets</h1>
        <p className="text-muted-foreground">Upload and manage your data files</p>
      </div>

      {/* Upload Zone */}
      <Card className="surface-panel border-border/50 animate-fade-in-up animate-delay-100">
        <CardContent className="pt-6">
          <div
            {...getRootProps()}
            className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 transition-all duration-400 ${
              isDragActive
                ? "border-primary bg-primary/[0.06] scale-[1.02] animate-glow-pulse shadow-[0_0_32px_-8px_rgba(30,58,138,0.15)]"
                : uploadSuccess
                ? "border-green-500/50 bg-green-500/[0.04] shadow-[0_0_24px_-8px_rgba(34,197,94,0.15)]"
                : "border-muted-foreground/20 hover:border-primary/40 hover:bg-primary/[0.03] hover:shadow-[0_4px_24px_-8px_rgba(30,58,138,0.08)]"
            }`}
          >
            <input {...getInputProps()} />
            {uploadSuccess ? (
              <div className="animate-check-pop">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
              </div>
            ) : uploading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <Progress value={uploadProgress} className="w-48" />
                <p className="text-sm text-muted-foreground">{Math.round(uploadProgress)}% uploading...</p>
              </div>
            ) : isDragActive ? (
              <div className="animate-scale-in">
                <Upload className="h-12 w-12 text-primary" />
              </div>
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/[0.06] transition-all duration-300 group-hover:bg-primary/10 group-hover:scale-110">
                <FileUp className="h-8 w-8 text-muted-foreground transition-colors duration-300 group-hover:text-primary" />
              </div>
            )}
            <p className="mt-4 text-sm font-medium">
              {uploadSuccess
                ? "Upload complete!"
                : isDragActive
                ? "Drop your file here"
                : "Drag & drop a file, or click to browse"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Supports CSV, Excel (.xlsx), and JSON
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Datasets Table */}
      <Card className="surface-panel border-border/50 animate-fade-in-up animate-delay-200">
        <CardHeader>
          <CardTitle>Your Datasets</CardTitle>
          <CardDescription>{datasets.length} dataset{datasets.length !== 1 ? "s" : ""}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          ) : datasets.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center animate-fade-in-up">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <Database className="h-7 w-7 text-primary/60" />
              </div>
              <p className="mt-4 text-sm text-muted-foreground">No datasets yet. Upload your first file above.</p>
            </div>
          ) : (
            <div className="rounded-xl border border-border/40 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/40 hover:bg-transparent">
                    <TableHead>Name</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead>Rows</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {datasets.map((ds, i) => (
                    <TableRow
                      key={ds.id}
                      className={`border-border/30 transition-all duration-200 hover:bg-primary/[0.03] animate-fade-in-up animate-delay-${Math.min((i + 1) * 100, 500)}`}
                    >
                      <TableCell className="font-medium">{ds.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="rounded-full">{ds.format.toUpperCase()}</Badge>
                      </TableCell>
                      <TableCell>{ds.rowCount.toLocaleString()}</TableCell>
                      <TableCell>{formatBytes(ds.fileSize)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(ds.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => setPreview(ds)} title="Preview" className="rounded-xl transition-all duration-200 hover:bg-primary/5">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" asChild title="Analyze" className="rounded-xl transition-all duration-200 hover:bg-primary/5">
                            <Link href={`/analyze?dataset=${ds.id}`}>
                              <MessageSquare className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteDataset(ds.id)} title="Delete" className="rounded-xl transition-all duration-200 hover:bg-destructive/5">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
        <DialogContent className="max-w-2xl rounded-2xl border-border/50 bg-background/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle>{preview?.name}</DialogTitle>
          </DialogHeader>
          {preview && (
            <div className="space-y-4 animate-fade-in-up">
              <div className="flex gap-4 text-sm text-muted-foreground">
                <Badge variant="outline" className="rounded-full">{preview.format.toUpperCase()}</Badge>
                <span>{preview.rowCount.toLocaleString()} rows</span>
                <span>{preview.columns.length} columns</span>
              </div>
              <div className="rounded-xl border border-border/40 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/40 hover:bg-transparent">
                      <TableHead>Column</TableHead>
                      <TableHead>Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.columns.map((col) => (
                      <TableRow key={col.name} className="border-border/30 transition-all duration-200 hover:bg-primary/[0.03]">
                        <TableCell className="font-mono text-sm">{col.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="rounded-full">{col.type}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
