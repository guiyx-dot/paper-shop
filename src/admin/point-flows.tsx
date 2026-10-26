import { useEffect, useMemo, useState } from 'react'
import { maskPhone } from './model'
import { useMemberRows } from './member-data'
import { loadRedeems } from './redemptions'
import { orderTimeValue } from './shop-orders'

type FlowKind = 'redeem' | 'refund'

type PointFlow = {
  id: string
  phone: string
  name: string
  kind: FlowKind
  amount: number
  orderId: string
  title: string
  time: string
}

const KIND_LABEL: Record<FlowKind, string> = {
  redeem: '兑换',
  refund: '退款',
}

function flowNo(prefix: string, id: string) {
  return `${prefix}${id.replace(/^(ORD|RD|SO)/, '')}`
}

function pointsText(amount: number) {
  const abs = Math.abs(amount)
  const text = Number.isInteger(abs) ? String(abs) : abs.toFixed(2)
  return amount > 0 ? `+${text}` : `-${text}`
}

function buildFlows(members: { phone: string; name: string }[]): PointFlow[] {
  const nameOf = new Map(members.map((item) => [item.phone.replace(/\D/g, ''), item.name]))
  const flows: PointFlow[] = []

  for (const order of loadRedeems()) {
    if (order.source === 'shop') continue
    const phone = order.phone.replace(/\D/g, '')
    flows.push({
      id: flowNo('RD', order.id),
      phone,
      name: nameOf.get(phone) ?? order.name,
      kind: 'redeem',
      amount: -order.cost,
      orderId: order.id,
      title: `兑换${order.productName}`,
      time: order.time,
    })
    if (order.status === 'refunded') {
      flows.push({
        id: flowNo('RF', order.id),
        phone,
        name: nameOf.get(phone) ?? order.name,
        kind: 'refund',
        amount: order.cost,
        orderId: order.id,
        title: `退款${order.productName}`,
        time: order.refundedAt ?? order.time,
      })
    }
  }

  return flows.sort((a, b) => orderTimeValue(b.time) - orderTimeValue(a.time))
}

const EMPTY = { phone: '', kind: '', orderId: '' }

export function PointFlowsPage() {
  const { rows } = useMemberRows()
  const [tick, setTick] = useState(0)
  const [form, setForm] = useState(EMPTY)
  const [query, setQuery] = useState(EMPTY)

  useEffect(() => {
    const sync = () => setTick((value) => value + 1)
    window.addEventListener('points-mall-sync', sync)
    return () => window.removeEventListener('points-mall-sync', sync)
  }, [])

  const flows = useMemo(() => buildFlows(rows), [rows, tick])
  const shown = flows.filter((item) => {
    if (query.phone && !item.phone.includes(query.phone.trim()) && !item.name.includes(query.phone.trim())) return false
    if (query.kind && item.kind !== query.kind) return false
    if (query.orderId && !item.orderId.includes(query.orderId.trim())) return false
    return true
  })

  return (
    <div className="list-page">
      <div className="admin-crumb">积分商城 / 兑换流水</div>
      <h2 className="list-title">兑换流水</h2>
      <p className="list-note">只记福多多的流水。兑换扣积分，退款加积分。退款另记一条，原来的兑换扣减还在。</p>
      <section className="list-card">
        <div className="mall-filters">
          <input value={form.phone} placeholder="用户手机号或姓名" onChange={(event) => setForm({ ...form, phone: event.target.value })} />
          <select value={form.kind} onChange={(event) => setForm({ ...form, kind: event.target.value })}>
            <option value="">变动类型</option>
            <option value="redeem">兑换</option>
            <option value="refund">退款</option>
          </select>
          <input value={form.orderId} placeholder="关联订单号" onChange={(event) => setForm({ ...form, orderId: event.target.value })} />
          <div className="mall-filter-actions">
            <button className="admin-primary" type="button" onClick={() => setQuery(form)}>
              查询
            </button>
            <button
              className="admin-ghost"
              type="button"
              onClick={() => {
                setForm(EMPTY)
                setQuery(EMPTY)
              }}
            >
              重置
            </button>
          </div>
        </div>
      </section>
      <section className="list-card is-table is-wide">
        {shown.length === 0 ? <div className="empty-panel">暂无流水</div> : null}
        <table className="admin-table list-table is-flow">
          <thead>
            <tr>
              <th className="w-flow">流水号</th>
              <th className="w-user">用户</th>
              <th className="w-pos">变动类型</th>
              <th className="w-num">变动积分</th>
              <th>说明</th>
              <th className="w-id">关联订单</th>
              <th className="w-time">时间</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>
                  <strong>{item.name}</strong>
                  <div className="muted-line">{maskPhone(item.phone)}</div>
                </td>
                <td>{KIND_LABEL[item.kind]}</td>
                <td className={item.amount > 0 ? 'flow-plus' : 'flow-minus'}>{pointsText(item.amount)}</td>
                <td>{item.title}</td>
                <td>{item.orderId}</td>
                <td>{item.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
