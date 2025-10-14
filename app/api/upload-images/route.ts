import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const files = formData.getAll("photos") as any[]

    const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads")
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true })
    }

    const saved: string[] = []

    for (const file of files) {
      if (!file || typeof file.arrayBuffer !== "function") continue
      const buffer = Buffer.from(await file.arrayBuffer())
      const originalName = (file as any).name || "upload.jpg"
      const safeName = `${Date.now()}-${Math.random().toString(36).slice(2,8)}-${originalName.replace(/\s+/g, "_")}`
      const outPath = path.join(UPLOAD_DIR, safeName)
      fs.writeFileSync(outPath, buffer)
      saved.push(`/uploads/${safeName}`)
    }

    return NextResponse.json({ success: true, files: saved })
  } catch (err) {
    console.error("upload-images error:", err)
    return new NextResponse("Failed to upload images", { status: 500 })
  }
}
