import { useState } from 'react'
import { StatusBar } from './components'

type ZcbView = 'home' | 'gold' | 'rights' | 'corp'
type RightsFilter = 'all' | 'unused' | 'charging' | 'used'

const GOLD_ROWS = [
  { title: '平台充值', sub: '*支持转出方式：支付宝', time: '2026-10-16 09:14:49', amount: '+1.00', remain: '剩余 1.00', plus: true },
  { title: '额度过期', time: '2026-08-20 00:00:03', amount: '-1.00', remain: '剩余 0.00', plus: false },
  { title: '额度过期', time: '2026-08-11 00:00:01', amount: '-1.00', remain: '剩余 1.00', plus: false },
  { title: '额度过期', time: '2026-08-11 00:00:01', amount: '-1.00', remain: '剩余 2.00', plus: false },
  { title: '取消转出', time: '2026-08-03 10:35:44', amount: '+1.00', remain: '剩余 3.00', plus: true },
]

function Chevron() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M15 5 8 12l7 7" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Eye({ on = true }: { on?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="2.4" stroke="currentColor" strokeWidth="1.6" />
      {on ? null : <path d="M4 5 20 19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />}
    </svg>
  )
}

function Capsule() {
  return (
    <span className="zcb-tools" aria-hidden="true">
      <span className="zcb-star">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
          <path d="m12 3.2 2.4 5.2 5.6.7-4.2 3.8 1.1 5.6L12 15.8 7.1 18.5l1.1-5.6L4 9.1l5.6-.7L12 3.2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="zcb-cap">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="5" cy="12" r="1.7" />
          <circle cx="12" cy="12" r="1.7" />
          <circle cx="19" cy="12" r="1.7" />
        </svg>
        <i />
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="7.2" stroke="currentColor" strokeWidth="1.7" />
          <circle cx="12" cy="12" r="2.3" fill="currentColor" />
        </svg>
      </span>
    </span>
  )
}

function ZcbNav({ title, onBack }: { title: string; onBack?: () => void }) {
  return (
    <div className="zcb-nav">
      <button type="button" className="zcb-back" onClick={onBack}>
        <Chevron />
        {title}
      </button>
      <Capsule />
    </div>
  )
}

function Gem() {
  return (
    <svg className="zcb-gem" viewBox="0 0 120 120" aria-hidden="true">
      <defs>
        <linearGradient id="zcbGemBody" x1="18%" y1="0%" x2="82%" y2="100%">
          <stop offset="0%" stopColor="#fff6cf" />
          <stop offset="42%" stopColor="#ffd15a" />
          <stop offset="100%" stopColor="#e09412" />
        </linearGradient>
        <linearGradient id="zcbGemShine" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#ffe7a2" stopOpacity="0.15" />
        </linearGradient>
      </defs>
      <polygon points="60,6 112,44 60,114 8,44" fill="url(#zcbGemBody)" />
      <polygon points="60,6 112,44 60,50" fill="url(#zcbGemShine)" />
      <polygon points="60,6 8,44 60,50" fill="#ffe08a" opacity="0.55" />
      <polygon points="8,44 60,50 60,114" fill="#d88810" opacity="0.28" />
      <polygon points="112,44 60,50 60,114" fill="#b86d08" opacity="0.22" />
      <polygon points="34,44 86,44 60,24" fill="#fff" opacity="0.42" />
      <polygon points="60,50 40,44 60,78 80,44" fill="#fff4c8" opacity="0.35" />
    </svg>
  )
}

function Coin({ className = 'zcb-coin' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 80 80" aria-hidden="true">
      <defs>
        <radialGradient id="zcbCoinFace" cx="36%" cy="32%" r="68%">
          <stop offset="0%" stopColor="#fff4c4" />
          <stop offset="46%" stopColor="#f5c44a" />
          <stop offset="100%" stopColor="#d49216" />
        </radialGradient>
      </defs>
      <ellipse cx="40" cy="68" rx="22" ry="5" fill="rgba(180,90,0,0.18)" />
      <circle cx="40" cy="38" r="30" fill="url(#zcbCoinFace)" />
      <circle cx="40" cy="38" r="24" fill="none" stroke="#fff6d4" strokeWidth="2" opacity="0.8" />
      <polygon points="40,22 52,38 40,54 28,38" fill="#e39a16" opacity="0.45" />
      <polygon points="40,22 52,38 40,38" fill="#fff" opacity="0.45" />
      <ellipse cx="30" cy="28" rx="8" ry="5" fill="#fff" opacity="0.4" />
    </svg>
  )
}

