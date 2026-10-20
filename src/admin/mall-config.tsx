import { useMemo, useState, type ReactNode } from 'react'
import {
  BANNER_PLACES,
  HOME_AREAS,
  HOME_POSITIONS,
  applySlots,
  areaOf,
  bannerPlaceName,
  jumpName,
  loadMallConfig,
  positionName,
  saveMallConfig,
  useMallConfig,
  type HomeBanner,
  type HomeSlot,
  type ShopCategory,
  type ShopGood,
} from '../shop-catalog'

function nextId(prefix: string) {
  return `${prefix}${Date.now().toString().slice(-8)}`
}

function readImage(file: File, onOk: (url: string) => void, onErr: (message: string) => void) {
  if (!/^image\/(jpeg|png)$/.test(file.type)) {
    onErr('请上传 jpg 或 png')
    return
  }
  if (file.size > 200 * 1024) {
    onErr('图片不超过 200KB')
    return
  }
  const reader = new FileReader()
  reader.onload = () => onOk(String(reader.result || ''))
  reader.readAsDataURL(file)
}

function Thumb({ src, text }: { src?: string; text: string }) {
  if (src) return <img className="mall-thumb" src={src} alt="" />
  const letter = text.replace(/[【】[\]\s]/g, '').slice(0, 1) || text.slice(0, 1)
  return <span className="mall-thumb is-empty">{letter}</span>
}

