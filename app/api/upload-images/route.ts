import { NextResponse } from "next/server"
import { put } from "@vercel/blob"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    // Verify token exists
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        {
          success: false,
          error: "BLOB_READ_WRITE_TOKEN is not configured",
        },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const files = formData.getAll("photos") as File[]

    const saved: string[] = []

    for (const file of files) {
      if (!file || typeof file.arrayBuffer !== "function") continue

      const safeName = `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}-${file.name.replace(/\s+/g, "_")}`

      const blob = await put(safeName, file, {
        access: "public",
      })

      saved.push(blob.url)
    }

    return NextResponse.json({
      success: true,
      files: saved,
    })
  } catch (err) {
    console.error("upload-images error:", err)

    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Upload failed",
      },
      { status: 500 }
    )
  }
}