import { loadCatalog } from '../catalog'
import { PRODUCTS } from '../data'
import type { Product } from '../types'

export const FEE_RATE = 0.08
export const GENERAL_FEE_RATE = 0.03
export const DEMO_PHONE = '19911011101'

const DEDICATED_IDS = ['gold', 'alipay', 'alipay-plus', 'wechat'] as const

export const DEDICATED_SKUS = DEDICATED_IDS.map((id) => PRODUCTS.find((item) => item.id === id)).filter(
  (item): item is Product => Boolean(item),
)

export function dedicatedLabel(name?: string) {
  const base = name?.trim()
  if (!base) return '专用券'
  return base.endsWith('专用券') ? base : `${base}专用券`
}

export type PurchaseKind = 'general' | 'dedicated'

export type AdminOrder = {
  id: string
  source: 'catalog' | 'approval'
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
  expireDate?: string
}

export type AdminScreen =
  | 'catalog'
  | 'buy'
  | 'orders'
  | 'issue'
  | 'users'
  | 'goods'
  | 'members'
  | 'redeems'
  | 'approval'
  | 'approval-buy'
  | 'approval-pay'
  | 'datacenter'

export function money(n: number) {
  return n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function maskPhone(phone: string) {
  const d = phone.replace(/\D/g, '')
  if (d.length < 7) return phone
  return `${d.slice(0, 3)}****${d.slice(-4)}`
}

export function skuById(id: string): Product | undefined {
  return loadCatalog().find((item) => item.id === id) ?? PRODUCTS.find((item) => item.id === id)
}

export const FEE_PCT = Math.round(FEE_RATE * 100)
export const GENERAL_FEE_PCT = Math.round(GENERAL_FEE_RATE * 100)
export const SAMPLE_UNITS = 100
export const UNIT_PRICE = 1

export function feeRateFor(kind: PurchaseKind) {
  return kind === 'general' ? GENERAL_FEE_RATE : FEE_RATE
}

export function feePctFor(kind: PurchaseKind) {
  return kind === 'general' ? GENERAL_FEE_PCT : FEE_PCT
}

export type ImportRow = {
  phone: string
  units: number
  points: number
  name?: string
  plate?: string
  idNo?: string
  alipay?: string
  remark?: string
  effectiveDate?: string
}

export const SAMPLE_TABLE: ImportRow[] = [
  { phone: '19911011101', name: '桂*徽', units: 1, points: 1 },
  { phone: '13800002202', name: '张*伟', units: 1, points: 1 },
  { phone: '18600003303', name: '李*敏', units: 1, points: 1 },
]

const EXTRA_NAMES = ['王*强', '陈*婷', '刘*军', '赵*丽', '周*杰', '吴*芳', '徐*峰', '孙*燕', '胡*斌', '朱*敏']

function extraPhone(index: number) {
  return `139${String(80000000 + index).slice(-8)}`
}

export function buildApprovalUsers(count = 128): ImportRow[] {
  const date = '2026-08-27'
  const head: ImportRow[] = [
    {
      phone: '19911011101',
      name: '桂*徽',
      units: 1,
      points: 1,
      plate: '浙A·8***2',
      idNo: '3301**********1101',
      alipay: '19911011101',
      effectiveDate: date,
    },
    {
      phone: '13800002202',
      name: '张*伟',
      units: 1,
      points: 1,
      plate: '',
      idNo: '3301**********2202',
      alipay: '13800002202',
      effectiveDate: date,
    },
    {
      phone: '18600003303',
      name: '李*敏',
      units: 1,
      points: 1,
      plate: '浙B·6***9',
      idNo: '',
      alipay: '',
      effectiveDate: date,
    },
  ]
  const extra = Array.from({ length: Math.max(0, count - head.length) }, (_, index) => {
    const n = index + 1
    const phone = extraPhone(n)
    return {
      phone,
      name: EXTRA_NAMES[index % EXTRA_NAMES.length],
      units: 1,
      points: 1,
      plate: n % 4 === 0 ? `浙A·${String(10 + (n % 90)).slice(-2)}***${n % 10}` : '',
      idNo: n % 3 === 0 ? `3301**********${String(1000 + n).slice(-4)}` : '',
      alipay: n % 2 === 0 ? phone : '',
      remark: '',
      effectiveDate: date,
    }
  })
  return [...head, ...extra]
}

export const APPROVAL_USERS = buildApprovalUsers(128)

export type SceneL1 = 'new-car' | 'used-car' | 'accident' | 'points'
export type SceneL2 =
  | 'new-sale'
  | 'new-commission'
  | 'new-member'
  | 'used-sale'
  | 'used-commission'
  | 'used-member'
  | 'acc-commission'
  | 'acc-repair'
  | 'acc-member'
  | 'points-issue'
  | 'points-redeem'

export const SCENE_TREE: { id: SceneL1; label: string; children: { id: SceneL2; label: string }[] }[] = [
  {
    id: 'new-car',
    label: '新车场景',
    children: [
      { id: 'new-sale', label: '新车销售' },
      { id: 'new-commission', label: '新车佣金' },
      { id: 'new-member', label: '会员营销' },
    ],
  },
  {
    id: 'used-car',
    label: '二手车场景',
    children: [
      { id: 'used-sale', label: '二手车销售' },
      { id: 'used-commission', label: '二手车佣金' },
      { id: 'used-member', label: '会员营销' },
    ],
  },
  {
    id: 'accident',
    label: '事故车场景',
    children: [
      { id: 'acc-commission', label: '事故车佣金' },
      { id: 'acc-repair', label: '维修佣金' },
      { id: 'acc-member', label: '会员营销佣金' },
    ],
  },
  {
    id: 'points',
    label: '积分权益',
    children: [
      { id: 'points-issue', label: '积分发放' },
      { id: 'points-redeem', label: '积分兑换' },
    ],
  },
]

export type ApprovalRecord = {
  id: string
  l1: SceneL1
  l2: SceneL2
  batchNo: string
  approvalNo: string
  merchant: string
  chainName: string
  applicant: string
  submittedAt: string
  handler: string
  handlerPhone: string
  voucherCount: number
  voucherStatus: string
  handledAt: string
  clue: string
  approvalStatus: string
  orderNo: string
  goodsName: string
  goodsPrice: number
  grantAmount: number
  ownerName: string
  ownerPhone: string
  plate: string
  vin: string
  carPrice: string
  outerNo: string
  receiverPhone: string
  receiverName: string
  receiverIdNo: string
  goodsOrderNo: string
  orderStatus: string
  mainBenefit: string
  giftBenefit: string
  users: ImportRow[]
}

function usersOf(phone: string, name: string): ImportRow[] {
  const head = APPROVAL_USERS.find((item) => item.phone === phone)
  if (head) return APPROVAL_USERS
  return [
    {
      phone,
      name,
      units: 1,
      points: 1,
      plate: '',
      idNo: '',
      alipay: phone,
      effectiveDate: '2026-08-27',
    },
  ]
}

function rec(
  partial: Pick<ApprovalRecord, 'id' | 'l1' | 'l2' | 'batchNo' | 'approvalNo' | 'chainName' | 'applicant' | 'submittedAt' | 'handler' | 'ownerName' | 'ownerPhone'> &
    Partial<ApprovalRecord>,
): ApprovalRecord {
  return {
    merchant: '产研中心线上验证专用',
    handlerPhone: '18958816209',
    voucherCount: 2,
    voucherStatus: '待审核',
    handledAt: partial.submittedAt,
    clue: '',
    approvalStatus: '审批通过',
    orderNo: '',
    goodsName: '',
    goodsPrice: 0,
    grantAmount: 1,
    plate: '',
    vin: '',
    carPrice: '',
    outerNo: '',
    receiverPhone: partial.ownerPhone,
    receiverName: partial.ownerName,
    receiverIdNo: '',
    goodsOrderNo: '',
    orderStatus: '下单未提交',
    mainBenefit: '-',
    giftBenefit: '-',
    users: usersOf(partial.ownerPhone, partial.ownerName),
    ...partial,
  }
}

export const APPROVAL_RECORDS: ApprovalRecord[] = [
  rec({
    id: 'ar1',
    l1: 'new-car',
    l2: 'new-sale',
    batchNo: '2068945828076064768',
    approvalNo: '010162320098',
    chainName: '产研验证商户演示新车销售提报',
    applicant: '灵犀小二023',
    submittedAt: '2026-06-22 14:34:38',
    handler: 'lingzhen',
    handlerPhone: '13988945620',
    voucherCount: 0,
    voucherStatus: '待审核',
    handledAt: '2026-06-22 14:35:03',
    ownerName: '桂*徽',
    ownerPhone: '19911011101',
    goodsName: '',
    goodsPrice: 0,
    grantAmount: 1,
    receiverIdNo: '3301**********1101',
    goodsOrderNo: '01',
    orderStatus: '下单未提交',
    users: APPROVAL_USERS,
  }),
  rec({
    id: 'ar2',
    l1: 'new-car',
    l2: 'new-sale',
    batchNo: '2066713434622368408',
    approvalNo: '010162320097',
    chainName: '产研验证商户演示新车销售提报',
    applicant: '灵犀小二084',
    submittedAt: '2026-06-13 16:24:25',
    handler: '清风',
    handlerPhone: '18357186730',
    voucherCount: 0,
    handledAt: '2026-06-13 16:30:40',
    ownerName: '陈*信',
    ownerPhone: '18357186730',
    goodsName: '宝马530Li',
    goodsPrice: 300000,
    grantAmount: 1,
    goodsOrderNo: '20260613163030001',
    orderStatus: '下单成功',
  }),
  rec({
    id: 'ar3',
    l1: 'new-car',
    l2: 'new-commission',
    batchNo: '2047623564261707776',
    approvalNo: '010162320096',
    chainName: '产研验证商户演示新车佣金提报',
    applicant: '灵犀小二001',
    submittedAt: '2026-04-24 18:20:08',
    handler: '清风',
    handlerPhone: '18357186730',
    voucherCount: 3,
    handledAt: '2026-04-24 18:27:59',
    ownerName: '张*伟',
    ownerPhone: '13800002202',
    goodsPrice: 200,
    grantAmount: 0,
    goodsOrderNo: '20260424182813001',
    orderStatus: '下单成功',
  }),
  rec({
    id: 'ar4',
    l1: 'new-car',
    l2: 'new-member',
    batchNo: '2047623564261707775',
    approvalNo: '010162320095',
    chainName: '产研验证商户演示会员营销提报',
    applicant: '灵犀小二075',
    submittedAt: '2026-04-24 18:20:08',
    handler: '清风',
    handlerPhone: '18357186730',
    voucherCount: 1,
    handledAt: '2026-04-24 18:27:59',
    ownerName: '李*敏',
    ownerPhone: '18600003303',
    grantAmount: 1,
  }),
  rec({
    id: 'ar5',
    l1: 'used-car',
    l2: 'used-sale',
    batchNo: '2068945828076064801',
    approvalNo: '010162320112',
    chainName: '产研验证商户演示二手车销售提报',
    applicant: '灵犀小二023',
    submittedAt: '2026-06-21 09:12:05',
    handler: 'lingzhen',
    ownerName: '张*伟',
    ownerPhone: '13800002202',
    grantAmount: 1,
  }),
  rec({
    id: 'ar6',
    l1: 'used-car',
    l2: 'used-commission',
    batchNo: '2068945828076064810',
    approvalNo: '010162320118',
    chainName: '产研验证商户演示二手车佣金提报',
    applicant: '灵犀小二023',
    submittedAt: '2026-06-18 10:08:11',
    handler: 'lingzhen',
    ownerName: '王*强',
    ownerPhone: '13700004404',
    grantAmount: 1,
  }),
  rec({
    id: 'ar7',
    l1: 'used-car',
    l2: 'used-member',
    batchNo: '2068945828076064812',
    approvalNo: '010162320119',
    chainName: '产研验证商户演示二手车会员营销',
    applicant: '灵犀小二023',
    submittedAt: '2026-06-17 15:22:47',
    handler: '清风',
    ownerName: '李*敏',
    ownerPhone: '18600003303',
    grantAmount: 1,
  }),
  rec({
    id: 'ar8',
    l1: 'accident',
    l2: 'acc-commission',
    batchNo: '2068945828076064902',
    approvalNo: '010162320220',
    chainName: '产研验证商户演示事故车佣金提报',
    applicant: '灵犀小二023',
    submittedAt: '2026-06-20 16:08:11',
    handler: 'lingzhen',
    clue: '1条线索',
    ownerName: '李*敏',
    ownerPhone: '18600003303',
    grantAmount: 1,
  }),
  rec({
    id: 'ar9',
    l1: 'accident',
    l2: 'acc-repair',
    batchNo: '2068945828076064908',
    approvalNo: '010162320228',
    chainName: '产研验证商户演示维修佣金提报',
    applicant: '灵犀小二023',
    submittedAt: '2026-06-16 11:18:09',
    handler: '清风',
    clue: '1条线索',
    ownerName: '王*强',
    ownerPhone: '13700004404',
    grantAmount: 1,
  }),
  rec({
    id: 'ar10',
    l1: 'accident',
    l2: 'acc-member',
    batchNo: '2068945828076064918',
    approvalNo: '010162320231',
    chainName: '产研验证商户演示会员营销佣金',
    applicant: '灵犀小二023',
    submittedAt: '2026-06-19 11:22:47',
    handler: 'lingzhen',
    ownerName: '王*强',
    ownerPhone: '13700004404',
    grantAmount: 1,
  }),
  rec({
    id: 'ar11',
    l1: 'points',
    l2: 'points-issue',
    batchNo: '2068945828076065001',
    approvalNo: '010162320301',
    chainName: '产研验证商户演示积分发放',
    applicant: '灵犀小二023',
    submittedAt: '2026-06-15 09:40:12',
    handler: 'lingzhen',
    voucherCount: 0,
    ownerName: '桂*徽',
    ownerPhone: '19911011101',
    grantAmount: 1,
    users: APPROVAL_USERS,
  }),
  rec({
    id: 'ar12',
    l1: 'points',
    l2: 'points-redeem',
    batchNo: '2068945828076065008',
    approvalNo: '010162320308',
    chainName: '产研验证商户演示积分兑换',
    applicant: '灵犀小二023',
    submittedAt: '2026-06-14 13:05:44',
    handler: '清风',
    voucherCount: 0,
    ownerName: '张*伟',
    ownerPhone: '13800002202',
    grantAmount: 0,
    goodsOrderNo: 'RD2003',
    orderStatus: '下单成功',
    mainBenefit: '星巴克中杯兑换券',
  }),
]

export type ApprovalDraft = {
  recordId: string
  kind: PurchaseKind
  productId?: string
  merchantFeeRate: number
  rows: ImportRow[]
  paid: boolean
  orderId?: string
  ticketNo?: string
}

export function approvalById(id: string) {
  return APPROVAL_RECORDS.find((item) => item.id === id)
}

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

export function quote(costAmount: number, merchantFeeRate: number, totalFeeRate = FEE_RATE) {
  const total = Math.round(Math.max(0, totalFeeRate) * 100) / 100
  const clamped = Math.round(Math.min(total, Math.max(0, merchantFeeRate)) * 100) / 100
  const userFeeRate = Math.round((total - clamped) * 100) / 100
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