function Mark({ tone = 'orange' }: { tone?: 'orange' | 'didi' }) {
  return (
    <span className={tone === 'didi' ? 'zcb-mark is-didi' : 'zcb-mark'}>
      {tone === 'didi' ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M7 16.5c2.8 2.2 7.6 1.6 9.4-1.2 1.2-1.8.8-3.6-.2-4.6-1.6 2.4-4.4 3.2-6.6 2.2" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M8.2 8.2c1.8-1.6 4.8-1.8 7 .1" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="7" stroke="#fff" strokeWidth="1.8" />
          <path d="M12 8.2v7.6M9.2 10.2h4.2a2 2 0 0 1 0 4H9.2" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      )}
    </span>
  )
}

function Crown() {
  return (
    <svg className="zcb-watermark" viewBox="0 0 80 64" aria-hidden="true">
      <path d="M8 48 16 18l16 16L40 8l8 26 16-16 8 30H8Z" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
      <path d="M14 54h52" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

function YenMark() {
  return (
    <svg className="zcb-watermark is-yen" viewBox="0 0 64 64" aria-hidden="true">
      <text x="8" y="52" fontSize="54" fontWeight="700" fill="currentColor">¥</text>
    </svg>
  )
}

function Arcs() {
  return (
    <svg className="zcb-arcs" viewBox="0 0 180 140" aria-hidden="true">
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <path
          key={i}
          d={`M${168 - i * 16} -8 C ${118 - i * 8} 36, ${132 - i * 6} 96, 188 ${150}`}
          fill="none"
          stroke="rgba(255,255,255,.62)"
          strokeWidth="1.3"
        />
      ))}
    </svg>
  )
}

