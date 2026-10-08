import { useMemo, useState } from 'react'
import { ProductIcon } from '../icons'
import { BuyPreview } from './buy-preview'
import { AccountViewButton } from './accounts'
import { EquityPicker } from './equity-picker'
import {
  APPROVAL_RECORDS,
  DEDICATED_SKUS,
  FEE_PCT,
  FEE_RATE,
  GENERAL_FEE_RATE,
  GENERAL_FEE_PCT,
  SCENE_TREE,
  UNIT_PRICE,
  approvalById,
  dedicatedLabel,
  feePctFor,
  feeRateFor,
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

export function KindPicker({ kind, onKind }: { kind: PurchaseKind; onKind: (kind: PurchaseKind) => void }) {
  const dedicatedOn = kind === 'dedicated'
  const generalOn = kind === 'general'
  return (
    <div className="kind-shell is-list">
      <div className="points-hero">
        <strong>积分</strong>
        <p>{pointsHeroCopy(kind)}</p>
      </div>
      <div className="kind-quiet">
        <span>采购类型</span>
        <button type="button" className={dedicatedOn ? 'kind-row on' : 'kind-row'} onClick={() => onKind('dedicated')}>
          <span className="kind-row-body">
            <strong>专用券</strong>
            <em>权益专区兑成金/券</em>
          </span>
          <span className={dedicatedOn ? 'radio on' : 'radio'} />
        </button>
        <button type="button" className={generalOn ? 'kind-row on' : 'kind-row'} onClick={() => onKind('general')}>
          <span className="kind-row-body">
            <strong>通用积分</strong>
            <em>兑换「积分专区」专属商品</em>
          </span>
          <span className={generalOn ? 'radio on' : 'radio'} />
        </button>
      </div>
    </div>
  )
}

function FeeSplitBar({
  feePct,
  merchantPct,
  locked,
  disabled,
  onChange,
}: {
  feePct: number
  merchantPct: number
  locked?: boolean
  disabled?: boolean
  onChange?: (value: number) => void
}) {
  const userPct = feePct - merchantPct
  return (
    <>
      <span>
        商户承担 {merchantPct}%　/　用户承担 {userPct}%
      </span>
      <input
        className={locked ? 'fee-range is-locked' : 'fee-range'}
        type="range"
        min={0}
        max={feePct}
        step={1}
        value={merchantPct}
        disabled={locked || disabled}
        onChange={(event) => onChange?.(Number(event.target.value))}
      />
    </>
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
  if (text.includes('待') || text.includes('审核')) return 'wait'
  return 'bad'
}

export function ApprovalListPage() {
  const { go, setApprovalDraft } = useAdmin()
  const [l1, setL1] = useState<SceneL1>('new-car')
  const [l2, setL2] = useState<SceneL2>('new-sale')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [batchNo, setBatchNo] = useState('')
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [picker, setPicker] = useState(false)
  const [pickKind, setPickKind] = useState<PurchaseKind>('dedicated')

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

  const selectedRows = rows.filter((item) => selectedIds.includes(item.id))
  const selectedAmount = selectedRows.reduce((sum, item) => sum + item.grantAmount, 0)
  const allChecked = rows.length > 0 && rows.every((item) => selectedIds.includes(item.id))

  const switchL1 = (next: SceneL1) => {
    const group = SCENE_TREE.find((item) => item.id === next)
    setL1(next)
    setL2(group?.children[0]?.id ?? 'new-sale')
    setSelectedIds([])
  }

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((item) => item !== id)
      if (prev.length >= SELECT_CAP) return prev
      return [...prev, id]
    })
  }

  const toggleAll = () => {
    if (allChecked) {
      setSelectedIds((prev) => prev.filter((id) => !rows.some((item) => item.id === id)))
      return
    }
    setSelectedIds((prev) => {
      const next = new Set(prev)
      for (const item of rows) {
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
    if (selectedRows.length === 0) return
    const users = mergeUsers(selectedRows.flatMap((item) => item.users))
    setApprovalDraft({
      recordId: selectedRows[0].id,
      kind: pickKind,
      productId: pickKind === 'dedicated' ? DEDICATED_SKUS[0]?.id : undefined,
      merchantFeeRate: pickKind === 'general' ? GENERAL_FEE_RATE : FEE_RATE,
      rows: users,
      paid: false,
    })
    setPicker(false)
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
            <button className="admin-outline" disabled={selectedRows.length === 0} type="button" onClick={() => setPicker(true)}>
              权益下单
            </button>
            <button className="admin-outline" type="button">
              查看权益
            </button>
            <span className="appr-count">
              已选择数量：{selectedRows.length}/{SELECT_CAP}　总金额={selectedAmount}元
            </span>
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
                  <span className={allChecked ? 'appr-box on' : 'appr-box'} onClick={toggleAll} />
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
                const on = selectedIds.includes(item.id)
                return (
                  <tr key={item.id} className={on ? 'is-selected' : ''} onClick={() => toggle(item.id)}>
                    <td className="col-check">
                      <span className={on ? 'appr-box on' : 'appr-box'} />
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

      {picker ? (
        <div className="admin-mask" onClick={() => setPicker(false)}>
          <div className="admin-modal pick-modal" onClick={(event) => event.stopPropagation()}>
            <div className="pick-head">
              <h2>选择商品</h2>
              <button className="pick-close" type="button" onClick={() => setPicker(false)} aria-label="关闭">
                ×
              </button>
            </div>
            <KindPicker kind={pickKind} onKind={setPickKind} />
            <div className="modal-actions">
              <button className="admin-ghost" type="button" onClick={() => setPicker(false)}>
                取消
              </button>
              <button className="admin-primary" type="button" onClick={openBuy}>
                下一步
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

export function ApprovalBuyPage() {
  const { go, approvalDraft, setApprovalDraft } = useAdmin()
  const record = approvalDraft ? approvalById(approvalDraft.recordId) : undefined
  const [kind, setKind] = useState<PurchaseKind>(approvalDraft?.kind ?? 'dedicated')
  const [productId, setProductId] = useState(approvalDraft?.productId ?? DEDICATED_SKUS[0]?.id ?? 'gold')
  const [equityOpen, setEquityOpen] = useState(false)
  const [dedicatedPct, setDedicatedPct] = useState(() =>
    approvalDraft?.kind === 'general'
      ? FEE_PCT
      : Math.round((approvalDraft?.merchantFeeRate ?? FEE_RATE) * 100),
  )

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
  const feePct = feePctFor(kind)
  const merchantPct = kind === 'general' ? GENERAL_FEE_PCT : dedicatedPct
  const merchantFeeRate = merchantPct / 100
  const plan = planFromRows(rows)
  const costAmount = plan.costAmount
  const q = quote(costAmount, merchantFeeRate, feeRateFor(kind))
  const sku = DEDICATED_SKUS.find((item) => item.id === productId)
  const canSubmit = plan.rows.length > 0 && costAmount > 0 && !approvalDraft.paid

  const toCashier = () => {
    setApprovalDraft({
      ...approvalDraft,
      kind,
      productId: kind === 'dedicated' ? productId : undefined,
      merchantFeeRate,
      rows,
      ticketNo: approvalDraft.ticketNo ?? `2026${Date.now().toString().slice(-12)}`,
    })
    go('approval-pay')
  }

  return (
    <>
      <div className="admin-crumb">
        <button type="button" onClick={() => go('approval')}>
          审批管理 / 审批记录管理
        </button>
        <span> / 采购积分</span>
      </div>
      <div className="admin-panel">
        <div className="buy-hero">
          <BuyPreview kind={kind} sku={sku} />
          <div className="buy-form">
            <h1>会员积分</h1>
            <p className="sku-no">
              来自审批单 {record.approvalNo} · {record.chainName}
            </p>
            <div className="price-box">
              <div className="price-row">
                商品价格
                <strong>¥ {money(UNIT_PRICE)}</strong>
              </div>
              <div className="fee-line">
                单价 · 1 份 = 1 元
                <span>
                  {kind === 'general'
                    ? `手续费率 ${GENERAL_FEE_PCT}.00% · 全部商户承担 · 不可调整`
                    : `手续费率 ${FEE_PCT}.00% · 必须拆满 · 默认商户全部承担`}
                </span>
              </div>
            </div>

            <div className="field">
              <span>采购类型</span>
              <div className="seg">
                <button type="button" className={kind === 'dedicated' ? 'on' : ''} onClick={() => setKind('dedicated')}>
                  专用券
                </button>
                <button type="button" className={kind === 'general' ? 'on' : ''} onClick={() => setKind('general')}>
                  通用积分
                </button>
              </div>
              <em>
                {kind === 'general'
                  ? '用户可直接用积分兑换积分专区商品'
                  : '一次只能选一种。用户先在权益专区兑成通用金余额或抵扣券，再去积分专区选对应支付方式'}
              </em>
            </div>

            {kind === 'dedicated' ? (
              <div className="field">
                <span>绑定商品</span>
                <div className="bound-sku">
                  {sku ? <ProductIcon id={sku.id} /> : null}
                  <div>
                    <strong>{dedicatedLabel(sku?.name)}</strong>
                    <em>一次只能绑定一种专用券</em>
                  </div>
                  <button className="account-btn" type="button" onClick={() => setEquityOpen(true)}>
                    选择商品
                  </button>
                </div>
              </div>
            ) : null}

            {equityOpen ? (
              <EquityPicker
                value={productId}
                onSelect={(id) => {
                  setProductId(id)
                  setEquityOpen(false)
                }}
                onClose={() => setEquityOpen(false)}
              />
            ) : null}

            <div className="field">
              <span>账号信息</span>
              <em>由审批单带入，共 {plan.rows.length} 人</em>
              <AccountViewButton rows={rows} />
            </div>

            <div className="calc-box">
              <div>
                <span>审批用户</span>
                <b>{plan.rows.length} 人</b>
              </div>
              <div>
                <span>{kind === 'dedicated' ? '需发放专用券' : '需采购积分'}</span>
                <b>
                  {plan.units} {kind === 'dedicated' ? `份${dedicatedLabel(sku?.name)}` : '分'}
                </b>
              </div>
              <div>
                <span>采购金额</span>
                <b>¥ {money(costAmount)}</b>
              </div>
            </div>

            <label className="field">
              <span>手续费拆分</span>
              {kind === 'general' ? (
                <em>
                  {costAmount > 0
                    ? `按本次采购金额 ¥${money(costAmount)} 计，固定 ${GENERAL_FEE_PCT}%，全部由商户承担，不可调整。`
                    : `通用积分固定 ${GENERAL_FEE_PCT}%，全部由商户承担，不可调整。`}
                </em>
              ) : (
                <em>
                  {costAmount > 0
                    ? `按本次采购金额 ¥${money(costAmount)} 计算 ${FEE_PCT}% 如何分配`
                    : `按审批名单金额计算 ${FEE_PCT}% 如何分配`}
                </em>
              )}
              <FeeSplitBar
                feePct={feePct}
                merchantPct={merchantPct}
                locked={kind === 'general'}
                disabled={approvalDraft.paid}
                onChange={kind === 'dedicated' ? setDedicatedPct : undefined}
              />
            </label>

            {costAmount > 0 ? (
              <div className="split-preview">
                <div>
                  <span>商户应付</span>
                  <b>¥ {money(q.merchantPay)}</b>
                </div>
                <div>
                  <span>用户兑换时扣除</span>
                  <b>¥ {money(q.userFeeAmount)}</b>
                </div>
              </div>
            ) : (
              <div className="calc-box is-empty">按审批名单金额计算商户应付与用户扣除</div>
            )}

            <div className="issue-actions">
              <button className="admin-ghost" type="button" onClick={() => go('approval')}>
                返回
              </button>
              <button className="admin-primary" disabled={!canSubmit} type="button" onClick={toCashier}>
                去收银台
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export function ApprovalPayPage() {
  const { go, approvalDraft, createOrder, orders } = useAdmin()
  const record = approvalDraft ? approvalById(approvalDraft.recordId) : undefined
  const [paying, setPaying] = useState(false)

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
  const sku = approvalDraft.productId ? DEDICATED_SKUS.find((item) => item.id === approvalDraft.productId) : undefined
  const productName = approvalDraft.kind === 'general' ? '通用积分' : dedicatedLabel(sku?.name)
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
                <th>手续费率</th>
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
              <dt>商户手续费 {(approvalDraft.merchantFeeRate * 100).toFixed(0)}%</dt>
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
                <button className="admin-primary" disabled={paying} type="button" onClick={pay}>
                  确认支付 ¥ {money(q.merchantPay)}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
