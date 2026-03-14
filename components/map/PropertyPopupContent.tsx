interface Property {
  id: number | string
  imageUrl?: string | null
  images?: (string | null)[]
  photos?: (string | null)[]
  uploadedImages?: (string | null)[]
  title?: string

  beds?: number | string
  baths?: number | string

  bedrooms?: number | string
  bathrooms?: number | string
  bhk?: number | string

  area?: string
  sqft?: number

  address?: string
  locality?: string
  city?: string

  type?: string
  price?: string | number
  amount?: string | number
  expectedPrice?: string | number
}

export const generatePropertyPopupContent = (
  property: Property
): string => {

  const sanitize = (val?: any) => {
    if (!val && val !== 0) return null
    if (val === "null" || val === "undefined") return null
    return String(val)
  }

  // ⭐ IMAGE BUILDER
  const buildImageUrl = (img?: string | null) => {
    const clean = sanitize(img)
    if (!clean) return "/placeholder.jpg"
    if (clean.startsWith("http")) return clean
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
      if (valid) return buildImageUrl(valid)
    }

    return "/placeholder.jpg"
  }

  const img = pickImage()

  // ⭐ PRICE DETECTOR (INR FORMAT)
  const rawPrice =
    property.price ??
    property.amount ??
    property.expectedPrice ??
    0

  const priceFormatted =
    rawPrice
      ? `₹ ${Number(rawPrice).toLocaleString("en-IN")}`
      : "₹ 0"

  // ⭐ BEDS DETECTOR
  const beds =
    property.beds ??
    property.bedrooms ??
    property.bhk ??
    "--"

  // ⭐ BATHS DETECTOR
  const baths =
    property.baths ??
    property.bathrooms ??
    "--"

  // ⭐ LOCATION DETECTOR
  const location =
    property.address ||
    `${property.locality || ""}${property.city ? ", " + property.city : ""}` ||
    "Location"

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

  <div>

    <div style="position:relative;height:170px;background:#f1f3f6">
      <img 
        src="${img}" 
        style="width:100%;height:100%;object-fit:cover"
        loading="lazy"
        onerror="this.onerror=null;this.src='/placeholder.jpg'"
      />

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
      ">
        ${(property.type || "Property").toUpperCase()}
      </div>
    </div>

    <div style="padding:14px 16px">

      <div style="
        font-size:20px;
        font-weight:700;
        color:#111;
        margin-bottom:6px;
      ">
        ${priceFormatted}
      </div>

      <div style="
        font-size:13px;
        color:#444;
        font-weight:600;
        margin-bottom:8px;
      ">
        ${beds} Beds • ${baths} Baths
        ${property.sqft ? " • " + property.sqft + " sqft" : ""}
      </div>

      <div style="
        font-size:13px;
        color:#777;
        line-height:1.4;
      ">
        ${location}
      </div>

    </div>

  </div>
</div>
`

  return popupContent
}