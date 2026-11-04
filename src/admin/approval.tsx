import { useMemo, useState } from 'react'
import { AccountViewButton } from './accounts'
import { EquityPicker, GeneralPointsCard } from './equity-picker'
import { ProductIcon } from '../icons'
import {
  APPROVAL_RECORDS,
  FEE_RATE,
  GENERAL_FEE_RATE,
  SCENE_TREE,
  approvalById,
  dedicatedLabel,
  purchaseGoodName,
  skuById,
  feeRateFor,
  isCommissionScene,
  money,
  planFromRows,
  quote,
  type ImportRow,
  type PurchaseKind,
  type SceneL1,
  type SceneL2,
} from './model'
import { maskPhone, useAdmin } from './store'

const ACCOUNT_BALANCE = 50000

function pointsHeroCopy(kind: PurchaseKind) {
  return kind === 'dedicated'
    ? '采购后发放给审批单用户，绑定一种专用券。'
    : '采购后发放给审批单用户，作为积分专区通用积分。'
}

export function KindPicker({
  kind,
  onKind,
  plain = false,
}: {
  kind: PurchaseKind | null
  onKind: (kind: PurchaseKind) => void
  plain?: boolean
}) {
  const dedicatedOn = kind === 'dedicated'
  const generalOn = kind === 'general'
  const row = (id: PurchaseKind, on: boolean, mark: string, title: string, note: string) => (
    <button type="button" className={on ? 'kind-row on' : 'kind-row'} onClick={() => onKind(id)}>
      <span className="kind-mark" aria-hidden="true">{mark}</span>
      <span className="kind-row-body">
        <strong>{title}</strong>
        <em>{note}</em>
      </span>
      <span className={on ? 'radio on' : 'radio'} />
      <span className="kind-go" aria-hidden="true">选择</span>
    </button>
  )
  return (
    <div className={plain ? 'kind-shell is-plain is-band' : 'kind-shell is-list'}>
      {plain || !kind ? null : (
        <div className="points-hero">
          <strong>积分</strong>
          <p>{pointsHeroCopy(kind)}</p>
        </div>
      )}
      <div className="kind-quiet">
        <span>采购类型</span>
        {row('dedicated', dedicatedOn, '券', '专用券', '兑换「权益专区」币/券')}
        {row('general', generalOn, '积', '通用积分', '兑换「积分专区」专属商品')}
      </div>
    </div>
  )
}

const SELECT_CAP = 200

function mergeUsers(rows: ImportRow[]) {
  const map = new Map<string, ImportRow>()
  for (const row of rows) {
    const phone = row.phone.replace(/\D/g, '')
    if (!phone || map.has(phone)) continue
    map.set(phone, { ...row, phone })
  }
  return [...map.values()]
}

function yuan(n: number) {
  return `¥${n.toLocaleString('zh-CN')}`
}

