import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { propertyData as builtInProperties } from "@/data/properties"

const DATA_DIR = path.join(process.cwd(), "data")
const CSV_PATH = path.join(DATA_DIR, "submissions.csv")

// helper to unescape CSV quoted value
function unescapeCsvValue(v: string) {
  if (!v) return ""
  // remove surrounding quotes if present
  let value = v
  if (value.startsWith('"') && value.endsWith('"')) {
    value = value.slice(1, -1)
  }
  // restore escaped quotes
  value = value.replace(/""/g, '"')
  return value
}

export async function GET() {
  try {
    const results = [...builtInProperties]

    if (fs.existsSync(CSV_PATH)) {
      const csv = fs.readFileSync(CSV_PATH, { encoding: "utf8" })
      const lines = csv.split(/\r?\n/).filter(Boolean)
      if (lines.length > 1) {
        const header = lines[0].split(",")
        const rows = lines.slice(1)
        rows.forEach((row, idx) => {
          // simple CSV split (we assume values are quoted) - handle commas in quotes
          const matches = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || []
          const vals = matches.map((v) => unescapeCsvValue(v))
          // Map columns according to CSV_HEADERS used in save route
          const [
            id,
            submittedAt,
            city,
            locality,
            fullAddress,
            price,
            priceUnit,
            area,
            areaUnit,
            bedrooms,
            bathrooms,
            propertyCategory,
            youAreHereTo,
            title,
            description,
            contactPersonName,
            email,
            whatsapp,
            youtubeLink,
            tourLink,
            lat,
            lng,
            photosCount,
            uploadedImages,
            facing,
            floorNumber,
            totalFloors,
          ] = vals

          let imageUrl = ""
          try {
            const images = JSON.parse(uploadedImages || "[]")
            if (Array.isArray(images) && images.length > 0) {
              imageUrl = images[0]
            }
          } catch (e) {
            // ignore parse error
          }

          // Format price
          let formattedPrice = "Price on request"
          if (price && priceUnit) {
            const priceNum = parseFloat(price)
            if (!isNaN(priceNum)) {
              const unit = priceUnit.charAt(0).toUpperCase() + priceUnit.slice(1).toLowerCase()
              formattedPrice = `₹${price} ${unit.replace("Crore", "Cr")}`
            }
          }

          // Create a property-like object
          const p: any = {
            id: Number(id) || `csv-${Date.now()}-${idx}`,
            lat: parseFloat(lat) || undefined,
            lng: parseFloat(lng) || undefined,
            type: youAreHereTo === "sell" ? "sale" : "rental",
            price: formattedPrice,
            title: title || (fullAddress || "Submitted Property"),
            area: area ? `${area} ${areaUnit}` : "",
            city: city || "",
            imageUrl: imageUrl,
            beds: bedrooms ? Number(bedrooms) : undefined,
            baths: bathrooms ? Number(bathrooms) : undefined,
            sqft: area ? Number(area) : undefined,
            address: fullAddress || "",
            has3DTour: !!tourLink,
            source: "csv",
            submittedAt,
            contactPersonName,
            email,
            whatsapp,
            youtubeLink,
            tourLink,
            photosCount: Number(photosCount) || 0,
            facing: facing || "",
            floorNumber: floorNumber || "",
            totalFloors: totalFloors || "",
          }

          // only include if lat/lng are present
          if (typeof p.lat === "number" && typeof p.lng === "number" && !isNaN(p.lat) && !isNaN(p.lng)) {
            results.push(p)
          }
        })
      }
    }

    return NextResponse.json(results)
  } catch (err) {
    console.error("Error reading properties:", err)
    return new NextResponse("Failed to read properties", { status: 500 })
  }
}
