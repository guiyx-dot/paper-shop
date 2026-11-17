import { useEffect, useState } from 'react'
import { NavBar, StatusBar } from './components'
import { catalogProduct } from './catalog'
import { appendShopOrder, listShopRedeems, orderTimeValue } from './admin/shop-orders'
import { loadRedeems } from './admin/redemptions'
import { pointCost, useMallConfig, type ShopGood } from './shop-catalog'
import { peekConsumer, useStore } from './store'

function coverText(name: string) {
  return name.replace(/【[^】]*】/g, '').trim().slice(0, 2)
}

function GoodsGrid({ goods, from }: { goods: ShopGood[]; from: string }) {
  const { go } = useStore()
  if (goods.length === 0) return <p className="shop-empty">这个货架暂时没有在售商品</p>
  return (
    <div className="fd-grid">
      {goods.map((item) => (
        <button
          key={item.id}
          className="fd-card"
          type="button"
          onClick={() => go({ name: 'shop-detail', productId: item.id, from })}
        >
          <div className="fd-cover" style={{ background: item.tone }}>
            {item.image ? <img src={item.image} alt="" /> : coverText(item.name)}
          </div>
          <h4>{item.name}</h4>
          <div className="fd-pills">
            {item.tags.map((tag) => (
              <i key={tag}>{tag}</i>
            ))}
          </div>
          <div className="fd-price">
            {item.price}点{item.origin ? <s>{item.origin}点</s> : null}
          </div>
        </button>
      ))}
    </div>
  )
}

export function ShopShelfPage({ shelfId }: { shelfId: string }) {
  const { go } = useStore()
  const config = useMallConfig()
  const shelf = config.shelves.find((item) => item.id === shelfId)

  return (
    <div className="page shop-page">
      <StatusBar />
      <NavBar title={shelf?.title ?? '商城'} onBack={() => go({ name: 'mall' })} />
      {!shelf ? <p className="shop-empty">没有这个货架</p> : null}
      {shelf ? <p className="shop-lead">{shelf.blurb}</p> : null}
      {shelf
        ? config.slots
            .filter((item) => item.positionId === shelf.id && item.enabled && item.image)
            .slice(0, 1)
            .map((item) => <img key={item.id} className="shop-banner" src={item.image} alt="" />)
        : null}
      {shelf?.kind === 'channels' ? (
        <div className="shop-list">
          {config.shelves
            .filter((item) => item.group === '频道' && item.id !== 'more')
            .map((item) => (
              <button key={item.id} className="shop-row" type="button" onClick={() => go({ name: 'shop-shelf', shelf: item.id })}>
                <div>
                  <h4>{item.title}</h4>
                  <p>{item.blurb}</p>
                </div>
                <span>进入</span>
              </button>
            ))}
        </div>
      ) : null}
      {shelf?.kind === 'goods' ? (
        <GoodsGrid
          from={shelf.id}
          goods={shelf.goodIds
            .map((id) => config.goods.find((item) => item.id === id))
            .filter((item): item is ShopGood => Boolean(item && item.onShelf))}
        />
      ) : null}
    </div>
  )
}

