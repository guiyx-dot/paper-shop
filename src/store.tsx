import { createContext, createElement, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { FOLLOW_UP_GRANT, INITIAL_GRANTS, PRODUCTS } from './data'
import type { Grant, LedgerEntry, Order, Product, Screen } from './types'

export const CONSUMER_KEY = 'points-mall-demo-v2'

type Persisted = {
  grants: Grant[]
  points: number
  quotas: Record<string, number>
  orders: Order[]
  ledger: LedgerEntry[]
  hasEverClaimed: boolean
  followUpIssued: boolean
  voucherValue: number
  voucherLabel: string
  userFeeRate: number
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

export function formatTime(date = new Date()) {
  return `${date.getMonth() + 1}月${date.getDate()}日 ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function addDays(days: number, date = new Date()) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return `${next.getFullYear()}年${next.getMonth() + 1}月${next.getDate()}日`
}

function benefitLocked(quotas: Record<string, number>) {
  let sum = 0
  for (const product of PRODUCTS) {
    if (product.zone === 'benefit') sum += (quotas[product.id] ?? 0) * product.cost
  }
  return sum
}

function emptyQuotas() {
  const quotas: Record<string, number> = {}
  for (const product of PRODUCTS) {
    if (product.zone === 'benefit') quotas[product.id] = 0
  }
  return quotas
}

function seedBenefitQuotas() {
  const quotas: Record<string, number> = {}
  for (const product of PRODUCTS) {
    if (product.zone === 'benefit') quotas[product.id] = product.quota ?? 0
  }
  return quotas
}

function emptyState(): Persisted {
  return {
    grants: INITIAL_GRANTS.map((item) => ({ ...item })),
    points: 0,
    quotas: emptyQuotas(),
    orders: [],
    ledger: [],
    hasEverClaimed: false,
    followUpIssued: false,
    voucherValue: 0,
    voucherLabel: '金/券',
    userFeeRate: 0,
  }
}

function loadState(): Persisted {
  try {
    const raw = sessionStorage.getItem(CONSUMER_KEY)
    if (!raw) return emptyState()
    return { ...emptyState(), ...JSON.parse(raw) } as Persisted
  } catch {
    return emptyState()
  }
}

type Unavailable = { label: string; hint: string } | null

type Store = Persisted & {
  screen: Screen
  pendingAmount: number
  pendingCount: number
  generalPoints: number
  go: (screen: Screen) => void
  claimPending: () => void
  redeem: (productId: string, payWith?: 'points' | 'voucher') => Order | null
  reset: () => void
  productById: (id: string) => Product | undefined
  remainingQuota: (productId: string) => number
  unavailable: (product: Product) => Unavailable
}

const StoreContext = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Persisted>(loadState)
  const [screen, setScreen] = useState<Screen>(loadState().hasEverClaimed ? { name: 'mall' } : { name: 'claim' })

  useEffect(() => {
    const sync = () => setData(loadState())
    window.addEventListener('points-mall-sync', sync)
    return () => window.removeEventListener('points-mall-sync', sync)
  }, [])

  const persist = (next: Persisted) => {
    setData(next)
    sessionStorage.setItem(CONSUMER_KEY, JSON.stringify(next))
  }

  const pending = data.grants.filter((item) => !item.claimed)
  const pendingAmount = pending.reduce((sum, item) => sum + item.amount, 0)
  const pendingCount = pending.length
  const generalPoints = Math.max(0, data.points - benefitLocked(data.quotas))

  const go = (next: Screen) => {
    if (!data.hasEverClaimed && next.name !== 'claim') {
      setScreen({ name: 'claim' })
      return
    }
    setScreen(next)
  }

  const claimPending = () => {
    if (pendingCount === 0) return
    const amount = pendingAmount
    const title = pendingCount > 1 ? `会员积分领取（${pendingCount} 笔合并）` : pending[0].title
    const nextGrants = data.grants.map((item) => (item.claimed ? item : { ...item, claimed: true }))
    const nextQuotas = { ...data.quotas }
    let userFeeRate = data.userFeeRate
    const hasLegacy = pending.some((grant) => !grant.kind)
    const hasMerchant = pending.some((grant) => grant.kind === 'general' || grant.kind === 'dedicated')
    if (hasLegacy) {
      const seed = seedBenefitQuotas()
      for (const id of Object.keys(seed)) nextQuotas[id] = (nextQuotas[id] ?? 0) + seed[id]
    }
    for (const grant of pending) {
      userFeeRate = Math.max(userFeeRate, grant.userFeeRate ?? 0)
      if (grant.kind === 'dedicated' && grant.productId) {
        const product = PRODUCTS.find((item) => item.id === grant.productId)
        const unit = product?.cost ?? 100
        nextQuotas[grant.productId] = (nextQuotas[grant.productId] ?? 0) + Math.max(0, Math.floor(grant.amount / unit))
      }
    }
    const addFollowUp = !data.followUpIssued && !hasMerchant
    persist({
      ...data,
      grants: addFollowUp ? [...nextGrants, { ...FOLLOW_UP_GRANT }] : nextGrants,
      points: data.points + amount,
      quotas: nextQuotas,
      userFeeRate,
      ledger: [
        { id: `L${Date.now()}`, type: 'claim', title, amount, time: formatTime() },
        ...data.ledger,
      ],
      hasEverClaimed: true,
      followUpIssued: data.followUpIssued || addFollowUp || hasMerchant,
    })
    setScreen({ name: 'mall' })
  }

  const unavailable = (product: Product): Unavailable => {
    const ended = { label: '兑换结束', hint: '该商品兑换活动已结束' }
    if (product.ended || product.benefitStatus === 'ended' || product.benefitStatus === 'locked') return ended
    if (product.zone === 'benefit' && (data.quotas[product.id] ?? 0) <= 0) {
      return { label: '兑换结束', hint: '该商品发放额度已兑完' }
    }
    if (product.zone === 'points') {
      if (data.voucherValue < product.cost && generalPoints < product.cost) return ended
      return null
    }
    if (data.points < product.cost) return ended
    return null
  }

  const redeem = (productId: string, payWith: 'points' | 'voucher' = 'points') => {
    const product = PRODUCTS.find((item) => item.id === productId)
    if (!product) return null
    if (product.ended || product.benefitStatus === 'ended' || product.benefitStatus === 'locked') return null
    const useVoucher = product.zone === 'points' && payWith === 'voucher'
    const pointsPay = product.cost
    if (useVoucher && (product.zone !== 'points' || data.voucherValue < product.cost)) return null
    if (!useVoucher && product.zone === 'points' && generalPoints < pointsPay) return null
    if (!useVoucher && product.zone === 'benefit' && unavailable(product)) return null

    const now = new Date()
    const received =
      product.zone === 'benefit' ? Math.round(product.cost * (1 - data.userFeeRate) * 100) / 100 : undefined
    const order: Order = {
      id: `ORD${now.getTime().toString().slice(-10)}`,
      productId: product.id,
      productName: product.name,
      cost: useVoucher ? product.cost : pointsPay,
      time: formatTime(now),
      expireDate: addDays(product.validityDays, now),
      status: 'completed',
      payWith: useVoucher ? 'voucher' : 'points',
      received,
    }
    persist({
      ...data,
      points: useVoucher ? data.points : data.points - (product.zone === 'points' ? pointsPay : product.cost),
      voucherValue: useVoucher
        ? data.voucherValue - product.cost
        : product.zone === 'benefit'
          ? data.voucherValue + (received ?? 0)
          : data.voucherValue,
      voucherLabel: product.zone === 'benefit' ? product.name : data.voucherLabel,
      quotas:
        product.zone === 'benefit' ? { ...data.quotas, [product.id]: (data.quotas[product.id] ?? 1) - 1 } : data.quotas,
      orders: [order, ...data.orders],
      ledger: [
        {
          id: `L${now.getTime()}`,
          type: 'redeem',
          title: useVoucher ? `金/券兑换${product.name}` : `兑换${product.name}`,
          amount: useVoucher ? -product.cost : -(product.zone === 'points' ? pointsPay : product.cost),
          time: order.time,
        },
        ...data.ledger,
      ],
    })
    setScreen({ name: 'success', orderId: order.id })
    return order
  }

  const reset = () => {
    persist(emptyState())
    setScreen({ name: 'claim' })
  }

  const value = useMemo<Store>(
    () => ({
      ...data,
      screen,
      pendingAmount,
      pendingCount,
      generalPoints,
      go,
      claimPending,
      redeem,
      reset,
      productById: (id: string) => PRODUCTS.find((item) => item.id === id),
      remainingQuota: (productId: string) => data.quotas[productId] ?? 0,
      unavailable,
    }),
    [data, screen, pendingAmount, pendingCount, generalPoints],
  )

  return createElement(StoreContext.Provider, { value }, children)
}

export function useStore() {
  const store = useContext(StoreContext)
  if (!store) throw new Error('Store missing')
  return store
}
