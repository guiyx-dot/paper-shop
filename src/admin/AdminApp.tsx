import { useMemo, useState } from 'react'
import { AdminProvider, useAdmin } from './store'
import { ApprovalBuyPage, ApprovalListPage, ApprovalPayPage } from './approval'
import { DatacenterPage } from './datacenter'
import { MallBannerPage, MallCategoryPage, MallGoodsPage, MallHomePage } from './mall-config'
import { Phase2Brief } from '../phase2-brief'
import { MembersPage } from './members'
import { PointFlowsPage } from './point-flows'
import { RedeemsPage } from './redemptions'
import { PurchaseOrdersPage } from './purchase-orders'
import { ShopOrdersPage } from './shop-orders'
import type { AdminScreen } from './model'
import './admin.css'

type NavScreen = Extract<
  AdminScreen,
  'members' | 'redeems' | 'flows' | 'approval' | 'datacenter' | 'mall-home' | 'mall-banner' | 'mall-goods' | 'mall-category' | 'shop-orders' | 'purchase-orders'
>

type NavItem = {
  id: string
  label: string
  icon: string
  screen?: NavScreen
  muted?: boolean
  children?: { id: string; label: string; screen?: NavScreen; muted?: boolean }[]
}

const NAV: NavItem[] = [
  { id: 'home', label: '首页', icon: 'home', muted: true },
  {
    id: 'goods',
    label: '商品管理',
    icon: 'goods',
    children: [{ id: 'goods-orders', label: '商品订单', screen: 'purchase-orders' }],
  },
  { id: 'activity', label: '活动管理', icon: 'activity', muted: true },
  { id: 'quota', label: '额度管理', icon: 'quota', muted: true },
  { id: 'insure', label: '车险报价管理', icon: 'insure', muted: true },
  { id: 'fleet', label: '运管家', icon: 'fleet', muted: true },
  {
    id: 'audit',
    label: '审核管理',
    icon: 'audit',
    children: [
      { id: 'approval', label: '审批记录管理', screen: 'approval' },
      { id: 'reporter', label: '提报人审批记录', muted: true },
    ],
  },
  {
    id: 'data',
    label: '数据中心',
    icon: 'data',
    children: [{ id: 'detail', label: '明细数据', screen: 'datacenter' }],
  },
  { id: 'user', label: '用户中心', icon: 'user', muted: true },
  { id: 'upload', label: '上传下载中心', icon: 'upload', muted: true },
  { id: 'system', label: '系统管理', icon: 'system', muted: true },
]

const MID_NAV: NavItem[] = [
  {
    id: 'mall',
    label: '积分商城',
    icon: 'mall',
    children: [
      { id: 'members', label: '用户积分', screen: 'members' },
      { id: 'redeems', label: '兑换订单', screen: 'redeems' },
      { id: 'flows', label: '兑换流水', screen: 'flows' },
    ],
  },
  {
    id: 'mini',
    label: '小程序管理',
    icon: 'mini',
    children: [
      { id: 'mall-home', label: '首页配置', screen: 'mall-home' },
      { id: 'mall-banner', label: 'banner配置', screen: 'mall-banner' },
    ],
  },
  {
    id: 'store',
    label: '商城管理',
    icon: 'goods',
    children: [
      { id: 'mall-goods', label: '商品管理', screen: 'mall-goods' },
      { id: 'mall-category', label: '类目管理', screen: 'mall-category' },
      { id: 'shop-orders', label: '商品订单', screen: 'shop-orders' },
    ],
  },
]

function isApprovalScreen(screen: string) {
  return screen === 'approval' || screen === 'approval-buy' || screen === 'approval-pay'
}