function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return (
    <div className="admin-mask" onClick={onClose}>
      <div className="admin-modal mall-dialog" onClick={(event) => event.stopPropagation()}>
        <div className="mall-dialog-head">
          <h2>{title}</h2>
          <button type="button" onClick={onClose} aria-label="关闭">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function MallHomePage() {
  const config = useMallConfig()
  const [areaId, setAreaId] = useState('')
  const [positionId, setPositionId] = useState('')
  const [status, setStatus] = useState('')
  const [query, setQuery] = useState({ areaId: '', positionId: '', status: '' })
  const [draft, setDraft] = useState<HomeSlot | null>(null)
  const [error, setError] = useState('')
  const [goodsQuery, setGoodsQuery] = useState('')

  const formPositions = (areaId ? HOME_AREAS.filter((area) => area.id === areaId) : HOME_AREAS).flatMap((area) => area.positions)

  const rows = config.slots.filter((item) => {
    if (query.positionId && item.positionId !== query.positionId) return false
    if (query.areaId && areaOf(item.positionId)?.id !== query.areaId) return false
    if (query.status === 'on' && !item.enabled) return false
    if (query.status === 'off' && item.enabled) return false
    return true
  })

  const openNew = () => {
    setError('')
    setGoodsQuery('')
    setDraft({ id: '', positionId: HOME_POSITIONS[0].id, image: '', goodIds: [], enabled: true })
  }

  const save = () => {
    if (!draft) return
    if (!draft.positionId) {
      setError('请选择首页板块')
      return
    }
    const current = loadMallConfig()
    const slot = { ...draft, id: draft.id || nextId('HS') }
    const slots = draft.id ? current.slots.map((item) => (item.id === slot.id ? slot : item)) : [slot, ...current.slots]
    saveMallConfig(applySlots(current, slots))
    setDraft(null)
  }

  const remove = (id: string) => {
    const current = loadMallConfig()
    saveMallConfig(applySlots(current, current.slots.filter((item) => item.id !== id)))
  }

  const goods = useMemo(() => {
    const keyword = goodsQuery.trim()
    return config.goods.filter((item) => !keyword || item.name.includes(keyword) || item.id.includes(keyword))
  }, [config.goods, goodsQuery])

  return (
    <div className="list-page">
      <div className="admin-crumb">小程序管理 / 首页配置</div>
      <h2 className="list-title">首页配置</h2>
      <p className="list-note">先选一级区域，再选里面的板块。底部商品分类直接读类目管理。一站省心购在 banner 配置里按位置设置。积分条和积分权益专区也不在这里配。</p>
      <section className="list-card">
        <div className="mall-filters">
          <select
            value={areaId}
            onChange={(event) => {
              const next = event.target.value
              const area = HOME_AREAS.find((item) => item.id === next)
              setAreaId(next)
              if (area && area.positions.length === 1) setPositionId(area.positions[0].id)
              else if (!area || areaOf(positionId)?.id !== next) setPositionId('')
            }}
          >
            <option value="">全部区域</option>
            {HOME_AREAS.map((area) => (
              <option key={area.id} value={area.id}>
                {area.name}
              </option>
            ))}
          </select>
          {HOME_AREAS.find((area) => area.id === areaId)?.positions.length === 1 ? null : (
            <select value={positionId} onChange={(event) => setPositionId(event.target.value)}>
              <option value="">全部板块</option>
              {formPositions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          )}
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">全部状态</option>
            <option value="on">上线</option>
            <option value="off">下线</option>
          </select>
          <div className="mall-filter-actions">
            <button className="admin-primary" type="button" onClick={() => setQuery({ areaId, positionId, status })}>
              查询
            </button>
            <button
              className="admin-ghost"
              type="button"
              onClick={() => {
                setAreaId('')
                setPositionId('')
                setStatus('')
                setQuery({ areaId: '', positionId: '', status: '' })
              }}
            >
              重置
            </button>
          </div>
        </div>
      </section>
      <section className="list-card is-table">
        <div className="mall-toolbar">
          <button className="admin-primary" type="button" onClick={openNew}>
            + 新增
          </button>
        </div>
        <table className="admin-table list-table">
          <thead>
            <tr>
              <th className="w-id">编号</th>
              <th>首页板块</th>
              <th className="w-thumb">图片</th>
              <th className="w-status">状态</th>
              <th className="w-ops">操作</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => (
              <tr key={item.id}>
                <td className="nowrap">{item.id}</td>
                <td className="nowrap">{positionName(item.positionId)}</td>
                <td>
                  <Thumb src={item.image} text={positionName(item.positionId)} />
                </td>
                <td className="nowrap">
                  <span className={item.enabled ? 'list-status' : 'list-status is-off'}>{item.enabled ? '上线' : '下线'}</span>
                </td>
                <td className="mall-ops">
                  <button className="link" type="button" onClick={() => { setError(''); setGoodsQuery(''); setDraft(item) }}>
                    编辑
                  </button>
                  <button className="link is-danger" type="button" onClick={() => remove(item.id)}>
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 ? <div className="empty-panel">没有配置</div> : null}
      </section>
      {draft ? (
        <Modal title={draft.id ? '编辑首页配置' : '新增首页配置'} onClose={() => setDraft(null)}>
          <label className="field">
            一级区域
            <select
              value={areaOf(draft.positionId)?.id ?? HOME_AREAS[0].id}
              onChange={(event) => {
                const area = HOME_AREAS.find((item) => item.id === event.target.value) ?? HOME_AREAS[0]
                setDraft({ ...draft, positionId: area.positions[0]?.id ?? '' })
              }}
            >
              {HOME_AREAS.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name}
                </option>
              ))}
            </select>
          </label>
          {(areaOf(draft.positionId)?.positions.length ?? 0) > 1 ? (
            <label className="field">
              二级板块
              <select value={draft.positionId} onChange={(event) => setDraft({ ...draft, positionId: event.target.value })}>
                {(areaOf(draft.positionId)?.positions ?? []).map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <div className="field">
            板块图片
            <label className="mall-upload">
              {draft.image ? <img src={draft.image} alt="" /> : <span>上传图片</span>}
              <input
                type="file"
                accept="image/jpeg,image/png"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (!file || !draft) return
                  readImage(file, (image) => setDraft({ ...draft, image }), setError)
                }}
              />
            </label>
            {draft.image ? (
              <button className="link" type="button" onClick={() => setDraft({ ...draft, image: '' })}>
                去掉图片
              </button>
            ) : null}
          </div>
          <div className="field">
            选择商品
            <input value={goodsQuery} placeholder="搜索商品名称或编号" onChange={(event) => setGoodsQuery(event.target.value)} />
            <div className="mall-checks">
              {goods.map((item) => {
                const on = draft.goodIds.includes(item.id)
                return (
                  <label key={item.id}>
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() =>
                        setDraft({
                          ...draft,
                          goodIds: on ? draft.goodIds.filter((id) => id !== item.id) : [...draft.goodIds, item.id],
                        })
                      }
                    />
                    <Thumb src={item.image} text={item.name} />
                    <span>
                      {item.name}
                      <em>{item.price}点</em>
                    </span>
                  </label>
                )
              })}
            </div>
          </div>
          <div className="field">
            上线 / 下线
            <div className="mall-radios">
              <label>
                <input type="radio" checked={draft.enabled} onChange={() => setDraft({ ...draft, enabled: true })} /> 上线
              </label>
              <label>
                <input type="radio" checked={!draft.enabled} onChange={() => setDraft({ ...draft, enabled: false })} /> 下线
              </label>
            </div>
          </div>
          {error ? <p className="mall-error">{error}</p> : null}
          <div className="refund-actions">
            <button className="admin-ghost" type="button" onClick={() => setDraft(null)}>
              取消
            </button>
            <button className="admin-primary" type="button" onClick={save}>
              确定
            </button>
          </div>
        </Modal>
      ) : null}
    </div>
  )
}

