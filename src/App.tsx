import { useEffect, useState } from 'react'
import { StoreProvider, useStore } from './store'
import { BenefitChannelPage, ClaimPage, CorpPayPage, DetailPage, MallPage, MinePage, PointsZonePage, RecordsPage, SuccessPage, TabBar } from './pages'
import AdminApp from './admin/AdminApp'
import type { HomeLayout } from './types'

function useAdminHash() {
  const [admin, setAdmin] = useState(() => window.location.hash.startsWith('#/admin'))
  useEffect(() => {
    const onHash = () => setAdmin(window.location.hash.startsWith('#/admin'))
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  return admin
}

function Screen() {
  const { screen, hasEverClaimed } = useStore()
  if (!hasEverClaimed) return <ClaimPage />
  if (screen.name === 'claim') return <ClaimPage />
  if (screen.name === 'detail') return <DetailPage productId={screen.productId} channel={screen.channel} from={screen.from} />
  if (screen.name === 'success') return <SuccessPage orderId={screen.orderId} from={screen.from} />
  if (screen.name === 'corp-pay') return <CorpPayPage fromOrderId={screen.fromOrderId} />
  if (screen.name === 'benefit-channel') return <BenefitChannelPage channel={screen.channel} />
  if (screen.name === 'points-zone') return <PointsZonePage />
  if (screen.name === 'mine') return <MinePage />
  if (screen.name === 'records') return <RecordsPage />
  return <MallPage />
}

function PhoneShell() {
  const { screen, hasEverClaimed } = useStore()
  const showTab = hasEverClaimed && (screen.name === 'mall' || screen.name === 'mine')
  return (
    <>
      <div className="phone-body">
        <Screen />
      </div>
      {showTab ? <TabBar current={screen.name === 'mine' ? 'mine' : 'mall'} /> : null}
    </>
  )
}

const LAYOUTS: { id: HomeLayout; label: string }[] = [
  { id: 'zones', label: '双专区' },
  { id: 'flat', label: '积分平铺' },
]

function StageChrome() {
  const { homeLayout, setHomeLayout } = useStore()
  return (
    <div className="stage-tools">
      <a className="admin-entry" href="#/admin">
        商户后台
      </a>
      <div className="layout-switch" role="group" aria-label="首页情况">
        {LAYOUTS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={homeLayout === item.id ? 'on' : ''}
            onClick={() => setHomeLayout(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function App() {
  const admin = useAdminHash()
  if (admin) return <AdminApp />
  return (
    <div className="stage">
      <StoreProvider>
        <StageChrome />
        <div className="phone">
          <PhoneShell />
        </div>
      </StoreProvider>
    </div>
  )
}
