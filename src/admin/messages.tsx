import { useMemo, useState } from 'react'

type MessageStatus = '已发送' | '已下架'

type Notice = {
  id: number
  title: string
  sentAt: string
  status: MessageStatus
  content: string
  popup: boolean
  priceChange: boolean
  merchants: string
  fileName: string
}

type Draft = {
  title: string
  content: string
  sentAt: string
  popup: '' | 'yes' | 'no'
  priceChange: '' | 'yes' | 'no'
  merchants: string
  fileName: string
}

const SEED: Notice[] = [
  { id: 88, title: '商户平台功能更新通知', sentAt: '2026-03-27 19:25:50', status: '已发送', content: '商户平台功能已更新，请留意相关入口变化。', popup: true, priceChange: false, merchants: '', fileName: '' },
  { id: 87, title: '商户平台功能更新通知', sentAt: '2026-02-12 18:15:01', status: '已发送', content: '商户平台功能已更新，请留意相关入口变化。', popup: false, priceChange: false, merchants: '', fileName: '' },
  { id: 86, title: '商户平台功能更新通知', sentAt: '2026-02-12 17:26:29', status: '已发送', content: '商户平台功能已更新，请留意相关入口变化。', popup: false, priceChange: false, merchants: '', fileName: '' },
  { id: 85, title: '商户平台功能更新通知', sentAt: '2026-02-12 17:20:48', status: '已发送', content: '商户平台功能已更新，请留意相关入口变化。', popup: false, priceChange: false, merchants: '', fileName: '' },
  { id: 84, title: '商户平台场景升级通知', sentAt: '2026-01-30 23:59:15', status: '已发送', content: '商户平台场景已升级，请按新的入口使用。', popup: true, priceChange: true, merchants: '', fileName: '' },
  { id: 83, title: '商户平台场景升级通知', sentAt: '2026-01-30 21:50:11', status: '已发送', content: '商户平台场景已升级，请按新的入口使用。', popup: false, priceChange: false, merchants: '', fileName: '' },
  { id: 82, title: '商户平台场景升级通知', sentAt: '2026-01-30 21:41:34', status: '已发送', content: '商户平台场景已升级，请按新的入口使用。', popup: false, priceChange: false, merchants: '', fileName: '' },
  { id: 81, title: '商户平台场景升级通知', sentAt: '2026-01-30 21:33:34', status: '已发送', content: '商户平台场景已升级，请按新的入口使用。', popup: false, priceChange: false, merchants: '', fileName: '' },
]

const EMPTY_DRAFT: Draft = { title: '', content: '', sentAt: '', popup: '', priceChange: '', merchants: '', fileName: '' }

function dayOf(value: string) {
  return value.slice(0, 10)
}

