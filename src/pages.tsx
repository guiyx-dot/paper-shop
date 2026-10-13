import { USER, PRODUCTS, PRODUCT_TONES, BENEFIT_CHANNELS, HOME_BENEFIT_PRODUCTS, CATEGORIES, benefitsInChannel, CORP_PAY_ID, GIFT_PACK_ID, DEMO_GIFT_PACK_ITEMS, LABOR_EXTRACT } from './data'
import { NavIcon, ProductIcon } from './icons'
import { NavBar, StatusBar } from './components'
import { GOLD_PRODUCT_ID, useStore } from './store'
import { useState, type CSSProperties, type ReactNode } from 'react'
import type { BenefitChannel, GiftPackItem, PayMethod, Product, RightsTab, Screen, ZoneFrom } from './types'

function money(n: number) {
  return Number.isInteger(n) ? String(n) : n.toFixed(2)
}

function zonePayHint(generalPoints: number, goldBalance: number, couponTotal: number) {
  const parts = [`${generalPoints} 积分`]
  if (goldBalance > 0) parts.push(`通用金 ${money(goldBalance)}`)
  if (couponTotal > 0) parts.push(`券 ${money(couponTotal)}`)
  return `任选一种支付 · ${parts.join(' · ')}`
}

function PayMark({ id }: { id: 'points' | string }) {
  if (id === 'points') {
    return (
      <div className="icon-plate" style={{ background: 'linear-gradient(145deg, #FFB347, #FF8A00)' }}>
        <span className="icon-fallback">积</span>
      </div>
    )
  }
  return <ProductIcon id={id} />
}

function PayRadio({ on }: { on: boolean }) {
  return <span className={on ? 'pay-radio on' : 'pay-radio'} />
}