type GoodDraft = {
  id: string
  name: string
  categoryId: string
  price: string
  spec: string
  detail: string
  tags: string
  image: string
  onShelf: boolean
}

function toDraft(item?: ShopGood): GoodDraft {
  return {
    id: item?.id ?? '',
    name: item?.name ?? '',
    categoryId: item?.categoryId ?? '',
    price: item?.price ?? '',
    spec: item?.spec ?? '',
    detail: item?.detail ?? '',
    tags: item?.tags.join('、') ?? '',
    image: item?.image ?? '',
    onShelf: item?.onShelf !== false,
  }
}

export function MallGoodsPage() {
  const config = useMallConfig()
  const [form, setForm] = useState({ id: '', name: '', categoryId: '', onShelf: '' })
  const [query, setQuery] = useState(form)
  const [draft, setDraft] = useState<GoodDraft | null>(null)
  const [error, setError] = useState('')

  const categories = [...config.categories].sort((a, b) => a.sort - b.sort || a.name.localeCompare(b.name, 'zh'))
  const rows = config.goods.filter((item) => {
    if (query.id && !item.id.includes(query.id.trim())) return false
    if (query.name && !item.name.includes(query.name.trim())) return false
    if (query.categoryId && item.categoryId !== query.categoryId) return false
    if (query.onShelf === 'on' && !item.onShelf) return false
    if (query.onShelf === 'off' && item.onShelf) return false
    return true
  })

  const save = () => {
    if (!draft) return
    if (!draft.name.trim()) {
      setError('请填写商品名称')
      return
    }
    if (!draft.categoryId) {
      setError('请选择类目')
      return
    }
    if (!draft.price.trim()) {
      setError('请填写积分价格')
      return
    }
    const current = loadMallConfig()
    const next: ShopGood = {
      id: draft.id || nextId('G'),
      name: draft.name.trim(),
      categoryId: draft.categoryId,
      price: draft.price.trim(),
      spec: draft.spec.trim() || undefined,
      detail: draft.detail.trim() || undefined,
      image: draft.image,
      tags: draft.tags.split(/[、,，]/).map((item) => item.trim()).filter(Boolean),
      tone: current.goods.find((item) => item.id === draft.id)?.tone ?? '#fff1e6',
      origin: current.goods.find((item) => item.id === draft.id)?.origin,
      drop: current.goods.find((item) => item.id === draft.id)?.drop,
      onShelf: draft.onShelf,
    }
    const goods = draft.id ? current.goods.map((item) => (item.id === next.id ? next : item)) : [next, ...current.goods]
    saveMallConfig({ ...current, goods })
    setDraft(null)
  }

  const remove = (id: string) => {
    const current = loadMallConfig()
    saveMallConfig(
      applySlots(
        {
          ...current,
          goods: current.goods.filter((item) => item.id !== id),
          slots: current.slots.map((item) => ({ ...item, goodIds: item.goodIds.filter((goodId) => goodId !== id) })),
        },
        current.slots.map((item) => ({ ...item, goodIds: item.goodIds.filter((goodId) => goodId !== id) })),
      ),
    )
  }

  return (
    <div className="list-page">
      <div className="admin-crumb">商城管理 / 商品管理</div>
      <h2 className="list-title">商品管理</h2>
      <p className="list-note">自营商品在这里维护。积分价格、图片和上下架会进入 2 期二级页。首页上已经确定的展示保持不变。</p>
      <section className="list-card">
        <div className="mall-filters">
          <input value={form.id} placeholder="商品编号" onChange={(event) => setForm({ ...form, id: event.target.value })} />
          <input value={form.name} placeholder="商品名称" onChange={(event) => setForm({ ...form, name: event.target.value })} />
          <select value={form.categoryId} onChange={(event) => setForm({ ...form, categoryId: event.target.value })}>
            <option value="">全部类目</option>
            {categories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <select value={form.onShelf} onChange={(event) => setForm({ ...form, onShelf: event.target.value })}>
            <option value="">是否在售</option>
            <option value="on">在售</option>
            <option value="off">未售</option>
          </select>
          <div className="mall-filter-actions">
            <button className="admin-primary" type="button" onClick={() => setQuery(form)}>
              查询
            </button>
            <button
              className="admin-ghost"
              type="button"
              onClick={() => {
                const empty = { id: '', name: '', categoryId: '', onShelf: '' }
                setForm(empty)
                setQuery(empty)
              }}
            >
              重置
            </button>
          </div>
        </div>
      </section>
      <section className="list-card is-table">
        <div className="mall-toolbar">
          <button className="admin-primary" type="button" onClick={() => { setError(''); setDraft(toDraft()) }}>
            + 添加
          </button>
        </div>
        <table className="admin-table list-table">
          <thead>
            <tr>
              <th className="w-id">商品编号</th>
              <th>商品名称</th>
              <th className="w-pos">类目</th>
              <th className="w-thumb">图片</th>
              <th className="w-num">积分</th>
              <th className="w-status">是否在售</th>
              <th className="w-ops">操作</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => (
              <tr key={item.id}>
                <td className="nowrap">{item.id}</td>
                <td>
                  <strong>{item.name}</strong>
                  {item.spec ? <div className="muted-line">{item.spec}</div> : null}
                </td>
                <td className="nowrap">{categories.find((category) => category.id === item.categoryId)?.name ?? '—'}</td>
                <td>
                  <Thumb src={item.image} text={item.name} />
                </td>
                <td className="nowrap">{item.price}</td>
                <td className="nowrap">
                  <span className={item.onShelf ? 'list-status' : 'list-status is-off'}>{item.onShelf ? '在售' : '未售'}</span>
                </td>
                <td className="mall-ops">
                  <button className="link" type="button" onClick={() => { setError(''); setDraft(toDraft(item)) }}>
                    编辑
                  </button>
                  <button className="link is-danger" type="button" onClick={() => remove(item.id)}>
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 ? <div className="empty-panel">没有商品</div> : null}
      </section>
      {draft ? (
        <Modal title={draft.id ? '编辑商品' : '新增商品'} onClose={() => setDraft(null)}>
          <label className="field">
            商品名称
            <input value={draft.name} placeholder="请填写商品名称" onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
          </label>
          <label className="field">
            类目
            <select value={draft.categoryId} onChange={(event) => setDraft({ ...draft, categoryId: event.target.value })}>
              <option value="">请选择类目</option>
              {categories.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            积分价格
            <input value={draft.price} placeholder="例如 178.18" onChange={(event) => setDraft({ ...draft, price: event.target.value })} />
          </label>
          <label className="field">
            规格
            <input value={draft.spec} placeholder="例如 60g*6盒" onChange={(event) => setDraft({ ...draft, spec: event.target.value })} />
          </label>
          <label className="field">
            标签
            <input value={draft.tags} placeholder="用顿号分隔，例如 包邮、省心购" onChange={(event) => setDraft({ ...draft, tags: event.target.value })} />
          </label>
          <div className="field">
            是否在售
            <div className="mall-radios">
              <label>
                <input type="radio" checked={draft.onShelf} onChange={() => setDraft({ ...draft, onShelf: true })} /> 在售
              </label>
              <label>
                <input type="radio" checked={!draft.onShelf} onChange={() => setDraft({ ...draft, onShelf: false })} /> 未售
              </label>
            </div>
          </div>
          <div className="field">
            商品图片
            <label className="mall-upload">
              {draft.image ? <img src={draft.image} alt="" /> : <span>上传图片</span>}
              <input
                type="file"
                accept="image/jpeg,image/png"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (!file) return
                  readImage(file, (image) => setDraft({ ...draft, image }), setError)
                }}
              />
            </label>
          </div>
          <label className="field">
            商品说明
            <textarea value={draft.detail} placeholder="选填" onChange={(event) => setDraft({ ...draft, detail: event.target.value })} />
          </label>
          {error ? <p className="mall-error">{error}</p> : null}
          <div className="refund-actions">
            <button className="admin-ghost" type="button" onClick={() => setDraft(null)}>
              取消
            </button>
            <button className="admin-primary" type="button" onClick={save}>
              保存
            </button>
          </div>
        </Modal>
      ) : null}
    </div>
  )
}