export function MessagesPage() {
  const [rows, setRows] = useState(SEED)
  const [mode, setMode] = useState<'list' | 'edit'>('list')
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT)
  const [missing, setMissing] = useState(false)
  const [viewing, setViewing] = useState<Notice | null>(null)
  const [title, setTitle] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [status, setStatus] = useState<'' | MessageStatus>('')
  const [applied, setApplied] = useState({ title: '', start: '', end: '', status: '' as '' | MessageStatus })

  const shown = useMemo(() => {
    return rows.filter((row) => {
      if (applied.title && !row.title.includes(applied.title.trim())) return false
      if (applied.status && row.status !== applied.status) return false
      const day = dayOf(row.sentAt)
      if (applied.start && day < applied.start) return false
      if (applied.end && day > applied.end) return false
      return true
    })
  }, [rows, applied])

  const openCreate = (next: Draft = EMPTY_DRAFT) => {
    setDraft(next)
    setMissing(false)
    setMode('edit')
  }

  const save = () => {
    if (!draft.title.trim() || !draft.content.trim() || !draft.sentAt || !draft.popup || !draft.priceChange) {
      setMissing(true)
      return
    }
    const sentAt = draft.sentAt.includes('T') ? draft.sentAt.replace('T', ' ') + (draft.sentAt.length === 16 ? ':00' : '') : draft.sentAt
    setRows((prev) => [
      {
        id: Math.max(...prev.map((row) => row.id)) + 1,
        title: draft.title.trim(),
        sentAt,
        status: '已发送',
        content: draft.content.trim(),
        popup: draft.popup === 'yes',
        priceChange: draft.priceChange === 'yes',
        merchants: draft.merchants.trim(),
        fileName: draft.fileName,
      },
      ...prev,
    ])
    setMode('list')
  }

  if (mode === 'edit') {
    return (
      <div className="msg-page">
        <div className="msg-card">
          <button className="msg-back" type="button" onClick={() => setMode('list')}>
            <span aria-hidden>‹</span>
            新增消息
          </button>
          <div className="msg-form">
            <label>
              <span><i>*</i>通知标题:</span>
              <input value={draft.title} placeholder="请输入通知标题" onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
            </label>
            <label className="is-top">
              <span><i>*</i>通知内容:</span>
              <div className="msg-editor">
                <div className="msg-toolbar" aria-hidden>
                  <b>正文</b>
                  <span>“”</span>
                  <span>B</span>
                  <span>U</span>
                  <span>I</span>
                  <em>默认字号</em>
                  <em>默认字体</em>
                  <em>默认行高</em>
                </div>
                <textarea value={draft.content} placeholder="请输入内容..." onChange={(event) => setDraft({ ...draft, content: event.target.value })} />
              </div>
            </label>
            <label>
              <span><i>*</i>发送时间:</span>
              <input type="datetime-local" value={draft.sentAt} onChange={(event) => setDraft({ ...draft, sentAt: event.target.value })} />
            </label>
            <div className="msg-radios">
              <span><i>*</i>是否强弹:</span>
              <div>
                <label>
                  <input type="radio" name="popup" checked={draft.popup === 'yes'} onChange={() => setDraft({ ...draft, popup: 'yes' })} />
                  是
                </label>
                <label>
                  <input type="radio" name="popup" checked={draft.popup === 'no'} onChange={() => setDraft({ ...draft, popup: 'no' })} />
                  否
                </label>
              </div>
            </div>
            <div className="msg-radios">
              <span><i>*</i>是否涉及调价:</span>
              <div>
                <label>
                  <input type="radio" name="price-change" checked={draft.priceChange === 'yes'} onChange={() => setDraft({ ...draft, priceChange: 'yes' })} />
                  是
                </label>
                <label>
                  <input type="radio" name="price-change" checked={draft.priceChange === 'no'} onChange={() => setDraft({ ...draft, priceChange: 'no' })} />
                  否
                </label>
              </div>
            </div>
            <div className="msg-file">
              <span>附件:</span>
              <div>
                <label className="msg-upload">
                  + 上传文件
                  <input
                    type="file"
                    onChange={(event) => setDraft({ ...draft, fileName: event.target.files?.[0]?.name ?? '' })}
                  />
                </label>
                {draft.fileName ? <em>{draft.fileName}</em> : null}
              </div>
            </div>
            <label>
              <span>发送指定商户:</span>
              <input value={draft.merchants} placeholder="请选择商户" onChange={(event) => setDraft({ ...draft, merchants: event.target.value })} />
            </label>
            {missing ? <p className="msg-missing">请填写通知标题、通知内容、发送时间、是否强弹和是否涉及调价</p> : null}
            <div className="msg-actions">
              <button className="admin-ghost" type="button" onClick={() => setMode('list')}>
                返回
              </button>
              <button className="admin-primary" type="button" onClick={save}>
                保存
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="msg-page">
      <div className="msg-card">
        <h1>消息管理</h1>
        <form
          className="msg-filters"
          onSubmit={(event) => {
            event.preventDefault()
            setApplied({ title, start, end, status })
          }}
        >
          <label className="msg-search">
            <input value={title} placeholder="请输入消息标题" onChange={(event) => setTitle(event.target.value)} />
          </label>
          <label className="msg-range">
            <input type="date" value={start} aria-label="发送开始时间" onChange={(event) => setStart(event.target.value)} />
            <span>-</span>
            <input type="date" value={end} aria-label="结束时间" onChange={(event) => setEnd(event.target.value)} />
          </label>
          <select className={status ? '' : 'is-placeholder'} value={status} onChange={(event) => setStatus(event.target.value as '' | MessageStatus)}>
            <option value="">请选择消息状态</option>
            <option value="已发送">已发送</option>
            <option value="已下架">已下架</option>
          </select>
          <div className="msg-filter-actions">
            <button className="admin-primary" type="submit">
              查询
            </button>
            <button
              className="admin-ghost"
              type="button"
              onClick={() => {
                setTitle('')
                setStart('')
                setEnd('')
                setStatus('')
                setApplied({ title: '', start: '', end: '', status: '' })
              }}
            >
              重置
            </button>
          </div>
        </form>
        <button className="msg-create" type="button" onClick={() => openCreate()}>
          + 新增消息
        </button>
        <table className="msg-table">
          <thead>
            <tr>
              <th>消息ID</th>
              <th>标题</th>
              <th>发送时间</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((row) => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td>{row.title}</td>
                <td>{row.sentAt}</td>
                <td>
                  <span className={row.status === '已发送' ? 'msg-status is-on' : 'msg-status'}>{row.status}</span>
                </td>
                <td>
                  <div className="msg-ops">
                    <button type="button" onClick={() => setViewing(row)}>
                      查看
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setRows((prev) =>
                          prev.map((item) =>
                            item.id === row.id ? { ...item, status: item.status === '已发送' ? '已下架' : '已发送' } : item,
                          ),
                        )
                      }
                    >
                      {row.status === '已发送' ? '下架' : '上架'}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        openCreate({
                          title: row.title,
                          content: row.content,
                          sentAt: row.sentAt.replace(' ', 'T').slice(0, 16),
                          popup: row.popup ? 'yes' : 'no',
                          priceChange: row.priceChange ? 'yes' : 'no',
                          merchants: row.merchants,
                          fileName: row.fileName,
                        })
                      }
                    >
                      复制
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {shown.length === 0 ? <div className="empty-panel">暂无消息</div> : null}
      </div>
      {viewing ? (
        <div className="admin-mask" onClick={() => setViewing(null)}>
          <div className="admin-modal msg-view" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <h2>{viewing.title}</h2>
            <p>{viewing.sentAt}</p>
            <div>{viewing.content}</div>
            <div className="modal-actions">
              <button className="admin-primary" type="button" onClick={() => setViewing(null)}>
                关闭
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