export function TabBar({ current, locked }: { current: 'mall' | 'mine'; locked?: boolean }) {
  const { go } = useStore()
  return (
    <div className="tab-bar">
      <button
        className={current === 'mall' ? 'tab active' : 'tab'}
        onClick={() => {
          if (!locked) go({ name: 'mall' })
        }}
      >
        <NavIcon name="mall" active={current === 'mall'} />
        首页
      </button>
      <button
        className={current === 'mine' ? 'tab active' : 'tab'}
        onClick={() => {
          if (!locked) go({ name: 'mine' })
        }}
      >
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

function zoneProducts(category: (typeof CATEGORIES)[number]['id']) {
  return PRODUCTS.filter((item) => {
    if (category === 'more') return item.zone === 'benefit'
    if (item.zone !== 'points') return false
    if (category !== 'all' && item.category !== category) return false
    return true
  })
}

function PointsZoneShelf({ variant }: { variant: 'page' | 'home' }) {
  const { go, generalPoints, goldBalance, couponTotal } = useStore()
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]['id']>('all')
  const list = zoneProducts(category)
  const cats = variant === 'page' ? CATEGORIES.filter((item) => item.id !== 'more') : CATEGORIES

  return (
    <>
      {variant === 'page' ? (
        <>
          <div className="fuduo-bar">本页嵌入福多多 H5，商品与履约由对方提供</div>
          <div className="mall-balance is-stack">
            <div className="mall-balance-row">
              <span>可用积分</span>
              <strong>{generalPoints}</strong>
            </div>
            <p className="mall-balance-expire">{zonePayHint(generalPoints, goldBalance, couponTotal)}</p>
          </div>
        </>
      ) : null}
      <div className="cat-row">
        {cats.map((item) => (
          <button key={item.id} className={category === item.id ? 'cat on' : 'cat'} onClick={() => setCategory(item.id)}>
            {item.label}
          </button>
        ))}
      </div>
      <div className="product-grid is-zone">
        {list.map((item) => (
          <button
            key={item.id}
            className="product-card"
            onClick={() =>
              go({
                name: 'detail',
                productId: item.id,
                from: variant === 'page' ? 'points-zone' : undefined,
              })
            }
          >
            <ProductCardBody product={item} />
          </button>
        ))}
      </div>
    </>
  )
}

function MallMemberHero({ variant = 'points' }: { variant?: 'points' | 'withdraw' }) {
  const { points } = useStore()
  const withdraw = variant === 'withdraw'
  return (
    <div className="mall-home-hero">
      <StatusBar />
      <div className="mall-home-nav">{withdraw ? '连续劳务' : '积分兑换商城'}</div>
      <div className="mall-home-card">
        <div className="mall-home-member">
          <div>
            <h2>{withdraw ? '用户中心' : '支车宝会员中心'}</h2>
            <div className="member-user">
              <span className="member-avatar">{USER.name.slice(0, 1)}</span>
              <span>{USER.name}</span>
              <span className="member-info-pill">个人信息 ›</span>
            </div>
          </div>
          <div className="member-gem" aria-hidden="true" />
        </div>
        <div className="mall-home-points">
          <div className="mall-home-points-row">
            <span>{withdraw ? '可提现金额' : '当前会员积分'}</span>
            <strong>{withdraw ? LABOR_EXTRACT.available : points}</strong>
          </div>
          <p>{withdraw ? '自发放起 90 天有效' : '通用积分自发放起 90 天有效'}</p>
        </div>
      </div>
    </div>
  )
}

export function MallPage() {
  const { go, pendingAmount, pendingCount, homeLayout } = useStore()

  return (
    <div className="page mall-page">
      <MallMemberHero />
      {pendingCount > 0 ? (
        <button className="pending-banner" onClick={() => go({ name: 'claim' })}>
          您还有 {pendingAmount} 积分待领取
          <span>去领取</span>
        </button>
      ) : null}

      {homeLayout === 'zones' ? (
        <section className="mall-section">
          <div className="mall-section-head">
            <h2>积分权益专区</h2>
          </div>
          <button className="zone-entry is-benefit" type="button" onClick={() => go({ name: 'benefit-zone' })}>
            <div className="zone-entry-copy">
              <span className="zone-entry-kicker">会员积分兑换</span>
              <strong>积分权益专区</strong>
              <span className="zone-entry-sub">通用金、支付宝券、微信立减金、权益礼包，用会员积分兑换</span>
              <span className="zone-entry-go">进入 ›</span>
            </div>
            <div className="mall-banner-visual" aria-hidden="true">
              <span className="mall-chip mall-chip-a">
                <ProductIcon id="gold" />
              </span>
              <span className="mall-chip mall-chip-b">
                <ProductIcon id="alipay" />
              </span>
              <span className="mall-chip mall-chip-c">
                <ProductIcon id="wechat" />
              </span>
              <span className="mall-chip mall-chip-d">
                <ProductIcon id="gift-pack" />
              </span>
            </div>
          </button>
        </section>
      ) : null}

      <section className="mall-section">
        {homeLayout === 'zones' ? (
          <div className="mall-section-head">
            <h2>积分专区</h2>
          </div>
        ) : null}
        {homeLayout !== 'zones' ? (
          <PointsZoneShelf variant="home" />
        ) : (
          <button className="zone-entry" type="button" onClick={() => go({ name: 'points-zone' })}>
            <div className="zone-entry-copy">
              <span className="zone-entry-kicker">福多多提供</span>
              <strong>积分专区</strong>
              <span className="zone-entry-sub">星巴克、外卖、出行等品牌好物，用通用积分、通用金或券兑换</span>
              <span className="zone-entry-go">进入 ›</span>
            </div>
            <div className="mall-banner-visual" aria-hidden="true">
              <span className="mall-chip mall-chip-a">
                <ProductIcon id="starbucks" />
              </span>
              <span className="mall-chip mall-chip-b">
                <ProductIcon id="takeout" />
              </span>
              <span className="mall-chip mall-chip-c">
                <ProductIcon id="ride" />
              </span>
              <span className="mall-chip mall-chip-d">
                <ProductIcon id="video" />
              </span>
            </div>
          </button>
        )}
      </section>
    </div>
  )
}

function yuan3(n: number) {
  return n.toFixed(3)
}

export function LaborExtractPage() {
  const [picked, setPicked] = useState<string | null>(null)
  const record = LABOR_EXTRACT.records.find((item) => item.id === picked)

  return (
    <div className="page labor-page">
      <MallMemberHero variant="withdraw" />
      <section className="extract-block">
        <h3>提取到收款账户</h3>
        <div className="extract-account">
          <div className="extract-account-left">
            <span className="extract-alipay">
              <ProductIcon id="alipay" />
            </span>
            <span>{LABOR_EXTRACT.accountMask}</span>
          </div>
          <span className="extract-switch">切换收款账号 ›</span>
        </div>
      </section>
      <h3 className="extract-list-head">请选择要提取的充值记录</h3>
      <p className="extract-tip">{LABOR_EXTRACT.tip}</p>
      {LABOR_EXTRACT.records.map((item) => (
        <div key={item.id} className="extract-card">
          <div className="extract-card-top">
            <div>
              <div className="extract-amount">¥{yuan3(item.amount)}</div>
              <div className="extract-name">{item.name}</div>
            </div>
            <button type="button" className="extract-now" onClick={() => setPicked(item.id)}>
              立即提取
            </button>
          </div>
          <div className="extract-meta">
            <div>预计到账金额 {yuan3(item.expected)}</div>
            <div>商家设定服务费率 {yuan3(item.feeRate)}%</div>
            <div>{LABOR_EXTRACT.feeNote}</div>
          </div>
        </div>
      ))}
      {record ? (
        <div className="modal-mask" onClick={() => setPicked(null)}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <h3>确认提取</h3>
            <p className="modal-name">{record.name}</p>
            <div className="modal-amount">
              <span className="modal-pay-label">预计到账</span>
              <em>{yuan3(record.expected)}</em> 元
            </div>
            <p className="modal-sub">
              提取 {yuan3(record.amount)} 元，服务费率 {yuan3(record.feeRate)}%
            </p>
            <button className="btn-primary" type="button" onClick={() => setPicked(null)}>
              确认提取
            </button>
            <button className="btn-text" type="button" onClick={() => setPicked(null)}>
              取消
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function PointsZonePage() {
  const { go } = useStore()

  return (
    <div className="page fuduo-page">
      <StatusBar />
      <NavBar title="积分专区" onBack={() => go({ name: 'mall' })} />
      <PointsZoneShelf variant="page" />
    </div>
  )
}

export function BenefitZonePage() {
  const { go } = useStore()

  return (
    <div className="page mall-page">
      <StatusBar />
      <NavBar title="积分权益专区" onBack={() => go({ name: 'mall' })} />
      <div className="product-grid">
        {HOME_BENEFIT_PRODUCTS.map((item) => (
          <button
            key={item.id}
            className="product-card"
            onClick={() => go({ name: 'detail', productId: item.id, from: 'benefit-zone' })}
          >
            <ProductCardBody product={item} />
          </button>
        ))}
      </div>
    </div>
  )
}

export function BenefitChannelPage({ channel }: { channel: BenefitChannel }) {
  const { go } = useStore()
  const meta = BENEFIT_CHANNELS.find((item) => item.id === channel)
  const list = benefitsInChannel(channel)

  return (
    <div className="page mall-page">
      <StatusBar />
      <NavBar title={meta?.name ?? '权益专区'} onBack={() => go({ name: 'mall' })} />
      <p className="channel-lead">{meta?.sub}</p>
      <div className="product-grid">
        {list.map((item) => (
          <button
            key={item.id}
            className="product-card"
            onClick={() => go({ name: 'detail', productId: item.id, channel })}
          >
            <ProductCardBody product={item} />
          </button>
        ))}
      </div>
    </div>
  )
}

function isGiftPack(id?: string) {
  return id === GIFT_PACK_ID
}

function openBenefitAsset(go: (screen: Screen) => void, productId: string, fromOrderId?: string) {
  if (productId === CORP_PAY_ID) go({ name: 'corp-pay', fromOrderId })
  else if (productId === GOLD_PRODUCT_ID) go({ name: 'gold-wallet', fromOrderId })
  else if (isGiftPack(productId)) go({ name: 'my-benefits', fromOrderId, tab: 'packs' })
  else go({ name: 'my-benefits', fromOrderId, tab: 'cards' })
}

function benefitCtaLabel(productId: string) {
  if (productId === CORP_PAY_ID) return '点击跳转'
  if (isGiftPack(productId)) return '查看权益'
  return '去使用'
}

function PackPerkList({ items }: { items: GiftPackItem[] }) {
  return (
    <div className="pack-perk-list">
      {items.map((item) => (
        <div key={item.id} className="pack-perk">
          <div className="pack-perk-brand">{item.brandName}</div>
          <div className="pack-perk-split" />
          <div className="pack-perk-copy">
            <b>{item.name}</b>
            <span>{item.sub}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function WxChrome({
  title,
  onBack,
  children,
  className,
}: {
  title: string
  onBack: () => void
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`page wx-page${className ? ` ${className}` : ''}`}>
      <StatusBar />
      <div className="wx-nav">
        <button type="button" className="wx-back" onClick={onBack} aria-label="返回">
          ‹
        </button>
        <h1>{title}</h1>
        <div className="wx-capsule" aria-hidden="true">
          <span>☆</span>
          <i />
          <span>⋯</span>
          <i />
          <span>○</span>
        </div>
      </div>
      {children}
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
          <em>{product.zone === 'benefit' && left > 0 ? left * product.cost : product.cost}</em> 积分
          {left > 0 && !reason ? <span className="card-quota">兑完 {left} 份</span> : null}
        </div>
        <ReasonTag product={product} />
      </div>
    </div>
  )
}

export function DetailPage({
  productId,
  channel,
  from,
}: {
  productId: string
  channel?: BenefitChannel
  from?: ZoneFrom
}) {
  const {
    go,
    points,
    generalPoints,
    productById,
    unavailable,
    redeem,
    remainingQuota,
    goldBalance,
    coupons,
    couponTotal,
    userFeeRate,
    quotePay,
    orders,
    homeLayout,
  } = useStore()
  const [confirm, setConfirm] = useState(false)
  const [payWith, setPayWith] = useState<PayMethod>('points')
  const [couponId, setCouponId] = useState<string | undefined>(undefined)
  const product = productById(productId)
  if (!product) return null
  const reason = unavailable(product)
  const quotaLeft = remainingQuota(product.id)
  const batchCost = product.zone === 'benefit' ? quotaLeft * product.cost : product.cost
  const received =
    product.zone === 'benefit' ? Math.round(batchCost * (1 - userFeeRate) * 100) / 100 : product.cost
  const pointsQuote = quotePay(product, 'points')
  const goldQuote = quotePay(product, 'gold')
  const couponQuote = quotePay(product, 'coupon', couponId)
  const quote = payWith === 'gold' ? goldQuote : payWith === 'coupon' ? couponQuote : pointsQuote
  const canAny = product.zone === 'benefit' ? !reason : pointsQuote.ok || goldQuote.ok || couponQuote.ok
  const afterPoints = (product.zone === 'points' ? generalPoints : points) - (product.zone === 'benefit' ? batchCost : quote.pointsPaid)
  const selectedCouponId = couponId ?? couponQuote.couponProductId
  const payUnit = payWith === 'gold' ? '通用金' : payWith === 'coupon' ? couponQuote.label : '积分'
  const latestBenefitOrder = orders.find((item) => item.productId === product.id)
  const benefitFinished = product.zone === 'benefit' && quotaLeft <= 0 && Boolean(latestBenefitOrder)
  const giftPack = isGiftPack(product.id)
  const backScreen =
    from === 'benefit-zone' && homeLayout === 'zones'
      ? { name: 'benefit-zone' as const }
      : from === 'points-zone' && homeLayout === 'zones'
        ? { name: 'points-zone' as const }
        : channel
          ? { name: 'benefit-channel' as const, channel }
          : { name: 'mall' as const }

  return (
    <div className="page detail-page">
      <StatusBar />
      <NavBar title="商品详情" onBack={() => go(backScreen)} />
      <div className="detail-scroll">
      <div className="hero-block">
        <ProductIcon id={product.id} />
        <h2>{product.name}</h2>
        <p>{product.subtitle}</p>
      </div>
      <div className="info-card">
        <Row label="所需积分" value={`${batchCost} 积分`} accent />
        {product.zone === 'points' ? (
          <Row label="本专区可用积分" value={`${generalPoints} 积分`} />
        ) : (
          <Row label="当前会员积分" value={`${points} 积分`} />
        )}
        {product.zone === 'points' ? <Row label="通用金余额" value={`${money(goldBalance)}`} /> : null}
        {product.zone === 'points' ? (
          <Row
            label="抵扣券"
            value={couponTotal > 0 ? coupons.map((item) => `${item.name} ${money(item.value)}`).join(' / ') : '0'}
          />
        ) : null}
        {product.zone === 'benefit' && quotaLeft > 0 ? (
          <Row label="可兑数量" value={`剩余 ${quotaLeft} 份`} />
        ) : null}
        {product.zone === 'benefit' && userFeeRate > 0 ? (
          <Row label="用户承担后到账" value={`${received} 元${product.name}`} />
        ) : null}
        {product.zone === 'benefit' ? (
          <Row
            label="兑后用途"
            value={
              giftPack
                ? '权益放入「我的礼包」，可查看礼包内容'
                : product.id === 'gold'
                  ? '入通用金余额，可兑积分专区'
                  : product.id === CORP_PAY_ID
                    ? '跳转因公付（企业权益）使用'
                    : '入抵扣券，可兑积分专区'
            }
          />
        ) : null}
        {product.zone === 'points' ? (
          <Row
            label="本次支付"
            value={
              payWith === 'gold'
                ? `通用金 ${money(product.cost)}（余额 ${money(goldBalance)}）`
                : payWith === 'coupon'
                  ? `${couponQuote.label} ${money(product.cost)}（持有 ${money(coupons.find((item) => item.productId === (couponId ?? couponQuote.couponProductId))?.value ?? couponTotal)}）`
                  : `${product.cost} 积分`
            }
          />
        ) : canAny ? (
          <Row label="本次支付" value={`${batchCost} 积分`} />
        ) : null}
        {product.zone !== 'points' && canAny ? (
          <Row label="兑后剩余积分" value={`${afterPoints} 积分`} />
        ) : null}
        {product.zone === 'points' && payWith === 'points' && pointsQuote.ok ? (
          <Row label="兑后剩余积分" value={`${generalPoints - product.cost} 积分`} />
        ) : null}
        <Row label="有效期" value={`兑换后 ${product.validityDays} 天`} />
        <Row label="库存" value={product.stockLabel} />
      </div>
      {giftPack ? (
        <div className="desc-card pack-preview">
          <h3>本次礼包内容</h3>
          <PackPerkList items={DEMO_GIFT_PACK_ITEMS} />
        </div>
      ) : null}
      <div className="desc-card">
        <h3>权益说明</h3>
        <p>{product.description}</p>
        <p className="desc-note">
          {reason
            ? reason.hint
            : product.zone === 'benefit'
              ? giftPack
                ? `${product.usage} 兑成后点「查看权益」进入我的礼包。`
                : product.id === CORP_PAY_ID
                  ? `${product.usage} 兑成后点击跳转至因公付（企业权益）。`
                  : `${product.usage} 兑成${product.id === 'gold' ? '通用金余额' : '抵扣券'}后，可在积分专区选择对应方式支付。`
              : '支付时竖向选择积分、通用金或抵扣券，一次只用一种。余额不够请先兑权益专区，或改用其他方式。'}
        </p>
      </div>
      </div>
      <div className="bottom-cta">
        {benefitFinished ? (
          <button className="btn-primary" type="button" onClick={() => openBenefitAsset(go, product.id)}>
            {benefitCtaLabel(product.id)}
          </button>
        ) : !canAny ? (
          <button className="btn-primary is-disabled" disabled>
            {reason?.label ?? '兑换结束'}
          </button>
        ) : (
          <button
            className="btn-primary"
            onClick={() => {
              if (product.zone === 'points' && !pointsQuote.ok) {
                if (goldQuote.ok) setPayWith('gold')
                else if (couponQuote.ok) setPayWith('coupon')
              }
              setConfirm(true)
            }}
          >
            {product.zone === 'benefit' && quotaLeft > 1 ? `兑换全部 ${quotaLeft} 份` : '立即兑换'}
          </button>
        )}
      </div>
      {confirm ? (
        <div className="modal-mask" onClick={() => setConfirm(false)}>
          <div className={`modal${product.zone === 'points' ? ' modal-pay' : ''}`} onClick={(event) => event.stopPropagation()}>
            <h3>确认兑换</h3>
            <p className="modal-name">{product.name}</p>
            <div className="modal-amount">
              <span className="modal-pay-label">需支付</span>
              <em>{money(batchCost)}</em> {product.zone === 'points' ? payUnit : '积分'}
            </div>
            {product.zone === 'points' ? (
              <div className="pay-list">
                <button
                  type="button"
                  className={`pay-row${payWith === 'points' ? ' on' : ''}${pointsQuote.ok ? '' : ' is-short'}`}
                  onClick={() => setPayWith('points')}
                >
                  <PayMark id="points" />
                  <span className="pay-row-body">
                    <span className="pay-row-title">积分</span>
                    <span className="pay-row-sub">
                      {pointsQuote.ok ? `可用 ${generalPoints} 积分` : `可用 ${generalPoints} 积分，不足 ${product.cost}`}
                    </span>
                  </span>
                  <PayRadio on={payWith === 'points'} />
                </button>
                <button
                  type="button"
                  className={`pay-row${payWith === 'gold' ? ' on' : ''}${goldQuote.ok ? '' : ' is-short'}`}
                  onClick={() => setPayWith('gold')}
                >
                  <PayMark id="gold" />
                  <span className="pay-row-body">
                    <span className="pay-row-title">通用金</span>
                    <span className="pay-row-sub">
                      {goldQuote.ok ? `余额 ${money(goldBalance)}` : `余额 ${money(goldBalance)}，不足 ${money(product.cost)}`}
                    </span>
                  </span>
                  <PayRadio on={payWith === 'gold'} />
                </button>
                {coupons.length > 0 ? (
                  coupons.map((item) => {
                    const selected = payWith === 'coupon' && selectedCouponId === item.productId
                    const enough = item.value >= product.cost
                    return (
                      <button
                        key={item.productId}
                        type="button"
                        className={`pay-row${selected ? ' on' : ''}${enough ? '' : ' is-short'}`}
                        onClick={() => {
                          setPayWith('coupon')
                          setCouponId(item.productId)
                        }}
                      >
                        <PayMark id={item.productId} />
                        <span className="pay-row-body">
                          <span className="pay-row-title">{item.name}</span>
                          <span className="pay-row-sub">
                            {enough ? `余额 ${money(item.value)}` : `余额 ${money(item.value)}，不足 ${money(product.cost)}`}
                          </span>
                        </span>
                        <PayRadio on={selected} />
                      </button>
                    )
                  })
                ) : (
                  <button
                    type="button"
                    className={`pay-row${payWith === 'coupon' ? ' on' : ''} is-short`}
                    onClick={() => setPayWith('coupon')}
                  >
                    <PayMark id="alipay" />
                    <span className="pay-row-body">
                      <span className="pay-row-title">抵扣券</span>
                      <span className="pay-row-sub">暂无可用券，请先兑权益专区</span>
                    </span>
                    <PayRadio on={payWith === 'coupon'} />
                  </button>
                )}
              </div>
            ) : (
              <p className="modal-sub">
                {giftPack
                  ? `当前会员积分：${points}，一次兑换整份礼包`
                  : `当前会员积分：${points}，一次兑完剩余 ${quotaLeft} 份`}
              </p>
            )}
            {product.zone === 'benefit' ? (
              <p className="modal-tip">
                {giftPack
                  ? '兑换后权益放入「我的礼包」，可查看本次礼包内容'
                  : product.id === CORP_PAY_ID
                    ? `到账约 ${received} 元因公付额度，兑换后点击跳转使用`
                    : `到账约 ${received} 元${product.name}${product.id === 'gold' ? '（计入通用金余额）' : '（计入抵扣券）'}，之后可在积分专区支付`}
              </p>
            ) : null}
            <button
              className="btn-primary"
              disabled={product.zone === 'points' ? !quote.ok : Boolean(reason)}
              onClick={() => {
                setConfirm(false)
                redeem(product.id, product.zone === 'points' ? payWith : 'points', couponId)
              }}
            >
              {product.zone === 'points' && !quote.ok ? '余额不足' : '确认兑换'}
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

function zoneReturnLabel(from?: ZoneFrom, screenName?: string) {
  if (from === 'benefit-zone' || screenName === 'benefit-zone') return '返回积分权益专区'
  if (from === 'points-zone' || screenName === 'points-zone') return '返回积分专区'
  return '返回商城'
}

export function SuccessPage({ orderId, from }: { orderId: string; from?: ZoneFrom }) {
  const { go, orders, productById, homeLayout } = useStore()
  const order = orders.find((item) => item.id === orderId)
  if (!order) return null
  const product = productById(order.productId)
  const listScreen =
    homeLayout === 'zones' && (from === 'points-zone' || product?.zone === 'points')
      ? { name: 'points-zone' as const }
      : homeLayout === 'zones' && (from === 'benefit-zone' || product?.zone === 'benefit')
        ? { name: 'benefit-zone' as const }
        : { name: 'mall' as const }

  return (
    <div className="page success-page">
      <StatusBar />
      <NavBar
        title="兑换详情"
        onBack={() => go(listScreen)}
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
          {order.payWith === 'gold'
            ? `已用通用金 ${money(order.goldPaid ?? 0)}${(order.pointsPaid ?? 0) > 0 ? `，积分补 ${money(order.pointsPaid ?? 0)}` : ''}`
            : order.payWith === 'coupon'
              ? `已用${order.payLabel ?? '抵扣券'}抵扣 ${money(order.couponPaid ?? 0)}${(order.pointsPaid ?? 0) > 0 ? `，积分补 ${money(order.pointsPaid ?? 0)}` : ''}`
              : `${order.cost} 积分已扣除`}
        </p>
        {isGiftPack(order.productId) ? (
          <p>权益已放入「我的礼包」，可查看本次礼包内容</p>
        ) : order.received ? (
          <p>
            {order.productId === CORP_PAY_ID
              ? `到账 ${order.received} 元因公付额度，点击跳转即可使用`
              : `到账 ${order.received} 元${order.productId === 'gold' ? '通用金' : '抵扣券'}，可在积分专区支付`}
          </p>
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
        <Row
          label="支付方式"
          value={
            order.payWith === 'gold' ? '通用金余额' : order.payWith === 'coupon' ? `${order.payLabel ?? '抵扣券'}` : '积分'
          }
        />
        {(order.pointsPaid ?? order.cost) > 0 && order.payWith !== 'gold' && order.payWith !== 'coupon' ? (
          <Row label="消耗积分" value={`-${order.cost} 积分`} accent />
        ) : null}
        {(order.goldPaid ?? 0) > 0 ? <Row label="消耗通用金" value={`-${money(order.goldPaid ?? 0)}`} accent /> : null}
        {(order.couponPaid ?? 0) > 0 ? (
          <Row label={`消耗${order.payLabel ?? '抵扣券'}`} value={`-${money(order.couponPaid ?? 0)}`} accent />
        ) : null}
        {(order.pointsPaid ?? 0) > 0 && (order.payWith === 'gold' || order.payWith === 'coupon') ? (
          <Row label="积分补差" value={`-${money(order.pointsPaid ?? 0)} 积分`} accent />
        ) : null}
        {order.received ? <Row label="到账" value={`${order.received} 元`} success /> : null}
        <Row label="状态" value="已完成" success />
      </div>
      <div className="bottom-cta">
        {product?.zone === 'benefit' ? (
          <>
            <button
              className="btn-primary"
              type="button"
              onClick={() => openBenefitAsset(go, order.productId, order.id)}
            >
              {benefitCtaLabel(order.productId)}
            </button>
            <button className="btn-text" onClick={() => go(listScreen)}>
              {zoneReturnLabel(from, listScreen.name)}
            </button>
          </>
        ) : (
          <button className="btn-primary" onClick={() => go(listScreen)}>
            {zoneReturnLabel(from, listScreen.name)}
          </button>
        )}
      </div>
    </div>
  )
}

export function GoldWalletPage({ fromOrderId }: { fromOrderId?: string }) {
  const { go, goldBalance, orders } = useStore()
  const rows = orders.filter((item) => item.productId === GOLD_PRODUCT_ID || item.payWith === 'gold')

  return (
    <div className="page gold-wallet-page">
      <StatusBar />
      <NavBar
        title="通用金"
        onBack={() => (fromOrderId ? go({ name: 'success', orderId: fromOrderId }) : go({ name: 'mall' }))}
      />
      <p className="gold-kicker">通用金 | 您的专属积分</p>
      <div className="gold-card">
        <div className="gold-card-top">
          <span>可用额度</span>
          <span className="gold-hint">提取说明</span>
        </div>
        <div className="gold-amount">{money(goldBalance)}</div>
        <div className="gold-coin" aria-hidden>
          <ProductIcon id="gold" />
        </div>
      </div>
      <button className="gold-transfer" type="button">
        <span className="gold-transfer-mark">¥</span>
        转出
      </button>
      <div className="gold-ledger-head">
        <h3>额度变动明细</h3>
        <span>全部</span>
      </div>
      <div className="gold-ledger">
        {rows.length === 0 ? (
          <p className="empty">暂无明细</p>
        ) : (
          rows.map((item) => {
            const inGold = item.productId === GOLD_PRODUCT_ID
            const amount = inGold ? item.received ?? item.cost : -(item.goldPaid ?? 0)
            return (
              <div key={item.id} className="gold-ledger-row">
                <div>
                  <div className="ledger-title">{inGold ? '兑换入账' : `兑换${item.productName}`}</div>
                  <div className="ledger-time">{item.time}</div>
                </div>
                <strong className={amount > 0 ? 'plus' : 'accent'}>
                  {amount > 0 ? '+' : ''}
                  {money(amount)}
                </strong>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export function RightsPage({ fromOrderId, tab: initialTab }: { fromOrderId?: string; tab?: RightsTab }) {
  const { go, coupons, giftPacks } = useStore()
  const [tab, setTab] = useState<RightsTab>(initialTab ?? 'cards')
  const [filter, setFilter] = useState<'all' | 'unused' | 'charging' | 'used'>('unused')
  const unused = coupons.filter((item) => item.value > 0)
  const shown = filter === 'charging' || filter === 'used' ? [] : unused

  return (
    <WxChrome
      title="我的权益"
      className="rights-page"
      onBack={() => (fromOrderId ? go({ name: 'success', orderId: fromOrderId }) : go({ name: 'mall' }))}
    >
      <div className="rights-tabs">
        <button type="button" className={tab === 'cards' ? 'on' : ''} onClick={() => setTab('cards')}>
          我的卡券
        </button>
        <button type="button" className={tab === 'packs' ? 'on' : ''} onClick={() => setTab('packs')}>
          我的礼包
        </button>
      </div>
      {tab === 'cards' ? (
        <>
          <div className="rights-filters">
            {(
              [
                ['all', '全部'],
                ['unused', '未使用'],
                ['charging', '充值中'],
                ['used', '已使用'],
              ] as const
            ).map(([id, label]) => (
              <button key={id} type="button" className={filter === id ? 'on' : ''} onClick={() => setFilter(id)}>
                {label}
              </button>
            ))}
          </div>
          <div className="rights-list">
            {shown.length === 0 ? (
              <p className="empty">{filter === 'charging' ? '暂无充值中的卡券' : filter === 'used' ? '暂无已使用卡券' : '暂无卡券'}</p>
            ) : (
              shown.map((item) => (
                <div key={item.productId} className="rights-group">
                  <div className="rights-brand">
                    <ProductIcon id={item.productId} />
                    <span>{item.productId === 'wechat' ? '微信' : '支付宝'}</span>
                  </div>
                  <div className="rights-coupon">
                    <div className="rights-value">
                      <em>¥{money(item.value)}</em>
                    </div>
                    <div className="rights-copy">
                      <div>{item.name}</div>
                      <p>可在积分专区支付时全额抵扣</p>
                      <p>兑换后 90 天内有效</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : giftPacks.length === 0 ? (
        <p className="empty">暂无礼包</p>
      ) : (
        <div className="rights-packs">
          {giftPacks.map((pack) => (
            <button
              key={pack.id}
              className="gift-card"
              type="button"
              onClick={() => go({ name: 'gift-pack', packId: pack.id, fromOrderId })}
            >
              <div className="gift-top">
                <span className="gift-badge">已领取</span>
                <span className="gift-go">查看礼包 ›</span>
              </div>
              <h3>{pack.name}</h3>
              <p className="gift-meta">含 {pack.items.length} 项权益</p>
            </button>
          ))}
        </div>
      )}
    </WxChrome>
  )
}

export function GiftPackPage({ packId, fromOrderId }: { packId?: string; fromOrderId?: string }) {
  const { go, giftPacks } = useStore()
  const pack = giftPacks.find((item) => item.id === packId) ?? giftPacks[0]
  if (!pack) return null

  return (
    <WxChrome
      title="礼包详情"
      className="gift-pack-page"
      onBack={() => go({ name: 'my-benefits', fromOrderId, tab: 'packs' })}
    >
      <div className="pack-hero">
        <span className="gift-badge">已领取</span>
        <h3>{pack.name}</h3>
        <p>全部权益已放入此礼包</p>
      </div>
      <PackPerkList items={pack.items} />
    </WxChrome>
  )
}

export function CorpPayPage({ fromOrderId }: { fromOrderId?: string }) {
  const { go } = useStore()

  return (
    <div className="page corp-pay-page">
      <StatusBar />
      <div className="corp-pay-nav">
        <button
          type="button"
          className="corp-pay-back"
          onClick={() => (fromOrderId ? go({ name: 'success', orderId: fromOrderId }) : go({ name: 'mall' }))}
          aria-label="返回"
        >
          ‹
        </button>
        <h1>因公付（企业权益）</h1>
        <div className="corp-pay-tools" aria-hidden="true">
          <span>☆</span>
          <span>⋯</span>
          <span>○</span>
        </div>
      </div>
      <div className="corp-pay-list">
        <div className="corp-pay-card is-maili">
          <div className="corp-pay-brand">
            <span className="corp-pay-logo">支</span>
            <strong>麦粒</strong>
          </div>
          <div className="corp-pay-row">
            <div>
              <span>可用额度（元）</span>
              <b>0.00</b>
            </div>
            <button type="button">进入</button>
          </div>
        </div>
        <div className="corp-pay-card is-corp">
          <div className="corp-pay-brand">
            <span className="corp-pay-logo">支</span>
            <strong>
              因公付 <em>| 麦粒</em>
            </strong>
          </div>
          <div className="corp-pay-row">
            <div>
              <span>可用额度（元）</span>
              <b>0.00</b>
            </div>
            <button type="button">进入</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function MinePage() {
  const { points, go, ledger, pendingAmount, pendingCount, reset, goldBalance, coupons, couponTotal } = useStore()

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
        <div className="account-grid is-three">
          <div>
            <span>可用积分</span>
            <strong>{points}</strong>
          </div>
          <div>
            <span>通用金余额</span>
            <strong>{money(goldBalance)}</strong>
          </div>
          <div>
            <span>抵扣券</span>
            <strong>{money(couponTotal)}</strong>
          </div>
        </div>
        {coupons.length > 0 ? (
          <div className="voucher-line">
            {coupons.map((item) => `${item.name} ${money(item.value)}`).join(' · ')}
            ，可在积分专区抵扣
          </div>
        ) : goldBalance > 0 ? (
          <div className="voucher-line">通用金可在积分专区作为余额支付</div>
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
              <div className="ledger-time">
                {item.time} · {item.id}
                {item.payWith === 'gold'
                  ? ' · 通用金'
                  : item.payWith === 'coupon'
                    ? ` · ${item.payLabel ?? '券'}`
                    : ' · 积分'}
              </div>
            </div>
            <strong className="accent">-{item.cost}</strong>
          </button>
        ))}
      </div>
    </div>
  )
}
