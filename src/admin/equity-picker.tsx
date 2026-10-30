import { useState } from 'react'
import { ProductIcon } from '../icons'
import { DEDICATED_SKUS, FEE_PCT, UNIT_PRICE, dedicatedLabel, money } from './model'

const TABS: { id: string; label: string; ids: string[] }[] = [
  { id: 'gold', label: '通用金', ids: ['gold-wechat', 'gold-alipay'] },
  { id: 'alipay', label: '支付宝', ids: ['alipay', 'alipay-plus'] },
  { id: 'wechat', label: '微信', ids: ['wechat'] },
]

const GOLD_META: Record<string, { tag: string; detail: string }> = {
  'gold-wechat': { tag: '【支持微信转出】', detail: '每日每人1000/天' },
  'gold-alipay': { tag: '【支持支付宝转出】', detail: '每日每人1000/天' },
}

function tabFor(productId: string) {
  return TABS.find((item) => item.ids.includes(productId))?.id ?? TABS[0].id
}

export function EquityPicker({
  value,
  onSelect,
  onClose,
}: {
  value: string
  onSelect: (id: string) => void
  onClose: () => void
}) {
  const [tab, setTab] = useState(() => tabFor(value))
  const [detailId, setDetailId] = useState<string | null>(null)
  const ids = TABS.find((item) => item.id === tab)?.ids ?? []
  const items = DEDICATED_SKUS.filter((item) => ids.includes(item.id))

  return (
    <div className="admin-mask" onClick={onClose}>
      <div className="admin-modal equity-modal" onClick={(event) => event.stopPropagation()}>
        <div className="account-modal-head">
          主权益
          <button className="account-modal-x" type="button" onClick={onClose} aria-label="关闭">
            ×
          </button>
        </div>
        <div className="equity-tabs">
          {TABS.map((item) => (
            <button key={item.id} className={tab === item.id ? 'on' : ''} type="button" onClick={() => setTab(item.id)}>
              {item.label}
            </button>
          ))}
        </div>
        <div className="equity-list">
          {items.map((item) => {
            const meta = GOLD_META[item.id]
            return (
              <div
                key={item.id}
                className={value === item.id ? 'equity-card on' : 'equity-card'}
                role="button"
                tabIndex={0}
                onClick={() => onSelect(item.id)}
                onKeyDown={(event) => {
                  if (event.target !== event.currentTarget) return
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    onSelect(item.id)
                  }
                }}
              >
                <ProductIcon id={item.id} />
                <div className="equity-card-body">
                  <div className="equity-title">
                    <strong>{dedicatedLabel(item.name)}</strong>
                    {meta ? <em className="equity-tag">{meta.tag}</em> : null}
                    {meta ? (
                      <button
                        className="equity-detail"
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          setDetailId((current) => (current === item.id ? null : item.id))
                        }}
                      >
                        详情
                      </button>
                    ) : null}
                  </div>
                  {meta && detailId === item.id ? (
                    <div className="equity-detail-pop" onClick={(event) => event.stopPropagation()}>
                      <span>商品详情</span>
                      <p>{meta.detail}</p>
                    </div>
                  ) : null}
                  <div className="equity-metrics">
                    <div>
                      <b>{money(UNIT_PRICE)}</b>
                      <span>单价</span>
                    </div>
                    <div>
                      <b>{FEE_PCT.toFixed(2)}%</b>
                      <span>手续费率</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