function currentNavId(screen: string) {
  if (screen === 'members') return 'members'
  if (screen === 'redeems') return 'redeems'
  if (screen === 'flows') return 'flows'
  if (screen === 'shop-orders') return 'shop-orders'
  if (screen === 'purchase-orders') return 'goods-orders'
  if (screen === 'mall-home') return 'mall-home'
  if (screen === 'mall-banner') return 'mall-banner'
  if (screen === 'mall-goods') return 'mall-goods'
  if (screen === 'mall-category') return 'mall-category'
  if (screen === 'datacenter') return 'detail'
  if (isApprovalScreen(screen)) return 'approval'
  return 'approval'
}

function NavIcon({ name }: { name: string }) {
  const common = {
    width: 16,
    height: 16,
    viewBox: '0 0 16 16',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.35,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }
  if (name === 'home') return <svg {...common}><path d="M2.4 7.2 8 2.6l5.6 4.6V13.4H9.6V9.2H6.4v4.2H2.4V7.2z" /></svg>
  if (name === 'mall') return <svg {...common}><rect x="2.4" y="3.2" width="11.2" height="9.6" rx="1.4" /><path d="M5.2 3.2v9.6M10.8 3.2v9.6M2.4 7.2h11.2" /></svg>
  if (name === 'mini') return <svg {...common}><rect x="5" y="2.2" width="6" height="11.6" rx="1.4" /><path d="M7 11.8h2" /></svg>
  if (name === 'goods') return <svg {...common}><path d="M3 4.2h10l-.8 8.2H3.8L3 4.2z" /><path d="M6 6.4c0 1.2.9 2 2 2s2-.8 2-2" /></svg>
  if (name === 'activity') return <svg {...common}><rect x="2.6" y="3.4" width="10.8" height="9.4" rx="1.4" /><path d="M5 2.6v2M11 2.6v2M2.6 6.4h10.8" /></svg>
  if (name === 'quota') return <svg {...common}><circle cx="8" cy="8" r="5.4" /><path d="M8 5.2v3.2l2.2 1.4" /></svg>
  if (name === 'insure') return <svg {...common}><path d="M8 2.6 13.2 5v3.6c0 3-2.2 4.8-5.2 5.8-3-1-5.2-2.8-5.2-5.8V5L8 2.6z" /></svg>
  if (name === 'fleet') return <svg {...common}><rect x="2.2" y="5.2" width="8.4" height="5.2" rx="1" /><path d="M10.6 7.2h2.2l1 1.6v1.6h-3.2" /><circle cx="5" cy="11.6" r="1" /><circle cx="11.4" cy="11.6" r="1" /></svg>
  if (name === 'audit') return <svg {...common}><path d="M4 2.8h6.2L13.2 6v7.2H4V2.8z" /><path d="M10.2 2.8V6h3" /><path d="M6.2 8.4h4M6.2 10.8h3.2" /></svg>
  if (name === 'orders') return <svg {...common}><path d="M3.2 3.2h9.6v10.2l-1.8-1.2-1.6 1.2-1.6-1.2-1.6 1.2-1.6-1.2-1.4 1.2V3.2z" /><path d="M5.6 6.4h4.8M5.6 8.8h3.4" /></svg>
  if (name === 'data') return <svg {...common}><path d="M3.2 12.4V8.2M6.8 12.4V4.4M10.4 12.4V7M13.2 12.4V5.4" /></svg>
  if (name === 'user') return <svg {...common}><circle cx="8" cy="5.4" r="2.2" /><path d="M3.6 13.2c.4-2.6 2-4 4.4-4s4 1.4 4.4 4" /></svg>
  if (name === 'upload') return <svg {...common}><path d="M3.2 10.6v2.4h9.6v-2.4" /><path d="M8 3.4v7.2M5.4 6 8 3.4 10.6 6" /></svg>
  return <svg {...common}><circle cx="8" cy="8" r="5.2" /><path d="M8 7.4v3.4M8 5.2h.01" /></svg>
}

