import { useEffect, useState } from 'react'
import { StoreProvider, useStore } from './store'
import { BenefitChannelPage, BenefitZonePage, ClaimPage, CorpPayPage, DetailPage, GiftPackPage, GoldWalletPage, LaborExtractPage, MallPage, MinePage, PointsZonePage, RecordsPage, RightsPage, SuccessPage, TabBar } from './pages'
import { ZcbMemberPage } from './zcb-pages'
import { ShopDetailPage, ShopPointsPage, ShopShelfPage } from './shop-pages'
import AdminApp from './admin/AdminApp'
import { Phase2Brief } from './phase2-brief'
import type { HomeLayout } from './types'

function useConsole() {
  const read = () => {
    if (window.location.hash.startsWith('#/mid')) return 'mid' as const
    if (window.location.hash.startsWith('#/admin')) return 'admin' as const
    return 'demo' as const
  }
  const [mode, setMode] = useState(read)
  useEffect(() => {
    const onHash = () => setMode(read())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  return mode
}

function Screen() {
  const { screen, hasEverClaimed } = useStore()
  if (!hasEverClaimed) return <ClaimPage />
  if (screen.name === 'claim') return <ClaimPage />
  if (screen.name === 'detail') return <DetailPage productId={screen.productId} channel={screen.channel} from={screen.from} />
  if (screen.name === 'success') return <SuccessPage orderId={screen.orderId} from={screen.from} />
  if (screen.name === 'corp-pay') return <CorpPayPage fromOrderId={screen.fromOrderId} />
  if (screen.name === 'gold-wallet') return <GoldWalletPage fromOrderId={screen.fromOrderId} />
  if (screen.name === 'my-benefits') return <RightsPage fromOrderId={screen.fromOrderId} tab={screen.tab} />
  if (screen.name === 'gift-pack') return <GiftPackPage packId={screen.packId} fromOrderId={screen.fromOrderId} />
  if (screen.name === 'benefit-channel') return <BenefitChannelPage channel={screen.channel} />
  if (screen.name === 'benefit-zone') return <BenefitZonePage />
  if (screen.name === 'points-zone') return <PointsZonePage />
  if (screen.name === 'mine') return <MinePage />
  if (screen.name === 'records') return <RecordsPage />
  if (screen.name === 'shop-shelf') return <ShopShelfPage shelfId={screen.shelf} />
  if (screen.name === 'shop-detail') return <ShopDetailPage productId={screen.productId} from={screen.from} />
  if (screen.name === 'shop-points') return <ShopPointsPage />
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
  { id: 'zones', label: '积分商城1期' },
  { id: 'flat', label: '积分商城2期' },
  { id: 'labor', label: '连续劳务区分' },
]

function StageChrome() {
  const { homeLayout, setHomeLayout } = useStore()
  return (
    <div className="stage-tools">
      <div className="stage-entries">
        <a className="admin-entry" href="#/admin">
          商户后台
        </a>
        <a className="admin-entry" href="#/mid">
          数字中台
        </a>
      </div>
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

function LaborExtractPhone() {
  return (
    <>
      <div className="phone-body">
        <LaborExtractPage />
      </div>
      <TabBar current="mall" locked />
    </>
  )
}

function DemoStage() {
  const { homeLayout } = useStore()
  if (homeLayout === 'zones') {
    return (
      <div className="stage is-pair">
        <StageChrome />
        <div className="phone-pair">
          <div className="phone-wrap">
            <div className="phone-caption">拾贝优选</div>
            <div className="phone">
              <PhoneShell />
            </div>
          </div>
          <div className="phone-wrap">
            <div className="phone-caption">支车宝</div>
            <div className="phone">
              <div className="phone-body">
                <ZcbMemberPage />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  if (homeLayout === 'labor') {
    return (
      <div className="stage is-single">
        <StageChrome />
        <div className="phone">
          <LaborExtractPhone />
        </div>
      </div>
    )
  }
  return (
    <div className="stage is-flat">
      <StageChrome />
      <div className="flat-row">
        <div className="phone-wrap">
          <div className="phone-caption">拾贝优选-自营商城</div>
          <div className="phone">
            <PhoneShell />
          </div>
        </div>
        <Phase2Brief />
      </div>
    </div>
  )
}

export default function App() {
  const mode = useConsole()
  if (mode === 'mid') return <AdminApp key="mid" place="mid" />
  if (mode === 'admin') return <AdminApp key="merchant" />
  return (
    <StoreProvider>
      <DemoStage />
    </StoreProvider>
  )
}
