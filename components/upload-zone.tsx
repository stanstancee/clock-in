"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Upload, FileSpreadsheet } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { ClockInRecord } from "@/app/page"

type UploadZoneProps = {
  onUpload: (data: ClockInRecord[]) => void
}

export function UploadZone({ onUpload }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const parseCSV = (text: string): ClockInRecord[] => {
    const lines = text.trim().split("\n")
    const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""))

    console.log("[v0] CSV Headers:", headers)

    const records: ClockInRecord[] = []

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      // Parse CSV line handling quoted values
      const values: string[] = []
      let current = ""
      let inQuotes = false

      for (let j = 0; j < line.length; j++) {
        const char = line[j]

        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === "," && !inQuotes) {
          values.push(current.trim().replace(/^"|"$/g, ""))
          current = ""
        } else {
          current += char
        }
      }
      values.push(current.trim().replace(/^"|"$/g, ""))

      const record: any = {}

      headers.forEach((header, index) => {
        const value = values[index] || ""

        // Parse based on header name
        if (header === "id" || header === "user_ref" || header === "user_id" || header === "role" || header === "otp") {
          record[header] = value && value !== "NULL" ? Number.parseInt(value) || 0 : 0
        } else if (header === "latitude" || header === "longitude") {
          record[header] = value && value !== "NULL" ? Number.parseFloat(value) || 0 : 0
        } else if (header === "phone") {
          record[header] = value
        } else {
          record[header] = value === "NULL" ? null : value
        }
      })

      records.push(record as ClockInRecord)
    }

    console.log("[v0] Parsed records:", records.length)
    console.log("[v0] Sample record:", records[0])

    return records
  }

  const handleFile = async (file: File) => {
    setIsProcessing(true)

    try {
      const text = await file.text()
      console.log("[v0] File loaded, size:", text.length)
      const data = parseCSV(text)
      console.log("[v0] Calling onUpload with", data.length, "records")
      onUpload(data)
    } catch (error) {
      console.error("[v0] Error parsing CSV:", error)
      alert("Error parsing CSV file. Please check the file format.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file && file.name.endsWith(".csv")) {
      handleFile(file)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  return (
    <Card className="p-8">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
          isDragging ? "border-blue-500 bg-blue-50" : "border-slate-300 bg-slate-50/50"
        }`}
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className={`h-16 w-16 rounded-full flex items-center justify-center transition-colors ${
              isDragging ? "bg-blue-100" : "bg-slate-100"
            }`}
          >
            {isProcessing ? (
              <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Upload className={`h-8 w-8 ${isDragging ? "text-blue-600" : "text-slate-600"}`} />
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-slate-900">
              {isProcessing ? "Processing..." : "Upload Clock-In Data"}
            </h3>
            <p className="text-sm text-slate-600">Drag and drop your CSV file here, or click to browse</p>
          </div>

          <input
            type="file"
            accept=".csv"
            onChange={handleFileInput}
            className="hidden"
            id="file-upload"
            disabled={isProcessing}
          />

          <Button asChild disabled={isProcessing}>
            <label htmlFor="file-upload" className="cursor-pointer">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Select CSV File
            </label>
          </Button>

          <p className="text-xs text-slate-500 mt-4">Expected format: user_locations.csv with clock-in timestamps</p>
        </div>
      </div>
    </Card>
  )
}
