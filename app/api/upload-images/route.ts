import { NextResponse } from "next/server"
import { put } from "@vercel/blob"

export const runtime = "nodejs"

export async function POST(request: Request) {
  console.log("========== UPLOAD REQUEST START ==========")

  try {
    // 🔐 Check env
    console.log(
      "BLOB_READ_WRITE_TOKEN exists:",
      !!process.env.BLOB_READ_WRITE_TOKEN
    )

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error("❌ Missing BLOB_READ_WRITE_TOKEN")
      return NextResponse.json(
        {
          success: false,
          error: "Missing BLOB_READ_WRITE_TOKEN in environment variables",
        },
        { status: 500 }
      )
    }

    // 📦 Parse form data
    const formData = await request.formData()

    console.log("📥 FormData received")

    const files = formData.getAll("photos") as File[]

    console.log("🖼️ Files received:", files?.length || 0)

    if (!files || files.length === 0) {
      console.error("❌ No files uploaded")

      return NextResponse.json(
        {
          success: false,
          error: "No files uploaded",
        },
        { status: 400 }
      )
    }

    const uploadedUrls: string[] = []

    // 🔄 Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      if (!file) {
        console.warn(`⚠️ Skipping null file at index ${i}`)
        continue
      }

      console.log("--------------------------------")
      console.log(`📄 File ${i + 1}/${files.length}`)
      console.log("Name:", file.name)
      console.log("Type:", file.type)
      console.log("Size:", file.size)

      try {
        // 🔑 Convert File → Buffer (IMPORTANT FIX)
        const buffer = await file.arrayBuffer()

        // 🧼 Safe filename
        const safeName = `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}-${file.name.replace(/\s+/g, "_")}`

        console.log("⬆️ Uploading to Vercel Blob:", safeName)

        // ☁️ Upload to Vercel Blob
        const blob = await put(safeName, buffer, {
          access: "public",
          contentType: file.type || "application/octet-stream",
        })

        console.log("✅ Upload success:", blob.url)

        uploadedUrls.push(blob.url)
      } catch (err) {
        console.error(`❌ Upload failed for file index ${i}`)

        if (err instanceof Error) {
          console.error("Message:", err.message)
          console.error("Stack:", err.stack)
        }

        // stop entire request OR continue (your choice)
        return NextResponse.json(
          {
            success: false,
            error: `Upload failed for file: ${file.name}`,
          },
          { status: 500 }
        )
      }
    }

    console.log("🎉 ALL UPLOADS COMPLETE")
    console.log("Total uploaded:", uploadedUrls.length)

    return NextResponse.json({
      success: true,
      files: uploadedUrls,
    })
  } catch (error) {
    console.error("========== UPLOAD REQUEST FAILED ==========")

    if (error instanceof Error) {
      console.error("Error:", error.message)
      console.error(error.stack)
    } else {
      console.error("Unknown error:", error)
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  } finally {
    console.log("========== UPLOAD REQUEST END ==========")
  }
}