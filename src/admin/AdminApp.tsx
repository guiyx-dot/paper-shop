import { AdminProvider, useAdmin } from './store'
import { ApprovalBuyPage, ApprovalListPage, ApprovalPayPage } from './approval'
import { MembersPage } from './members'
import { RedeemsPage } from './redemptions'
import './admin.css'

type NavItem = {
  id: string
  label: string
  icon: string
  screen?: 'members' | 'redeems' | 'approval'
  muted?: boolean
  children?: { id: string; label: string; screen?: 'members' | 'redeems' | 'approval'; muted?: boolean }[]
}

const NAV: NavItem[] = [
  { id: 'home', label: '首页', icon: 'home', muted: true },
  {
    id: 'mall',
    label: '积分商城',
    icon: 'mall',
    children: [
      { id: 'members', label: '用户积分', screen: 'members' },
      { id: 'redeems', label: '兑换订单', screen: 'redeems' },
    ],
  },
  { id: 'goods', label: '商品管理', icon: 'goods', muted: true },
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
  { id: 'orders', label: '订单管理', icon: 'orders', muted: true },
  { id: 'data', label: '数据中心', icon: 'data', muted: true },
  { id: 'user', label: '用户中心', icon: 'user', muted: true },
  { id: 'upload', label: '上传下载中心', icon: 'upload', muted: true },
  { id: 'system', label: '系统管理', icon: 'system', muted: true },
]

function isApprovalScreen(screen: string) {
  return screen === 'approval' || screen === 'approval-buy' || screen === 'approval-pay'
}

function currentNavId(screen: string) {
  if (screen === 'members') return 'members'
  if (screen === 'redeems') return 'redeems'
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

function Shell() {
  const { screen, go } = useAdmin()
  const active = currentNavId(screen)

  return (
    <div className="admin-root">
      <header className="hive-top">
        <div className="hive-brand">
          <strong>蜂巢云平台</strong>
          <span>商户管理平台</span>
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
      <div className="hive-body">
        <aside className="admin-side">
          {NAV.map((item) => {
            const childOn = item.children?.some((child) => child.id === active)
            return (
              <div key={item.id} className="side-block">
                <button
                  className={item.id === active ? 'side-item on' : item.muted && !childOn ? 'side-item muted' : 'side-item'}
                  type="button"
                  onClick={() => {
                    const first = item.children?.find((child) => child.screen)
                    if (first?.screen) go(first.screen)
                  }}
                >
                  <NavIcon name={item.icon} />
                  <span>{item.label}</span>
                </button>
                {item.children
                  ? item.children.map((child) => (
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
        <main className="admin-main">
          {screen === 'members' ? <MembersPage /> : null}
          {screen === 'redeems' ? <RedeemsPage /> : null}
          {screen === 'approval-buy' ? <ApprovalBuyPage /> : null}
          {screen === 'approval-pay' ? <ApprovalPayPage /> : null}
          {screen === 'approval' || (!isApprovalScreen(screen) && screen !== 'members' && screen !== 'redeems') ? (
            <ApprovalListPage />
          ) : null}
        </main>
      </div>
    </div>
  )
}

export default function AdminApp() {
  return (
    <AdminProvider>
      <Shell />
    </AdminProvider>
  )
}
