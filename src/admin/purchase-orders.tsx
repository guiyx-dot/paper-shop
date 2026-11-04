import { useMemo, useState, type FormEvent } from 'react'
import { ProductIcon } from '../icons'
import { AccountViewButton } from './accounts'
import { SAMPLE_TABLE, money, type AdminOrder, type ImportRow, type IssuedUser } from './model'
import { useAdmin } from './store'

type ListStatus = '待支付' | '充值中' | '发放成功' | '发放失败'
type RateLine = { label: string; rate: string }

type ListOrder = {
  id: string
  batchNo: string
  outerNo?: string
  createdAt: string
  productId?: string
  productName: string
  skuNo: string
  faceAmount: number
  goodsAmount: number
  feeAmount: number
  merchantId: string
  merchantName: string
  businessType: string
  accounts: ImportRow[]
  feeRate: string
  feeDetail?: RateLine[]
  status: ListStatus
  grant?: 'all' | 'partial'
  claimed: number
  claimTotal: number
  expireLabel?: string
  fresh?: boolean
}

const TABS: { id: 'all' | ListStatus; label: string }[] = [
  { id: 'all', label: '全部订单' },
  { id: '待支付', label: '待支付' },
  { id: '充值中', label: '充值中' },
  { id: '发放成功', label: '发放成功' },
  { id: '发放失败', label: '发放失败' },
]

const BIZ_OPTIONS = ['其他', '事故车', '事故车佣金', '维修权益', '新车销售', '新车权益', '二手车销售', '二手车权益', '会员营销', '会员营销权益', '积分发放', '积分兑换']

const FEE_DETAIL: RateLine[] = [
  { label: '支付宝', rate: '8%' },
  { label: '银行', rate: '8%' },
]

const DEMO_BATCH = '2068945828076064768'

const SEED: ListOrder[] = [
  {
    id: '202611041020000001',
    batchNo: DEMO_BATCH,
    createdAt: '2026-11-04 10:20:00',
    productId: 'gold-wechat',
    productName: '微信通用币',
    skuNo: 'PO-POINTS-001',
    faceAmount: 138.24,
    goodsAmount: 128,
    feeAmount: 10.24,
    merchantId: '03000000001',
    merchantName: '产研中心线上验证专用',
    businessType: '新车销售',
    accounts: SAMPLE_TABLE,
    feeRate: '8.00%',
    feeDetail: FEE_DETAIL,
    status: '发放成功',
    grant: 'all',
    claimed: 129,
    claimTotal: 129,
    expireLabel: '【有效期剩余：90天】',
  },
  {
    id: '202611041050000002',
    batchNo: DEMO_BATCH,
    createdAt: '2026-11-04 10:50:00',
    productId: 'gold-wechat',
    productName: '微信通用币',
    skuNo: 'PO-POINTS-001',
    faceAmount: 108,
    goodsAmount: 100,
    feeAmount: 8,
    merchantId: '03000000001',
    merchantName: '产研中心线上验证专用',
    businessType: '新车销售',
    accounts: SAMPLE_TABLE,
    feeRate: '8.00%',
    feeDetail: FEE_DETAIL,
    status: '发放成功',
    grant: 'all',
    claimed: 61,
    claimTotal: 129,
    expireLabel: '【有效期剩余：60天】',
  },
  {
    id: '202611040940000001',
    batchNo: DEMO_BATCH,
    createdAt: '2026-11-04 09:40:00',
    productId: 'gold-wechat',
    productName: '微信通用币',
    skuNo: 'PO-POINTS-001',
    faceAmount: 86.4,
    goodsAmount: 80,
    feeAmount: 6.4,
    merchantId: '03000000001',
    merchantName: '产研中心线上验证专用',
    businessType: '新车销售',
    accounts: SAMPLE_TABLE,
    feeRate: '8.00%',
    feeDetail: FEE_DETAIL,
    status: '发放成功',
    grant: 'partial',
    claimed: 76,
    claimTotal: 129,
    expireLabel: '【已过期】',
  },
  {
    id: '202611040920000004',
    batchNo: DEMO_BATCH,
    createdAt: '2026-11-04 09:20:00',
    productId: 'gold-alipay',
    productName: '支付宝通用币',
    skuNo: 'PO-POINTS-001',
    faceAmount: 64.8,
    goodsAmount: 60,
    feeAmount: 4.8,
    merchantId: '03000000001',
    merchantName: '产研中心线上验证专用',
    businessType: '新车销售',
    accounts: SAMPLE_TABLE,
    feeRate: '8.00%',
    feeDetail: FEE_DETAIL,
    status: '发放成功',
    grant: 'all',
    claimed: 94,
    claimTotal: 129,
    expireLabel: '【有效期剩余：30天】',
  },
  {
    id: '202611031622110001',
    batchNo: DEMO_BATCH,
    createdAt: '2026-11-03 16:22:11',
    productId: 'gold-alipay',
    productName: '支付宝通用币',
    skuNo: 'PO-POINTS-001',
    faceAmount: 54,
    goodsAmount: 50,
    feeAmount: 4,
    merchantId: '03000000001',
    merchantName: '产研中心线上验证专用',
    businessType: '新车销售',
    accounts: SAMPLE_TABLE,
    feeRate: '8.00%',
    feeDetail: FEE_DETAIL,
    status: '待支付',
    claimed: 0,
    claimTotal: 129,
  },
  {
    id: '202611031118420001',
    batchNo: DEMO_BATCH,
    createdAt: '2026-11-03 11:18:42',
    productId: 'wechat',
    productName: '微信立减金',
    skuNo: 'PO-POINTS-001',
    faceAmount: 21.6,
    goodsAmount: 20,
    feeAmount: 1.6,
    merchantId: '03000000001',
    merchantName: '产研中心线上验证专用',
    businessType: '新车销售',
    accounts: SAMPLE_TABLE,
    feeRate: '8.00%',
    feeDetail: FEE_DETAIL,
    status: '充值中',
    claimed: 0,
    claimTotal: 129,
  },
  {
    id: '202610261640330001',
    batchNo: DEMO_BATCH,
    createdAt: '2026-11-04 09:00:00',
    productId: 'gold-wechat',
    productName: '微信通用币',
    skuNo: 'PO-POINTS-001',
    faceAmount: 30.24,
    goodsAmount: 28,
    feeAmount: 2.24,
    merchantId: '03000000001',
    merchantName: '产研中心线上验证专用',
    businessType: '新车销售',
    accounts: SAMPLE_TABLE,
    feeRate: '8.00%',
    feeDetail: FEE_DETAIL,
    status: '发放失败',
    claimed: 0,
    claimTotal: 129,
  },
]