function Caret({ open }: { open: boolean }) {
  return (
    <svg className={open ? 'side-caret is-open' : 'side-caret'} width="12" height="12" viewBox="0 0 12 12" aria-hidden>
      <path d="M3 4.5 6 7.5 9 4.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function NoticeArt() {
  return (
    <svg className="price-notice-art" viewBox="0 0 210 108" aria-hidden>
      <rect x="86" y="30" width="52" height="62" rx="6" fill="#d5e8fc" transform="rotate(-8 112 61)" />
      <path d="M88 46h16M88 54h10" stroke="#b7d4f4" strokeWidth="2.2" strokeLinecap="round" transform="rotate(-8 112 61)" />
      <rect x="78" y="36" width="108" height="62" rx="7" fill="#8ec5f6" />
      <path d="M78 36 132 70 186 36" fill="#c5e2fb" />
      <path d="M78 98 120 66M186 98 144 66" fill="none" stroke="#6eafef" strokeWidth="1.4" />
      <rect x="118" y="6" width="42" height="26" rx="10" fill="#7ed6e6" />
      <circle cx="131" cy="19" r="2.2" fill="#fff" />
      <circle cx="139" cy="19" r="2.2" fill="#fff" />
      <circle cx="147" cy="19" r="2.2" fill="#fff" />
      <rect x="162" y="74" width="40" height="24" rx="9" fill="#9ec4f6" />
      <path d="M172 86h20" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  )
}

function PriceNotice({ onClose }: { onClose: () => void }) {
  return (
    <div className="admin-mask" role="presentation">
      <div className="admin-modal price-notice" role="dialog" aria-modal="true" aria-labelledby="price-notice-title" onClick={(event) => event.stopPropagation()}>
        <div className="price-notice-head">
          <div>
            <h2 id="price-notice-title">商品平台调价通知</h2>
            <time dateTime="2026-08-04">2026-08-04</time>
          </div>
          <NoticeArt />
          <button className="price-notice-close" type="button" aria-label="关闭" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="price-notice-body">
          <p>尊敬的客户：</p>
          <p>
            受市场环境影响，为保障产品品质及服务交付，灵犀及旗下关联公司已完成产品方案与定价体系优化，对部分数字权益商品价格进行调整。本次调整适用于4S店业务场景下的全部数字权益商品，报价标准如下：
          </p>
          <table className="price-notice-table">
            <thead>
              <tr>
                <th>数字权益商品</th>
                <th>原合作费率</th>
                <th>调整后费率</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>支付宝通用金（营销折让）</td>
                <td>服务费&lt;8%</td>
                <td>服务费 8%</td>
              </tr>
            </tbody>
          </table>
          <p>
            上述调整自<em>2026年8月15日0点</em>起施行。请同步至内部相关部门，做好业务衔接。如对方案或执行细节有疑问，请联系对接的商务经理。
          </p>
        </div>
        <div className="modal-actions">
          <button className="admin-primary" type="button" onClick={onClose}>
            我知道了
          </button>
        </div>
      </div>
    </div>
  )
}

function Shell({ place }: { place: 'merchant' | 'mid' }) {
  const { screen, go } = useAdmin()
  const [priceNotice, setPriceNotice] = useState(place === 'merchant')
  const active = currentNavId(screen)
  const nav = place === 'mid' ? MID_NAV : NAV
  const [opened, setOpened] = useState<string[]>(place === 'mid' ? ['mall', 'mini', 'store'] : ['audit'])
  const openSet = useMemo(() => new Set(opened), [opened])

  const toggle = (id: string) => {
    setOpened((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  return (
    <div className={place === 'mid' ? 'admin-root is-prd' : 'admin-root'}>
      <header className="hive-top">
        <div className="hive-brand">
          <strong>{place === 'mid' ? '数字中台' : '蜂巢云平台'}</strong>
          <span>{place === 'mid' ? '积分商城' : '商户管理平台'}</span>
        </div>
        <div className="hive-user">
          <a className="hive-consumer" href="#/">
            打开用户端
          </a>
          <span className="hive-bell" aria-hidden>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
              <path d="M4.2 11.4h7.6M5 6.8a3 3 0 0 1 6 0c0 2.2 1 3.2 1 3.2H4s1-1 1-3.2z" />
              <path d="M7.1 12.6a1.1 1.1 0 0 0 1.8 0" />
            </svg>
            <i />
          </span>
          <em>产研中心线上验证专用</em>
          <span className="hive-avatar">常</span>
          <b>常念云</b>
        </div>
      </header>
      <div className={place === 'mid' ? 'hive-body is-prd' : 'hive-body'}>
        <aside className="admin-side">
          {nav.map((item) => {
            const childOn = item.children?.some((child) => child.id === active)
            const open = Boolean(item.children && (openSet.has(item.id) || childOn))
            return (
              <div key={item.id} className={open ? 'side-block is-open' : 'side-block'}>
                <button
                  className={item.id === active ? 'side-item on' : item.muted && !childOn ? 'side-item muted' : 'side-item'}
                  type="button"
                  onClick={() => {
                    if (item.children) {
                      toggle(item.id)
                      return
                    }
                    if (item.screen) go(item.screen)
                  }}
                >
                  <NavIcon name={item.icon} />
                  <span>{item.label}</span>
                  {item.children ? <Caret open={open} /> : null}
                </button>
                {open
                  ? item.children?.map((child) => (
                      <button
                        key={child.id}
                        className={child.id === active ? 'side-sub on' : child.muted ? 'side-sub muted' : 'side-sub'}
                        type="button"
                        onClick={() => {
                          if (child.screen) go(child.screen)
                        }}
                      >
                        {child.label}
                      </button>
                    ))
                  : null}
              </div>
            )
          })}
        </aside>
        <main className={place === 'mid' || screen === 'datacenter' || screen === 'purchase-orders' ? `admin-main is-canvas${place === 'mid' ? ' is-mid' : ''}` : 'admin-main'}>
          {screen === 'mall-home' ? <MallHomePage /> : null}
          {screen === 'mall-banner' ? <MallBannerPage /> : null}
          {screen === 'mall-goods' ? <MallGoodsPage /> : null}
          {screen === 'mall-category' ? <MallCategoryPage /> : null}
          {screen === 'members' ? <MembersPage /> : null}
          {screen === 'redeems' ? <RedeemsPage /> : null}
          {screen === 'flows' ? <PointFlowsPage /> : null}
          {screen === 'shop-orders' ? <ShopOrdersPage /> : null}
          {screen === 'purchase-orders' ? <PurchaseOrdersPage /> : null}
          {screen === 'datacenter' ? <DatacenterPage /> : null}
          {screen === 'approval-buy' ? <ApprovalBuyPage /> : null}
          {screen === 'approval-pay' ? <ApprovalPayPage /> : null}
          {screen === 'approval' ||
          (!isApprovalScreen(screen) &&
            screen !== 'members' &&
            screen !== 'redeems' &&
            screen !== 'datacenter' &&
            screen !== 'mall-home' &&
            screen !== 'mall-banner' &&
            screen !== 'mall-goods' &&
            screen !== 'mall-category' &&
            screen !== 'flows' &&
            screen !== 'shop-orders' &&
            screen !== 'purchase-orders') ? (
            <ApprovalListPage />
          ) : null}
        </main>
        {place === 'mid' ? <Phase2Brief dock /> : null}
        {priceNotice ? <PriceNotice onClose={() => setPriceNotice(false)} /> : null}
      </div>
    </div>
  )
}

export default function AdminApp({ place = 'merchant' }: { place?: 'merchant' | 'mid' }) {
  return (
    <AdminProvider initialScreen={place === 'mid' ? 'mall-home' : 'approval'}>
      <Shell place={place} />
    </AdminProvider>
  )
}
