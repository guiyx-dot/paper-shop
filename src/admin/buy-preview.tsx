import { ProductIcon } from '../icons'
import { DEDICATED_SKUS, dedicatedLabel, type PurchaseKind } from './model'

export function BuyPreview({ kind, sku }: { kind: PurchaseKind | null; sku?: (typeof DEDICATED_SKUS)[number] }) {
  if (!kind) {
    return (
      <div className="buy-visual">
        <div className="points-mark">积</div>
        <strong className="buy-visual-name">会员积分</strong>
        <div className="trust">先选择采购类型，再选择商品</div>
      </div>
    )
  }
  return (
    <div className="buy-visual">
      {kind === 'dedicated' && sku ? (
        <ProductIcon id={sku.id} />
      ) : (
        <div className="points-mark">积</div>
      )}
      <strong className="buy-visual-name">
        {kind === 'dedicated' ? (sku ? dedicatedLabel(sku.name) : '专用券') : '通用积分'}
      </strong>
      <div className="trust">
        {kind === 'dedicated' ? '专用券 · 兑成币/券后可在积分专区使用' : '正品保障 · 安全到账 · 可批量发放'}
      </div>
    </div>
  )
}
