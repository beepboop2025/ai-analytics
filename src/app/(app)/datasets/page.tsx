"use client"

import { useCallback, useEffect, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { Database, FileUp, Loader2, Trash2, Eye, MessageSquare } from "lucide-react"
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
    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/datasets/upload", {
        method: "POST",
        body: formData,
      })
      if (res.ok) {
        toast.success(`"${file.name}" uploaded successfully`)
        fetchDatasets()
      } else {
        const data = await res.json()
        toast.error(data.error || "Upload failed")
      }
    } catch {
      toast.error("Upload failed")
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
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Datasets</h1>
        <p className="text-muted-foreground">Upload and manage your data files</p>
      </div>

      {/* Upload Zone */}
      <Card>
        <CardContent className="pt-6">
          <div
            {...getRootProps()}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
              isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
            }`}
          >
            <input {...getInputProps()} />
            {uploading ? (
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            ) : (
              <FileUp className="h-10 w-10 text-muted-foreground" />
            )}
            <p className="mt-4 text-sm font-medium">
              {isDragActive ? "Drop your file here" : "Drag & drop a file, or click to browse"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Supports CSV, Excel (.xlsx), and JSON
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Datasets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your Datasets</CardTitle>
          <CardDescription>{datasets.length} dataset{datasets.length !== 1 ? "s" : ""}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : datasets.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <Database className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-sm text-muted-foreground">No datasets yet. Upload your first file above.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Rows</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {datasets.map((ds) => (
                  <TableRow key={ds.id}>
                    <TableCell className="font-medium">{ds.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{ds.format.toUpperCase()}</Badge>
                    </TableCell>
                    <TableCell>{ds.rowCount.toLocaleString()}</TableCell>
                    <TableCell>{formatBytes(ds.fileSize)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(ds.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setPreview(ds)} title="Preview">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" asChild title="Analyze">
                          <Link href={`/analyze?dataset=${ds.id}`}>
                            <MessageSquare className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteDataset(ds.id)} title="Delete">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{preview?.name}</DialogTitle>
          </DialogHeader>
          {preview && (
            <div className="space-y-4">
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>{preview.format.toUpperCase()}</span>
                <span>{preview.rowCount.toLocaleString()} rows</span>
                <span>{preview.columns.length} columns</span>
              </div>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Column</TableHead>
                      <TableHead>Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.columns.map((col) => (
                      <TableRow key={col.name}>
                        <TableCell className="font-mono text-sm">{col.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{col.type}</Badge>
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