type Filters = {
  goods: string
  from: string
  to: string
  orderNo: string
  batchNo: string
  merchant: string
  merchantId: string
  biz: string
  outerNo: string
}

const EMPTY_FILTERS: Filters = {
  goods: '',
  from: '',
  to: '',
  orderNo: '',
  batchNo: '',
  merchant: '',
  merchantId: '',
  biz: '',
  outerNo: '',
}

const COLUMNS = ['商品信息', '商户名称', '业务类型', '账号信息', '服务费率', '金额', '发放状态', '领取状态', '操作']

const FAIL_ERRORS: Record<string, { phone: string; name: string; amount: string; reason: string }[]> = {
  '202610261640330001': [
    { phone: '19911011101', name: '桂*徽', amount: '10.00', reason: '手机号未注册' },
    { phone: '13800002202', name: '张*伟', amount: '18.00', reason: '超出单日发放限额' },
  ],
  '202610251512070001': [{ phone: '18600003303', name: '李*敏', amount: '3.00', reason: '支付宝账号未实名' }],
}

function csvCell(value: string) {
  return `"${value.replace(/"/g, '""')}"`
}

function downloadErrorFile(item: ListOrder) {
  const rows =
    FAIL_ERRORS[item.id] ??
    item.accounts.map((row) => ({
      phone: row.phone,
      name: row.name || '',
      amount: money(row.units),
      reason: '充值失败',
    }))
  const lines = [
    ['订单号', '商品名称', '手机号', '姓名', '金额', '失败原因'],
    ...rows.map((row) => [item.id, item.productName, row.phone, row.name, row.amount, row.reason]),
  ]
  const csv = `\uFEFF${lines.map((line) => line.map(csvCell).join(',')).join('\n')}`
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `报错信息-${item.id}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

function accountsOf(order: AdminOrder, users: IssuedUser[]): ImportRow[] {
  return users
    .filter((item) => item.orderId === order.id)
    .map((item) => ({
      phone: item.phone,
      name: item.name,
      units: item.points,
      points: item.points,
    }))
}

function fromPaid(order: AdminOrder, users: IssuedUser[], fresh: boolean): ListOrder {
  const goodsAmount = order.costAmount
  const feeAmount = Math.round((order.merchantPay - order.costAmount) * 100) / 100
  return {
    id: order.ticketNo || order.id,
    batchNo: order.batchNo || '—',
    createdAt: order.createdAt,
    productId: order.productId,
    productName: order.productName,
    skuNo: 'PO-POINTS-001',
    faceAmount: order.merchantPay,
    goodsAmount,
    feeAmount,
    merchantId: order.merchantId || '03000000001',
    merchantName: order.merchantName || '产研中心线上验证专用',
    businessType: order.businessType || '其他',
    accounts: accountsOf(order, users),
    feeRate: `${(order.merchantFeeRate * 100).toFixed(2)}%`,
    status: order.listStatus || '发放成功',
    claimed: users.filter((item) => item.orderId === order.id && item.claimed).length,
    claimTotal: users.filter((item) => item.orderId === order.id).length,
    fresh,
  }
}

function includes(hay: string, needle: string) {
  return !needle || hay.toLowerCase().includes(needle.trim().toLowerCase())
}

function inRange(createdAt: string, from: string, to: string) {
  const day = createdAt.slice(0, 10)
  if (from && day < from) return false
  if (to && day > to) return false
  return true
}

function SearchField({
  value,
  placeholder,
  onChange,
}: {
  value: string
  placeholder: string
  onChange: (value: string) => void
}) {
  return (
    <label className="po-search">
      <input value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
      <svg viewBox="0 0 16 16" aria-hidden>
        <circle cx="7" cy="7" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.4" />
        <path d="M10.4 10.4 13.2 13.2" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    </label>
  )
}

function RateTip({ lines }: { lines: RateLine[] }) {
  return (
    <span className="po-tip">
      i
      <span className="po-tip-pop">
        {lines.map((line) => (
          <span key={line.label}>
            {line.label}：{line.rate}
          </span>
        ))}
      </span>
    </span>
  )
}

function ClaimBar({ claimed, total, expireLabel }: { claimed: number; total: number; expireLabel?: string }) {
  const width = total > 0 ? Math.min(100, Math.round((claimed / total) * 100)) : 0
  const expired = expireLabel === '【已过期】'
  const tone = expired ? 'is-partial' : 'is-full'
  return (
    <div className="po-claim">
      <span className="po-claim-top">
        {expireLabel ? <em className={tone}>{expireLabel}</em> : null}
        <b className={tone}>{width}%</b>
      </span>
      <span className={expired ? 'po-claim-track is-partial' : 'po-claim-track'}>
        <i style={{ width: `${width}%` }} />
      </span>
    </div>
  )
}

function statusText(item: ListOrder) {
  if (item.grant === 'all') return '全部发放成功'
  if (item.grant === 'partial') return '部分成功'
  return item.status
}

function statusClass(status: ListStatus) {
  if (status === '发放成功') return 'is-ok'
  if (status === '待支付') return 'is-wait'
  if (status === '充值中') return 'is-ing'
  return 'is-off'
}

export function PurchaseOrdersPage() {
  const { orders, users, approvalDraft, go } = useAdmin()
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('all')
  const [draft, setDraft] = useState<Filters>(EMPTY_FILTERS)
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)

  const rows = useMemo(() => {
    const latest = orders
      .filter((item) => item.source === 'approval' && (item.listStatus || '发放成功') === '发放成功')
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0))[0]
    const fullSeed = SEED.find((item) => item.grant === 'all')
    const fullSource = latest ? fromPaid(latest, users, latest.id === approvalDraft?.orderId) : fullSeed
    const total = fullSource && fullSource.claimTotal > 0 ? fullSource.claimTotal : 129
    const full = fullSource
      ? { ...fullSource, status: '发放成功' as const, grant: 'all' as const, claimed: Math.max(1, Math.round(total * 0.1)), claimTotal: total, expireLabel: '【有效期剩余：90天】' }
      : null
    const second = SEED.find((item) => item.id === '202611041050000002')
    const third = SEED.find((item) => item.grant === 'partial')
    const fourth = SEED.find((item) => item.id === '202611040920000004')
    const pinned = new Set([full?.id, second?.id, third?.id, fourth?.id])
    const rest = SEED.filter((item) => item.grant !== 'all' && !pinned.has(item.id)).sort((a, b) =>
      a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0,
    )
    return [full, second, third, fourth, ...rest].filter((item): item is ListOrder => Boolean(item))
  }, [orders, users, approvalDraft?.orderId])

  const shown = rows.filter((item) => {
    if (tab !== 'all' && item.status !== tab) return false
    if (!includes(item.productName, filters.goods)) return false
    if (!includes(item.id, filters.orderNo)) return false
    if (!includes(item.batchNo, filters.batchNo)) return false
    if (!includes(item.merchantName, filters.merchant)) return false
    if (!includes(item.merchantId, filters.merchantId)) return false
    if (filters.biz && item.businessType !== filters.biz) return false
    if (!includes(item.outerNo || '', filters.outerNo)) return false
    return inRange(item.createdAt, filters.from, filters.to)
  })

  const set = (key: keyof Filters, value: string) => setDraft((prev) => ({ ...prev, [key]: value }))

  const search = (event: FormEvent) => {
    event.preventDefault()
    setFilters(draft)
  }

  return (
    <div className="po-page">
      <form className="po-filters" onSubmit={search}>
        <SearchField value={draft.goods} placeholder="搜索商品名称" onChange={(value) => set('goods', value)} />
        <label className="po-range">
          <input type="date" value={draft.from} aria-label="下单开始时间" onChange={(event) => set('from', event.target.value)} />
          <span>-</span>
          <input type="date" value={draft.to} aria-label="终止时间" onChange={(event) => set('to', event.target.value)} />
        </label>
        <SearchField value={draft.orderNo} placeholder="搜索订单号" onChange={(value) => set('orderNo', value)} />
        <SearchField value={draft.batchNo} placeholder="搜索批次号" onChange={(value) => set('batchNo', value)} />
        <SearchField value={draft.merchant} placeholder="搜索商户名称" onChange={(value) => set('merchant', value)} />
        <SearchField value={draft.merchantId} placeholder="搜索商户ID" onChange={(value) => set('merchantId', value)} />
        <label className="po-select">
          <select value={draft.biz} aria-label="业务类型" onChange={(event) => set('biz', event.target.value)}>
            <option value="">请选择业务类型</option>
            {BIZ_OPTIONS.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <SearchField value={draft.outerNo} placeholder="搜索第三方订单编号" onChange={(value) => set('outerNo', value)} />
        <div className="po-filter-actions">
          <button className="admin-primary" type="submit">
            查询
          </button>
          <button
            className="po-reset"
            type="button"
            onClick={() => {
              setDraft(EMPTY_FILTERS)
              setFilters(EMPTY_FILTERS)
            }}
          >
            重置
          </button>
        </div>
      </form>
      <div className="po-export">
        <button className="admin-primary" type="button">
          导出
        </button>
      </div>
      <section className="po-board">
        <div className="po-tabs">
          {TABS.map((item) => (
            <button key={item.id} type="button" className={tab === item.id ? 'on' : ''} onClick={() => setTab(item.id)}>
              {item.label}
            </button>
          ))}
        </div>
        <div className="po-table-wrap">
          <div className="po-sheet">
          <div className="po-head">
            {COLUMNS.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
          {shown.map((item) => (
            <article key={item.id} className={item.fresh ? 'po-order is-fresh' : 'po-order'}>
              <div className="po-order-bar">
                <span>订单号：{item.id}</span>
                <span>批次号：{item.batchNo}</span>
                {item.outerNo ? <span>第三方订单编号：{item.outerNo}</span> : null}
                <em>下单时间：{item.createdAt}</em>
              </div>
              <div className="po-order-grid">
                <div className="po-goods">
                  <div className="po-thumb">
                    {item.productId ? <ProductIcon id={item.productId} /> : <div className="points-mark">积</div>}
                  </div>
                  <div>
                    <strong>{item.productName}</strong>
                    <p>商品编号：{item.skuNo}</p>
                    <p>提货方式：批量发放</p>
                    <b>¥{money(item.faceAmount)}</b>
                  </div>
                </div>
                <div>{item.merchantName}</div>
                <div>{item.businessType}</div>
                <div>
                  <AccountViewButton rows={item.accounts} />
                </div>
                <div className="po-rate">
                  {item.feeRate}
                  {item.feeDetail ? <RateTip lines={item.feeDetail} /> : null}
                </div>
                <div className="po-money">
                  <b>¥{money(item.faceAmount)}</b>
                  <span>商品费用 ¥{money(item.goodsAmount)}</span>
                  <span>服务费 ¥{money(item.feeAmount)}</span>
                </div>
                <div>
                  <em className={`po-status ${statusClass(item.status)}`}>{statusText(item)}</em>
                </div>
                <div>
                  <ClaimBar claimed={item.claimed} total={item.claimTotal} expireLabel={item.expireLabel} />
                </div>
                <div className="po-ops">
                  {item.status === '发放成功' ? (
                    <button className="po-error-link" type="button" onClick={() => go('datacenter')}>
                      详情
                    </button>
                  ) : null}
                  {item.status === '发放失败' ? (
                    <button className="po-error-link" type="button" onClick={() => downloadErrorFile(item)}>
                      下载报错信息
                    </button>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
          {shown.length === 0 ? <div className="empty-panel">暂无订单</div> : null}
          </div>
        </div>
      </section>
    </div>
  )
}
