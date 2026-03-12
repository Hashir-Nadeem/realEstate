interface Property {
  id: number | string
  imageUrl?: string | null
  images?: (string | null)[]
  photos?: (string | null)[]
  uploadedImages?: (string | null)[]
  title: string
  beds?: number | string
  baths?: number | string
  area?: string
  sqft?: number
  address?: string
  floorNumber?: string
  totalFloors?: string
  facing?: string
  locality?: string
  city?: string
  type: string
  price: string | number
}

export const generatePropertyPopupContent = (
  property: Property
): string => {

  const sanitize = (val?: string | null) => {
    if (!val) return null
    if (val === "null" || val === "undefined") return null
    if (val === "/no-image.png") return null
    return val.trim()
  }

  // ⭐ IMPORTANT — LOAD ONLY THROUGH NEXT PUBLIC
  const buildImageUrl = (img?: string | null) => {
    const clean = sanitize(img)

    if (!clean) return "/placeholder.jpg"

    if (clean.startsWith("http")) return clean

    // images already inside /public/uploads
    return clean.startsWith("/") ? clean : `/${clean}`
  }

  const pickImage = (): string => {

    const candidates = [
      property.uploadedImages?.[0],
      property.imageUrl,
      property.images?.[0],
      property.photos?.[0],
    ]

    for (const c of candidates) {
      const valid = sanitize(c)
      if (valid) {
        return buildImageUrl(valid)
      }
    }

    return "/placeholder.jpg"
  }

  const img = pickImage()
const popupContent = `
<div style="
  width:280px;
  background:#ffffff;
  border-radius:16px;
  overflow:hidden;
  box-shadow:0 12px 30px rgba(0,0,0,0.18);
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial;
  cursor:pointer;
  transition:0.25s;
">

  <div onclick="window.propertyDetailsHandler('${property.id}')">

    <!-- IMAGE -->
    <div style="position:relative;height:170px;background:#f1f3f6">
      <img 
        src="${img}" 
        style="width:100%;height:100%;object-fit:cover"
        loading="lazy"
        onerror="this.onerror=null;this.src='/placeholder.jpg'"
      />

      <!-- TYPE BADGE -->
      <div style="
        position:absolute;
        top:10px;
        left:10px;
        background:rgba(0,0,0,0.65);
        color:white;
        padding:4px 10px;
        border-radius:20px;
        font-size:11px;
        font-weight:600;
        letter-spacing:.3px;
      ">
        ${property.type?.toUpperCase() || "PROPERTY"}
      </div>
    </div>

    <!-- CONTENT -->
    <div style="padding:14px 16px">

      <!-- PRICE -->
      <div style="
        font-size:20px;
        font-weight:700;
        color:#111;
        margin-bottom:6px;
      ">
        ₹ ${property.price}
      </div>

      <!-- TITLE / BEDS -->
      <div style="
        font-size:13px;
        color:#444;
        font-weight:600;
        margin-bottom:8px;
      ">
        ${property.beds || "--"} Beds • ${property.baths || "--"} Baths
        ${property.sqft ? " • " + property.sqft + " sqft" : ""}
      </div>

      <!-- LOCATION -->
      <div style="
        font-size:13px;
        color:#777;
        line-height:1.4;
      ">
        ${property.locality || ""}
        ${property.city ? ", " + property.city : ""}
      </div>

    </div>

  </div>
</div>
`
  return popupContent
}