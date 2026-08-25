import { USER, PRODUCTS, PRODUCT_TONES } from './data'
import { NavIcon, ProductIcon } from './icons'
import { NavBar, StatusBar } from './components'
import { useStore } from './store'
import { useState, type CSSProperties } from 'react'
import type { Product } from './types'

export function TabBar({ current }: { current: 'mall' | 'mine' }) {
  const { go } = useStore()
  return (
    <div className="tab-bar">
      <button className={current === 'mall' ? 'tab active' : 'tab'} onClick={() => go({ name: 'mall' })}>
        <NavIcon name="mall" active={current === 'mall'} />
        商城
      </button>
      <button className={current === 'mine' ? 'tab active' : 'tab'} onClick={() => go({ name: 'mine' })}>
        <NavIcon name="mine" active={current === 'mine'} />
        我的
      </button>
    </div>
  )
}

function ReasonTag({ product }: { product: Product }) {
  const { unavailable } = useStore()
  const reason = unavailable(product)
  if (!reason) return <span className="link-redeem">立即兑换</span>
  return <span className="reason-text">{reason.label}</span>
}

const LOGO_PILE = [
  { id: 'starbucks', left: '34%', top: '14%', size: 58, z: 6, rotate: -9 },
  { id: 'alipay', left: '18%', top: '6%', size: 50, z: 5, rotate: 12 },
  { id: 'wechat', left: '52%', top: '2%', size: 48, z: 4, rotate: -7 },
  { id: 'takeout', left: '6%', top: '34%', size: 46, z: 5, rotate: 14 },
  { id: 'jd', left: '58%', top: '30%', size: 54, z: 7, rotate: 8 },
  { id: 'gold', left: '40%', top: '46%', size: 42, z: 8, rotate: -5 },
  { id: 'ride', left: '72%', top: '10%', size: 42, z: 3, rotate: -16 },
  { id: 'movie', left: '68%', top: '50%', size: 40, z: 5, rotate: 7 },
  { id: 'video', left: '16%', top: '58%', size: 38, z: 4, rotate: -11 },
  { id: 'market', left: '2%', top: '6%', size: 34, z: 2, rotate: 18 },
  { id: 'hotel', left: '82%', top: '38%', size: 36, z: 2, rotate: -10 },
  { id: 'hotpot', left: '30%', top: '64%', size: 36, z: 3, rotate: 15 },
  { id: 'digital', left: '84%', top: '4%', size: 32, z: 1, rotate: 22 },
] as const

export function ClaimPage() {
  const { pendingAmount, pendingCount, claimPending, hasEverClaimed, go } = useStore()

  return (
    <div className="page claim-page">
      <StatusBar />
      <div className="claim-hero">
        <div className="orb orb-a" />
        <div className="orb orb-b" />
        <div className="claim-kicker">会员积分待领取</div>
        <div className="claim-amount">
          {pendingAmount}
          <span>分</span>
        </div>
        <div className="claim-sub">
          {pendingCount > 1 ? `共 ${pendingCount} 笔发放，领取后合并入账` : '领取后可前往积分商城兑换精选好礼'}
        </div>
      </div>
      <div className="claim-sheet">
        <div className="sheet-title">领取后可兑好物</div>
        <div className="logo-pile" aria-hidden="true">
          {LOGO_PILE.map((item) => (
            <div
              key={item.id}
              className="logo-chip"
              style={{
                left: item.left,
                top: item.top,
                width: item.size,
                height: item.size,
                zIndex: item.z,
                transform: `rotate(${item.rotate}deg)`,
              }}
            >
              <ProductIcon id={item.id} />
            </div>
          ))}
        </div>
        <p className="pile-caption">精选品牌好物，领完即可兑换</p>
        <button className="btn-primary" onClick={claimPending} disabled={pendingAmount <= 0}>
          {pendingAmount > 0 ? '立即领取' : '暂无待领取积分'}
        </button>
        {hasEverClaimed ? (
          <button className="btn-text" onClick={() => go({ name: 'mall' })}>
            返回商城
          </button>
        ) : (
          <p className="claim-note">领取后即可进入积分商城</p>
        )}
      </div>
    </div>
  )
}

