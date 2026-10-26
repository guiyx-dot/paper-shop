import { useEffect, useState } from 'react'
import { DEMO_PHONE, money } from './model'
import { creditGeneralPoints } from './member-data'
import { loadRedeems, type RedeemOrder } from './redemptions'
import { adjustConsumerPoints } from '../store'
import type { ShopGood } from '../shop-catalog'

export type ShopOrderStatus = 'pending' | 'shipped' | 'completed' | 'refunding' | 'refunded' | 'closed'
export type ShopOrderKind = 'physical' | 'virtual'

export type ShopOrderEvent = {
  label: string
  time: string
  remark: string
}

export type ShopOrder = {
  id: string
  channel: string
  submittedAt: string
  phone: string
  name: string
  receiverName: string
  receiverPhone: string
  receiverAddress: string
  productId: string
  productName: string
  spec: string
  categoryName: string
  image?: string
  kind: ShopOrderKind
  qty: number
  unitPrice: number
  orderAmount: number
  couponAmount: number
  freight: number
  payAmount: number
  settleAmount: number
  payLabel: string
  status: ShopOrderStatus
  carrier: string
  trackingNo: string
  autoConfirmAt: string
  events: ShopOrderEvent[]
}

const ORDERS_KEY = 'paper-shop-orders-v1'

export const SHOP_STATUS_LABEL: Record<ShopOrderStatus, string> = {
  pending: '待发货',
  shipped: '已发货',
  completed: '已完成',
  refunding: '退款中',
  refunded: '已退款',
  closed: '交易关闭',
}

function stamp(date = new Date()) {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

export function orderTimeValue(value: string) {
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    const parsed = Date.parse(value.replace(' ', 'T'))
    if (!Number.isNaN(parsed)) return parsed
  }
  const matched = value.match(/(\d+)月(\d+)日\s*(\d+):(\d+)/)
  if (matched) return new Date(2026, Number(matched[1]) - 1, Number(matched[2]), Number(matched[3]), Number(matched[4])).getTime()
  if (value === '刚刚') return Date.now()
  return 0
}

function event(label: string, time: string, remark = '—'): ShopOrderEvent {
  return { label, time, remark }
}

function order(partial: ShopOrder): ShopOrder {
  return partial
}

