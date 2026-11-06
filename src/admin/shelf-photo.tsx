import alipayCoin from './goods-art/alipay-coin.jpg'
import alipayCoupon from './goods-art/alipay-coupon.jpg'
import alipayPlus from './goods-art/alipay-plus.jpg'
import corpPay from './goods-art/corp-pay-card.jpg'
import wanjiale from './goods-art/wanjiale.jpg'
import wechatCoin from './goods-art/wechat-coin.jpg'
import wechatCoupon from './goods-art/wechat-coupon.jpg'

const PHOTOS: Record<string, { src: string; label: string; packet?: boolean }> = {
  'gold-wechat': { src: wechatCoin, label: '微信通用币', packet: true },
  'gold-alipay': { src: alipayCoin, label: '支付宝通用币', packet: true },
  wechat: { src: wechatCoupon, label: '微信立减金', packet: true },
  alipay: { src: alipayCoupon, label: '支付宝通用券', packet: true },
  'alipay-plus': { src: alipayPlus, label: '支付宝通用券Plus', packet: true },
  'corp-pay': { src: corpPay, label: '因公付', packet: true },
  'gift-pack': { src: wanjiale, label: '万佳乐' },
}

export function hasShelfPhoto(id: string) {
  return id in PHOTOS
}

export function ShelfPhoto({ id }: { id: string }) {
  const photo = PHOTOS[id]
  if (!photo) return null
  return <img className={photo.packet ? 'shelf-photo is-packet' : 'shelf-photo'} src={photo.src} alt="" />
}
