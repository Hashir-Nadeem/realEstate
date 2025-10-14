import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

type SubmissionPayload = {
  formData: Record<string, any>
  location: { lat: number; lng: number } | null
  submittedAt?: string
}

const DATA_DIR = path.join(process.cwd(), "data")
const CSV_PATH = path.join(DATA_DIR, "submissions.csv")

const CSV_HEADERS = [
  "id",
  "submittedAt",
  "city",
  "locality",
  "fullAddress",
  "price",
  "priceUnit",
  "area",
  "areaUnit",
  "bedrooms",
  "bathrooms",
  "propertyCategory",
  "youAreHereTo",
  "title",
  "description",
  "contactPersonName",
  "email",
  "whatsapp",
  "youtubeLink",
  "tourLink",
  "lat",
  "lng",
  "photosCount",
  "uploadedImages",
  "facing",
  "floorNumber",
  "totalFloors",
]

// Escape values for CSV: wrap in double quotes, double any embedded quotes
function escapeCsv(value: any) {
  if (value === null || value === undefined) return '""'
  const s = String(value)
  // remove newlines to keep CSV tidy
  const cleaned = s.replace(/\r?\n/g, " ").replace(/\"/g, '""')
  return `"${cleaned}"`
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as SubmissionPayload

    // Ensure data directory exists
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true })
    }

    // If CSV doesn't exist, write headers
    if (!fs.existsSync(CSV_PATH)) {
      fs.writeFileSync(CSV_PATH, CSV_HEADERS.join(",") + "\n", { encoding: "utf8" })
    }

    const id = Date.now()
    const submittedAt = payload.submittedAt || new Date().toISOString()
    const f = payload.formData || {}
    const loc = payload.location || { lat: "", lng: "" }
    // prefer uploadedImages (URLs) if provided, otherwise fallback to client-side photos array
    const photosCount = Array.isArray(f.uploadedImages)
      ? f.uploadedImages.length
      : Array.isArray(f.photos)
      ? f.photos.length
      : 0

    const rowValues = [
      id,
      submittedAt,
      f.city ?? "",
      f.locality ?? "",
      f.fullAddress ?? "",
      f.price ?? "",
      f.priceUnit ?? "",
      f.area ?? "",
      f.areaUnit ?? "",
      f.bedrooms ?? "",
      f.bathrooms ?? "",
      f.propertyCategory ?? "",
      f.youAreHereTo ?? "",
      f.title ?? "",
      f.description ?? "",
      f.contactPersonName ?? "",
      f.email ?? "",
      f.whatsapp ?? "",
      f.youtubeLink ?? "",
      f.tourLink ?? "",
      loc.lat ?? "",
      loc.lng ?? "",
      photosCount,
      JSON.stringify(f.uploadedImages || []),
      f.facing ?? "",
      f.floorNumber ?? "",
      f.totalFloors ?? "",
    ]

    const csvLine = rowValues.map(escapeCsv).join(",") + "\n"

    // Append row atomically
    fs.appendFileSync(CSV_PATH, csvLine, { encoding: "utf8" })

    return NextResponse.json({ success: true, path: CSV_PATH })
  } catch (err) {
    console.error("Error saving submission:", err)
    return new NextResponse("Failed to save submission", { status: 500 })
  }
}