function Home({
  hide,
  onToggle,
  onOpen,
}: {
  hide: boolean
  onToggle: () => void
  onOpen: (view: ZcbView) => void
}) {
  return (
    <div className="page zcb-page zcb-home">
      <StatusBar />
      <ZcbNav title="会员服务" />
      <div className="zcb-card">
        <div className="zcb-card-main">
          <h2>支车宝会员中心</h2>
          <div className="zcb-user">
            <span className="zcb-avatar" aria-hidden="true">
              <svg viewBox="0 0 32 32">
                <circle cx="16" cy="16" r="16" fill="#efe4ff" />
                <circle cx="16" cy="13" r="5.2" fill="#f3c7b0" />
                <path d="M8 27c1.4-5 4.2-7.4 8-7.4S22.6 22 24 27" fill="#7a4dff" />
                <path d="M9 14c.4-5 3-8 7-8s6.4 2.6 7 7c-2-2.2-4.2-3-7-3s-5 .8-7 4Z" fill="#5b37e6" />
              </svg>
            </span>
            <span className="zcb-name">云曦</span>
            <span className="zcb-pill">个人信息 ›</span>
          </div>
        </div>
        <Gem />
      </div>
      <section className="zcb-perks">
        <div className="zcb-head">
          <h3>专属福利</h3>
          <button type="button" onClick={onToggle}>
            {hide ? '隐藏' : '显示'}
            <Eye on={!hide} />
          </button>
        </div>
        <div className="zcb-grid">
          <button type="button" className="zcb-gold" onClick={() => onOpen('gold')}>
            <div className="zcb-gold-label">
              <Mark />
              通用金
            </div>
            <Coin />
            <p>您的专属积分</p>
            <strong>
              {hide ? '****' : '1.00'}
              <i
                onClick={(event) => {
                  event.stopPropagation()
                  onToggle()
                }}
              >
                <Eye on={!hide} />
              </i>
            </strong>
            <span className="zcb-more">查看更多</span>
          </button>
          <div className="zcb-side">
            <button type="button" className="zcb-lite" onClick={() => onOpen('rights')}>
              <div>我的权益</div>
              <b>{hide ? '**' : '1项'}</b>
              <span className="zcb-more">查看更多</span>
              <Crown />
            </button>
            <button type="button" className="zcb-lite is-corp" onClick={() => onOpen('corp')}>
              <div>因公付</div>
              <b>{hide ? '****' : '¥0.00'}</b>
              <span className="zcb-more">查看更多</span>
              <YenMark />
            </button>
          </div>
        </div>
      </section>
      <button className="zcb-service" type="button" aria-label="客服">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M5 13a7 7 0 0 1 14 0" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
          <rect x="3.2" y="12" width="3.6" height="6.2" rx="1.4" fill="#fff" />
          <rect x="17.2" y="12" width="3.6" height="6.2" rx="1.4" fill="#fff" />
          <path d="M17.2 18.2c0 1.6-2 2.6-5.2 2.6" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}

function Gold({ onBack }: { onBack: () => void }) {
  return (
    <div className="page zcb-page zcb-gold-page">
      <StatusBar />
      <ZcbNav title="通用金" onBack={onBack} />
      <div className="zcb-kicker">
        <Mark />
        <b>通用金</b>
        <span>| 您的专属积分</span>
      </div>
      <div className="zcb-balance">
        <div className="zcb-balance-top">
          <span>
            可用额度
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6" />
              <path d="M12 11v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              <circle cx="12" cy="8" r="0.9" fill="currentColor" />
            </svg>
          </span>
          <em>提取说明</em>
        </div>
        <div className="zcb-balance-num">1.00</div>
        <Coin className="zcb-balance-coin" />
      </div>
      <div className="zcb-transfer">
        <span>
          ¥<i>+</i>
        </span>
        转出
      </div>
      <div className="zcb-ledger-head">
        <h3>额度变动明细</h3>
        <span>全部 ›</span>
      </div>
      <div className="zcb-ledger">
        {GOLD_ROWS.map((row) => (
          <div key={`${row.title}-${row.time}-${row.remain}`} className="zcb-ledger-row">
            <div>
              <div className="zcb-ledger-title">{row.title}</div>
              {row.sub ? <div className="zcb-ledger-sub">{row.sub}</div> : null}
              <div className="zcb-ledger-time">{row.time}</div>
            </div>
            <div className="zcb-ledger-amt">
              <b className={row.plus ? 'is-plus' : ''}>{row.amount}</b>
              <span>{row.remain}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Rights({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState<'cards' | 'packs'>('cards')
  const [filter, setFilter] = useState<RightsFilter>('unused')
  const filters: { id: RightsFilter; label: string }[] = [
    { id: 'all', label: '全部' },
    { id: 'unused', label: '未使用' },
    { id: 'charging', label: '充值中' },
    { id: 'used', label: '已使用' },
  ]
  const showCoupon = tab === 'cards' && (filter === 'all' || filter === 'unused')

  return (
    <div className="page zcb-page zcb-rights-page">
      <StatusBar />
      <ZcbNav title="我的权益" onBack={onBack} />
      <div className="zcb-tabs">
        <button type="button" className={tab === 'cards' ? 'on' : ''} onClick={() => setTab('cards')}>
          我的卡券
        </button>
        <button type="button" className={tab === 'packs' ? 'on' : ''} onClick={() => setTab('packs')}>
          我的礼包
        </button>
      </div>
      {tab === 'cards' ? (
        <>
          <div className="zcb-filters">
            {filters.map((item) => (
              <button key={item.id} type="button" className={filter === item.id ? 'on' : ''} onClick={() => setFilter(item.id)}>
                {item.label}
              </button>
            ))}
          </div>
          {showCoupon ? (
            <div className="zcb-rights-card">
              <div className="zcb-rights-brand">
                <Mark tone="didi" />
                滴滴打车
              </div>
              <div className="zcb-coupon">
                <div className="zcb-coupon-val">
                  <b>20.0</b>
                  <span>km</span>
                </div>
                <div>
                  <div className="zcb-coupon-name">滴滴代驾券20km</div>
                  <p>有效期至: 2026-01-07 00:00:00</p>
                </div>
                <em>已兑换</em>
              </div>
            </div>
          ) : (
            <p className="zcb-empty">{filter === 'charging' ? '暂无充值中的卡券' : '暂无已使用卡券'}</p>
          )}
        </>
      ) : (
        <p className="zcb-empty">暂无礼包</p>
      )}
    </div>
  )
}

function Corp({ onBack }: { onBack: () => void }) {
  return (
    <div className="page zcb-page zcb-corp-page">
      <StatusBar />
      <ZcbNav title="因公付（企业权益）" onBack={onBack} />
      <div className="zcb-corp-list">
        <article className="zcb-corp-card is-maili">
          <Arcs />
          <div className="zcb-corp-brand">
            <Mark />
            <strong>麦粒</strong>
          </div>
          <div className="zcb-corp-row">
            <div>
              <span>可用额度（元）</span>
              <b>0.00</b>
            </div>
            <button type="button">进入</button>
          </div>
        </article>
        <article className="zcb-corp-card is-pay">
          <Arcs />
          <div className="zcb-corp-brand">
            <Mark />
            <strong>
              因公付 <em>| 麦粒</em>
            </strong>
          </div>
          <div className="zcb-corp-row">
            <div>
              <span>可用额度（元）</span>
              <b>0.00</b>
            </div>
            <button type="button">进入</button>
          </div>
        </article>
      </div>
    </div>
  )
}

export function ZcbMemberPage() {
  const [view, setView] = useState<ZcbView>('home')
  const [hide, setHide] = useState(false)
  if (view === 'gold') return <Gold onBack={() => setView('home')} />
  if (view === 'rights') return <Rights onBack={() => setView('home')} />
  if (view === 'corp') return <Corp onBack={() => setView('home')} />
  return <Home hide={hide} onToggle={() => setHide((value) => !value)} onOpen={setView} />
}
