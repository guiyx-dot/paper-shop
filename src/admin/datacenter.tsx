import { useMemo, useState } from 'react'

type TabKey = 'benefit' | 'fund'

type Field = { id: string; label: string; group: string }

type DetailRow = {
  id: string
  merchant: string
  name: string
  phone: string
  idNo: string
  issueAt: string
  viewAt: string
  couponName: string
  face: string
  fee: string
  couponNo: string
  batchNo: string
  bizType: string
  approvalNo: string
  issueStatus: string
  useStatus?: string
  arriveStatus?: string
  reward?: string
  couponRemark: string
  remark: string
  arrivedAmount?: string
  withdrawn?: boolean
  revoked?: boolean
}

const BENEFIT_FIELDS: Field[] = [
  { id: 'merchant', label: '商户', group: '基本数据' },
  { id: 'name', label: '姓名', group: '基本数据' },
  { id: 'phone', label: '手机号', group: '基本数据' },
  { id: 'idNo', label: '身份证', group: '基本数据' },
  { id: 'issueAt', label: '发放时间', group: '发放数据' },
  { id: 'viewAt', label: '查看时间', group: '发放数据' },
  { id: 'couponName', label: '卡券名称', group: '发放数据' },
  { id: 'face', label: '面额', group: '发放数据' },
  { id: 'fee', label: '服务费（元）', group: '发放数据' },
  { id: 'couponNo', label: '卡券编号', group: '发放数据' },
  { id: 'batchNo', label: '发放批次号', group: '发放数据' },
  { id: 'bizType', label: '业务类型', group: '发放数据' },
  { id: 'approvalNo', label: '审批单号', group: '发放数据' },
  { id: 'issueStatus', label: '发放状态', group: '发放数据' },
  { id: 'useStatus', label: '使用状态', group: '发放数据' },
  { id: 'couponRemark', label: '卡券备注', group: '发放数据' },
  { id: 'remark', label: '备注', group: '发放数据' },
]

const FUND_FIELDS: Field[] = [
  { id: 'merchant', label: '商户', group: '基本数据' },
  { id: 'name', label: '姓名', group: '基本数据' },
  { id: 'phone', label: '手机号', group: '基本数据' },
  { id: 'idNo', label: '身份证', group: '基本数据' },
  { id: 'issueAt', label: '发放时间', group: '发放数据' },
  { id: 'viewAt', label: '查看时间', group: '发放数据' },
  { id: 'couponName', label: '卡券名称', group: '发放数据' },
  { id: 'face', label: '面额', group: '发放数据' },
  { id: 'fee', label: '服务费（元）', group: '发放数据' },
  { id: 'couponNo', label: '卡券编号', group: '发放数据' },
  { id: 'batchNo', label: '发放批次号', group: '发放数据' },
  { id: 'bizType', label: '业务类型', group: '发放数据' },
  { id: 'approvalNo', label: '审批单号', group: '发放数据' },
  { id: 'issueStatus', label: '发放状态', group: '发放数据' },
  { id: 'arriveStatus', label: '到账状态', group: '发放数据' },
  { id: 'reward', label: '奖励金额（元）', group: '发放数据' },
  { id: 'couponRemark', label: '卡券备注', group: '发放数据' },
  { id: 'remark', label: '备注', group: '发放数据' },
  { id: 'arrivedAmount', label: '到账金额', group: '发放数据' },
]

