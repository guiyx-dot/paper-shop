import { useState } from 'react'
import { ProductIcon } from '../icons'
import { DEDICATED_SKUS, FEE_PCT, SAMPLE_TABLE, SAMPLE_UNITS, UNIT_PRICE, money, planFromRows, quote, type ImportRow, type PurchaseKind } from './model'
import { maskPhone, useAdmin } from './store'

export function CatalogPage() {
  const { go } = useAdmin()
  return (
    <>
      <div className="admin-crumb">商品管理 / 商品中心</div>
      <div className="admin-panel">
        <div className="admin-tabs">
          <button className="on">积分采购</button>
          <button type="button" disabled>
            服务超市
          </button>
        </div>
        <div className="admin-block-title">
          <span className="dot" />
          会员积分
        </div>
        <div className="sku-grid">
          <button className="sku-card" onClick={() => go('buy')}>
            <div className="sku-art">
              <strong>积分</strong>
              <p>采购后发放给用户。可绑一种专用权益，或作为积分专区通用积分。</p>
            </div>
            <div className="sku-meta">
              <em>去采购</em>
            </div>
          </button>
        </div>
      </div>
    </>
  )
}

export function BuyPage() {
  const { go, createOrder } = useAdmin()
  const [kind, setKind] = useState<PurchaseKind>('general')
  const [productId, setProductId] = useState(DEDICATED_SKUS[0]?.id ?? 'gold')
  const [rows, setRows] = useState<ImportRow[]>([])
  const [merchantPct, setMerchantPct] = useState(FEE_PCT)
  const [confirm, setConfirm] = useState(false)

  const merchantFeeRate = merchantPct / 100
  const plan = planFromRows(rows)
  const costAmount = plan.costAmount
  const q = quote(costAmount, merchantFeeRate)
  const sample = quote(SAMPLE_UNITS, merchantFeeRate)
  const sku = DEDICATED_SKUS.find((item) => item.id === productId)
  const userPct = FEE_PCT - merchantPct
  const canSubmit = plan.rows.length > 0 && costAmount > 0

  return (
    <>
      <div className="admin-crumb">
        <button type="button" onClick={() => go('catalog')}>
          商品管理 / 商品中心
        </button>
        <span> / 采购积分</span>
      </div>
      <div className="admin-panel">
        <div className="buy-hero">
          <div className="buy-visual">
            {kind === 'dedicated' && sku ? <ProductIcon id={sku.id} /> : <div className="points-mark">积</div>}
            <div className="trust">正品保障 · 安全到账 · 可批量发放</div>
          </div>
          <div className="buy-form">
            <h1>会员积分</h1>
            <p className="sku-no">商品编号 PO-POINTS-001</p>
            <div className="price-box">
              <div className="price-row">
                商品价格
                <strong>¥ {money(UNIT_PRICE)}</strong>
              </div>
              <div className="fee-line">
                单价 · 1 份 = 1 元
                <span>手续费率 {FEE_PCT}.00% · 必须拆满 · 默认商户全部承担</span>
              </div>
            </div>
            <div className="trust-row">
              <span>正品保障</span>
              <span>安全保障</span>
              <span>极速到账</span>
              <span>售后无忧</span>
            </div>

            <label className="field">
              <span>采购类型</span>
              <div className="seg">
                <button type="button" className={kind === 'general' ? 'on' : ''} onClick={() => setKind('general')}>
                  通用积分
                </button>
                <button type="button" className={kind === 'dedicated' ? 'on' : ''} onClick={() => setKind('dedicated')}>
                  专用权益
                </button>
              </div>
              <em>
                {kind === 'general'
                  ? '用户可兑换积分专区任意商品'
                  : '一次只能选一种。用户先兑该金/券，兑完后可用金/券再兑积分专区'}
              </em>
            </label>

            {kind === 'dedicated' ? (
              <label className="field">
                <span>绑定商品</span>
                <div className="sku-pick">
                  {DEDICATED_SKUS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={productId === item.id ? 'on' : ''}
                      onClick={() => setProductId(item.id)}
                    >
                      <ProductIcon id={item.id} />
                      {item.name}
                    </button>
                  ))}
                </div>
              </label>
            ) : null}

            <div className="field">
              <span>导入用户</span>
              <em>点击导入表格即可载入样例用户，演示无需实际上传文件。1 份 = 1 元。</em>
              <div className="import-bar">
                <div className="verify-row">
                  <span>验证方式</span>
                  <button type="button" className="verify-pill">
                    手机号验证
                  </button>
                </div>
                <div className="import-actions">
                  <button className="admin-ghost" type="button">
                    下载模板
                  </button>
                  <button className="admin-primary" type="button" onClick={() => setRows(SAMPLE_TABLE)}>
                    导入表格
                  </button>
                </div>
              </div>
              {rows.length > 0 ? (
                <table className="admin-table import-table">
                  <thead>
                    <tr>
                      <th>用户</th>
                      <th>手机号</th>
                      <th>{kind === 'dedicated' ? '份数' : '积分'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.phone}>
                        <td>{row.name ?? maskPhone(row.phone)}</td>
                        <td>{maskPhone(row.phone)}</td>
                        <td>{row.units}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="import-empty">尚未导入。点击「导入表格」载入 3 条样例数据。</div>
              )}
            </div>

            {plan.rows.length > 0 ? (
              <div className="calc-box">
                <div>
                  <span>已导入用户</span>
                  <b>{plan.rows.length} 人</b>
                </div>
                <div>
                  <span>{kind === 'dedicated' ? '需发放权益' : '需采购积分'}</span>
                  <b>
                    {plan.units} {kind === 'dedicated' ? `份${sku?.name ?? ''}` : '分'}
                  </b>
                </div>
                <div>
                  <span>采购金额</span>
                  <b>¥ {money(costAmount)}</b>
                </div>
              </div>
            ) : (
              <div className="calc-box is-empty">导入用户后，按单价 ¥{UNIT_PRICE} × 份数计算采购金额</div>
            )}

            <label className="field">
              <span>手续费拆分</span>
              <em>
                假定采购 {SAMPLE_UNITS} 份（1 份 = 1 元），仅用于展示 {FEE_PCT}% 如何分配，实际按下单商品价格结算
              </em>
              <span>
                商户承担 {merchantPct}%　/　用户承担 {userPct}%
              </span>
              <input
                type="range"
                min={0}
                max={FEE_PCT}
                step={1}
                value={merchantPct}
                onChange={(event) => setMerchantPct(Number(event.target.value))}
              />
            </label>

            <div className="split-preview">
              <div>
                <span>假定商户应付</span>
                <b>¥ {money(sample.merchantPay)}</b>
              </div>
              <div>
                <span>假定用户兑换时扣除</span>
                <b>¥ {money(sample.userFeeAmount)}</b>
              </div>
            </div>

            <button className="admin-primary" disabled={!canSubmit} onClick={() => setConfirm(true)}>
              提交采购
            </button>
          </div>
        </div>
      </div>

      {confirm ? (
        <div className="admin-mask" onClick={() => setConfirm(false)}>
          <div className="admin-modal" onClick={(event) => event.stopPropagation()}>
            <h2>确认采购信息</h2>
            <p className="modal-lead">请核对商户支付与用户承担，确认后生成可发放额度。</p>
            <dl>
              <div>
                <dt>采购类型</dt>
                <dd>{kind === 'general' ? '通用积分' : `专用权益 · ${sku?.name}`}</dd>
              </div>
              <div>
                <dt>商品价格（单价）</dt>
                <dd>¥ {money(UNIT_PRICE)}</dd>
              </div>
              <div>
                <dt>导入用户</dt>
                <dd>{plan.rows.length} 人</dd>
              </div>
              <div>
                <dt>{kind === 'dedicated' ? '发放份数' : '积分数量'}</dt>
                <dd>
                  {plan.units} {kind === 'dedicated' ? '份' : '分'}
                </dd>
              </div>
              <div>
                <dt>采购金额</dt>
                <dd>¥ {money(costAmount)}</dd>
              </div>
              <div>
                <dt>手续费合计 {FEE_PCT}%</dt>
                <dd>¥ {money(q.merchantFeeAmount + q.userFeeAmount)}</dd>
              </div>
              <div className="hi">
                <dt>商户承担 {merchantPct}%</dt>
                <dd>¥ {money(q.merchantFeeAmount)}</dd>
              </div>
              <div className="hi">
                <dt>用户承担 {userPct}%</dt>
                <dd>¥ {money(q.userFeeAmount)}</dd>
              </div>
              <div className="total">
                <dt>商户本次应付</dt>
                <dd>¥ {money(q.merchantPay)}</dd>
              </div>
              <div>
                <dt>用户兑换实得</dt>
                <dd>
                  {kind === 'dedicated'
                    ? `同样 ${costAmount} 分，兑成约 ${money(q.userGets)} 元${sku?.name ?? '权益'}，之后可用金/券再兑积分专区`
                    : userPct
                      ? `同样积分兑金/券时少到账 ${userPct}%；积分专区按面值兑换`
                      : '用户不承担手续费，按面值兑换'}
                </dd>
              </div>
            </dl>
            <div className="modal-actions">
              <button className="admin-ghost" onClick={() => setConfirm(false)}>
                返回修改
              </button>
              <button
                className="admin-primary"
                onClick={() => {
                  createOrder({
                    kind,
                    productId: kind === 'dedicated' ? productId : undefined,
                    costAmount,
                    merchantFeeRate,
                    grants: plan.rows,
                  })
                }}
              >
                确认支付 ¥ {money(q.merchantPay)}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

export function IssuePage() {
  const { orders, issueOrderId, go, distribute, remainingPoints } = useAdmin()
  const order = orders.find((item) => item.id === issueOrderId) ?? orders[0]
  const [rows, setRows] = useState<ImportRow[]>([])
  if (!order) {
    return (
      <>
        <div className="admin-crumb">商品管理 / 批量发放</div>
        <div className="admin-panel empty-panel">暂无已支付订单，请先采购积分。</div>
      </>
    )
  }
  const remain = remainingPoints(order.id)

  return (
    <>
      <div className="admin-crumb">商品管理 / 商品中心 / 批量发放</div>
      <div className="admin-panel">
        <h2 className="teal-title">批量发放</h2>
        <div className="issue-banner">
          请导入表格发放。演示点击「导入表格」即可载入样例。本单剩余可发 {remain} 积分。
        </div>
        <div className="issue-meta">
          <span>订单 {order.id}</span>
          <span>{order.productName}</span>
          <span>用户费率 {(order.userFeeRate * 100).toFixed(0)}%</span>
        </div>
        <div className="import-bar">
          <div className="verify-row">
            <span>验证方式</span>
            <button type="button" className="verify-pill">
              手机号验证
            </button>
          </div>
          <div className="import-actions">
            <button className="admin-ghost" type="button">
              下载模板
            </button>
            <button className="admin-primary" type="button" onClick={() => setRows(SAMPLE_TABLE)}>
              导入表格
            </button>
          </div>
        </div>
        {rows.length > 0 ? (
          <table className="admin-table import-table">
            <thead>
              <tr>
                <th>用户</th>
                <th>手机号</th>
                <th>积分</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.phone}>
                  <td>{row.name ?? maskPhone(row.phone)}</td>
                  <td>{maskPhone(row.phone)}</td>
                  <td>{row.units}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="import-empty">尚未导入。点击「导入表格」载入样例数据。</div>
        )}
        <div className="issue-actions">
          <button className="admin-ghost" onClick={() => go('orders')}>
            查看订单
          </button>
          <button
            className="admin-primary"
            disabled={remain <= 0 || rows.length === 0}
            onClick={() => distribute(order.id, rows.map((row) => row.phone))}
          >
            确认发放
          </button>
        </div>
      </div>
    </>
  )
}

export function OrdersPage() {
  const { orders, go } = useAdmin()
  return (
    <>
      <div className="admin-crumb">商品管理 / 商品订单</div>
      <div className="admin-panel">
        {orders.length === 0 ? <div className="empty-panel">暂无采购订单</div> : null}
        <table className="admin-table">
          <thead>
            <tr>
              <th>订单号</th>
              <th>类型</th>
              <th>采购金额</th>
              <th>商户应付</th>
              <th>用户承担</th>
              <th>已发放</th>
              <th>时间</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {orders.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.productName}</td>
                <td>¥ {money(item.costAmount)}</td>
                <td>¥ {money(item.merchantPay)}</td>
                <td>¥ {money(item.userFeeAmount)}</td>
                <td>
                  {item.issuedPoints}/{item.pointsTotal}
                </td>
                <td>{item.createdAt}</td>
                <td>
                  <button className="link" onClick={() => go('issue', item.id)}>
                    发放
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export function UsersPage() {
  const { users } = useAdmin()
  return (
    <>
      <div className="admin-crumb">商品管理 / 用户积分</div>
      <div className="admin-panel">
        <p className="table-hint">
          商户在此核对每位用户积分。19911011101 对应用户端演示账号，发放后打开用户端即可领取。
        </p>
        {users.length === 0 ? <div className="empty-panel">暂无发放记录</div> : null}
        <table className="admin-table">
          <thead>
            <tr>
              <th>用户</th>
              <th>手机号</th>
              <th>类型</th>
              <th>积分</th>
              <th>用户费率</th>
              <th>兑换实得参考</th>
              <th>订单</th>
            </tr>
          </thead>
          <tbody>
            {users.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{maskPhone(item.phone)}</td>
                <td>{item.kind === 'general' ? '通用积分' : item.productName}</td>
                <td>{item.points}</td>
                <td>{(item.userFeeRate * 100).toFixed(0)}%</td>
                <td>
                  {item.kind === 'dedicated'
                    ? `约 ${Math.round(item.points * (1 - item.userFeeRate))} 元金/券，可再兑积分专区`
                    : item.userFeeRate
                      ? `兑金/券少到账 ${(item.userFeeRate * 100).toFixed(0)}%；积分专区按面值`
                      : '按面值兑换'}
                </td>
                <td>{item.orderId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
