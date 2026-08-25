import { AdminProvider, useAdmin } from './store'
import { BuyPage, CatalogPage, IssuePage, OrdersPage, UsersPage } from './pages'
import type { AdminScreen } from './model'
import './admin.css'

const NAV: { id: AdminScreen; label: string }[] = [
  { id: 'catalog', label: '商品中心' },
  { id: 'orders', label: '商品订单' },
  { id: 'issue', label: '批量发放' },
  { id: 'users', label: '用户积分' },
]

function Shell() {
  const { screen, go } = useAdmin()
  return (
    <div className="admin-root">
      <aside className="admin-side">
        <div className="admin-brand">商户后台</div>
        <button className="side-item muted" type="button">
          首页
        </button>
        <div className="side-group">商品管理</div>
        {NAV.map((item) => (
          <button
            key={item.id}
            className={screen === item.id || (item.id === 'catalog' && screen === 'buy') ? 'side-item on' : 'side-item'}
            onClick={() => go(item.id)}
          >
            {item.label}
          </button>
        ))}
        {['活动管理', '额度管理', '车险报价管理', '运管家', '审核管理', '订单管理', '数据中心', '用户中心'].map(
          (label) => (
            <button key={label} className="side-item muted" type="button">
              {label}
            </button>
          ),
        )}
        <a className="side-consumer" href="#/">
          打开用户端
        </a>
      </aside>
      <main className="admin-main">
        {screen === 'catalog' ? <CatalogPage /> : null}
        {screen === 'buy' ? <BuyPage /> : null}
        {screen === 'orders' ? <OrdersPage /> : null}
        {screen === 'issue' ? <IssuePage /> : null}
        {screen === 'users' ? <UsersPage /> : null}
      </main>
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
