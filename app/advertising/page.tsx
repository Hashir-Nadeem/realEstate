"use client"

export default function AdvertisingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
      <div className="max-w-md">
        <h1 className="text-2xl font-semibold mb-4 text-black">Advertising</h1>
        <p className="text-gray-600 mb-6 text-sm leading-relaxed">
          This space will soon let you promote your property, brand or related services on Zamindar.ai.
          We are preparing self-serve ad placements and featured listing packages.
        </p>
        <div className="rounded-lg border border-dashed border-gray-300 p-8 mb-4">
          <span className="text-gray-400 text-sm">(Ad placement preview area)</span>
        </div>
        <p className="text-xs text-gray-400">Coming soon. Contact support for early access.</p>
      </div>
    </div>
  )
}
