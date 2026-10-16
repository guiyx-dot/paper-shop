import { useState, type MouseEvent, type ReactNode } from 'react'
import { useStore } from './store'

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
  ['CEO星推荐', 'c2', 'star'],
  ['多多补贴', 'c3', 'tag'],
  ['多多优选', 'c4', 'bag'],
  ['视听会员', 'c5', 'play'],
  ['天猫优购', 'c6', 'bag'],
  ['网易严选', 'c7', 'seal'],
  ['生日蛋糕', 'c8', 'cake'],
  ['多多影视', 'c9', 'ticket'],
  ['更多频道', 'c10', 'more'],
].map(([name, color, icon]) => ({ name, color, icon: icons[icon] }))

type Good = { promo?: boolean; name: string; desc?: string; price?: string; tags?: string[] }

const covers = ['#fff1e6', '#eef4ff', '#eefaf3', '#fff1f6', '#f6f3ee', '#fff6ec']

const goods: Record<string, Good[]> = {
  hot: [
    { promo: true, name: '一站省心购', desc: '提前比对商品，优选划算好物' },
    { name: '【张太和】阿胶糕 60g*6盒', price: '178.18', tags: ['包邮', '省心购'] },
    { name: '【倍轻松】眼部按摩器 EM002', price: '456.36', tags: ['包邮', '省心购'] },
    { name: '【伟易达】汪汪队立大功救援套装', price: '198.99', tags: ['包邮', '省心购'] },
  ],
  grain: [
    { name: '【乡村振兴】山真美椴木细木耳 200g', price: '54.99', tags: ['包邮', '省心购'] },
    { name: '【刀唛】压榨花生油 5L', price: '169.89', tags: ['包邮', '省心购'] },
    { name: '【神农唛】精选猴头菇 180g', price: '42', tags: ['包邮'] },
    { name: '【神农唛】精选羊肚菌 100g', price: '218', tags: ['包邮'] },
  ],
  snack: [
    { name: '【雅觅】原味晶沙酥 360g', price: '57.99', tags: ['包邮', '省心购'] },
    { name: '【雅觅】元气蜂蜜枣糕 1000g', price: '59.79', tags: ['包邮', '省心购'] },
    { name: '【雅觅】拔丝蛋糕 500g', price: '33.89', tags: ['包邮', '省心购'] },
    { name: '【雅觅】蝴蝶酥 210g', price: '39.89', tags: ['包邮', '省心购'] },
  ],
  care: [
    { name: '【碧浪】云感内衣洗衣液泡沫 200g', price: '29.49', tags: ['包邮', '省心购'] },
    { name: '【蔬果园】幸福四叶草香氛洗衣凝珠', price: '58.89~119', tags: ['包邮', '省心购'] },
    { name: '【茱莉蔻】玫瑰柔肤沐浴露 300ml', price: '219.99', tags: ['包邮', '省心购'] },
    { name: '【大公鸡管家】厨房清洁剂', price: '37.27', tags: ['包邮', '省心购'] },
  ],
}

const tabs = [
  { id: 'hot', title: '热门推荐', sub: '猜你喜欢' },
  { id: 'grain', title: '健康粮油', sub: '营养均衡' },
  { id: 'snack', title: '休闲零食', sub: '追剧必备' },
  { id: 'care', title: '个护清洁', sub: '身体护理' },
]

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
  const [tab, setTab] = useState('hot')

  const onPageClick = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement
    if (target.closest('.fd-rights, .fd-tabs')) return
    if (!allowH5) return
    window.location.href = FUDUO
  }

  return (
    <div className="page fd-home" onClick={onPageClick}>
      <div className="fd-wrap">
        <button className="fd-hero" type="button">
          <div>
            <h2>视听会员</h2>
            <strong>5折起</strong>
          </div>
          <div className="fd-hero-art" aria-hidden="true">
            <span className="fd-blob" />
            <span className="fd-blob tall" />
            <span className="fd-blob" />
          </div>
        </button>

        <div className="fd-points">
          <span>当前会员积分</span>
          <b>7500</b>
        </div>

        <section className="fd-panel">
          <div className="fd-channels">
            {channels.map((item) => (
              <button key={item.name} type="button">
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
          <button className="fd-sub" type="button">
            <header>
              <h3>视听补贴</h3>
              <em>补贴50款+</em>
            </header>
            <div className="fd-mini">
              <span className="fd-ph green" />
              <div>
                <p>爱奇艺年卡</p>
                <b>377.5点</b>
                <p className="fd-drop">直降240.5点</p>
              </div>
            </div>
            <div className="fd-mini">
              <span className="fd-ph blue" />
              <div>
                <p>腾讯视频年卡</p>
                <b>379点</b>
                <p className="fd-drop">直降109点</p>
              </div>
            </div>
          </button>
          <button className="fd-sub" type="button">
            <header>
              <h3>蛋糕补贴</h3>
              <em>补贴100款+</em>
            </header>
            <div className="fd-mini">
              <span className="fd-ph pink" />
              <div>
                <p>生日蛋糕</p>
                <b>234.1点</b>
                <p className="fd-drop">直降14.9点</p>
              </div>
            </div>
          </button>
        </div>

        <button className="fd-ceo" type="button">
          <header>
            <h3>CEO星推荐</h3>
            <span>查看 ›</span>
          </header>
          <div className="fd-ceo-row">
            <span className="fd-apple" aria-hidden="true" />
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
          <button className="fd-pick" type="button">
            <h3>每日特价</h3>
            <div className="fd-mini">
              <span className="fd-ph sand" />
              <div>
                <p>安野屋磨砂膏</p>
                <b>
                  72点 <s>85点</s>
                </b>
              </div>
            </div>
          </button>
          <div className="fd-stack">
            <button className="fd-pick" type="button">
              <h3>
                买手推荐 <span className="fd-tag">用心精选</span>
              </h3>
              <p className="fd-note">香肠 40点 · 座椅 880点</p>
            </button>
            <button className="fd-pick" type="button">
              <h3>
                新品首发 <span className="fd-tag">每日上新</span>
              </h3>
              <p className="fd-note">身体乳 74.9点</p>
            </button>
          </div>
        </div>
      </div>

      <nav className="fd-tabs">
        {tabs.map((item) => (
          <button key={item.id} type="button" className={tab === item.id ? 'on' : ''} onClick={() => setTab(item.id)}>
            <span className="t">{item.title}</span>
            <span className="s">{item.sub}</span>
          </button>
        ))}
      </nav>
      <div className="fd-grid">
        {goods[tab].map((item, index) =>
          item.promo ? (
            <button key={item.name} className="fd-promo" type="button">
              <h4>{item.name}</h4>
              <p>{item.desc}</p>
            </button>
          ) : (
            <button key={item.name} className="fd-card" type="button">
              <div className="fd-cover" style={{ background: covers[index % covers.length] }}>
                {item.name.replace(/【[^】]*】/g, '').trim().slice(0, 2)}
              </div>
              <h4>{item.name}</h4>
              <div className="fd-pills">
                {(item.tags ?? []).map((tag) => (
                  <i key={tag}>{tag}</i>
                ))}
              </div>
              <div className="fd-price">{item.price}点</div>
            </button>
          ),
        )}
      </div>
    </div>
  )
}
