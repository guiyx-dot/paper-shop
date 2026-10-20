import { useEffect, useState } from 'react'
import { ProductIcon } from '../icons'
import { catalogProduct } from '../catalog'
import { formatTime, peekConsumer, refundConsumerOrder, adjustConsumerPoints } from '../store'
import { DEMO_PHONE, maskPhone } from './model'
import { creditGeneralPoints } from './member-data'

export type RedeemStatus = 'completed' | 'refunded'

export type RedeemOrder = {
  id: string
  phone: string
  name: string
  productId: string
  productName: string
  cost: number
  payLabel: string
  time: string
  status: RedeemStatus
  refundedAt?: string
  source?: 'shop' | 'rights'
}

const REDEEMS_KEY = 'points-mall-spec-redeems-v2'

const SEED: RedeemOrder[] = [
  {
    id: 'ORD88210011',
    phone: '13800002202',
    name: '张*伟',
    productId: 'starbucks',
    productName: '星巴克中杯兑换券',
    cost: 99,
    payLabel: '积分',
    time: '9月1日 10:12',
    status: 'completed',
  },
  {
    id: 'ORD88210028',
    phone: '13700004404',
    name: '王*强',
    productId: 'takeout',
    productName: '外卖满减券',
    cost: 50,
    payLabel: '积分',
    time: '8月21日 08:44',
    status: 'completed',
  },
  {
    id: 'RD2003',
    phone: DEMO_PHONE,
    name: '桂*徽',
    productId: 'ride',
    productName: '网约车代金券',
    cost: 100,
    payLabel: '积分',
    time: '9月3日 09:15',
    status: 'completed',
  },
]

function fromConsumer(): RedeemOrder[] {
  const data = peekConsumer()
  return data.orders.flatMap((item) => {
    const product = catalogProduct(item.productId)
    if (product?.zone === 'benefit') return []
    return [
      {
        id: item.id,
        phone: DEMO_PHONE,
        name: '桂*徽',
        productId: item.productId,
        productName: item.productName,
        cost: item.cost,
        payLabel: item.payLabel ?? (item.payWith === 'gold' ? '通用金' : item.payWith === 'coupon' ? '抵扣券' : '积分'),
        time: item.time,
        status: item.status === 'refunded' ? 'refunded' : 'completed',
      },
    ]
  })
}

function loadRedeems(): RedeemOrder[] {
  let stored: RedeemOrder[] = []
  try {
    const raw = sessionStorage.getItem(REDEEMS_KEY)
    stored = raw ? (JSON.parse(raw) as RedeemOrder[]) : []
    if (!Array.isArray(stored) || stored.length === 0) stored = SEED.map((item) => ({ ...item }))
  } catch {
    stored = SEED.map((item) => ({ ...item }))
  }
  const map = new Map(stored.map((item) => [item.id, item]))
  for (const item of fromConsumer()) {
    const prev = map.get(item.id)
    map.set(item.id, {
      ...(prev ?? item),
      ...item,
      status: item.status === 'refunded' || prev?.status === 'refunded' ? 'refunded' : 'completed',
      refundedAt: item.status === 'refunded' ? prev?.refundedAt ?? '刚刚' : prev?.refundedAt,
    })
  }
  return [...map.values()]
}

function saveRedeems(items: RedeemOrder[]) {
  sessionStorage.setItem(REDEEMS_KEY, JSON.stringify(items))
}

export function listShopRedeems() {
  return loadRedeems().filter((item) => item.source === 'shop')
}

export function appendShopRedeem(productName: string, cost: number) {
  const order: RedeemOrder = {
    id: `SP${Date.now().toString().slice(-8)}`,
    phone: DEMO_PHONE,
    name: '桂*徽',
    productId: 'shop',
    productName,
    cost,
    payLabel: '积分',
    time: formatTime(),
    status: 'completed',
    source: 'shop',
  }
  saveRedeems([order, ...loadRedeems().filter((item) => item.id !== order.id)])
  window.dispatchEvent(new Event('points-mall-sync'))
}

function applyRefund(order: RedeemOrder) {
  if (order.status === 'refunded') return false
  if (order.source === 'shop') return true
  const demo = order.phone.replace(/\D/g, '') === DEMO_PHONE
  if (demo) {
    const exists = peekConsumer().orders.some((item) => item.id === order.id)
    if (exists) refundConsumerOrder(order.id)
    else adjustConsumerPoints(order.cost, `退款${order.productName}`)
  } else {
    creditGeneralPoints(order.phone, order.cost, `退款${order.productName}`)
  }
  return true
}

