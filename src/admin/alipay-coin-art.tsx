export const ALIPAY_MARK =
  'M19.695 15.07c3.426 1.158 4.203 1.22 4.203 1.22V3.846c0-2.124-1.705-3.845-3.81-3.845H3.914C1.808.001.102 1.722.102 3.846v16.31c0 2.123 1.706 3.845 3.813 3.845h16.173c2.105 0 3.81-1.722 3.81-3.845v-.157s-6.19-2.602-9.315-4.119c-2.096 2.602-4.8 4.181-7.607 4.181-4.75 0-6.361-4.19-4.112-6.949.49-.602 1.324-1.175 2.617-1.497 2.025-.502 5.247.313 8.266 1.317a16.796 16.796 0 0 0 1.341-3.302H5.781v-.952h4.799V6.975H4.77v-.953h5.81V3.591s0-.409.411-.409h2.347v2.84h5.744v.951h-5.744v1.704h4.69a19.453 19.453 0 0 1-1.986 5.06c1.424.52 2.702 1.011 3.654 1.333m-13.81-2.032c-.596.06-1.71.325-2.321.869-1.83 1.608-.735 4.55 2.968 4.55 2.151 0 4.301-1.388 5.99-3.61-2.403-1.182-4.438-2.028-6.637-1.809'

const WECHAT_MARK =
  'M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.27-.027-.407-.03zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z'

function SealPacket({
  label,
  title,
  logo,
  evenodd = false,
  bodyTop,
  bodyBottom,
  seal,
  idPrefix,
}: {
  label: string
  title: string
  logo: string
  evenodd?: boolean
  bodyTop: string
  bodyBottom: string
  seal: string
  idPrefix: string
}) {
  const body = `${idPrefix}-body`
  const gold = `${idPrefix}-gold`
  return (
    <svg className="coin-art" viewBox="0 0 176 235" role="img" aria-label={label}>
      <defs>
        <linearGradient id={body} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={bodyTop} />
          <stop offset="1" stopColor={bodyBottom} />
        </linearGradient>
        <radialGradient id={gold} cx="0.38" cy="0.32" r="0.75">
          <stop offset="0" stopColor="#FFF6DE" />
          <stop offset="0.5" stopColor="#F8C96A" />
          <stop offset="1" stopColor="#E09428" />
        </radialGradient>
      </defs>
      <rect width="176" height="235" fill={`url(#${body})`} />
      <path fill="#FFF6E8" d="M0 0h176v84c-34 30-142 30-176 0V0Z" />
      <path d="M8 82c32 26 128 26 160 0" fill="none" stroke={`url(#${gold})`} strokeWidth="7" strokeLinecap="round" />
      <circle cx="88" cy="124" r="36" fill={`url(#${gold})`} />
      <circle cx="88" cy="124" r="28" fill={seal} />
      <circle cx="0" cy="168" r="12" fill="#fff" />
      <circle cx="176" cy="168" r="12" fill="#fff" />
      <g transform="translate(70 106) scale(1.5)">
        <path fill="#fff" fillRule={evenodd ? 'evenodd' : 'nonzero'} d={logo} />
      </g>
      <text x="88" y="198" textAnchor="middle" fill="#FFF6E0" fontSize="22" fontWeight="700" fontFamily="PingFang SC, Noto Sans SC, sans-serif">
        {title}
      </text>
    </svg>
  )
}

export function WechatCoinArt() {
  return (
    <SealPacket
      label="微信通用币"
      title="通用币"
      logo={WECHAT_MARK}
      evenodd
      bodyTop="#14C86A"
      bodyBottom="#047A3C"
      seal="#067A3A"
      idPrefix="wechat-coin"
    />
  )
}

export function AlipayCoinArt() {
  return (
    <SealPacket
      label="支付宝通用币"
      title="通用币"
      logo={ALIPAY_MARK}
      bodyTop="#2B86FF"
      bodyBottom="#0846B0"
      seal="#0B5ED7"
      idPrefix="alipay-coin"
    />
  )
}

export function WechatCouponArt() {
  return (
    <svg className="coin-art" viewBox="0 0 176 235" role="img" aria-label="微信立减金">
      <defs>
        <linearGradient id="wechat-cut-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1FCB6E" />
          <stop offset="1" stopColor="#059447" />
        </linearGradient>
        <linearGradient id="wechat-cut-flap" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0A9A52" />
          <stop offset="1" stopColor="#067A3A" />
        </linearGradient>
      </defs>
      <rect width="176" height="235" fill="url(#wechat-cut-body)" />
      <path fill="url(#wechat-cut-flap)" d="M0 0h176v62c-36 40-140 40-176 0V0Z" />
      <path d="M10 64c34 32 122 32 156 0" fill="none" stroke="#D9FFE8" strokeWidth="3" strokeLinecap="round" opacity="0.85" />
      <g transform="translate(58 108) scale(2.5)">
        <path fill="#fff" fillRule="evenodd" d={WECHAT_MARK} />
      </g>
      <text x="88" y="204" textAnchor="middle" fill="#fff" fontSize="22" fontWeight="700" fontFamily="PingFang SC, Noto Sans SC, sans-serif">
        立减金
      </text>
    </svg>
  )
}

export function AlipayCouponArt() {
  return (
    <svg className="coin-art" viewBox="0 0 176 235" role="img" aria-label="支付宝通用券">
      <defs>
        <linearGradient id="ali-coupon-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3C92FF" />
          <stop offset="1" stopColor="#0A4BB5" />
        </linearGradient>
        <linearGradient id="ali-coupon-flap" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0E5ED8" />
          <stop offset="1" stopColor="#083E9C" />
        </linearGradient>
        <linearGradient id="ali-coupon-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFE3A6" />
          <stop offset="1" stopColor="#E0A030" />
        </linearGradient>
      </defs>
      <rect width="176" height="235" fill="url(#ali-coupon-body)" />
      <path fill="url(#ali-coupon-flap)" d="M0 0h176v62c-36 40-140 40-176 0V0Z" />
      <path d="M10 64c34 32 122 32 156 0" fill="none" stroke="url(#ali-coupon-gold)" strokeWidth="4" strokeLinecap="round" />
      <rect x="12" y="12" width="152" height="211" rx="28" fill="none" stroke="url(#ali-coupon-gold)" strokeWidth="3" />
      <g transform="translate(64 112) scale(2)">
        <path fill="#fff" d={ALIPAY_MARK} />
      </g>
    </svg>
  )
}
