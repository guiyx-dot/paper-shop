import { useState } from 'react'

export function Phase2Brief({ dock = false }: { dock?: boolean }) {
  const [open, setOpen] = useState(false)
  const classes = ['phase2-brief', dock ? 'is-dock' : '', open ? 'is-open' : 'is-shut'].filter(Boolean).join(' ')
  return (
    <aside className={classes}>
      <button className="phase2-toggle" type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        <span>说明</span>
        <i>{open ? '收起' : '展开'}</i>
      </button>
      {open ? (
        <div className="phase2-body">
      <p className="phase2-kicker">积分商城 2 期</p>
      <p className="phase2-lead">配置在数字中台。</p>

      <h3>C 端数据来源</h3>
      <table>
        <thead>
          <tr>
            <th>位置</th>
            <th>来源</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>顶部横幅</td>
            <td>banner 配置，位置为首页顶部。取标题、副标题、图片。多条上架时按创建时间从新到旧，首页可切换。不进入页面。</td>
          </tr>
          <tr>
            <td>一站省心购</td>
            <td>banner 配置，位置为一站省心购。只显示最新一条上架。没有上架则不显示。不进入页面。</td>
          </tr>
          <tr>
            <td>会员积分</td>
            <td>首页固定 7500。点进积分页后，兑换记录来自兑换订单。</td>
          </tr>
          <tr>
            <td>频道和板块卡片</td>
            <td>首页上的名称、商品和价格是定稿。点进货架后，商品和头图来自首页配置。</td>
          </tr>
          <tr>
            <td>积分权益专区</td>
            <td>沿用权益页，不在商城配置里。</td>
          </tr>
          <tr>
            <td>底部分类</td>
            <td>类目管理。按排序从左到右。</td>
          </tr>
          <tr>
            <td>底部商品</td>
            <td>商品管理里，当前类目且在售的商品。</td>
          </tr>
        </tbody>
      </table>

      <h3>点进去之后</h3>
      <ul>
        <li>货架商品取该板块已上线的配置，并且商品本身在售。上传了图片就显示在货架顶部。</li>
        <li>商品详情取商品管理的名称、积分价、图片、规格、标签。下架后不能兑换。</li>
        <li>兑换记入兑换订单。首页积分数字不减少。</li>
      </ul>

      <h3>后台配置</h3>
      <table>
        <thead>
          <tr>
            <th>菜单</th>
            <th>配置内容</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>首页配置</td>
            <td>板块固定为频道、CEO星推荐、补贴专区、精选推荐。每条配图片、商品、上线或下线。改的是货架，不改首页卡片。底部分类不在这里。</td>
          </tr>
          <tr>
            <td>banner 配置</td>
            <td>位置只有首页顶部、一站省心购。配标题、副标题、图片、上架或下架。跳转板块不作用到首页。</td>
          </tr>
          <tr>
            <td>商品管理</td>
            <td>名称、积分价、类目、图片、标签、上下架。</td>
          </tr>
          <tr>
            <td>类目管理</td>
            <td>一级类目的名称和排序。</td>
          </tr>
          <tr>
            <td>用户积分</td>
            <td>查看账户和发放。首页的 7500 不读这里。</td>
          </tr>
          <tr>
            <td>兑换订单</td>
            <td>查看 C 端兑换，可以整单退。</td>
          </tr>
        </tbody>
      </table>
        </div>
      ) : null}
    </aside>
  )
}
