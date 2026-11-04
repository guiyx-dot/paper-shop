import corpPay from './goods-art/corp-pay.png'
import wanjiale from './goods-art/wanjiale.png'

const PHOTOS: Record<string, { src: string; label: string }> = {
  'corp-pay': { src: corpPay, label: '因公付' },
  'gift-pack': { src: wanjiale, label: '万佳乐' },
}

export function hasShelfPhoto(id: string) {
  return id in PHOTOS
}

export function ShelfPhoto({ id }: { id: string }) {
  const photo = PHOTOS[id]
  if (!photo) return null
  return <img className="shelf-photo" src={photo.src} alt="" />
}