const SEED_BENEFIT: DetailRow[] = [
  { id: 'b1', merchant: '产研中心线上验证专用', name: '', phone: '17858938786', idNo: '', issueAt: '2026-10-07 11:19:49', viewAt: '2026-10-07 11:19:58', couponName: '测试奥塞斯因公付1元', face: '1元', fee: '¥0.08', couponNo: '02006144030026', batchNo: '09274624', bizType: '其他', approvalNo: '', issueStatus: '已发放', useStatus: '已使用', couponRemark: '', remark: '', withdrawn: true },
  { id: 'b2', merchant: '产研中心线上验证专用', name: '', phone: '17858938786', idNo: '', issueAt: '2026-10-06 16:17:50', viewAt: '2026-10-06 16:18:19', couponName: '因公付（企业权益）', face: '1元', fee: '¥0.08', couponNo: '02006144030025', batchNo: '09274347', bizType: '其他', approvalNo: '', issueStatus: '已发放', useStatus: '已使用', couponRemark: '', remark: '' },
  { id: 'b3', merchant: '产研中心线上验证专用', name: '', phone: '17858938786', idNo: '', issueAt: '2026-10-05 16:56:26', viewAt: '2026-10-05 16:56:43', couponName: '测试奥塞斯因公付1元', face: '1元', fee: '¥0.08', couponNo: '02006144030024', batchNo: '09273677', bizType: '其他', approvalNo: '', issueStatus: '已发放', useStatus: '已使用', couponRemark: '', remark: '' },
  { id: 'b4', merchant: '产研中心线上验证专用', name: '', phone: '18067972318', idNo: '', issueAt: '2026-10-05 16:56:26', viewAt: '', couponName: '测试奥塞斯因公付1元', face: '1元', fee: '¥0.08', couponNo: '02001264950023', batchNo: '09273677', bizType: '其他', approvalNo: '', issueStatus: '已发放', useStatus: '未使用', couponRemark: '', remark: '' },
  { id: 'b5', merchant: '产研中心线上验证专用', name: '', phone: '18806521450', idNo: '', issueAt: '2026-10-04 16:56:26', viewAt: '2026-10-04 16:58:16', couponName: '测试奥塞斯因公付1元', face: '1元', fee: '¥0.08', couponNo: '0200308643000', batchNo: '09273677', bizType: '其他', approvalNo: '', issueStatus: '已发放', useStatus: '已使用', couponRemark: '', remark: '' },
  { id: 'b6', merchant: '产研中心线上验证专用', name: '刘雄', phone: '13758257534', idNo: '', issueAt: '2026-10-02 10:04:13', viewAt: '2026-10-02 10:04:33', couponName: '卡赢微信立减金-测试-1元', face: '1元', fee: '¥0.08', couponNo: '020070716804', batchNo: '', bizType: '', approvalNo: '', issueStatus: '', useStatus: '', couponRemark: '', remark: '' },
]

const SEED_FUND: DetailRow[] = [
  { id: 'f1', merchant: '产研中心线上验证专用', name: '', phone: '17858938786', idNo: '', issueAt: '2026-10-07 17:50:15', viewAt: '2026-10-07 17:50:30', couponName: '通用金', face: '1元', fee: '¥0.08', couponNo: '20997979414270402', batchNo: '09270826', bizType: '其他', approvalNo: '', issueStatus: '已查看', arriveStatus: '已到账', reward: '¥0', couponRemark: '', remark: '', arrivedAmount: '¥1', withdrawn: true },
  { id: 'f2', merchant: '产研中心线上验证专用', name: '', phone: '13210046919', idNo: '', issueAt: '2026-10-06 16:55:41', viewAt: '2026-10-06 17:02:00', couponName: '通用金', face: '2元', fee: '¥0.14', couponNo: '20976098789768705', batchNo: '09266727', bizType: '其他', approvalNo: '', issueStatus: '已查看', arriveStatus: '已到账', reward: '¥0.1', couponRemark: '', remark: '', arrivedAmount: '¥2' },
  { id: 'f3', merchant: '产研中心线上验证专用', name: '', phone: '17858938786', idNo: '', issueAt: '2026-10-05 16:45:01', viewAt: '2026-10-05 16:46:17', couponName: '通用金', face: '1.1元', fee: '¥0.08', couponNo: '20976071946123265', batchNo: '09266712', bizType: '其他', approvalNo: '', issueStatus: '已查看', arriveStatus: '已到账', reward: '¥0.06', couponRemark: '', remark: '', arrivedAmount: '¥1.1' },
  { id: 'f4', merchant: '产研中心线上验证专用', name: '', phone: '15528222001', idNo: '', issueAt: '2026-10-02 09:45:59', viewAt: '', couponName: '通用金', face: '1元', fee: '¥0.08', couponNo: '20949650278747521', batchNo: '09261766', bizType: '其他', approvalNo: '', issueStatus: '已失效', arriveStatus: '未到账', reward: '¥0', couponRemark: '', remark: '', arrivedAmount: '¥0' },
]

const WHITELIST = new Set(['产研中心线上验证专用'])

function inRange(value: string, start: string, end: string) {
  if (!start && !end) return true
  if (!value) return false
  const day = value.slice(0, 10)
  if (start && day < start) return false
  if (end && day > end) return false
  return true
}

function statusOk(text: string) {
  return text === '已发放' || text === '已使用' || text === '已查看' || text === '已到账'
}

function StatusCell({ text }: { text?: string }) {
  if (!text) return <span className="dc-dash">-</span>
  return <span className={statusOk(text) ? 'dc-status ok' : 'dc-status muted'}>{text}</span>
}