export function ShopDetailPage({ productId, from }: { productId: string; from?: string }) {
  const { go } = useStore()
  const config = useMallConfig()
  const product = config.goods.find((item) => item.id === productId)
  const [ask, setAsk] = useState(false)
  const [done, setDone] = useState(false)
  const [citiesOpen, setCitiesOpen] = useState(false)
  const back = () => {
    if (from && from !== 'mall') go({ name: 'shop-shelf', shelf: from })
    else go({ name: 'mall' })
  }

  if (!product) {
    return (
      <div className="page shop-page">
        <StatusBar />
        <NavBar title="商品详情" onBack={back} />
        <p className="shop-empty">没有这个商品</p>
      </div>
    )
  }

  const cost = pointCost(product.price)
  const categoryName = config.categories.find((item) => item.id === product.categoryId)?.name ?? ''

  const confirm = () => {
    appendShopOrder(product, categoryName)
    setAsk(false)
    setDone(true)
  }

  return (
    <div className="page shop-page">
      <StatusBar />
      <NavBar title="商品详情" onBack={back} />
      <div className="shop-detail">
        <div className="shop-hero" style={{ background: product.tone }}>
          {product.image ? <img src={product.image} alt="" /> : coverText(product.name)}
        </div>
        <h2>{product.name}</h2>
        {product.spec ? <p className="shop-spec">{product.spec}</p> : null}
        <div className="fd-price">
          {product.price}点{product.origin ? <s>{product.origin}点</s> : null}
        </div>
        {product.drop ? <p className="fd-drop">{product.drop}</p> : null}
        {product.detail ? <p className="shop-lead">{product.detail}</p> : null}
        <div className="fd-pills">
          {product.tags.map((tag) => (
            <i key={tag}>{tag}</i>
          ))}
        </div>
        {product.stock != null || product.shipCities?.length ? (
          <dl className="shop-facts">
            {product.stock != null ? (
              <div>
                <dt>库存</dt>
                <dd>{product.stock}</dd>
              </div>
            ) : null}
            {product.shipCities?.length ? (
              <div>
                <dt>包邮城市</dt>
                <dd>
                  <p className={citiesOpen ? 'shop-cities' : 'shop-cities is-fold'}>{product.shipCities.join('、')}</p>
                  <button className="shop-more" type="button" onClick={() => setCitiesOpen((open) => !open)}>
                    {citiesOpen ? '收起' : `共${product.shipCities.length}个城市，展开`}
                  </button>
                </dd>
              </div>
            ) : null}
          </dl>
        ) : null}
        <p className="shop-lead">使用会员积分兑换。提交后可在数字中台的商品订单里查看。</p>
        {product.detailImages?.length ? (
          <section className="shop-story">
            <h3>商品详情</h3>
            {product.detailImages.map((src) => (
              <img key={src} src={src} alt="" />
            ))}
          </section>
        ) : null}
      </div>
      <div className="shop-buybar">
        <button className="shop-buy" type="button" onClick={() => setAsk(true)} disabled={!product.onShelf || done}>
          {done ? '已兑换' : product.onShelf ? '立即兑换' : '已下架'}
        </button>
      </div>
      {ask ? (
        <div className="shop-mask" onClick={() => setAsk(false)}>
          <div className="shop-sheet" onClick={(event) => event.stopPropagation()}>
            <h3>确认兑换</h3>
            <p>
              使用 {cost} 积分兑换「{product.name}」。
            </p>
            <div className="shop-sheet-actions">
              <button type="button" onClick={() => setAsk(false)}>
                取消
              </button>
              <button className="shop-buy" type="button" onClick={confirm}>
                确认兑换
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

type PointsTab = 'zone' | 'mall'

type PointsRow = {
  id: string
  productName: string
  time: string
  cost: number
  status: string
}

function shopStatus(status: string) {
  if (status === 'refunded') return '已退款'
  if (status === 'pending') return '待发货'
  if (status === 'shipped') return '已发货'
  if (status === 'refunding') return '退款中'
  return '已完成'
}

const BENEFIT_SEED: PointsRow[] = [
  { id: 'BZ20261102001', productName: '通用金', time: '2026-11-02 14:20:18', cost: 500, status: '已完成' },
  { id: 'BZ20261028002', productName: '支付宝通用券', time: '2026-10-28 10:06:33', cost: 500, status: '已完成' },
  { id: 'BZ20261021003', productName: '支付宝通用券plus', time: '2026-10-21 16:42:09', cost: 500, status: '已完成' },
  { id: 'BZ20261015004', productName: '微信立减金', time: '2026-10-15 09:18:47', cost: 200, status: '已完成' },
  { id: 'BZ20261005005', productName: '万佳乐权益大礼包', time: '2026-10-05 19:03:26', cost: 100, status: '已完成' },
]

function listZoneRedeems(): PointsRow[] {
  const live = peekConsumer()
    .orders.filter((item) => catalogProduct(item.productId)?.zone === 'benefit')
    .map((item) => ({
      id: item.id,
      productName: item.productName,
      time: item.time,
      cost: item.cost,
      status: item.status === 'refunded' ? '已退款' : '已完成',
    }))
  const liveIds = new Set(live.map((item) => item.id))
  return [...live, ...BENEFIT_SEED.filter((item) => !liveIds.has(item.id))].sort(
    (a, b) => orderTimeValue(b.time) - orderTimeValue(a.time),
  )
}

function listMallRedeems(): PointsRow[] {
  const shop = listShopRedeems().map((item) => ({
    id: item.id,
    productName: item.productName,
    time: item.time,
    cost: item.cost,
    status: shopStatus(item.status),
  }))
  const points = loadRedeems()
    .filter((item) => item.source !== 'shop' && catalogProduct(item.productId)?.zone !== 'benefit')
    .map((item) => ({
      id: item.id,
      productName: item.productName,
      time: item.time,
      cost: item.cost,
      status: item.status === 'refunded' ? '已退款' : '已完成',
    }))
  const seen = new Set<string>()
  return [...shop, ...points]
    .filter((item) => (seen.has(item.id) ? false : (seen.add(item.id), true)))
    .sort((a, b) => orderTimeValue(b.time) - orderTimeValue(a.time))
}

export function ShopPointsPage() {
  const { go } = useStore()
  const [tab, setTab] = useState<PointsTab>('zone')
  const [zoneOrders, setZoneOrders] = useState(listZoneRedeems)
  const [mallOrders, setMallOrders] = useState(listMallRedeems)

  useEffect(() => {
    const sync = () => {
      setZoneOrders(listZoneRedeems())
      setMallOrders(listMallRedeems())
    }
    window.addEventListener('points-mall-sync', sync)
    return () => window.removeEventListener('points-mall-sync', sync)
  }, [])

  const orders = tab === 'zone' ? zoneOrders : mallOrders

  return (
    <div className="page shop-page">
      <StatusBar />
      <NavBar title="会员积分" onBack={() => go({ name: 'mall' })} />
      <div className="shop-points">
        <span>当前会员积分</span>
        <b>7500</b>
        <p>积分自发放起 90 天有效。</p>
      </div>
      <div className="shop-tabs" role="tablist">
        <button type="button" role="tab" aria-selected={tab === 'zone'} className={tab === 'zone' ? 'is-on' : ''} onClick={() => setTab('zone')}>
          专区权益
        </button>
        <button type="button" role="tab" aria-selected={tab === 'mall'} className={tab === 'mall' ? 'is-on' : ''} onClick={() => setTab('mall')}>
          商城权益
        </button>
      </div>
      {orders.length === 0 ? <p className="shop-empty">{tab === 'zone' ? '还没有专区权益兑换' : '还没有商城权益兑换'}</p> : null}
      <div className="shop-list">
        {orders.map((item) => (
          <button key={item.id} type="button" className="shop-row">
            <div>
              <h4>{item.productName}</h4>
              <p>
                {item.time} · {item.status}
              </p>
            </div>
            <span className="shop-cost">-{item.cost}</span>
            <span className="shop-go" aria-hidden>
              ›
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
