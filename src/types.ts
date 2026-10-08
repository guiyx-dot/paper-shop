export type Zone = 'benefit' | 'points'
export type Category = 'dining' | 'life' | 'travel' | 'more'
export type BenefitStatus = 'available' | 'locked' | 'ended'
export type Tab = 'mall' | 'mine'

export type BenefitChannel = 'alipay' | 'wechat'
export type HomeLayout = 'zones' | 'flat' | 'labor'

export type ZoneFrom = 'points-zone' | 'benefit-zone'

export type Screen =
  | { name: 'claim' }
  | { name: 'mall' }
  | { name: 'points-zone' }
  | { name: 'benefit-zone' }
  | { name: 'benefit-channel'; channel: BenefitChannel }
  | { name: 'detail'; productId: string; channel?: BenefitChannel; from?: ZoneFrom }
  | { name: 'success'; orderId: string; from?: ZoneFrom }
  | { name: 'corp-pay'; fromOrderId?: string }
  | { name: 'mine' }
  | { name: 'records' }

export type Product = {
  id: string
  name: string
  subtitle: string
  zone: Zone
  category?: Category
  channels?: BenefitChannel[]
  cost: number
  validityDays: number
  stockLabel: string
  description: string
  usage: string
  benefitStatus?: BenefitStatus
  quota?: number
  ended?: boolean
  stock?: number
  onShelf?: boolean
}

export type Grant = {
  id: string
  title: string
  amount: number
  claimed: boolean
  expireDate?: string
  kind?: 'general' | 'dedicated'
  productId?: string
  userFeeRate?: number
}

export type LedgerEntry = {
  id: string
  type: 'claim' | 'redeem'
  title: string
  amount: number
  time: string
}

export type PayMethod = 'points' | 'gold' | 'coupon'

export type CouponHold = {
  productId: string
  name: string
  value: number
}

export type PayQuote = {
  method: PayMethod
  goldPaid: number
  couponPaid: number
  pointsPaid: number
  ok: boolean
  label: string
  couponProductId?: string
}

export type Order = {
  id: string
  productId: string
  productName: string
  cost: number
  time: string
  expireDate: string
  status: 'completed' | 'refunded'
  payWith?: PayMethod
  payLabel?: string
  goldPaid?: number
  couponPaid?: number
  pointsPaid?: number
  received?: number
}