function SearchIcon() {
  return (
    <svg className="appr-ico" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <circle cx="6.2" cy="6.2" r="4.2" stroke="currentColor" strokeWidth="1.3" />
      <path d="M9.3 9.3 12 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function statusTone(text: string) {
  if (text.includes('成功') || text.includes('通过')) return 'ok'
  if (text.includes('驳回') || text.includes('拒绝')) return 'bad'
  if (text.includes('待') || text.includes('审核') || text.includes('审批中')) return 'wait'
  return 'bad'
}

function canPlaceOrder(status: string) {
  return status === '审批通过'
}

export function ApprovalListPage() {
  const { go, setApprovalDraft } = useAdmin()
  const [l1, setL1] = useState<SceneL1>('new-car')
  const [l2, setL2] = useState<SceneL2>('new-sale')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [batchNo, setBatchNo] = useState('')
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [blockTip, setBlockTip] = useState('')

  const scene = SCENE_TREE.find((item) => item.id === l1) ?? SCENE_TREE[0]

  const rows = useMemo(() => {
    return APPROVAL_RECORDS.filter((item) => {
      if (item.l1 !== l1 || item.l2 !== l2) return false
      if (batchNo.trim() && !item.batchNo.includes(batchNo.trim()) && !item.approvalNo.includes(batchNo.trim())) {
        return false
      }
      if (phone.trim() && !item.receiverPhone.includes(phone.trim()) && !item.ownerPhone.includes(phone.trim())) {
        return false
      }
      if (name.trim() && !item.receiverName.includes(name.trim()) && !item.ownerName.includes(name.trim())) {
        return false
      }
      return true
    })
  }, [l1, l2, batchNo, phone, name])

  const orderableRows = rows.filter((item) => canPlaceOrder(item.approvalStatus))
  const selectedRows = orderableRows.filter((item) => selectedIds.includes(item.id))
  const selectedAmount = selectedRows.reduce((sum, item) => sum + item.grantAmount, 0)
  const allChecked = orderableRows.length > 0 && orderableRows.every((item) => selectedIds.includes(item.id))

  const switchL1 = (next: SceneL1) => {
    const group = SCENE_TREE.find((item) => item.id === next)
    setL1(next)
    setL2(group?.children[0]?.id ?? 'new-sale')
    setSelectedIds([])
  }

  const toggle = (id: string) => {
    const item = rows.find((row) => row.id === id)
    if (!item || !canPlaceOrder(item.approvalStatus)) {
      setBlockTip('审批状态为审批通过后，才可以勾选并权益下单。')
      return
    }
    setBlockTip('')
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((current) => current !== id)
      if (prev.length >= SELECT_CAP) return prev
      return [...prev, id]
    })
  }

  const toggleAll = () => {
    if (orderableRows.length === 0) {
      setBlockTip('审批状态为审批通过后，才可以勾选并权益下单。')
      return
    }
    setBlockTip('')
    if (allChecked) {
      setSelectedIds((prev) => prev.filter((id) => !orderableRows.some((item) => item.id === id)))
      return
    }
    setSelectedIds((prev) => {
      const next = new Set(prev)
      for (const item of orderableRows) {
        if (next.size >= SELECT_CAP) break
        next.add(item.id)
      }
      return [...next]
    })
  }

  const resetFilters = () => {
    setBatchNo('')
    setPhone('')
    setName('')
  }

  const openBuy = () => {
    const approved = selectedRows.filter((item) => canPlaceOrder(item.approvalStatus))
    if (approved.length === 0) {
      setBlockTip('审批状态为审批通过后，才可以勾选并权益下单。')
      return
    }
    const users = mergeUsers(approved.flatMap((item) => item.users))
    setApprovalDraft({
      recordId: approved[0].id,
      kind: 'dedicated',
      merchantFeeRate: FEE_RATE,
      rows: users,
      paid: false,
    })
    go('approval-buy')
  }

  return (
    <>
      <div className="admin-crumb">审批管理 / 审批记录管理</div>
      <div className="appr-alert">
        <i />
        <span>提示：有10个凭证审核问题待处理请立即处理</span>
        <b>›</b>
      </div>
      <div className="admin-panel appr-page">
        <div className="appr-l1">
          <div className="admin-tabs">
            {SCENE_TREE.map((item) => (
              <button key={item.id} className={l1 === item.id ? 'on' : ''} type="button" onClick={() => switchL1(item.id)}>
                {item.label}
              </button>
            ))}
          </div>
          <button className="appr-bin" type="button">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M2.5 3.6h9M5 3.6V2.4h4v1.2M3.6 3.6l.5 8h5.8l.5-8" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
            </svg>
            垃圾箱
          </button>
        </div>

        <div className="admin-tabs appr-l2">
          {scene.children.map((item) => (
            <button
              key={item.id}
              className={l2 === item.id ? 'on' : ''}
              type="button"
              onClick={() => {
                setL2(item.id)
                setSelectedIds([])
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="appr-filter-row">
          <label className="appr-field">
            <SearchIcon />
            <input value={batchNo} placeholder="搜索审批批次号" onChange={(event) => setBatchNo(event.target.value)} />
          </label>
          <label className="appr-field is-date">
            <input defaultValue="" placeholder="开始时间 - 结束时间" readOnly />
            <svg className="appr-ico is-right" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <rect x="2.2" y="3.2" width="9.6" height="8.4" rx="1.2" stroke="currentColor" strokeWidth="1.2" />
              <path d="M2.2 6h9.6M5 2.4v1.8M9 2.4v1.8" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </label>
          <label className="appr-field">
            <SearchIcon />
            <input value={phone} placeholder="搜索领取人手机号" onChange={(event) => setPhone(event.target.value)} />
          </label>
          <label className="appr-field">
            <SearchIcon />
            <input value={name} placeholder="搜索领取人姓名" onChange={(event) => setName(event.target.value)} />
          </label>
          <button className="admin-primary" type="button">
            查询
          </button>
          <button className="admin-outline" type="button" onClick={resetFilters}>
            重置
          </button>
          <button className="admin-outline" type="button">
            高级筛选
          </button>
        </div>

        <div className="appr-action-row">
          <div className="appr-action-left">
            <button className="admin-outline" disabled={selectedRows.length === 0} type="button" onClick={openBuy}>
              权益下单
            </button>
            <button className="admin-outline" type="button">
              查看权益
            </button>
            <span className="appr-count">
              已选择数量：{selectedRows.length}/{SELECT_CAP}　总金额={selectedAmount}元
            </span>
            <span className="appr-rule">仅审批通过可选</span>
            {blockTip ? <span className="appr-block">{blockTip}</span> : null}
          </div>
          <div className="appr-action-right">
            <button className="appr-link" type="button">
              <span>+</span>
              批量上传业务凭证
            </button>
            <button className="appr-link" type="button">
              <span>+</span>
              导入审批记录
            </button>
            <button className="appr-link" type="button">
              导出
            </button>
            <button className="appr-link" type="button">
              设置可见字段
            </button>
          </div>
        </div>

        <div className="appr-table-wrap">
          <table className="admin-table appr-wide">
            <thead>
              <tr>
                <th rowSpan={2} className="col-check">
                  <span
                    className={orderableRows.length === 0 ? 'appr-box is-off' : allChecked ? 'appr-box on' : 'appr-box'}
                    onClick={toggleAll}
                  />
                </th>
                <th colSpan={12}>审批链基础信息</th>
                <th colSpan={11}>审批链业务信息</th>
                <th colSpan={3}>领取人信息</th>
                <th colSpan={4}>商品订单信息</th>
                <th rowSpan={2}>操作</th>
              </tr>
              <tr>
                <th>批次号</th>
                <th>审批单号</th>
                <th>商户</th>
                <th>审批链名称</th>
                <th>审批提报人</th>
                <th>提报时间</th>
                <th>经办人</th>
                <th>经办人手机号</th>
                <th>关联凭证</th>
                <th>凭证审核状态</th>
                <th>经办时间</th>
                <th>关联线索</th>
                <th>审批状态</th>
                <th>订单号</th>
                <th>商品名称</th>
                <th>商品价格</th>
                <th>发放金额</th>
                <th>新车主姓名</th>
                <th>车主手机号</th>
                <th>车牌号</th>
                <th>车架号</th>
                <th>车辆价格</th>
                <th>外部流程号</th>
                <th>领取人手机号</th>
                <th>领取人姓名</th>
                <th>领取人身份证号</th>
                <th>商品订单号</th>
                <th>下单状态</th>
                <th>主权益</th>
                <th>赠送权益</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => {
                const allowed = canPlaceOrder(item.approvalStatus)
                const on = allowed && selectedIds.includes(item.id)
                return (
                  <tr key={item.id} className={on ? 'is-selected' : allowed ? '' : 'is-locked'} onClick={() => toggle(item.id)}>
                    <td className="col-check">
                      <span className={on ? 'appr-box on' : allowed ? 'appr-box' : 'appr-box is-off'} />
                    </td>
                    <td>{item.batchNo}</td>
                    <td>{item.approvalNo}</td>
                    <td>{item.merchant}</td>
                    <td>{item.chainName}</td>
                    <td>{item.applicant}</td>
                    <td>{item.submittedAt}</td>
                    <td>{item.handler}</td>
                    <td>{item.handlerPhone}</td>
                    <td>{item.voucherCount > 0 ? `${item.voucherCount}个凭证` : '无凭证'}</td>
                    <td>
                      <em className={`appr-status is-${statusTone(item.voucherStatus)}`}>{item.voucherStatus}</em>
                    </td>
                    <td>{item.handledAt}</td>
                    <td>{item.clue}</td>
                    <td>
                      <em className={`appr-status is-${statusTone(item.approvalStatus)}`}>{item.approvalStatus}</em>
                    </td>
                    <td>{item.orderNo}</td>
                    <td>{item.goodsName}</td>
                    <td>{item.goodsPrice ? yuan(item.goodsPrice) : ''}</td>
                    <td>{item.grantAmount ? yuan(item.grantAmount) : ''}</td>
                    <td>{item.ownerName}</td>
                    <td>{maskPhone(item.ownerPhone)}</td>
                    <td>{item.plate}</td>
                    <td>{item.vin}</td>
                    <td>{item.carPrice}</td>
                    <td>{item.outerNo}</td>
                    <td>{maskPhone(item.receiverPhone)}</td>
                    <td>{item.receiverName}</td>
                    <td>{item.receiverIdNo}</td>
                    <td>{item.goodsOrderNo}</td>
                    <td>
                      <em className={`appr-status is-${statusTone(item.orderStatus)}`}>{item.orderStatus}</em>
                    </td>
                    <td>{item.mainBenefit}</td>
                    <td>{item.giftBenefit}</td>
                    <td onClick={(event) => event.stopPropagation()}>
                      <div className="appr-ops">
                        <button type="button">商品订单</button>
                        <button type="button">修改信息</button>
                        <button type="button">上传凭证</button>
                        <button type="button">删除</button>
                        <button type="button">查看凭证</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {rows.length === 0 ? <div className="empty-panel">当前分类下暂无审批记录</div> : null}
      </div>
    </>
  )
}

const BUY_STEPS = ['采购类型', '选择商品', '付款']

function BuySteps({ step }: { step: 1 | 2 | 3 }) {
  return (
    <ol className={`buy-steps is-${step}`} aria-label="采购进度">
      {BUY_STEPS.map((label, index) => {
        const current = index + 1
        return (
          <li key={label} className={step === current ? 'on' : step > current ? 'done' : ''}>
            <span className="buy-step-dot">{current}</span>
            <span className="buy-step-label">{label}</span>
          </li>
        )
      })}
    </ol>
  )
}

function PayGoods({ name, skuId, amount }: { name: string; skuId?: string; amount: string }) {
  return (
    <div className="pay-goods">
      {skuId ? <ProductIcon id={skuId} /> : <div className="points-mark sm">积</div>}
      <div>
        <strong>{name}</strong>
        <p>商品编号 PO-POINTS-001 · 批量发放</p>
      </div>
      <b>¥ {amount}</b>
    </div>
  )
}

function FeeChangeDialog({ onAgree, onRefuse }: { onAgree: () => void; onRefuse: () => void }) {
  return (
    <div className="admin-mask" role="presentation">
      <div className="admin-modal fee-change-modal" role="dialog" aria-modal="true" aria-labelledby="fee-change-title" onClick={(event) => event.stopPropagation()}>
        <div className="fee-change-head">
          <span className="fee-change-tag">重要提示</span>
          <h2 id="fee-change-title">服务费变更确认</h2>
        </div>
        <p className="fee-change-ask">
          本次下单适用的服务费费率已由 <em>7%</em> 调整为 <em>8%</em>，请确认是否同意上述变更。
        </p>
        <p className="fee-change-note">如不同意本次变更，订单将无法提交。</p>
        <div className="modal-actions">
          <button className="admin-ghost" type="button" onClick={onRefuse}>
            不同意
          </button>
          <button className="admin-primary" type="button" onClick={onAgree}>
            同意变更
          </button>
        </div>
      </div>
    </div>
  )
}

function PayStage({
  paid,
  paying,
  ticketNo,
  payName,
  skuId,
  people,
  cost,
  feeRate,
  merchantFee,
  userRate,
  userFee,
  due,
  balance,
  rows,
  onBack,
  onPay,
  onDone,
}: {
  paid: boolean
  paying: boolean
  ticketNo: string
  payName: string
  skuId?: string
  people: number
  cost: string
  feeRate: string
  merchantFee: string
  userRate: string
  userFee: string
  due: string
  balance: string
  rows: ImportRow[]
  onBack: () => void
  onPay: () => void
  onDone: () => void
}) {
  const actions = paid ? (
    <button className="admin-primary" type="button" onClick={onDone}>
      返回审批记录
    </button>
  ) : (
    <>
      <button className="admin-ghost" type="button" onClick={onBack}>
        上一步
      </button>
      <button className="admin-primary" disabled={paying} type="button" onClick={onPay}>
        确认支付 ¥ {due}
      </button>
    </>
  )
  const lines = [
    ['账户余额', `¥ ${balance}`],
    ['商品金额', `¥ ${cost}`],
    [`商户服务费 ${feeRate}`, `¥ ${merchantFee}`],
    [`用户承担 ${userRate}`, `¥ ${userFee}`],
  ]
  return (
    <section className="pay-look is-sheet">
      <PayGoods name={payName} skuId={skuId} amount={cost} />
      <div className="pay-meta">
        <span>订单号 {ticketNo}</span>
        <span>发放 {people} 人</span>
        <AccountViewButton rows={rows} />
        <span>服务费率 {feeRate}</span>
      </div>
      <div className="pay-sheet-bar">
        {lines.map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <b>{value}</b>
          </div>
        ))}
        <div className="pay-due">
          <span>应付金额</span>
          <strong>¥ {due}</strong>
          <div className="pay-actions">{actions}</div>
        </div>
      </div>
    </section>
  )
}

export function ApprovalBuyPage() {
  const { go, approvalDraft, setApprovalDraft, createOrder, orders } = useAdmin()
  const record = approvalDraft ? approvalById(approvalDraft.recordId) : undefined
  const coinsOnly = isCommissionScene(record?.l2)
  const resumed = Boolean(approvalDraft?.ticketNo)
  const [step, setStep] = useState<1 | 2 | 3>(resumed ? 3 : coinsOnly ? 2 : 1)
  const [kind, setKind] = useState<PurchaseKind | null>(resumed ? (approvalDraft?.kind ?? null) : coinsOnly ? 'dedicated' : null)
  const [productId, setProductId] = useState<string | null>(
    resumed ? (approvalDraft?.kind === 'general' ? 'general' : (approvalDraft?.productId ?? null)) : null,
  )
  const [paying, setPaying] = useState(false)
  const [feeAsk, setFeeAsk] = useState(false)
  if (!approvalDraft || !record) {
    return (
      <>
        <div className="admin-crumb">审批管理 / 审批记录管理</div>
        <div className="admin-panel empty-panel">
          请先在审批记录中选择一条记录并权益下单。
          <div className="issue-actions">
            <button className="admin-primary" type="button" onClick={() => go('approval')}>
              返回审批记录
            </button>
          </div>
        </div>
      </>
    )
  }

  const rows = approvalDraft.rows

  const chooseKind = (next: PurchaseKind) => {
    if (next !== kind) setProductId(null)
    setKind(next)
    setStep(2)
  }

  const placeOrder = (id: string) => {
    if (!kind) return
    if (coinsOnly && id !== 'gold-wechat' && id !== 'gold-alipay') return
    setProductId(id)
    setApprovalDraft({
      ...approvalDraft,
      kind,
      productId: kind === 'dedicated' ? id : undefined,
      merchantFeeRate: kind === 'general' ? GENERAL_FEE_RATE : FEE_RATE,
      rows,
      ticketNo: approvalDraft.ticketNo ?? `2026${Date.now().toString().slice(-12)}`,
    })
    setStep(3)
  }

  const payPlan = planFromRows(approvalDraft.rows)
  const payQuote = quote(payPlan.costAmount, approvalDraft.merchantFeeRate, feeRateFor(approvalDraft.kind))
  const paySku = approvalDraft.productId ? skuById(approvalDraft.productId) : undefined
  const payName =
    approvalDraft.kind === 'general' ? '通用积分' : (purchaseGoodName(approvalDraft.productId) ?? dedicatedLabel(paySku?.name))
  const paidOrder = approvalDraft.orderId ? orders.find((item) => item.id === approvalDraft.orderId) : undefined
  const paid = approvalDraft.paid
  const ticketNo = paidOrder?.id ?? approvalDraft.ticketNo ?? record.approvalNo

  const pay = () => {
    if (paid || paying || !approvalDraft.ticketNo) return
    setPaying(true)
    createOrder({
      kind: approvalDraft.kind,
      productId: approvalDraft.productId,
      costAmount: payPlan.costAmount,
      merchantFeeRate: approvalDraft.merchantFeeRate,
      grants: payPlan.rows,
      source: 'approval',
    })
  }

  return (
    <>
      <div className="admin-crumb">
        <button type="button" onClick={() => go('approval')}>
          审批管理 / 审批记录管理
        </button>
        <span> / 采购积分</span>
      </div>
      <div className="admin-panel is-buy">
        {step === 3 ? (
          <div className="buy-pay">
            <div className="buy-pay-head">
              <h1>会员积分</h1>
              <p className="sku-no">
                来自审批单 {record.approvalNo} · {record.chainName}
              </p>
              <BuySteps step={step} />
            </div>
            <div className={paid ? 'pay-banner is-ok' : 'pay-banner'}>
              {paid ? '支付成功，权益已发放至审批用户，打开用户端即可兑换使用。' : '订单已生成，请确认信息并完成付款。'}
            </div>
            <PayStage
              paid={paid}
              paying={paying}
              ticketNo={ticketNo}
              payName={payName}
              skuId={paySku?.id}
              people={payPlan.rows.length}
              cost={money(payPlan.costAmount)}
              feeRate={`${(approvalDraft.merchantFeeRate * 100).toFixed(2)}%`}
              merchantFee={money(payQuote.merchantFeeAmount)}
              userRate={`${(payQuote.userFeeRate * 100).toFixed(0)}%`}
              userFee={money(payQuote.userFeeAmount)}
              due={money(payQuote.merchantPay)}
              balance={money(ACCOUNT_BALANCE)}
              rows={approvalDraft.rows}
              onBack={() => setStep(2)}
              onPay={() => {
                if (!paid && !paying) setFeeAsk(true)
              }}
              onDone={() => go('approval')}
            />
          </div>
        ) : (
          <div className="buy-hero">
            <div className="buy-form">
              <h1>会员积分</h1>
              <p className="sku-no">
                来自审批单 {record.approvalNo} · {record.chainName}
              </p>
              <BuySteps step={step} />

              {step === 1 ? (
                <div className="field is-choices">
                  <span>选择采购类型</span>
                  <KindPicker plain kind={kind} onKind={chooseKind} />
                </div>
              ) : null}

              {step === 2 && kind === 'dedicated' ? (
                <div className="field">
                  <span>选择商品</span>
                  <em>点击商品即下单</em>
                  <EquityPicker coinsOnly={coinsOnly} value={productId ?? ''} onSelect={placeOrder} />
                </div>
              ) : null}

              {step === 2 && kind === 'general' ? (
                <div className="field">
                  <span>选择商品</span>
                  <em>点击商品即下单</em>
                  <GeneralPointsCard selected={productId === 'general'} onSelect={() => placeOrder('general')} />
                </div>
              ) : null}

              <div className="issue-actions">
                {step === 1 || coinsOnly ? (
                  <button className="admin-ghost" type="button" onClick={() => go('approval')}>
                    返回
                  </button>
                ) : (
                  <button className="admin-ghost" type="button" onClick={() => setStep(1)}>
                    上一步
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      {feeAsk ? (
        <FeeChangeDialog
          onRefuse={() => setFeeAsk(false)}
          onAgree={() => {
            setFeeAsk(false)
            pay()
          }}
        />
      ) : null}
    </>
  )
}

export function ApprovalPayPage() {
  const { go, approvalDraft, createOrder, orders } = useAdmin()
  const record = approvalDraft ? approvalById(approvalDraft.recordId) : undefined
  const [paying, setPaying] = useState(false)
  const [feeAsk, setFeeAsk] = useState(false)

  if (!approvalDraft || !record) {
    return (
      <>
        <div className="admin-crumb">审批管理 / 审批记录管理</div>
        <div className="admin-panel empty-panel">
          没有待支付的审批订单。
          <div className="issue-actions">
            <button className="admin-primary" type="button" onClick={() => go('approval')}>
              返回审批记录
            </button>
          </div>
        </div>
      </>
    )
  }

  const plan = planFromRows(approvalDraft.rows)
  const q = quote(plan.costAmount, approvalDraft.merchantFeeRate, feeRateFor(approvalDraft.kind))
  const sku = approvalDraft.productId ? skuById(approvalDraft.productId) : undefined
  const productName =
    approvalDraft.kind === 'general' ? '通用积分' : (purchaseGoodName(approvalDraft.productId) ?? dedicatedLabel(sku?.name))
  const paidOrder = approvalDraft.orderId ? orders.find((item) => item.id === approvalDraft.orderId) : undefined
  const paid = approvalDraft.paid
  const ticketNo = paidOrder?.id ?? approvalDraft.ticketNo ?? record.approvalNo

  const pay = () => {
    if (paid || paying) return
    setPaying(true)
    createOrder({
      kind: approvalDraft.kind,
      productId: approvalDraft.productId,
      costAmount: plan.costAmount,
      merchantFeeRate: approvalDraft.merchantFeeRate,
      grants: plan.rows,
      source: 'approval',
    })
  }

  return (
    <>
      <div className="admin-crumb">
        <button type="button" onClick={() => go(paid ? 'approval' : 'approval-buy')}>
          审批管理 / 审批记录管理
        </button>
        <span> / 收银台</span>
      </div>
      <div className={paid ? 'pay-banner is-ok' : 'pay-banner'}>
        {paid ? '支付成功，权益已发放至审批用户，打开用户端即可兑换使用。' : '提交成功，请尽快完成付款。超时未支付订单将自动关闭。'}
      </div>
      <div className="cashier-grid">
        <div className="admin-panel">
          <h2 className="teal-title">商品清单</h2>
          <div className="order-bar">订单号：{ticketNo}</div>
          <table className="admin-table goods-table">
            <thead>
              <tr>
                <th>商品信息</th>
                <th>账号信息</th>
                <th>服务费率</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div className="goods-cell">
                    <div className="points-mark sm">积</div>
                    <div>
                      <strong>{productName}</strong>
                      <p>商品编号 PO-POINTS-001</p>
                      <p>提货方式：批量发放</p>
                      <p>¥ {money(plan.costAmount)}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <AccountViewButton rows={approvalDraft.rows} />
                </td>
                <td>{(approvalDraft.merchantFeeRate * 100).toFixed(2)}%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="admin-panel cashier-side">
          <h2 className="teal-title">支付信息</h2>
          <dl className="cashier-dl">
            <div>
              <dt>账户余额</dt>
              <dd>¥ {money(ACCOUNT_BALANCE)}</dd>
            </div>
            <div>
              <dt>商品金额</dt>
              <dd>¥ {money(plan.costAmount)}</dd>
            </div>
            <div>
              <dt>商户服务费 {(approvalDraft.merchantFeeRate * 100).toFixed(0)}%</dt>
              <dd>¥ {money(q.merchantFeeAmount)}</dd>
            </div>
            <div>
              <dt>用户承担 {(q.userFeeRate * 100).toFixed(0)}%</dt>
              <dd>¥ {money(q.userFeeAmount)}</dd>
            </div>
            <div className="total">
              <dt>应付金额</dt>
              <dd>¥ {money(q.merchantPay)}</dd>
            </div>
          </dl>
          {paidOrder ? <p className="table-hint">订单号 {paidOrder.id} · 已支付</p> : null}
          <div className="issue-actions">
            {paid ? (
              <button className="admin-primary" type="button" onClick={() => go('approval')}>
                返回审批记录
              </button>
            ) : (
              <>
                <button className="admin-ghost" type="button" onClick={() => go('approval-buy')}>
                  返回修改
                </button>
                <button
                  className="admin-primary"
                  disabled={paying}
                  type="button"
                  onClick={() => {
                    if (!paid && !paying) setFeeAsk(true)
                  }}
                >
                  确认支付 ¥ {money(q.merchantPay)}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      {feeAsk ? (
        <FeeChangeDialog
          onRefuse={() => setFeeAsk(false)}
          onAgree={() => {
            setFeeAsk(false)
            pay()
          }}
        />
      ) : null}
    </>
  )
}
