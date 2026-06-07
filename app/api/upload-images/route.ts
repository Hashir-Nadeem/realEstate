import { NextResponse } from "next/server"
import { put } from "@vercel/blob"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const files = formData.getAll("photos") as File[]

    if (!files.length) {
      return NextResponse.json(
        {
          success: false,
          error: "No files uploaded",
        },
        { status: 400 }
      )
    }

    const uploadedUrls: string[] = []

    for (const file of files) {
      if (!file || typeof file.arrayBuffer !== "function") {
        continue
      }

      const safeName = `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}-${file.name.replace(/\s+/g, "_")}`

      const blob = await put(safeName, file, {
        access: "public",
        contentType: file.type,
      })

      uploadedUrls.push(blob.url)
    }

    return NextResponse.json({
      success: true,
      files: uploadedUrls,
    })
  } catch (error) {
    console.error("upload-images error:", error)

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to upload images",
      },
      { status: 500 }
    )
  }
}