import { useEffect, useState } from 'react'
import { StoreProvider, useStore } from './store'
import { BenefitChannelPage, ClaimPage, CorpPayPage, DetailPage, MallPage, MinePage, PointsZonePage, RecordsPage, SuccessPage, TabBar } from './pages'
import AdminApp from './admin/AdminApp'

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

export default function App() {
  const admin = useAdminHash()
  if (admin) return <AdminApp />
  return (
    <div className="stage">
      <a className="admin-entry" href="#/admin">
        商户后台
      </a>
      <div className="phone">
        <StoreProvider>
          <PhoneShell />
        </StoreProvider>
      </div>
    </div>
  )
}
