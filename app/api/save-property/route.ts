import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

type SubmissionPayload = {
  formData?: Record<string, any>
  location?: { lat: number; lng: number } | null
  submittedAt?: string
  // For contact requests
  propertyId?: string | number
  name?: string
  email?: string
  whatsapp?: string
  type?: string
}

const DATA_DIR = path.join(process.cwd(), "data")
const CSV_PATH = path.join(DATA_DIR, "submissions.csv")
const LEADS_CSV_PATH = path.join(DATA_DIR, "leads.csv")

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

const LEADS_CSV_HEADERS = [
  "id",
  "submittedAt", 
  "propertyId",
  "name",
  "email",
  "whatsapp",
  "type"
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

    // Handle contact requests separately
    if (payload.type === 'contact_request') {
      // Handle leads CSV
      if (!fs.existsSync(LEADS_CSV_PATH)) {
        fs.writeFileSync(LEADS_CSV_PATH, LEADS_CSV_HEADERS.join(",") + "\n", { encoding: "utf8" })
      }

      const leadId = Date.now()
      const submittedAt = new Date().toISOString()
      
      const leadValues = [
        leadId,
        submittedAt,
        payload.propertyId ?? "",
        payload.name ?? "",
        payload.email ?? "",
        payload.whatsapp ?? "",
        payload.type ?? ""
      ]

      const leadCsvLine = leadValues.map(escapeCsv).join(",") + "\n"
      fs.appendFileSync(LEADS_CSV_PATH, leadCsvLine, { encoding: "utf8" })

      return NextResponse.json({ success: true, type: 'lead', path: LEADS_CSV_PATH })
    }

    // Handle property submissions (existing logic)
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

    return NextResponse.json({ success: true, type: 'property', path: CSV_PATH })
  } catch (err) {
    console.error("Error saving submission:", err)
    return new NextResponse("Failed to save submission", { status: 500 })
  }
}
