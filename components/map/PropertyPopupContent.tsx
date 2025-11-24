interface Property {
  id: number | string
  imageUrl?: string
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
  price: string
}

interface PopupOptions {
  showCloseButton?: boolean
}

export const generatePropertyPopupContent = (property: Property, options: PopupOptions = {}): string => {
  const { showCloseButton = true } = options

  const img = property.imageUrl || "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1200&auto=format&fit=crop"
  const beds = property.beds ?? '2'
  const baths = property.baths ?? '2'
  
  let areaDisplay = ''
  if (property.area) {
    areaDisplay = property.area
  } else if (property.sqft) {
    areaDisplay = `${property.sqft} sqft`
  } else {
    areaDisplay = 'Area not specified'
  }
  
  const address = property.address || 'Sample Address, Near Mall'
  const floorNumber = property.floorNumber ?? '3'
  const totalFloors = property.totalFloors ?? '5'
  const facing = property.facing || 'North'
  const locality = property.locality || 'Koramangala'
  const city = property.city || 'Bangalore'

  const heart = `<div style="position:absolute;right:8px;top:8px;width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,0.9);display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.15); cursor:pointer;" onclick="event.stopPropagation();">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    </div>`
  
  const closeBtn = showCloseButton ? `<div style="position:absolute;left:-12px;top:-12px;width:28px;height:28px;border-radius:50%;background:white;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:1001;" onclick="event.stopPropagation(); window.closeLeafletPopup()">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
    </div>` : ''

  const shareContainer = `
    <div id="share-container-${property.id}" style="display:none; position:absolute; top:40px; right:8px; background:white; border-radius:8px; box-shadow:0 6px 20px rgba(0,0,0,0.15); padding:16px; width:250px; z-index:1000;" onclick="event.stopPropagation();">
      <div style="text-align:center; margin-bottom:12px;">
        <h3 style="font-size:16px; font-weight:600; color:#111827; margin:0;">Share Property</h3>
      </div>
      
      <div style="display:flex; justify-content:center; gap:12px; margin-bottom:12px;">
        <div onclick="event.stopPropagation(); window.shareProperty('email', '${property.id}')" style="width:40px; height:40px; border-radius:50%; background:#6B7280; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all 0.2s;" 
             onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
        </div>
        
        <div onclick="event.stopPropagation(); window.shareProperty('whatsapp', '${property.id}')" style="width:40px; height:40px; border-radius:50%; background:#25D366; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all 0.2s;"
             onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/></svg>
        </div>
        
        <div onclick="event.stopPropagation(); window.shareProperty('facebook', '${property.id}')" style="width:40px; height:40px; border-radius:50%; background:#1877F2; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all 0.2s;"
             onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
        </div>
        
        <div onclick="event.stopPropagation(); window.shareProperty('twitter', '${property.id}')" style="width:40px; height:40px; border-radius:50%; background:#1DA1F2; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all 0.2s;"
             onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
        </div>
      </div>
      
      <div style="border-top:1px solid #E5E7EB; padding-top:12px;">
        <div style="display:flex; gap:6px; align-items:center;">
          <input 
            type="text" 
            id="share-link-${property.id}"
            value="http://mbtrk.co/jWThMOwS6LMznDr6eNCt..."
            readonly 
            style="flex:1; padding:6px 10px; border:1px solid #D1D5DB; border-radius:4px; font-size:12px; background:#F9FAFB;"
            onclick="event.stopPropagation();"
          />
          <button 
            onclick="event.stopPropagation(); window.copyShareLink('${property.id}')"
            style="padding:6px 12px; background:#EF4444; color:white; border:none; border-radius:4px; font-size:12px; font-weight:500; cursor:pointer;"
            onmouseover="this.style.background='#DC2626'" 
            onmouseout="this.style.background='#EF4444'"
          >
            Copy
          </button>
        </div>
      </div>
    </div>
  `

  const threeDots = `<div style="position:absolute;right:48px;top:8px;width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,0.9);display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.15); cursor:pointer;" onclick="event.stopPropagation(); window.toggleShareContainer('${property.id}')">
      <div style="display:flex;gap:2px; color: #666;">
        <div style="width:3px;height:3px;background:currentColor;border-radius:50%;"></div>
        <div style="width:3px;height:3px;background:currentColor;border-radius:50%;"></div>
        <div style="width:3px;height:3px;background:currentColor;border-radius:50%;"></div>
      </div>
    </div>`

  const popupContent = `
    <div style="position:relative; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width:100%; width:90vw; border-radius:8px; overflow:hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.15); background:white;">
      ${closeBtn}
      <div onclick="window.propertyDetailsHandler('${property.id}')" style="cursor:pointer;">
        <!-- Image Section -->
        <div style="position:relative; width:100%; height:160px; overflow:hidden;">
          <img src="${img}" alt="${property.title}" style="width:100%; height:100%; object-fit:cover; display:block;"/>
          ${heart}
          ${threeDots}
        </div>
        
        <!-- Content Section -->
        <div style="padding:12px 16px;">
          <!-- Row 1: Property Type and Status -->
          <div style="margin-bottom:6px;">
            <span style="color:#333; font-size:14px; font-weight:600; line-height:1.3; display:block;">
              ${beds} BHK Flat FOR ${property.type.includes('sale') ? 'SALE' : 'RENT'} in ${locality}, ${city}
            </span>
          </div>
          
          <!-- Row 2: Price -->
          <div style="margin-bottom:10px;">
            <span style="color:#000; font-size:18px; font-weight:700; display:block;">${property.price}</span>
          </div>
          
          <!-- Row 3: Details with icons -->
          <div style="display:flex; flex-wrap:wrap; gap:8px 12px; margin-bottom:8px; font-size:12px; color:#666;">
            <div style="display:flex; align-items:center; gap:3px; flex-shrink:0;">
              <img src="/icons/ruler.png" width="14" height="14" style="object-fit:contain" alt="Area" onerror="if(!this.dataset.fallback){this.dataset.fallback='true';this.src='/icons/Ruler.svg';}" />
              <span>${areaDisplay}</span>
            </div>
            <div style="display:flex; align-items:center; gap:3px; flex-shrink:0">
              <img src="/icons/bed.png" width="14" height="14" style="object-fit:contain" alt="Beds" onerror="if(!this.dataset.fallback){this.dataset.fallback='true';this.src='/icons/bed.png';}" />
              <span>${beds} Beds</span>
            </div>
            <div style="display:flex; align-items:center; gap:3px; flex-shrink:0">
              <img src="/icons/bath.png" width="14" height="14" style="object-fit:contain" alt="Baths" onerror="if(!this.dataset.fallback){this.dataset.fallback='true';this.src='/icons/bath.png';}" />
              <span>${baths} Baths</span>
            </div>
            <div style="display:flex; align-items:center; gap:3px; flex-shrink:0">
              <img src="/icons/balcony.png" width="14" height="14" style="object-fit:contain" alt="Facing"/>
              <span>${facing}</span>
            </div>
            ${floorNumber !== '' && totalFloors !== '' ? `
              <div style="display:flex; align-items:center; gap:3px; flex-shrink:0">
                <img src="/icons/balcony.png" width="14" height="14" style="object-fit:contain" alt="Floors"/>
                <span>${floorNumber === '0' ? 'Ground' : floorNumber} of ${totalFloors} Floors</span>
              </div>
            ` : ''}
          </div>
          
          <!-- Row 4: Address -->
          <div style="color:#888; font-size:12px; line-height:1.4; word-wrap:break-word; overflow-wrap:break-word;">
            ${address}
          </div>
        </div>
      </div>
    </div>
  `
  return popupContent
}
