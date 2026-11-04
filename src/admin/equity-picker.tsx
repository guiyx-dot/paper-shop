import { useState } from 'react'
import { AlipayCoinArt, AlipayCouponArt, WechatCoinArt, WechatCouponArt } from './alipay-coin-art'
import { AlipayPlusArt } from './alipay-plus-art'
import { hasShelfPhoto, ShelfPhoto } from './shelf-photo'
import { FEE_RATE, GENERAL_FEE_PCT, PURCHASE_GOODS, UNIT_PRICE, money } from './model'

const TABS: { id: 'coin' | 'coupon'; label: string }[] = [
  { id: 'coin', label: '币' },
  { id: 'coupon', label: '券' },
]

function tabFor(productId: string): 'coin' | 'coupon' {
  return PURCHASE_GOODS.find((item) => item.id === productId)?.tab ?? 'coin'
}

export function EquityPicker({
  value,
  onSelect,
  coinsOnly = false,
}: {
  value: string
  onSelect: (id: string) => void
  coinsOnly?: boolean
}) {
  const tabs = coinsOnly ? TABS.filter((item) => item.id === 'coin') : TABS
  const [tab, setTab] = useState<'coin' | 'coupon'>(() => (coinsOnly ? 'coin' : tabFor(value)))
  const items = PURCHASE_GOODS.filter((item) => item.tab === tab)

  return (
    <div className="equity-inline">
      <div className="equity-tabs">
        {tabs.map((item) => (
          <button key={item.id} className={tab === item.id ? 'on' : ''} type="button" onClick={() => setTab(item.id)}>
            {item.label}
          </button>
        ))}
      </div>
      <div className="equity-list is-page">
        {items.map((item) => (
          <button
            key={item.id}
            className={value === item.id ? 'equity-tile on' : 'equity-tile'}
            type="button"
            onClick={() => onSelect(item.id)}
          >
            <span className={item.id === 'gold-alipay' || item.id === 'gold-wechat' || item.id === 'alipay' || item.id === 'wechat' || item.id === 'alipay-plus' || hasShelfPhoto(item.id) ? 'equity-tile-slot is-art' : 'equity-tile-slot'} aria-hidden>
              {item.id === 'gold-alipay' ? <AlipayCoinArt /> : null}
              {item.id === 'gold-wechat' ? <WechatCoinArt /> : null}
              {item.id === 'alipay' ? <AlipayCouponArt /> : null}
              {item.id === 'wechat' ? <WechatCouponArt /> : null}
              {item.id === 'alipay-plus' ? <AlipayPlusArt /> : null}
              {hasShelfPhoto(item.id) ? <ShelfPhoto id={item.id} /> : null}
            </span>
            <strong>{item.name}</strong>
            <em>¥ {money(UNIT_PRICE)}</em>
            <span className="equity-fee">服务费 ¥{money(UNIT_PRICE * FEE_RATE)}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export function GeneralPointsCard({ selected, onSelect }: { selected: boolean; onSelect: () => void }) {
  return (
    <div
      className={selected ? 'equity-card on' : 'equity-card'}
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect()
        }
      }}
    >
      <div className="points-mark is-card">积</div>
      <div className="equity-card-body">
        <div className="equity-title">
          <strong>通用积分</strong>
        </div>
        <p className="equity-note">兑换「积分专区」专属商品</p>
        <div className="equity-metrics">
          <div>
            <b>{money(UNIT_PRICE)}</b>
            <span>单价</span>
          </div>
          <div>
            <b>{GENERAL_FEE_PCT.toFixed(2)}%</b>
            <span>服务费率</span>
          </div>
        </div>
      </div>
    </div>
  )
}
