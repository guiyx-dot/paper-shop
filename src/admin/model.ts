import { PRODUCTS } from '../data'
import type { Product } from '../types'

export const FEE_RATE = 0.08
export const DEMO_PHONE = '19911011101'

const DEDICATED_IDS = ['gold', 'alipay', 'alipay-plus', 'wechat'] as const

export const DEDICATED_SKUS = DEDICATED_IDS.map((id) => PRODUCTS.find((item) => item.id === id)).filter(
  (item): item is Product => Boolean(item),
)

export type PurchaseKind = 'general' | 'dedicated'

export type AdminOrder = {
  id: string
  kind: PurchaseKind
  productId?: string
  productName: string
  costAmount: number
  pointsTotal: number
  merchantFeeRate: number
  userFeeRate: number
  merchantPay: number
  userFeeAmount: number
  issuedPoints: number
  status: 'paid'
  createdAt: string
}

export type IssuedUser = {
  id: string
  phone: string
  name: string
  orderId: string
  points: number
  kind: PurchaseKind
  productId?: string
  productName: string
  userFeeRate: number
  claimed: boolean
}

export type AdminScreen = 'catalog' | 'buy' | 'orders' | 'issue' | 'users'

export function money(n: number) {
  return n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function maskPhone(phone: string) {
  const d = phone.replace(/\D/g, '')
  if (d.length < 7) return phone
  return `${d.slice(0, 3)}****${d.slice(-4)}`
}

export function skuById(id: string): Product | undefined {
  return PRODUCTS.find((item) => item.id === id)
}

export const FEE_PCT = Math.round(FEE_RATE * 100)
export const SAMPLE_UNITS = 100
export const UNIT_PRICE = 1

export type ImportRow = {
  phone: string
  units: number
  points: number
  name?: string
}

export const SAMPLE_TABLE: ImportRow[] = [
  { phone: '19911011101', name: '桂*徽', units: 1, points: 1 },
  { phone: '13800002202', name: '张*伟', units: 1, points: 1 },
  { phone: '18600003303', name: '李*敏', units: 1, points: 1 },
]

export function parseImport(text: string, unitPoints = 1): ImportRow[] {
  const map = new Map<string, number>()
  for (const line of text.split(/\n/)) {
    const trimmed = line.trim()
    if (!trimmed) continue
    const parts = trimmed.split(/[\s,，\t]+/).filter(Boolean)
    const phone = (parts[0] ?? '').replace(/\D/g, '')
    if (phone.length < 11) continue
    const units = Math.max(1, Math.floor(Number(parts[1]) || 1))
    map.set(phone, (map.get(phone) ?? 0) + units)
  }
  return [...map.entries()].map(([phone, units]) => ({
    phone,
    units,
    points: units * unitPoints,
  }))
}

export function planFromRows(rows: ImportRow[]) {
  const units = rows.reduce((sum, row) => sum + row.units, 0)
  const pointsTotal = rows.reduce((sum, row) => sum + row.points, 0)
  const costAmount = units * UNIT_PRICE
  return { rows, units, pointsTotal, costAmount }
}

export function quote(costAmount: number, merchantFeeRate: number) {
  const clamped = Math.min(FEE_RATE, Math.max(0, merchantFeeRate))
  const userFeeRate = Math.round((FEE_RATE - clamped) * 100) / 100
  return {
    merchantFeeRate: clamped,
    userFeeRate,
    merchantFeeAmount: round2(costAmount * clamped),
    userFeeAmount: round2(costAmount * userFeeRate),
    merchantPay: round2(costAmount * (1 + clamped)),
    userGets: round2(costAmount * (1 - userFeeRate)),
  }
}

export function issuePerUser(remain: number, count: number, kind: PurchaseKind, productId?: string) {
  if (count <= 0 || remain <= 0) return 0
  const unit = kind === 'dedicated' ? (skuById(productId ?? '')?.cost ?? 100) : 1
  return Math.floor(remain / count / unit) * unit
}

export function round2(n: number) {
  return Math.round(n * 100) / 100
}

export const SAMPLE_PHONES = `19911011101
13800002202
18600003303`