function DateCell({ value }: { value: string }) {
  if (!value) return <span className="dc-dash">-</span>
  const [date, time] = value.split(' ')
  return (
    <div className="dc-dt">
      <span>{date}</span>
      <span>{time || ''}</span>
    </div>
  )
}

function SearchIcon() {
  return (
    <svg className="appr-ico is-right" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3-3" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg className="appr-ico is-right" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  )
}

function formatRange(start: string, end: string) {
  const a = start.replaceAll('-', '/')
  const b = end.replaceAll('-', '/')
  if (a && b) return `${a} - ${b}`
  if (a) return `${a} -`
  if (b) return `- ${b}`
  return ''
}

export function DatacenterPage() {
  const [tab, setTab] = useState<TabKey>('benefit')
  const [benefitRows, setBenefitRows] = useState(SEED_BENEFIT)
  const [fundRows, setFundRows] = useState(SEED_FUND)
  const [phone, setPhone] = useState('')
  const [issue, setIssue] = useState('')
  const [second, setSecond] = useState('')
  const [coupon, setCoupon] = useState('')
  const [merchant, setMerchant] = useState('')
  const [batch, setBatch] = useState('')
  const [biz, setBiz] = useState('')
  const [approval, setApproval] = useState('')
  const [issueStart, setIssueStart] = useState('2026-10-01')
  const [issueEnd, setIssueEnd] = useState('2026-10-08')
  const [viewStart, setViewStart] = useState('')
  const [viewEnd, setViewEnd] = useState('')
  const [advanced, setAdvanced] = useState(false)
  const [applied, setApplied] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [toast, setToast] = useState('')
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [columnsOpen, setColumnsOpen] = useState(false)
  const [visible, setVisible] = useState<string[]>(BENEFIT_FIELDS.map((item) => item.id))
  const [draft, setDraft] = useState<string[]>(BENEFIT_FIELDS.map((item) => item.id))

  const fields = tab === 'benefit' ? BENEFIT_FIELDS : FUND_FIELDS
  const rows = tab === 'benefit' ? benefitRows : fundRows
  const issueOptions = tab === 'benefit' ? ['已发放'] : ['已查看', '已失效']
  const secondOptions = tab === 'benefit' ? ['已使用', '未使用'] : ['已到账', '未到账']
  const secondKey = tab === 'benefit' ? 'useStatus' : 'arriveStatus'
  const issuePlaceholder = '请选择发放状态'
  const secondPlaceholder = tab === 'benefit' ? '请选择使用状态' : '请选择到账状态'

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      if (phone && !row.phone.includes(phone)) return false
      if (issue && row.issueStatus !== issue) return false
      if (second && row[secondKey] !== second) return false
      if (coupon && !row.couponNo.includes(coupon)) return false
      if (!inRange(row.issueAt, issueStart, issueEnd)) return false
      if (merchant && !row.merchant.includes(merchant)) return false
      if (!inRange(row.viewAt, viewStart, viewEnd)) return false
      if (batch && !row.batchNo.includes(batch)) return false
      if (biz && row.bizType !== biz) return false
      if (approval && !row.approvalNo.includes(approval)) return false
      return true
    })
  }, [rows, phone, issue, second, coupon, issueStart, issueEnd, merchant, viewStart, viewEnd, batch, biz, approval, secondKey, applied])

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, pages)
  const pageRows = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const shown = fields.filter((field) => visible.includes(field.id))

  const showToast = (text: string) => {
    setToast(text)
    window.setTimeout(() => setToast((prev) => (prev === text ? '' : prev)), 1600)
  }

  const switchTab = (next: TabKey) => {
    setTab(next)
    setIssue('')
    setSecond('')
    setPage(1)
    const nextFields = next === 'benefit' ? BENEFIT_FIELDS : FUND_FIELDS
    setVisible(nextFields.map((item) => item.id))
  }

  const reset = () => {
    setPhone('')
    setIssue('')
    setSecond('')
    setCoupon('')
    setMerchant('')
    setBatch('')
    setBiz('')
    setApproval('')
    setIssueStart('2026-10-01')
    setIssueEnd('2026-10-08')
    setViewStart('')
    setViewEnd('')
    setPage(1)
    setApplied((n) => n + 1)
  }

  const revokeState = (row: DetailRow) => {
    if (!WHITELIST.has(row.merchant)) return 'hidden'
    if (row.revoked) return 'revoked'
    if (row.issueStatus === '已失效') return 'expired'
    if (row.withdrawn) return 'withdrawn'
    return 'ok'
  }

  const clickRevoke = (row: DetailRow) => {
    const state = revokeState(row)
    if (state === 'revoked') return showToast('已撤回，不可再撤回')
    if (state === 'expired') return showToast('已失效，不可撤回')
    if (state === 'withdrawn') return showToast('用户已提现，不可撤回')
    if (state === 'ok') setPendingId(row.id)
  }

  const confirmRevoke = () => {
    if (!pendingId) return
    if (tab === 'benefit') {
      setBenefitRows((prev) => prev.map((row) => (row.id === pendingId ? { ...row, revoked: true } : row)))
    } else {
      setFundRows((prev) => prev.map((row) => (row.id === pendingId ? { ...row, revoked: true } : row)))
    }
    setPendingId(null)
    showToast('撤回成功')
  }

  const cell = (id: string, row: DetailRow) => {
    if (id === 'issueStatus' || id === 'useStatus' || id === 'arriveStatus') {
      return <StatusCell text={row[id]} />
    }
    if (id === 'issueAt' || id === 'viewAt') return <DateCell value={row[id]} />
    const value = row[id as keyof DetailRow]
    if (!value) return <span className="dc-dash">-</span>
    if (id === 'couponName') return <div className="dc-name">{String(value)}</div>
    return <span>{String(value)}</span>
  }

  return (
    <>
      <div className="dc-crumb">
        <span>数据中心</span>
        <em>/</em>
        <strong>明细数据</strong>
      </div>
      <div className="dc-card">
      <div className="admin-tabs dc-tabs">
        <button className={tab === 'benefit' ? 'on' : ''} type="button" onClick={() => switchTab('benefit')}>
          权益
        </button>
        <button className={tab === 'fund' ? 'on' : ''} type="button" onClick={() => switchTab('fund')}>
          通用金
        </button>
      </div>

      <div className={advanced ? 'dc-filters is-advanced' : 'dc-filters'}>
        <label className="appr-field dc-search">
          <input value={phone} placeholder="请输入用户手机号" onChange={(event) => setPhone(event.target.value)} />
          <SearchIcon />
        </label>
        <label className="dc-select">
          <select className={issue ? '' : 'is-placeholder'} value={issue} onChange={(event) => setIssue(event.target.value)}>
            <option value="">{issuePlaceholder}</option>
            {issueOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="dc-select">
          <select className={second ? '' : 'is-placeholder'} value={second} onChange={(event) => setSecond(event.target.value)}>
            <option value="">{secondPlaceholder}</option>
            {secondOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="appr-field dc-search">
          <input value={coupon} placeholder="请输入卡券编号" onChange={(event) => setCoupon(event.target.value)} />
          <SearchIcon />
        </label>
        <label className="dc-range">
          <span>{formatRange(issueStart, issueEnd) || '开始日期 - 结束日期'}</span>
          <input type="date" value={issueStart} onChange={(event) => setIssueStart(event.target.value)} />
          <input type="date" value={issueEnd} onChange={(event) => setIssueEnd(event.target.value)} />
          <CalendarIcon />
        </label>
        {advanced ? (
          <>
            <label className="appr-field dc-search">
              <input value={merchant} placeholder="请输入商户" onChange={(event) => setMerchant(event.target.value)} />
              <SearchIcon />
            </label>
            <label className="dc-range">
              <span>{formatRange(viewStart, viewEnd) || '查看起始日期 - 结束日期'}</span>
              <input type="date" value={viewStart} onChange={(event) => setViewStart(event.target.value)} />
              <input type="date" value={viewEnd} onChange={(event) => setViewEnd(event.target.value)} />
              <CalendarIcon />
            </label>
            <label className="appr-field dc-search">
              <input value={batch} placeholder="请输入发放批次号" onChange={(event) => setBatch(event.target.value)} />
              <SearchIcon />
            </label>
            <label className="dc-select">
              <select className={biz ? '' : 'is-placeholder'} value={biz} onChange={(event) => setBiz(event.target.value)}>
                <option value="">请选择业务类型</option>
                <option value="其他">其他</option>
              </select>
            </label>
            <label className="appr-field dc-search">
              <input value={approval} placeholder="请输入审批单号" onChange={(event) => setApproval(event.target.value)} />
              <SearchIcon />
            </label>
          </>
        ) : null}
        <div className="dc-filter-actions">
          <button className="admin-primary dc-query" type="button" onClick={() => { setPage(1); setApplied((n) => n + 1) }}>
            查询
          </button>
          <button className="admin-outline" type="button" onClick={reset}>
            重置
          </button>
          <button className="dc-advanced" type="button" onClick={() => setAdvanced((on) => !on)}>
            {advanced ? '普通筛选' : '高级筛选'}
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
              <path d={advanced ? 'M2 6.5 5 3.5 8 6.5' : 'M2 3.5 5 6.5 8 3.5'} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      <div className="dc-toolbar">
        <p>提示：若页面查询时间较长，可通过筛选时间范围、业务类型等维度控制数据量，以提高查询效率。</p>
        <div>
          <button className="dc-tool-btn" type="button" onClick={() => showToast('已开始导出')}>
            导出
          </button>
          <button
            className="dc-tool-btn"
            type="button"
            onClick={() => {
              setDraft(visible)
              setColumnsOpen(true)
            }}
          >
            设置可见字段
          </button>
        </div>
      </div>

      <div className="dc-table-wrap">
        <table className="admin-table dc-table">
          <thead>
            <tr>
              {shown.map((field) => (
                <th key={field.id}>{field.label}</th>
              ))}
              <th className="dc-sticky">操作</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={shown.length + 1}>
                  <div className="empty-panel">暂无数据</div>
                </td>
              </tr>
            ) : (
              pageRows.map((row) => {
                const state = revokeState(row)
                return (
                  <tr key={row.id}>
                    {shown.map((field) => (
                      <td key={field.id}>{cell(field.id, row)}</td>
                    ))}
                    <td className="dc-sticky">
                      <div className="dc-ops">
                        <button type="button" onClick={() => showToast('备注')}>
                          备注
                        </button>
                        {state === 'hidden' ? null : (
                          <button className={state === 'ok' ? '' : 'is-blocked'} type="button" onClick={() => clickRevoke(row)}>
                            撤回
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="dc-pager">
        <span>共 {filtered.length} 条</span>
        <select
          value={pageSize}
          onChange={(event) => {
            setPageSize(Number(event.target.value))
            setPage(1)
          }}
        >
          <option value={10}>10条/页</option>
          <option value={20}>20条/页</option>
          <option value={50}>50条/页</option>
        </select>
        <button type="button" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>
          ‹
        </button>
        <em>{currentPage}</em>
        <button type="button" disabled={currentPage === pages} onClick={() => setPage(currentPage + 1)}>
          ›
        </button>
      </div>
      </div>

      {pendingId ? (
        <div className="admin-mask" onClick={() => setPendingId(null)}>
          <div className="admin-modal dc-confirm" onClick={(event) => event.stopPropagation()}>
            <div className="dc-confirm-body">
              <i />
              <p>
                你正在撤回对应所选记录，撤回后对应卡券/商品将不再可用，并会退款给商户。
                <br />
                确定继续？
              </p>
            </div>
            <div className="modal-actions">
              <button className="admin-ghost" type="button" onClick={() => setPendingId(null)}>
                关闭
              </button>
              <button className="admin-primary" type="button" onClick={confirmRevoke}>
                确定
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {columnsOpen ? (
        <div className="admin-mask" onClick={() => setColumnsOpen(false)}>
          <div className="admin-modal dc-columns" onClick={(event) => event.stopPropagation()}>
            <div className="pick-head">
              <h2>设置可见字段</h2>
              <button className="appr-link" type="button" onClick={() => setDraft([])}>
                取消全选
              </button>
            </div>
            {['基本数据', '发放数据'].map((group) => (
              <div key={group} className="dc-col-group">
                <strong>{group}</strong>
                <div>
                  {fields
                    .filter((field) => field.group === group)
                    .map((field) => (
                      <label key={field.id}>
                        <span className={draft.includes(field.id) ? 'appr-box on' : 'appr-box'} />
                        <input
                          type="checkbox"
                          checked={draft.includes(field.id)}
                          onChange={() =>
                            setDraft((prev) => (prev.includes(field.id) ? prev.filter((id) => id !== field.id) : [...prev, field.id]))
                          }
                        />
                        {field.label}
                      </label>
                    ))}
                </div>
              </div>
            ))}
            <div className="modal-actions">
              <button className="admin-ghost" type="button" onClick={() => setColumnsOpen(false)}>
                返回
              </button>
              <button
                className="admin-primary"
                type="button"
                onClick={() => {
                  if (!draft.length) {
                    showToast('请至少保留一个字段')
                    return
                  }
                  setVisible(fields.map((field) => field.id).filter((id) => draft.includes(id)))
                  setColumnsOpen(false)
                }}
              >
                确定
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {toast ? <div className="dc-toast">{toast}</div> : null}
    </>
  )
}
