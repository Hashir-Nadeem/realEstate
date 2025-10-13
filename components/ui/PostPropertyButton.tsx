import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus, MapPin } from 'lucide-react'

interface PostPropertyButtonProps {
  isViewingCurrentLocation: boolean
  onShowCurrentLocation: () => void
  isLocating?: boolean
}

export const PostPropertyButton: React.FC<PostPropertyButtonProps> = ({
  isViewingCurrentLocation,
  onShowCurrentLocation,
  isLocating = false
}) => {
  if (isViewingCurrentLocation) {
    return (
      <Link href="/post-property">
        <Button className="w-full bg-red-600 hover:bg-red-700 text-white py-3 text-base font-medium rounded-lg transition-colors">
          <Plus className="w-5 h-5 mr-2" />
          Post Property Ad for Free!
        </Button>
      </Link>
    )
  }

  return (
    <Button 
      onClick={onShowCurrentLocation}
      disabled={isLocating}
      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 text-base font-medium rounded-lg transition-colors"
    >
      {isLocating ? (
        <>
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
          Getting location...
        </>
      ) : (
        <>
          <MapPin className="w-5 h-5 mr-2" />
          Show current location to post property
        </>
      )}
    </Button>
  )
}