export function MallPage() {
  const { points, go, pendingAmount, pendingCount, generalPoints, voucherValue, voucherLabel } = useStore()
  const [category, setCategory] = useState<'all' | 'dining' | 'life' | 'travel'>('all')

  const benefitList = PRODUCTS.filter((item) => item.zone === 'benefit')
  const pointsList = PRODUCTS.filter((item) => {
    if (item.zone !== 'points') return false
    if (category !== 'all' && item.category !== category) return false
    return true
  })

  return (
    <div className="page mall-page">
      <StatusBar />
      <NavBar title="积分兑换商城" />
      <div className="mall-balance">
        <span>当前会员积分</span>
        <strong>{points}</strong>
      </div>
      {pendingCount > 0 ? (
        <button className="pending-banner" onClick={() => go({ name: 'claim' })}>
          您还有 {pendingAmount} 积分待领取
          <span>去领取</span>
        </button>
      ) : null}

      <section className="mall-section">
        <div className="mall-section-head">
          <h2>权益专区</h2>
          <p>按发放额度兑换</p>
        </div>
        <div className="product-grid">
          {benefitList.map((item) => (
            <button key={item.id} className="product-card" onClick={() => go({ name: 'detail', productId: item.id })}>
              <ProductCardBody product={item} />
            </button>
          ))}
        </div>
      </section>

      <section className="mall-section">
        <div className="mall-section-head">
          <h2>积分专区</h2>
          <p>本专区可用 {generalPoints} 积分{voucherValue > 0 ? ` · ${voucherLabel} ${voucherValue}` : ''}</p>
        </div>
        <div className="cat-row">
          {[
            ['all', '全部'],
            ['dining', '餐饮'],
            ['life', '生活'],
            ['travel', '出行'],
          ].map(([id, label]) => (
            <button
              key={id}
              className={category === id ? 'cat on' : 'cat'}
              onClick={() => setCategory(id as typeof category)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="product-grid">
          {pointsList.map((item) => (
            <button key={item.id} className="product-card" onClick={() => go({ name: 'detail', productId: item.id })}>
              <ProductCardBody product={item} />
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}

function ProductCardBody({ product }: { product: Product }) {
  const { unavailable, remainingQuota } = useStore()
  const reason = unavailable(product)
  const tone = PRODUCT_TONES[product.id] ?? ['#FFB347', '#FF8A00']
  const left = product.zone === 'benefit' ? remainingQuota(product.id) : 0
  return (
    <div
      className={`card-inner card-poster${reason ? ' is-disabled' : ''}`}
      style={{ '--c1': tone[0], '--c2': tone[1] } as CSSProperties}
    >
      <ProductIcon id={product.id} />
      <div className="card-meta">
        <div className="card-name">{product.name}</div>
        <div className="card-price">
          <em>{product.cost}</em> 积分
          {left > 0 && !reason ? <span className="card-quota">剩 {left} 份</span> : null}
        </div>
        <ReasonTag product={product} />
      </div>
    </div>
  )
}

export function DetailPage({ productId }: { productId: string }) {
  const { go, points, generalPoints, productById, unavailable, redeem, remainingQuota, voucherValue, voucherLabel, userFeeRate } =
    useStore()
  const [confirm, setConfirm] = useState(false)
  const [payWith, setPayWith] = useState<'points' | 'voucher'>('points')
  const product = productById(productId)
  if (!product) return null
  const reason = unavailable(product)
  const quotaLeft = remainingQuota(product.id)
  const pointsPay = product.cost
  const canVoucher = product.zone === 'points' && !product.ended && voucherValue >= product.cost
  const activePay: 'points' | 'voucher' = canVoucher && reason ? 'voucher' : payWith
  const usable = product.zone === 'points' ? generalPoints : points
  const after = usable - (product.zone === 'points' ? pointsPay : product.cost)
  const received = product.zone === 'benefit' ? Math.round(product.cost * (1 - userFeeRate) * 100) / 100 : product.cost

  return (
    <div className="page detail-page">
      <StatusBar />
      <NavBar title="商品详情" onBack={() => go({ name: 'mall' })} />
      <div className="hero-block">
        <ProductIcon id={product.id} />
        <h2>{product.name}</h2>
        <p>{product.subtitle}</p>
      </div>
      <div className="info-card">
        <Row label="所需积分" value={`${product.cost} 积分`} accent />
        {product.zone === 'points' ? (
          <Row label="本专区可用" value={`${generalPoints} 积分`} />
        ) : (
          <Row label="当前会员积分" value={`${points} 积分`} />
        )}
        {product.zone === 'benefit' && quotaLeft > 0 ? (
          <Row label="可兑数量" value={`剩余 ${quotaLeft} 份`} />
        ) : null}
        {product.zone === 'benefit' && userFeeRate > 0 ? (
          <Row label="用户承担后到账" value={`${received} 元${product.name}`} />
        ) : null}
        {product.zone === 'points' && canVoucher ? (
          <Row label="也可用金/券兑" value={`1:1 · ${voucherLabel} ${voucherValue}`} />
        ) : null}
        {voucherValue > 0 ? <Row label={voucherLabel} value={`${voucherValue}`} /> : null}
        {!reason && payWith === 'points' ? <Row label="兑后剩余积分" value={`${after} 积分`} /> : null}
        <Row label="有效期" value={`兑换后 ${product.validityDays} 天`} />
        <Row label="库存" value={product.stockLabel} />
      </div>
      <div className="desc-card">
        <h3>权益说明</h3>
        <p>{product.description}</p>
        <p className="desc-note">
          {reason
            ? reason.hint
            : product.zone === 'benefit'
              ? `${product.usage} 兑成金/券后，可再兑换积分专区商品。`
              : product.usage}
        </p>
      </div>
      <div className="bottom-cta">
        {reason && !canVoucher ? (
          <button className="btn-primary is-disabled" disabled>
            {reason.label}
          </button>
        ) : (
          <button className="btn-primary" onClick={() => setConfirm(true)}>
            立即兑换
          </button>
        )}
      </div>
      {confirm ? (
        <div className="modal-mask" onClick={() => setConfirm(false)}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <h3>确认兑换</h3>
            <p className="modal-name">{product.name}</p>
            {canVoucher ? (
              <div className="pay-switch">
                <button className={activePay === 'voucher' ? 'on' : ''} onClick={() => setPayWith('voucher')} type="button">
                  用{voucherLabel}兑
                </button>
                <button
                  className={activePay === 'points' ? 'on' : ''}
                  onClick={() => setPayWith('points')}
                  type="button"
                  disabled={Boolean(reason)}
                >
                  用积分兑
                </button>
              </div>
            ) : null}
            <div className="modal-amount">
              <em>{activePay === 'voucher' ? product.cost : pointsPay}</em> {activePay === 'voucher' ? voucherLabel : '积分'}
            </div>
            <p className="modal-sub">
              {activePay === 'voucher'
                ? `${voucherLabel}余额：${voucherValue}`
                : product.zone === 'points'
                  ? `本专区可用：${generalPoints}`
                  : `当前会员积分：${points}`}
            </p>
            {product.zone === 'benefit' ? (
              <p className="modal-tip">
                到账约 {received} 元{product.name}，之后可二次兑换积分专区
              </p>
            ) : null}
            <button
              className="btn-primary"
              onClick={() => {
                setConfirm(false)
                redeem(product.id, activePay)
              }}
            >
              确认兑换
            </button>
            <button className="btn-text" onClick={() => setConfirm(false)}>
              取消
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function Row({
  label,
  value,
  accent,
  success,
}: {
  label: string
  value: string
  accent?: boolean
  success?: boolean
}) {
  return (
    <div className="info-row">
      <span>{label}</span>
      <strong className={accent ? 'accent' : success ? 'plus' : ''}>{value}</strong>
    </div>
  )
}

export function SuccessPage({ orderId }: { orderId: string }) {
  const { go, orders, productById } = useStore()
  const order = orders.find((item) => item.id === orderId)
  if (!order) return null
  const product = productById(order.productId)

  return (
    <div className="page success-page">
      <StatusBar />
      <NavBar
        title="兑换详情"
        onBack={() => go({ name: 'mall' })}
        right={
          <button className="nav-text" onClick={() => go({ name: 'records' })}>
            记录
          </button>
        }
      />
      <div className="success-head">
        <div className="check">✓</div>
        <h2>兑换成功</h2>
        <p>
          {order.payWith === 'voucher'
            ? `已用金/券抵扣 ${order.cost}`
            : `${order.cost} 积分已扣除`}
        </p>
        {order.received ? (
          <p>到账 {order.received} 元，可再兑换积分专区商品</p>
        ) : null}
      </div>
      <div className="ticket">
        {product ? <ProductIcon id={product.id} /> : null}
        <div>
          <div className="ticket-name">{order.productName}</div>
          <div className="ticket-sub">有效期至 {order.expireDate}</div>
        </div>
      </div>
      <div className="info-card">
        <Row label="订单编号" value={order.id} />
        <Row label="兑换时间" value={order.time} />
        <Row label="消耗积分" value={`-${order.cost} 积分`} accent />
        <Row label="状态" value="已完成" success />
      </div>
      <div className="bottom-cta">
        <button className="btn-primary" onClick={() => go({ name: 'mall' })}>
          返回商城
        </button>
      </div>
    </div>
  )
}

export function MinePage() {
  const { points, go, ledger, pendingAmount, pendingCount, reset, voucherValue, voucherLabel } = useStore()

  return (
    <div className="page mine-page">
      <StatusBar />
      <NavBar title="会员" />
      <div className="user-row">
        <div className="avatar">{USER.name.slice(0, 1)}</div>
        <div>
          <div className="user-name">{USER.name}</div>
          <div className="user-phone">{USER.phone}</div>
        </div>
      </div>
      <div className="account-card">
        <div className="account-top">我的账户</div>
        <div className="account-grid">
          <div>
            <span>可用积分额度</span>
            <strong>{points}</strong>
          </div>
          <div>
            <span>冻结积分额度</span>
            <strong>0</strong>
          </div>
        </div>
        {voucherValue > 0 ? (
          <div className="voucher-line">
            {voucherLabel}余额 <b>{voucherValue}</b> · 可二次兑换积分专区
          </div>
        ) : null}
      </div>
      <div className="corp-card">
        <span className="ok">✓</span>
        {USER.corp}
      </div>
      {pendingCount > 0 ? (
        <button className="pending-banner" onClick={() => go({ name: 'claim' })}>
          您还有 {pendingAmount} 积分待领取
          <span>去领取</span>
        </button>
      ) : null}
      <button className="plain-card" onClick={() => go({ name: 'records' })}>
        <div>
          <div className="plain-title">兑换记录</div>
          <div className="plain-sub">查看已兑换商品与订单详情</div>
        </div>
        <span className="chev">›</span>
      </button>
      <div className="section-head">
        <span>额度变动明细</span>
      </div>
      <div className="ledger">
        {ledger.length === 0 ? <div className="empty">暂无变动</div> : null}
        {ledger.map((item) => (
          <div key={item.id} className="ledger-row">
            <div>
              <div className="ledger-title">{item.title}</div>
              <div className="ledger-time">{item.time}</div>
            </div>
            <strong className={item.amount > 0 ? 'plus' : 'accent'}>
              {item.amount > 0 ? `+${item.amount}` : item.amount}
            </strong>
          </div>
        ))}
      </div>
      <button className="reset-demo" onClick={reset}>
        重置演示数据
      </button>
    </div>
  )
}

export function RecordsPage() {
  const { go, orders } = useStore()
  return (
    <div className="page records-page">
      <StatusBar />
      <NavBar title="兑换记录" onBack={() => go({ name: 'mine' })} />
      <div className="ledger">
        {orders.length === 0 ? <div className="empty">暂无兑换记录</div> : null}
        {orders.map((item) => (
          <button key={item.id} className="ledger-row as-btn" onClick={() => go({ name: 'success', orderId: item.id })}>
            <div>
              <div className="ledger-title">{item.productName}</div>
              <div className="ledger-time">{item.time} · {item.id}</div>
            </div>
            <strong className="accent">-{item.cost}</strong>
          </button>
        ))}
      </div>
    </div>
  )
}
