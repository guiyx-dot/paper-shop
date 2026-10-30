import { useMemo, useState, type MouseEvent, type ReactNode } from 'react'
import { useMallConfig } from './shop-catalog'
import { useStore } from './store'
import type { Screen } from './types'

const FUDUO = 'https://h5.fuduoka.com/fuduoduo/#/'

const icons: Record<string, ReactNode> = {
  bag: (
    <>
      <path d="M6 8h12l-1 11H7L6 8z" stroke="#fff" strokeWidth="1.6" />
      <path d="M9 8V6.5A3 3 0 0 1 12 3.5 3 3 0 0 1 15 6.5V8" stroke="#fff" strokeWidth="1.6" />
    </>
  ),
  star: <path d="M12 3.5 14.2 8.6 19.8 9.2 15.6 13l1.2 5.5L12 15.8 7.2 18.5 8.4 13 4.2 9.2 9.8 8.6 12 3.5z" stroke="#fff" strokeWidth="1.4" strokeLinejoin="round" />,
  tag: (
    <>
      <path d="M4 12.5 11.5 5H18v6.5L10.5 19 4 12.5z" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="14.5" cy="8.5" r="1" fill="#fff" />
    </>
  ),
  play: (
    <>
      <circle cx="12" cy="12" r="7" stroke="#fff" strokeWidth="1.6" />
      <path d="M10.5 9.2v5.6L15 12l-4.5-2.8z" fill="#fff" />
    </>
  ),
  seal: (
    <>
      <circle cx="12" cy="12" r="7" stroke="#fff" strokeWidth="1.6" />
      <path d="M9 12.2 11 14.2 15.2 9.8" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  cake: (
    <>
      <path d="M6 14h12v5H6v-5zM7 14c0-3 2-4 5-4s5 1 5 4" stroke="#fff" strokeWidth="1.6" />
      <path d="M12 10V7" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  ticket: <path d="M5 8h14v3a2 2 0 0 0 0 4v3H5v-3a2 2 0 0 0 0-4V8z" stroke="#fff" strokeWidth="1.6" />,
  more: (
    <>
      <circle cx="7" cy="12" r="1.3" fill="#fff" />
      <circle cx="12" cy="12" r="1.3" fill="#fff" />
      <circle cx="17" cy="12" r="1.3" fill="#fff" />
    </>
  ),
}

const channels: { name: string; color: string; icon: ReactNode }[] = [
  ['京东优购', 'c1', 'bag'],
  ['多多补贴', 'c3', 'tag'],
  ['多多优选', 'c4', 'bag'],
  ['视听会员', 'c5', 'play'],
  ['天猫优购', 'c6', 'bag'],
  ['网易严选', 'c7', 'seal'],
  ['生日蛋糕', 'c8', 'cake'],
  ['多多影视', 'c9', 'ticket'],
  ['更多频道', 'c10', 'more'],
].map(([name, color, icon]) => ({ name, color, icon: icons[icon] }))

const channelShelf: Record<string, string> = {
  京东优购: 'jd',
  多多补贴: 'subsidy',
  多多优选: 'select',
  视听会员: 'video',
  天猫优购: 'tmall',
  网易严选: 'netease',
  生日蛋糕: 'cake',
  多多影视: 'film',
  更多频道: 'more',
}

const covers = ['#fff1e6', '#eef4ff', '#eefaf3', '#fff1f6', '#f6f3ee', '#fff6ec']

function homeImg(file: string) {
  return `${import.meta.env.BASE_URL}goods/${file}`
}

function Thumb({ file, className }: { file: string; className: string }) {
  return (
    <span className={className}>
      <img src={homeImg(file)} alt="" />
    </span>
  )
}

function Mark({ color, children }: { color: string; children: ReactNode }) {
  return (
    <span className={`fd-mark fd-${color}`}>
      <svg viewBox="0 0 24 24" fill="none">
        {children}
      </svg>
    </span>
  )
}

export function FuduoHome({ allowH5 }: { allowH5: boolean }) {
  const { go } = useStore()
  const config = useMallConfig()
  const categories = useMemo(
    () => [...config.categories].sort((a, b) => a.sort - b.sort || a.name.localeCompare(b.name, 'zh')),
    [config.categories],
  )
  const [tab, setTab] = useState('')
  const [bannerIndex, setBannerIndex] = useState(0)
  const activeId = categories.some((item) => item.id === tab) ? tab : (categories[0]?.id ?? '')
  const feed = config.goods.filter((item) => item.onShelf && item.categoryId === activeId)
  const banners = useMemo(
    () => config.banners.filter((item) => item.enabled && item.place !== 'careful').sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [config.banners],
  )
  const carefulBanner = useMemo(
    () =>
      config.banners
        .filter((item) => item.enabled && item.place === 'careful')
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0],
    [config.banners],
  )
  const bannerAt = banners.length ? bannerIndex % banners.length : 0
  const banner = banners[bannerAt]

  const onPageClick = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement
    if (target.closest('.fd-rights, .fd-tabs')) return
    if (!allowH5) return
    window.location.href = FUDUO
  }

  const enter = (event: MouseEvent, next: Screen) => {
    if (allowH5) return
    event.stopPropagation()
    go(next)
  }

  const openProduct = (event: MouseEvent, productId: string) => {
    enter(event, { name: 'shop-detail', productId, from: 'mall' })
  }

  return (
    <div className="page fd-home" onClick={onPageClick}>
      <div className="fd-wrap">
        <div
          className={banner?.image ? 'fd-hero is-photo' : 'fd-hero'}
          style={banner?.image ? { backgroundImage: `linear-gradient(90deg, rgba(28, 18, 8, 0.45), rgba(28, 18, 8, 0.05)), url(${banner.image})` } : undefined}
          onClick={(event) => event.stopPropagation()}
        >
          <div>
            <h2>{banner?.title || '视听会员'}</h2>
            {banner ? banner.subtitle ? <strong>{banner.subtitle}</strong> : null : <strong>5折起</strong>}
          </div>
          {banner?.image ? null : (
            <div className="fd-hero-art" aria-hidden="true">
              <span className="fd-blob" />
              <span className="fd-blob tall" />
              <span className="fd-blob" />
            </div>
          )}
          {banners.length > 1 ? (
            <span className="fd-hero-dots">
              {banners.map((item, index) => (
                <i
                  key={item.id}
                  className={index === bannerAt ? 'on' : ''}
                  onClick={(event) => {
                    event.stopPropagation()
                    setBannerIndex(index)
                  }}
                />
              ))}
            </span>
          ) : null}
        </div>

        <div className="fd-points" onClick={(event) => enter(event, { name: 'shop-points' })}>
          <span>当前会员积分</span>
          <b>7500</b>
        </div>

        <section className="fd-panel">
          <div className="fd-channels">
            {channels.map((item) => (
              <button key={item.name} type="button" onClick={(event) => enter(event, { name: 'shop-shelf', shelf: channelShelf[item.name] })}>
                <Mark color={item.color}>{item.icon}</Mark>
                <small>{item.name}</small>
              </button>
            ))}
          </div>
        </section>

        <button className="fd-rights" type="button" onClick={() => go({ name: 'benefit-zone' })}>
          <div>
            <h3>积分权益专区</h3>
            <span className="fd-enter">进入 ›</span>
          </div>
          <span className="fd-coin" aria-hidden="true" />
        </button>

        <div className="fd-duo">
          <button className="fd-sub" type="button" onClick={(event) => enter(event, { name: 'shop-shelf', shelf: 'video-sub' })}>
            <header>
              <h3>视听补贴</h3>
              <em>补贴50款+</em>
            </header>
            <div className="fd-mini">
              <Thumb file="home-iqiyi.jpg" className="fd-ph" />
              <div>
                <p>爱奇艺年卡</p>
                <b>377.5点</b>
                <p className="fd-drop">直降240.5点</p>
              </div>
            </div>
            <div className="fd-mini">
              <Thumb file="home-tencent.jpg" className="fd-ph" />
              <div>
                <p>腾讯视频年卡</p>
                <b>379点</b>
                <p className="fd-drop">直降109点</p>
              </div>
            </div>
          </button>
          <button className="fd-sub" type="button" onClick={(event) => enter(event, { name: 'shop-shelf', shelf: 'cake-sub' })}>
            <header>
              <h3>蛋糕补贴</h3>
              <em>补贴100款+</em>
            </header>
            <div className="fd-mini">
              <Thumb file="home-birthday.jpg" className="fd-ph" />
              <div>
                <p>生日蛋糕</p>
                <b>234.1点</b>
                <p className="fd-drop">直降14.9点</p>
              </div>
            </div>
          </button>
        </div>

        <button className="fd-ceo" type="button" onClick={(event) => enter(event, { name: 'shop-shelf', shelf: 'ceo' })}>
          <header>
            <h3>CEO星推荐</h3>
            <span>查看 ›</span>
          </header>
          <div className="fd-ceo-row">
            <Thumb file="home-apple.jpg" className="fd-apple" />
            <div>
              <h4>大凉山盐源丑苹果</h4>
              <p>4.5斤（70-75mm）</p>
              <div className="fd-price">
                41.5点 <s>45.8点</s>
              </div>
            </div>
          </div>
        </button>

        <div className="fd-picks">
          <button className="fd-pick" type="button" onClick={(event) => enter(event, { name: 'shop-shelf', shelf: 'daily' })}>
            <h3>每日特价</h3>
            <div className="fd-mini">
              <Thumb file="home-scrub.jpg" className="fd-ph" />
              <div>
                <p>安野屋磨砂膏</p>
                <b>
                  72点 <s>85点</s>
                </b>
              </div>
            </div>
          </button>
          <div className="fd-stack">
            <button className="fd-pick" type="button" onClick={(event) => enter(event, { name: 'shop-shelf', shelf: 'buyer' })}>
              <h3>
                买手推荐 <span className="fd-tag">用心精选</span>
              </h3>
              <p className="fd-note">香肠 40点 · 座椅 880点</p>
            </button>
            <button className="fd-pick" type="button" onClick={(event) => enter(event, { name: 'shop-shelf', shelf: 'fresh' })}>
              <h3>
                新品首发 <span className="fd-tag">每日上新</span>
              </h3>
              <p className="fd-note">身体乳 74.9点</p>
            </button>
          </div>
        </div>

        {carefulBanner ? (
          <div
            className={carefulBanner.image ? 'fd-promo is-bar is-photo' : 'fd-promo is-bar'}
            style={
              carefulBanner.image
                ? { backgroundImage: `linear-gradient(90deg, rgba(28, 18, 8, 0.45), rgba(28, 18, 8, 0.05)), url(${carefulBanner.image})` }
                : undefined
            }
            onClick={(event) => event.stopPropagation()}
          >
            <div>
              <h4>{carefulBanner.title}</h4>
              {carefulBanner.subtitle ? <p>{carefulBanner.subtitle}</p> : null}
            </div>
          </div>
        ) : null}
      </div>

      <nav className="fd-tabs">
        {categories.map((item) => (
          <button key={item.id} type="button" className={activeId === item.id ? 'on' : ''} onClick={() => setTab(item.id)}>
            <span className="t">{item.name}</span>
          </button>
        ))}
      </nav>
      <div className="fd-grid">
        {feed.length === 0 ? <p className="fd-empty">这个类目还没有在售商品</p> : null}
        {feed.map((item, index) => (
          <button key={item.id} className="fd-card" type="button" onClick={(event) => openProduct(event, item.id)}>
            <div className="fd-cover" style={{ background: item.tone || covers[index % covers.length] }}>
              {item.image ? <img src={item.image} alt="" /> : item.name.replace(/【[^】]*】/g, '').trim().slice(0, 2)}
            </div>
            <h4>{item.name}</h4>
            <div className="fd-pills">
              {item.tags.map((tag) => (
                <i key={tag}>{tag}</i>
              ))}
            </div>
            <div className="fd-price">{item.price}点</div>
          </button>
        ))}
      </div>
    </div>
  )
}