export function MallCategoryPage() {
  const config = useMallConfig()
  const [form, setForm] = useState({ id: '', name: '' })
  const [query, setQuery] = useState(form)
  const [draft, setDraft] = useState<ShopCategory | null>(null)
  const [error, setError] = useState('')

  const rows = [...config.categories]
    .filter((item) => {
      if (query.id && !item.id.includes(query.id.trim())) return false
      if (query.name && !item.name.includes(query.name.trim())) return false
      return true
    })
    .sort((a, b) => a.sort - b.sort || a.name.localeCompare(b.name, 'zh'))

  const save = () => {
    if (!draft) return
    if (!draft.name.trim()) {
      setError('请填写类目名')
      return
    }
    const current = loadMallConfig()
    const next = { id: draft.id || nextId('C'), name: draft.name.trim(), sort: Number(draft.sort) || 0 }
    const categories = draft.id
      ? current.categories.map((item) => (item.id === next.id ? next : item))
      : [...current.categories, next]
    saveMallConfig({ ...current, categories })
    setDraft(null)
  }

  const remove = (id: string) => {
    const current = loadMallConfig()
    if (current.goods.some((item) => item.categoryId === id)) {
      setError('该类目下还有商品，先改商品类目再删除。')
      return
    }
    setError('')
    saveMallConfig({ ...current, categories: current.categories.filter((item) => item.id !== id) })
  }

  return (
    <div className="list-page">
      <div className="admin-crumb">商城管理 / 类目管理</div>
      <h2 className="list-title">类目管理</h2>
      <p className="list-note">目前只做一级类目，不配置图片。</p>
      {error ? <p className="mall-error">{error}</p> : null}
      <section className="list-card">
        <div className="mall-filters">
          <input value={form.id} placeholder="类目ID" onChange={(event) => setForm({ ...form, id: event.target.value })} />
          <input value={form.name} placeholder="类目名" onChange={(event) => setForm({ ...form, name: event.target.value })} />
          <div className="mall-filter-actions">
            <button className="admin-primary" type="button" onClick={() => setQuery(form)}>
              查询
            </button>
            <button
              className="admin-ghost"
              type="button"
              onClick={() => {
                const empty = { id: '', name: '' }
                setForm(empty)
                setQuery(empty)
              }}
            >
              重置
            </button>
          </div>
        </div>
      </section>
      <section className="list-card is-table">
        <div className="mall-toolbar">
          <button
            className="admin-primary"
            type="button"
            onClick={() => {
              setError('')
              setDraft({ id: '', name: '', sort: config.categories.length + 1 })
            }}
          >
            + 添加
          </button>
        </div>
        <table className="admin-table list-table">
          <thead>
            <tr>
              <th className="w-id">类目ID</th>
              <th>类目名</th>
              <th className="w-num">顺序</th>
              <th className="w-ops">操作</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.name}</td>
                <td>{item.sort}</td>
                <td className="mall-ops">
                  <button className="link" type="button" onClick={() => { setError(''); setDraft(item) }}>
                    编辑
                  </button>
                  <button className="link is-danger" type="button" onClick={() => remove(item.id)}>
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 ? <div className="empty-panel">没有类目</div> : null}
      </section>
      {draft ? (
        <Modal title={draft.id ? '编辑类目' : '新增类目'} onClose={() => setDraft(null)}>
          <label className="field">
            类目名
            <input value={draft.name} placeholder="请填写类目名" onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
          </label>
          <label className="field">
            顺序
            <input
              value={String(draft.sort)}
              onChange={(event) => setDraft({ ...draft, sort: Number(event.target.value.replace(/[^\d]/g, '')) || 0 })}
            />
          </label>
          {error ? <p className="mall-error">{error}</p> : null}
          <div className="refund-actions">
            <button className="admin-ghost" type="button" onClick={() => setDraft(null)}>
              取消
            </button>
            <button className="admin-primary" type="button" onClick={save}>
              保存
            </button>
          </div>
        </Modal>
      ) : null}
    </div>
  )
}

