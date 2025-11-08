import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), "data")
const USERS_CSV_PATH = path.join(DATA_DIR, "users.csv")

const USERS_CSV_HEADERS = [
  "id",
  "name",
  "email",
  "phone",
  "password",
  "createdAt"
]

// Escape values for CSV: wrap in double quotes, double any embedded quotes
function escapeCsv(value: any) {
  if (value === null || value === undefined) return '""'
  const s = String(value)
  // remove newlines to keep CSV tidy
  const cleaned = s.replace(/\r?\n/g, " ").replace(/\"/g, '""')
  return `"${cleaned}"`
}

type UserRegistrationPayload = {
  id: string
  name: string
  email: string
  phone: string
  password: string
  createdAt: string
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as UserRegistrationPayload

    // Validate required fields
    if (!payload.id || !payload.name || !payload.email || !payload.phone || !payload.password) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    // Ensure data directory exists
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true })
    }

    // If CSV doesn't exist, write headers
    if (!fs.existsSync(USERS_CSV_PATH)) {
      const headerLine = USERS_CSV_HEADERS.map(escapeCsv).join(",") + "\n"
      fs.writeFileSync(USERS_CSV_PATH, headerLine, { encoding: "utf8" })
    }

    const rowValues = [
      payload.id,
      payload.name,
      payload.email,
      payload.phone,
      payload.password,
      payload.createdAt || new Date().toISOString(),
    ]

    const csvLine = rowValues.map(escapeCsv).join(",") + "\n"

    // Append row atomically
    fs.appendFileSync(USERS_CSV_PATH, csvLine, { encoding: "utf8" })

    return NextResponse.json({ 
      success: true, 
      message: "User registered successfully",
      userId: payload.id,
      csvPath: USERS_CSV_PATH 
    })
  } catch (err) {
    console.error("Error saving user to CSV:", err)
    return new NextResponse("Failed to save user registration", { status: 500 })
  }
}

export async function GET() {
  try {
    // Read and return all users for verification/debugging
    if (!fs.existsSync(USERS_CSV_PATH)) {
      return NextResponse.json({ users: [] })
    }

    const csv = fs.readFileSync(USERS_CSV_PATH, { encoding: "utf8" })
    const lines = csv.split(/\r?\n/).filter(Boolean)
    
    if (lines.length <= 1) {
      return NextResponse.json({ users: [] })
    }

    const users: Array<{
      id: string
      name: string
      email: string
      phone: string
      password: string
      createdAt: string
    }> = []
    const rows = lines.slice(1) // Skip header

    rows.forEach((row) => {
      const matches = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || []
      const vals = matches.map((v) => {
        // Remove surrounding quotes if present
        let value = v
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1)
        }
        // Restore escaped quotes
        value = value.replace(/""/g, '"')
        return value
      })

      if (vals.length >= 6) {
        const [id, name, email, phone, password, createdAt] = vals
        users.push({
          id: id || '',
          name: name || '',
          email: email || '',
          phone: phone || '',
          password: password || '', // In production, this should be hashed
          createdAt: createdAt || ''
        })
      }
    })

    return NextResponse.json({ users })
  } catch (err) {
    console.error("Error reading users CSV:", err)
    return new NextResponse("Failed to read users", { status: 500 })
  }
}