const SEED: ShopOrder[] = [
  order({
    id: 'SO20261024001',
    channel: '拾贝优选',
    submittedAt: '2026-10-24 11:20:08',
    phone: DEMO_PHONE,
    name: '桂*徽',
    receiverName: '桂徽',
    receiverPhone: DEMO_PHONE,
    receiverAddress: '上海市浦东新区世纪大道 88 号',
    productId: 'oil',
    productName: '【刀唛】压榨花生油 5L',
    spec: '5L',
    categoryName: '粮油干货',
    kind: 'physical',
    qty: 1,
    unitPrice: 169.89,
    orderAmount: 169.89,
    couponAmount: 0,
    freight: 0,
    payAmount: 169.89,
    settleAmount: 169.89,
    payLabel: '积分支付',
    status: 'pending',
    carrier: '—',
    trackingNo: '—',
    autoConfirmAt: '—',
    events: [event('下单', '2026-10-24 11:20:08')],
  }),
  order({
    id: 'SO20261022002',
    channel: '拾贝优选',
    submittedAt: '2026-10-22 16:08:41',
    phone: DEMO_PHONE,
    name: '桂*徽',
    receiverName: '桂徽',
    receiverPhone: DEMO_PHONE,
    receiverAddress: '上海市浦东新区世纪大道 88 号',
    productId: 'apple',
    productName: '大凉山盐源丑苹果',
    spec: '4.5斤（70-75mm）',
    categoryName: '生鲜水果',
    kind: 'physical',
    qty: 1,
    unitPrice: 41.5,
    orderAmount: 41.5,
    couponAmount: 0,
    freight: 0,
    payAmount: 41.5,
    settleAmount: 41.5,
    payLabel: '积分支付',
    status: 'shipped',
    carrier: '顺丰速运',
    trackingNo: 'SF102200188',
    autoConfirmAt: '2026-10-29 16:08:41',
    events: [event('下单', '2026-10-22 16:08:41'), event('发货', '2026-10-22 18:06:12', '顺丰速运 SF102200188')],
  }),
  order({
    id: 'SO20261018003',
    channel: '拾贝优选',
    submittedAt: '2026-10-18 09:12:33',
    phone: '13800002202',
    name: '张*伟',
    receiverName: '张伟',
    receiverPhone: '13800002202',
    receiverAddress: '杭州市西湖区演示路 18 号',
    productId: 'lotion',
    productName: '身体乳',
    spec: '—',
    categoryName: '个护清洁',
    kind: 'physical',
    qty: 1,
    unitPrice: 74.9,
    orderAmount: 74.9,
    couponAmount: 0,
    freight: 0,
    payAmount: 74.9,
    settleAmount: 74.9,
    payLabel: '积分支付',
    status: 'completed',
    carrier: '中通快递',
    trackingNo: 'ZT20261018019',
    autoConfirmAt: '2026-10-25 09:12:33',
    events: [
      event('下单', '2026-10-18 09:12:33'),
      event('发货', '2026-10-18 15:40:02', '中通快递 ZT20261018019'),
      event('确认收货', '2026-10-21 09:12:33'),
    ],
  }),
  order({
    id: 'SO20261011004',
    channel: '拾贝优选',
    submittedAt: '2026-10-11 14:26:02',
    phone: '18600003303',
    name: '李*敏',
    receiverName: '李敏',
    receiverPhone: '18600003303',
    receiverAddress: '南京市玄武区演示街 6 号',
    productId: 'scrub',
    productName: '安野屋磨砂膏',
    spec: '—',
    categoryName: '个护清洁',
    kind: 'physical',
    qty: 1,
    unitPrice: 72,
    orderAmount: 72,
    couponAmount: 0,
    freight: 0,
    payAmount: 72,
    settleAmount: 72,
    payLabel: '积分支付',
    status: 'refunded',
    carrier: '圆通速递',
    trackingNo: 'YT20261011008',
    autoConfirmAt: '2026-10-18 14:26:02',
    events: [
      event('下单', '2026-10-11 14:26:02'),
      event('发货', '2026-10-12 09:18:44', '圆通速递 YT20261011008'),
      event('确认收货', '2026-10-15 14:26:02'),
      event('申请退货退款', '2026-10-16 10:02:18'),
      event('退款完成', '2026-10-16 11:30:06', '积分已退回'),
    ],
  }),
  order({
    id: 'SO20261009005',
    channel: '拾贝优选',
    submittedAt: '2026-10-09 10:13:14',
    phone: '13700004404',
    name: '王*强',
    receiverName: '—',
    receiverPhone: '—',
    receiverAddress: '—',
    productId: 'iqiyi',
    productName: '爱奇艺年卡',
    spec: '年卡',
    categoryName: '视听会员',
    kind: 'virtual',
    qty: 1,
    unitPrice: 377.5,
    orderAmount: 377.5,
    couponAmount: 0,
    freight: 0,
    payAmount: 377.5,
    settleAmount: 377.5,
    payLabel: '积分支付',
    status: 'closed',
    carrier: '—',
    trackingNo: '—',
    autoConfirmAt: '—',
    events: [event('下单', '2026-10-09 10:13:14'), event('取消订单', '2026-10-09 10:13:20', '未扣积分')],
  }),
  order({
    id: 'SO20260928006',
    channel: '拾贝优选',
    submittedAt: '2026-09-28 19:40:22',
    phone: '13800002202',
    name: '张*伟',
    receiverName: '—',
    receiverPhone: '—',
    receiverAddress: '—',
    productId: 'tencent',
    productName: '腾讯视频年卡',
    spec: '年卡',
    categoryName: '视听会员',
    kind: 'virtual',
    qty: 1,
    unitPrice: 379,
    orderAmount: 379,
    couponAmount: 0,
    freight: 0,
    payAmount: 379,
    settleAmount: 379,
    payLabel: '积分支付',
    status: 'completed',
    carrier: '—',
    trackingNo: '—',
    autoConfirmAt: '—',
    events: [event('下单', '2026-09-28 19:40:22'), event('兑换完成', '2026-09-28 19:40:22')],
  }),
]