export function RedeemsPage() {
  const [items, setItems] = useState(loadRedeems)
  const [pending, setPending] = useState<RedeemOrder | null>(null)
  const [view, setView] = useState<RedeemOrder | null>(null)
  const [form, setForm] = useState({ id: '', phone: '', product: '', status: '' })
  const [query, setQuery] = useState(form)

  useEffect(() => {
    const sync = () => setItems(loadRedeems())
    window.addEventListener('points-mall-sync', sync)
    return () => window.removeEventListener('points-mall-sync', sync)
  }, [])

  const rows = items.filter((item) => {
    if (query.id && !item.id.includes(query.id.trim())) return false
    if (query.phone && !item.phone.includes(query.phone.trim()) && !item.name.includes(query.phone.trim())) return false
    if (query.product && !item.productName.includes(query.product.trim())) return false
    if (query.status && item.status !== query.status) return false
    return true
  })

  const confirmRefund = () => {
    if (!pending) return
    applyRefund(pending)
    const next = loadRedeems().map((item) =>
      item.id === pending.id ? { ...item, status: 'refunded' as const, refundedAt: formatTime() } : item,
    )
    saveRedeems(next)
    setItems(next)
    setPending(null)
  }

  return (
    <div className="list-page">
      <div className="admin-crumb">积分商城 / 兑换订单</div>
      <h2 className="list-title">兑换订单</h2>
      <p className="list-note">商品订单记在这里，含自营商品和权益商品。一笔订单只能整单退，不能退一部分；多笔订单可以分别退。</p>
      <section className="list-card">
        <div className="mall-filters">
          <input value={form.id} placeholder="订单编号" onChange={(event) => setForm({ ...form, id: event.target.value })} />
          <input value={form.phone} placeholder="用户手机号或姓名" onChange={(event) => setForm({ ...form, phone: event.target.value })} />
          <input value={form.product} placeholder="商品名称" onChange={(event) => setForm({ ...form, product: event.target.value })} />
          <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
            <option value="">订单状态</option>
            <option value="completed">已完成</option>
            <option value="refunded">已退款</option>
          </select>
          <div className="mall-filter-actions">
            <button className="admin-primary" type="button" onClick={() => setQuery(form)}>
              查询
            </button>
            <button
              className="admin-ghost"
              type="button"
              onClick={() => {
                const empty = { id: '', phone: '', product: '', status: '' }
                setForm(empty)
                setQuery(empty)
              }}
            >
              重置
            </button>
          </div>
        </div>
      </section>
      <section className="list-card is-table">
        {rows.length === 0 ? <div className="empty-panel">暂无订单</div> : null}
        <table className="admin-table list-table">
          <thead>
            <tr>
              <th className="w-id">订单号</th>
              <th className="w-user">用户</th>
              <th>商品</th>
              <th className="w-num">来源</th>
              <th className="w-num">消耗</th>
              <th className="w-num">支付</th>
              <th className="w-time">时间</th>
              <th className="w-status">状态</th>
              <th className="w-order-ops">操作</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>
                  <strong>{item.name}</strong>
                  <div className="muted-line">{maskPhone(item.phone)}</div>
                </td>
                <td>
                  <div className="goods-cell">
                    <ProductIcon id={item.productId} />
                    <strong>{item.productName}</strong>
                  </div>
                </td>
                <td>{item.source === 'shop' ? '自营' : '权益'}</td>
                <td>-{item.cost}</td>
                <td>{item.payLabel}</td>
                <td>{item.time}</td>
                <td>
                  <span className={item.status === 'refunded' ? 'list-status is-off' : 'list-status'}>
                    {item.status === 'refunded' ? '已退款' : '已完成'}
                  </span>
                </td>
                <td className="w-order-ops">
                  <div className="mall-ops is-stack">
                    <button className="link" type="button" onClick={() => setView(item)}>
                      查看订单
                    </button>
                    {item.status === 'completed' ? (
                      <button className="link" type="button" onClick={() => setPending(item)}>
                        退货退款
                      </button>
                    ) : (
                      <span className="muted-line">{item.refundedAt ?? '已退回'}</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {view ? (
        <div className="admin-mask" onClick={() => setView(null)}>
          <div className="admin-modal mall-dialog" onClick={(event) => event.stopPropagation()}>
            <div className="mall-dialog-head">
              <h2>订单详情</h2>
              <button type="button" onClick={() => setView(null)} aria-label="关闭">
                ×
              </button>
            </div>
            <dl className="mall-detail">
              <div>
                <dt>订单编号</dt>
                <dd>{view.id}</dd>
              </div>
              <div>
                <dt>用户</dt>
                <dd>
                  {view.name} {maskPhone(view.phone)}
                </dd>
              </div>
              <div>
                <dt>商品名称</dt>
                <dd>{view.productName}</dd>
              </div>
              <div>
                <dt>订单类型</dt>
                <dd>{view.source === 'shop' ? '自营商品' : '权益商品'}</dd>
              </div>
              <div>
                <dt>支付方式</dt>
                <dd>{view.payLabel}</dd>
              </div>
              <div>
                <dt>消耗积分</dt>
                <dd>{view.cost}</dd>
              </div>
              <div>
                <dt>提交时间</dt>
                <dd>{view.time}</dd>
              </div>
              <div>
                <dt>订单状态</dt>
                <dd>{view.status === 'refunded' ? '已退款' : '已完成'}</dd>
              </div>
            </dl>
            <div className="refund-actions">
              <button className="admin-primary" type="button" onClick={() => setView(null)}>
                关闭
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {pending ? (
        <div className="admin-mask" onClick={() => setPending(null)}>
          <div className="admin-modal mall-dialog is-confirm" onClick={(event) => event.stopPropagation()}>
            <div className="mall-dialog-head">
              <h2>确认退货退款</h2>
              <button type="button" onClick={() => setPending(null)} aria-label="关闭">
                ×
              </button>
            </div>
            <p className="modal-lead">
              {pending.name} 兑换的「{pending.productName}」将退回 {pending.cost} 通用积分，订单标记为已退款。
            </p>
            <div className="refund-actions">
              <button className="admin-ghost" type="button" onClick={() => setPending(null)}>
                取消
              </button>
              <button className="admin-primary" type="button" onClick={confirmRefund}>
                确认退款
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
