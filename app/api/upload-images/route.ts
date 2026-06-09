import { NextResponse } from "next/server"
import sharp from "sharp"

export const runtime = "nodejs"

export async function POST(request: Request) {
  console.log("========== IMAGE PROCESSING START ==========")

  try {
    const formData = await request.formData()

    console.log("📥 FormData received")

    const files = formData.getAll("photos") as File[]

    console.log("Files received:", files?.length || 0)

    if (!files.length) {
      return NextResponse.json(
        {
          success: false,
          error: "No files uploaded",
        },
        { status: 400 }
      )
    }

    const processedImages: {
      fileName: string
      contentType: string
      data: string
    }[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      try {
        const buffer = Buffer.from(await file.arrayBuffer())

        const processedBuffer = await sharp(buffer)
          .resize({
            width: 1200,
            withoutEnlargement: true,
          })
          .jpeg({
            quality: 80,
            mozjpeg: true,
          })
          .toBuffer()

        console.log(
          `✅ Compressed: ${buffer.length} -> ${processedBuffer.length}`
        )

        processedImages.push({
          fileName: file.name,
          contentType: "image/jpeg",
          data: processedBuffer.toString("base64"),
        })
      } catch (err) {
        console.error(`❌ Failed processing ${file.name}`, err)

        return NextResponse.json(
          {
            success: false,
            error: `Failed processing ${file.name}`,
          },
          { status: 500 }
        )
      }
    }

    console.log("🎉 PROCESSING COMPLETE")
    console.log("Total processed:", processedImages.length)

    return NextResponse.json({
      success: true,
      files: processedImages,
    })
  } catch (error) {
    console.error("========== PROCESSING FAILED ==========")

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  } finally {
    console.log("========== PROCESSING END ==========")
  }
}