function readStored(): ShopOrder[] {
  try {
    const raw = sessionStorage.getItem(ORDERS_KEY)
    const parsed = raw ? (JSON.parse(raw) as ShopOrder[]) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeStored(items: ShopOrder[]) {
  sessionStorage.setItem(ORDERS_KEY, JSON.stringify(items))
  window.dispatchEvent(new Event('points-mall-sync'))
}

function persist(order: ShopOrder) {
  writeStored([order, ...readStored().filter((item) => item.id !== order.id)])
}

function fromLegacy(item: RedeemOrder): ShopOrder {
  const refunded = item.status === 'refunded'
  return {
    id: item.id,
    channel: '拾贝优选',
    submittedAt: item.time,
    phone: item.phone,
    name: item.name,
    receiverName: item.name.replace('*', ''),
    receiverPhone: item.phone,
    receiverAddress: '—',
    productId: item.productId,
    productName: item.productName,
    spec: '—',
    categoryName: '—',
    kind: 'physical',
    qty: 1,
    unitPrice: item.cost,
    orderAmount: item.cost,
    couponAmount: 0,
    freight: 0,
    payAmount: item.cost,
    settleAmount: item.cost,
    payLabel: '积分支付',
    status: refunded ? 'refunded' : 'completed',
    carrier: '—',
    trackingNo: '—',
    autoConfirmAt: '—',
    events: refunded
      ? [event('下单', item.time), event('退款完成', item.refundedAt ?? item.time, '积分已退回')]
      : [event('下单', item.time), event('兑换完成', item.time)],
  }
}

export function loadShopOrders(): ShopOrder[] {
  const map = new Map<string, ShopOrder>()
  for (const item of SEED) map.set(item.id, item)
  for (const item of loadRedeems()) {
    if (item.source === 'shop' && !map.has(item.id)) map.set(item.id, fromLegacy(item))
  }
  for (const item of readStored()) map.set(item.id, item)
  return [...map.values()].sort((a, b) => orderTimeValue(b.submittedAt) - orderTimeValue(a.submittedAt))
}

export function listShopRedeems() {
  return loadShopOrders()
    .filter((item) => item.status !== 'closed')
    .map((item) => ({
      id: item.id,
      productName: item.productName,
      time: item.submittedAt,
      cost: item.payAmount,
      status: item.status,
    }))
}

export function appendShopOrder(product: ShopGood, categoryName: string) {
  const amount = Number(product.price.split('~')[0])
  const price = Number.isFinite(amount) ? amount : 0
  const virtual = product.categoryId === 'c-audio' || product.tags.includes('视听')
  const now = stamp()
  const created: ShopOrder = {
    id: `SO${Date.now().toString().slice(-8)}`,
    channel: '拾贝优选',
    submittedAt: now,
    phone: DEMO_PHONE,
    name: '桂*徽',
    receiverName: virtual ? '—' : '桂徽',
    receiverPhone: virtual ? '—' : DEMO_PHONE,
    receiverAddress: virtual ? '—' : '上海市浦东新区世纪大道 88 号',
    productId: product.id,
    productName: product.name,
    spec: product.spec || '—',
    categoryName: categoryName || '—',
    image: product.image,
    kind: virtual ? 'virtual' : 'physical',
    qty: 1,
    unitPrice: price,
    orderAmount: price,
    couponAmount: 0,
    freight: 0,
    payAmount: price,
    settleAmount: price,
    payLabel: '积分支付',
    status: virtual ? 'completed' : 'pending',
    carrier: '—',
    trackingNo: '—',
    autoConfirmAt: '—',
    events: virtual ? [event('下单', now), event('兑换完成', now)] : [event('下单', now)],
  }
  persist(created)
  return created
}

export function refundAction(order: ShopOrder): 'refund' | 'return' | 'confirm' | null {
  if (order.status === 'pending') return 'refund'
  if (order.status === 'shipped' || order.status === 'completed') return 'return'
  if (order.status === 'refunding') return 'confirm'
  return null
}

export function refundActionLabel(action: 'refund' | 'return' | 'confirm') {
  if (action === 'refund') return '退款'
  if (action === 'return') return '退货退款'
  return '确认退款'
}

export function requestShopRefund(id: string) {
  const current = loadShopOrders().find((item) => item.id === id)
  if (!current) return false
  const action = refundAction(current)
  if (action !== 'refund' && action !== 'return') return false
  persist({
    ...current,
    status: 'refunding',
    events: [...current.events, event(action === 'refund' ? '申请退款' : '申请退货退款', stamp())],
  })
  return true
}

export function confirmShopRefund(id: string) {
  const current = loadShopOrders().find((item) => item.id === id)
  if (!current || current.status !== 'refunding') return false
  const now = stamp()
  persist({
    ...current,
    status: 'refunded',
    events: [...current.events, event('退款完成', now, '积分已退回')],
  })
  const title = `退款${current.productName}`
  if (current.phone.replace(/\D/g, '') === DEMO_PHONE) adjustConsumerPoints(current.payAmount, title)
  else creditGeneralPoints(current.phone, current.payAmount, title)
  return true
}

function statusClass(status: ShopOrderStatus) {
  if (status === 'closed' || status === 'refunded') return 'list-status is-off'
  if (status === 'refunding') return 'list-status is-warn'
  return 'list-status'
}

function dayOf(value: string) {
  return /^\d{4}-\d{2}-\d{2}/.test(value) ? value.slice(0, 10) : ''
}

const EMPTY_QUERY = { id: '', phone: '', product: '', status: '', kind: '', start: '', end: '' }

export function ShopOrdersPage() {
  const [items, setItems] = useState(loadShopOrders)
  const [viewId, setViewId] = useState<string | null>(null)
  const [pending, setPending] = useState<ShopOrder | null>(null)
  const [form, setForm] = useState(EMPTY_QUERY)
  const [query, setQuery] = useState(EMPTY_QUERY)

  useEffect(() => {
    const sync = () => setItems(loadShopOrders())
    window.addEventListener('points-mall-sync', sync)
    return () => window.removeEventListener('points-mall-sync', sync)
  }, [])

  const view = items.find((item) => item.id === viewId) ?? null
  const rows = items.filter((item) => {
    if (query.id && !item.id.includes(query.id.trim())) return false
    if (query.phone && !item.phone.includes(query.phone.trim()) && !item.receiverPhone.includes(query.phone.trim())) return false
    if (query.product && !item.productName.includes(query.product.trim())) return false
    if (query.status && item.status !== query.status) return false
    if (query.kind && item.kind !== query.kind) return false
    const day = dayOf(item.submittedAt)
    if ((query.start || query.end) && !day) return false
    if (query.start && day < query.start) return false
    if (query.end && day > query.end) return false
    return true
  })

  const openRefund = (order: ShopOrder) => {
    if (!refundAction(order)) return
    setPending(order)
  }

  const submitRefund = () => {
    if (!pending) return
    const action = refundAction(pending)
    if (action === 'confirm') confirmShopRefund(pending.id)
    else if (action) requestShopRefund(pending.id)
    setItems(loadShopOrders())
    setPending(null)
  }

  if (view) {
    const action = refundAction(view)
    return (
      <div className="list-page">
        <div className="admin-crumb">
          <button type="button" onClick={() => setViewId(null)}>
            商城管理 / 商品订单
          </button>
          <span> / {view.id}</span>
        </div>
        <div className="order-head">
          <div>
            <h2 className="list-title">商品订单详情</h2>
            <p className="list-note">订单状态：{SHOP_STATUS_LABEL[view.status]}</p>
          </div>
          {action ? (
            <button className="admin-primary" type="button" onClick={() => openRefund(view)}>
              {refundActionLabel(action)}
            </button>
          ) : null}
        </div>

        <section className="list-card order-section">
          <h3>基本信息</h3>
          <div className="order-kv">
            <div>
              <span>订单编号</span>
              <b>{view.id}</b>
            </div>
            <div>
              <span>渠道来源</span>
              <b>{view.channel}</b>
            </div>
            <div>
              <span>用户手机号</span>
              <b>{view.phone}</b>
            </div>
            <div>
              <span>支付方式</span>
              <b>{view.payLabel}</b>
            </div>
            <div>
              <span>订单类型</span>
              <b>{view.kind === 'virtual' ? '虚拟商品' : '实物商品'}</b>
            </div>
            <div>
              <span>提交时间</span>
              <b>{view.submittedAt}</b>
            </div>
            <div>
              <span>自动确认收货时间</span>
              <b>{view.autoConfirmAt}</b>
            </div>
            <div>
              <span>配送公司</span>
              <b>{view.carrier}</b>
            </div>
            <div>
              <span>物流单号</span>
              <b>{view.trackingNo}</b>
            </div>
          </div>
        </section>

        <section className="list-card order-section">
          <h3>商品信息</h3>
          <table className="admin-table list-table">
            <thead>
              <tr>
                <th className="w-thumb">商品图片</th>
                <th className="w-id">商品ID</th>
                <th>商品名称</th>
                <th className="w-area">商品规格</th>
                <th className="w-pos">商品类别</th>
                <th className="w-num">数量</th>
                <th className="w-num">单价</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  {view.image ? <img className="mall-thumb" src={view.image} alt="" /> : <span className="mall-thumb is-empty">{view.productName.replace(/[【】\s]/g, '').slice(0, 1)}</span>}
                </td>
                <td>{view.productId}</td>
                <td>{view.productName}</td>
                <td>{view.spec}</td>
                <td>{view.categoryName}</td>
                <td>{view.qty}</td>
                <td>{money(view.unitPrice)}</td>
              </tr>
            </tbody>
          </table>
          <p className="order-total">合计：{money(view.orderAmount)} 元</p>
        </section>

        <section className="list-card order-section">
          <h3>收货地址信息</h3>
          <div className="order-kv">
            <div>
              <span>收货人姓名</span>
              <b>{view.receiverName}</b>
            </div>
            <div>
              <span>收货人地址</span>
              <b>{view.receiverAddress}</b>
            </div>
            <div>
              <span>收货人电话</span>
              <b>{view.receiverPhone}</b>
            </div>
          </div>
        </section>

        <section className="list-card order-section">
          <h3>费用信息</h3>
          <div className="order-kv">
            <div>
              <span>支付方式</span>
              <b>{view.payLabel}</b>
            </div>
            <div>
              <span>订单金额</span>
              <b>{money(view.orderAmount)}</b>
            </div>
            <div>
              <span>优惠券优惠金额</span>
              <b>{view.couponAmount ? money(view.couponAmount) : '—'}</b>
            </div>
            <div>
              <span>运费金额</span>
              <b>{view.freight ? money(view.freight) : '—'}</b>
            </div>
            <div>
              <span>实付金额</span>
              <b>{money(view.payAmount)}</b>
            </div>
            <div>
              <span>结算金额</span>
              <b>{money(view.settleAmount)}</b>
            </div>
          </div>
        </section>

        <section className="list-card order-section">
          <h3>操作信息</h3>
          <table className="admin-table list-table">
            <thead>
              <tr>
                <th>订单流转</th>
                <th className="w-time">流转时间</th>
                <th>订单备注</th>
              </tr>
            </thead>
            <tbody>
              {view.events.map((item) => (
                <tr key={`${item.label}-${item.time}`}>
                  <td>{item.label}</td>
                  <td>{item.time}</td>
                  <td>{item.remark}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        {pending ? <RefundDialog order={pending} onClose={() => setPending(null)} onOk={submitRefund} /> : null}
      </div>
    )
  }

  return (
    <div className="list-page">
      <div className="admin-crumb">商城管理 / 商品订单</div>
      <h2 className="list-title">商品订单</h2>
      <p className="list-note">自营商品的兑换订单。福多多回传的订单在积分商城的兑换订单。待发货可退款；已发货、已完成可退货退款。确认退款后积分退回。</p>
      <section className="list-card">
        <div className="mall-filters">
          <input value={form.id} placeholder="请输入订单编号" onChange={(event) => setForm({ ...form, id: event.target.value })} />
          <input value={form.phone} placeholder="请输入用户手机号" onChange={(event) => setForm({ ...form, phone: event.target.value })} />
          <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
            <option value="">请选择订单状态</option>
            <option value="pending">待发货</option>
            <option value="shipped">已发货</option>
            <option value="completed">已完成</option>
            <option value="refunding">退款中</option>
            <option value="refunded">已退款</option>
            <option value="closed">交易关闭</option>
          </select>
          <select value={form.kind} onChange={(event) => setForm({ ...form, kind: event.target.value })}>
            <option value="">请选择订单类型</option>
            <option value="physical">实物商品</option>
            <option value="virtual">虚拟商品</option>
          </select>
          <input type="date" value={form.start} aria-label="提交开始时间" onChange={(event) => setForm({ ...form, start: event.target.value })} />
          <input type="date" value={form.end} aria-label="结束时间" onChange={(event) => setForm({ ...form, end: event.target.value })} />
          <input value={form.product} placeholder="请输入商品名称" onChange={(event) => setForm({ ...form, product: event.target.value })} />
          <div className="mall-filter-actions">
            <button className="admin-primary" type="button" onClick={() => setQuery(form)}>
              查询
            </button>
            <button
              className="admin-ghost"
              type="button"
              onClick={() => {
                setForm(EMPTY_QUERY)
                setQuery(EMPTY_QUERY)
              }}
            >
              重置
            </button>
          </div>
        </div>
      </section>
      <section className="list-card is-table is-wide">
        {rows.length === 0 ? <div className="empty-panel">暂无订单</div> : null}
        <table className="admin-table list-table is-wide">
          <thead>
            <tr>
              <th className="w-order-no">订单编号</th>
              <th className="w-channel">渠道来源</th>
              <th className="w-time">提交时间</th>
              <th className="w-phone">用户手机号</th>
              <th className="w-phone">收货人电话</th>
              <th>商品名称</th>
              <th className="w-pay">支付方式</th>
              <th className="w-kind">订单类型</th>
              <th className="w-num">订单金额</th>
              <th className="w-num">实付金额</th>
              <th className="w-status">订单状态</th>
              <th className="w-order-ops">操作</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => {
              const action = refundAction(item)
              return (
                <tr key={item.id}>
                  <td className="w-order-no">{item.id}</td>
                  <td>{item.channel}</td>
                  <td>{item.submittedAt}</td>
                  <td>{item.phone}</td>
                  <td>{item.receiverPhone}</td>
                  <td>{item.productName}</td>
                  <td>{item.payLabel}</td>
                  <td>{item.kind === 'virtual' ? '虚拟商品' : '实物商品'}</td>
                  <td>{money(item.orderAmount)}</td>
                  <td>{money(item.payAmount)}</td>
                  <td>
                    <span className={statusClass(item.status)}>{SHOP_STATUS_LABEL[item.status]}</span>
                  </td>
                  <td className="w-order-ops">
                    <div className="mall-ops is-stack">
                      <button className="link" type="button" onClick={() => setViewId(item.id)}>
                        查看订单
                      </button>
                      {action ? (
                        <button className="link" type="button" onClick={() => openRefund(item)}>
                          {refundActionLabel(action)}
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </section>
      {pending ? <RefundDialog order={pending} onClose={() => setPending(null)} onOk={submitRefund} /> : null}
    </div>
  )
}

function RefundDialog({ order, onClose, onOk }: { order: ShopOrder; onClose: () => void; onOk: () => void }) {
  const action = refundAction(order)
  const confirming = action === 'confirm'
  return (
    <div className="admin-mask" onClick={onClose}>
      <div className="admin-modal mall-dialog is-confirm" onClick={(event) => event.stopPropagation()}>
        <div className="mall-dialog-head">
          <h2>{confirming ? '确认退款' : action === 'refund' ? '确认退款' : '确认退货退款'}</h2>
          <button type="button" onClick={onClose} aria-label="关闭">
            ×
          </button>
        </div>
        <p className="modal-lead">
          {confirming
            ? `${order.name} 的「${order.productName}」将退回 ${money(order.payAmount)} 积分，订单记为已退款。`
            : `${order.name} 的「${order.productName}」将整单进入退款中。确认退款后才退回积分。`}
        </p>
        <div className="refund-actions">
          <button className="admin-ghost" type="button" onClick={onClose}>
            取消
          </button>
          <button className="admin-primary" type="button" onClick={onOk}>
            {confirming ? '确认退款' : '提交'}
          </button>
        </div>
      </div>
    </div>
  )
}