function stamp() {
  const date = new Date()
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function emptyBanner(): HomeBanner {
  return { id: '', title: '', subtitle: '', image: '', place: 'hero', positionId: 'video', enabled: true, createdAt: '' }
}

export function MallBannerPage() {
  const config = useMallConfig()
  const [title, setTitle] = useState('')
  const [place, setPlace] = useState('')
  const [status, setStatus] = useState('')
  const [query, setQuery] = useState({ title: '', place: '', status: '' })
  const [draft, setDraft] = useState<HomeBanner | null>(null)
  const [view, setView] = useState<HomeBanner | null>(null)
  const [error, setError] = useState('')

  const rows = [...config.banners]
    .filter((item) => {
      if (query.title && !item.title.includes(query.title.trim())) return false
      if (query.place && item.place !== query.place) return false
      if (query.status === 'on' && !item.enabled) return false
      if (query.status === 'off' && item.enabled) return false
      return true
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  const save = () => {
    if (!draft) return
    if (!draft.title.trim()) {
      setError('请填写活动标题')
      return
    }
    const current = loadMallConfig()
    const next = {
      ...draft,
      id: draft.id || nextId('BN'),
      title: draft.title.trim(),
      subtitle: draft.subtitle.trim(),
      createdAt: draft.createdAt || stamp(),
    }
    const banners = draft.id ? current.banners.map((item) => (item.id === next.id ? next : item)) : [next, ...current.banners]
    saveMallConfig({ ...current, banners })
    setDraft(null)
  }

  const patch = (id: string, enabled: boolean) => {
    const current = loadMallConfig()
    saveMallConfig({
      ...current,
      banners: current.banners.map((item) => (item.id === id ? { ...item, enabled } : item)),
    })
  }

  const remove = (id: string) => {
    const current = loadMallConfig()
    saveMallConfig({ ...current, banners: current.banners.filter((item) => item.id !== id) })
  }

  return (
    <div className="list-page">
      <div className="admin-crumb">小程序管理 / banner配置</div>
      <h2 className="list-title">banner配置</h2>
      <p className="list-note">用位置决定出现在首页顶部，还是分类上方的一站省心购。顶部多条上架时按创建时间从新到旧切换；一站省心购只显示最新上架的一条。</p>
      <section className="list-card">
        <div className="mall-filters">
          <input value={title} placeholder="请输入活动标题" onChange={(event) => setTitle(event.target.value)} />
          <select value={place} onChange={(event) => setPlace(event.target.value)}>
            <option value="">全部位置</option>
            {BANNER_PLACES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">请选择状态</option>
            <option value="on">上架</option>
            <option value="off">下架</option>
          </select>
          <div className="mall-filter-actions">
            <button className="admin-primary" type="button" onClick={() => setQuery({ title, place, status })}>
              查询
            </button>
            <button
              className="admin-ghost"
              type="button"
              onClick={() => {
                setTitle('')
                setPlace('')
                setStatus('')
                setQuery({ title: '', place: '', status: '' })
              }}
            >
              重置
            </button>
          </div>
        </div>
      </section>
      <section className="list-card is-table">
        <div className="mall-toolbar">
          <button className="admin-primary" type="button" onClick={() => { setError(''); setDraft(emptyBanner()) }}>
            + 新增banner
          </button>
        </div>
        <table className="admin-table list-table">
          <thead>
            <tr>
              <th>活动标题</th>
              <th className="w-area">位置</th>
              <th className="w-area">跳转板块</th>
              <th className="w-time">banner图片</th>
              <th className="w-time">创建时间</th>
              <th className="w-status">状态</th>
              <th className="w-banner-ops">操作</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => (
              <tr key={item.id}>
                <td>
                  <strong>{item.title}</strong>
                  {item.subtitle ? <div className="muted-line">{item.subtitle}</div> : null}
                </td>
                <td className="nowrap">{bannerPlaceName(item.place)}</td>
                <td>{jumpName(item.positionId)}</td>
                <td>
                  {item.image ? <img className="mall-banner-thumb" src={item.image} alt="" /> : <span className="mall-banner-thumb is-empty">无图</span>}
                </td>
                <td className="nowrap">{item.createdAt || '—'}</td>
                <td className="nowrap">
                  <span className={item.enabled ? 'list-status' : 'list-status is-off'}>{item.enabled ? '上架' : '下架'}</span>
                </td>
                <td className="w-banner-ops">
                  <div className="mall-ops is-row">
                    <button className="link" type="button" onClick={() => patch(item.id, !item.enabled)}>
                      {item.enabled ? '下架' : '上架'}
                    </button>
                    {item.enabled ? (
                      <button className="link" type="button" onClick={() => setView(item)}>
                        查看
                      </button>
                    ) : (
                      <>
                        <button className="link" type="button" onClick={() => { setError(''); setDraft(item) }}>
                          编辑
                        </button>
                        <button className="link is-danger" type="button" onClick={() => remove(item.id)}>
                          删除
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 ? <div className="empty-panel">没有 banner</div> : null}
      </section>
      {draft ? (
        <Modal title={draft.id ? '编辑banner' : '新增banner'} onClose={() => setDraft(null)}>
          <label className="field">
            活动标题
            <input value={draft.title} placeholder="例如：视听会员" onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
          </label>
          <label className="field">
            副标题
            <input value={draft.subtitle} placeholder="例如：5折起" onChange={(event) => setDraft({ ...draft, subtitle: event.target.value })} />
          </label>
          <div className="field">
            banner图片
            <label className="mall-upload">
              {draft.image ? <img src={draft.image} alt="" /> : <span>上传图片</span>}
              <input
                type="file"
                accept="image/jpeg,image/png"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (!file || !draft) return
                  readImage(file, (image) => setDraft({ ...draft, image }), setError)
                }}
              />
            </label>
            <em>{draft.place === 'careful' ? '不上传时，用橙色卡片，显示标题和副标题。' : '不上传时，首页继续用现在的橙色横幅。'}</em>
          </div>
          <label className="field">
            位置
            <select value={draft.place} onChange={(event) => setDraft({ ...draft, place: event.target.value })}>
              {BANNER_PLACES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            跳转板块
            <select value={draft.positionId} onChange={(event) => setDraft({ ...draft, positionId: event.target.value })}>
              <option value="">不跳转</option>
              <option value="careful">一站省心购</option>
              {HOME_AREAS.map((area) => (
                <optgroup key={area.id} label={area.name}>
                  {area.positions.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>
          <div className="field">
            状态
            <div className="mall-radios">
              <label>
                <input type="radio" checked={draft.enabled} onChange={() => setDraft({ ...draft, enabled: true })} /> 上架
              </label>
              <label>
                <input type="radio" checked={!draft.enabled} onChange={() => setDraft({ ...draft, enabled: false })} /> 下架
              </label>
            </div>
          </div>
          {error ? <p className="mall-error">{error}</p> : null}
          <div className="refund-actions">
            <button className="admin-ghost" type="button" onClick={() => setDraft(null)}>
              取消
            </button>
            <button className="admin-primary" type="button" onClick={save}>
              确定
            </button>
          </div>
        </Modal>
      ) : null}
      {view ? (
        <Modal title="查看banner" onClose={() => setView(null)}>
          <dl className="mall-detail">
            <div>
              <dt>活动标题</dt>
              <dd>{view.title}</dd>
            </div>
            <div>
              <dt>副标题</dt>
              <dd>{view.subtitle || '—'}</dd>
            </div>
            <div>
              <dt>位置</dt>
              <dd>{bannerPlaceName(view.place)}</dd>
            </div>
            <div>
              <dt>跳转板块</dt>
              <dd>{jumpName(view.positionId)}</dd>
            </div>
            <div>
              <dt>创建时间</dt>
              <dd>{view.createdAt || '—'}</dd>
            </div>
            <div>
              <dt>状态</dt>
              <dd>{view.enabled ? '上架' : '下架'}</dd>
            </div>
          </dl>
          {view.image ? <img className="mall-banner-preview" src={view.image} alt="" /> : null}
          <div className="refund-actions">
            <button className="admin-primary" type="button" onClick={() => setView(null)}>
              关闭
            </button>
          </div>
        </Modal>
      ) : null}
    </div>
  )
}
