import { useEffect, useState } from 'react'
import { NavBar, StatusBar } from './components'
import { appendShopOrder, listShopRedeems } from './admin/shop-orders'
import { pointCost, useMallConfig, type ShopGood } from './shop-catalog'
import { useStore } from './store'

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
        <p className="shop-lead">使用会员积分兑换。提交后可在数字中台的商品订单里查看。</p>
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

export function ShopPointsPage() {
  const { go } = useStore()
  const [orders, setOrders] = useState(() => listShopRedeems())

  useEffect(() => {
    const sync = () => setOrders(listShopRedeems())
    window.addEventListener('points-mall-sync', sync)
    return () => window.removeEventListener('points-mall-sync', sync)
  }, [])

  return (
    <div className="page shop-page">
      <StatusBar />
      <NavBar title="会员积分" onBack={() => go({ name: 'mall' })} />
      <div className="shop-points">
        <span>当前会员积分</span>
        <b>7500</b>
        <p>积分自发放起 90 天有效。</p>
      </div>
      <h3 className="shop-block">自营兑换</h3>
      {orders.length === 0 ? <p className="shop-empty">还没有自营商品兑换</p> : null}
      <div className="shop-list">
        {orders.map((item) => (
          <div key={item.id} className="shop-row is-static">
            <div>
              <h4>{item.productName}</h4>
              <p>
                {item.time} · {item.status === 'refunded' ? '已退款' : item.status === 'pending' ? '待发货' : item.status === 'shipped' ? '已发货' : item.status === 'refunding' ? '退款中' : '已完成'}
              </p>
            </div>
            <span>-{item.cost}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
