import { NextResponse } from "next/server"
import { put } from "@vercel/blob"

export const runtime = "nodejs"

export async function POST(request: Request) {
  console.log("========== UPLOAD REQUEST START ==========")

  try {
    console.log("Node env:", process.env.NODE_ENV)
    console.log(
      "BLOB_READ_WRITE_TOKEN exists:",
      !!process.env.BLOB_READ_WRITE_TOKEN
    )

    const formData = await request.formData()

    const entries = Array.from(formData.entries())
    console.log("FormData entries count:", entries.length)

    entries.forEach(([key, value]) => {
      console.log("FormData key:", key)

      if (value instanceof File) {
        console.log("File name:", value.name)
        console.log("File type:", value.type)
        console.log("File size:", value.size)
      } else {
        console.log("Value:", value)
      }
    })

    const files = formData.getAll("photos") as File[]

    console.log("Files received:", files.length)

    if (!files.length) {
      console.error("No files found in FormData")

      return NextResponse.json(
        {
          success: false,
          error: "No files uploaded",
        },
        { status: 400 }
      )
    }

    const uploadedUrls: string[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      console.log("--------------------------------")
      console.log("Processing file index:", i)

      if (!file) {
        console.error("File is null/undefined")
        continue
      }

      console.log("Name:", file.name)
      console.log("Type:", file.type)
      console.log("Size:", file.size)

      if (typeof file.arrayBuffer !== "function") {
        console.error("arrayBuffer is not available on file")
        continue
      }

      const safeName = `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}-${file.name.replace(/\s+/g, "_")}`

      console.log("Generated filename:", safeName)

      try {
        console.log("Starting Blob upload...")

        const blob = await put(safeName, file, {
          access: "public",
          contentType: file.type,
        })

        console.log("Blob upload successful")
        console.log("Blob URL:", blob.url)

        uploadedUrls.push(blob.url)
      } catch (blobError) {
        console.error("BLOB UPLOAD FAILED")
        console.error(blobError)

        if (blobError instanceof Error) {
          console.error("Message:", blobError.message)
          console.error("Stack:", blobError.stack)
        }

        throw blobError
      }
    }

    console.log("Upload completed")
    console.log("Uploaded files:", uploadedUrls.length)
    console.log("URLs:", uploadedUrls)

    console.log("========== UPLOAD REQUEST SUCCESS ==========")

    return NextResponse.json({
      success: true,
      files: uploadedUrls,
    })
  } catch (error) {
    console.error("========== UPLOAD REQUEST FAILED ==========")
    console.error("Full error:", error)

    if (error instanceof Error) {
      console.error("Error name:", error.name)
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    }

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 }
    )
  }
}