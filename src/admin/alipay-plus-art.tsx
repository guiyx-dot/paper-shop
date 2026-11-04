import { ALIPAY_MARK } from './alipay-coin-art'

export function AlipayPlusArt() {
  return (
    <svg className="coin-art" viewBox="0 0 176 235" role="img" aria-label="支付宝通用券Plus">
      <defs>
        <linearGradient id="alipay-plus-cream" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFBF6" />
          <stop offset="1" stopColor="#F6E0C2" />
        </linearGradient>
        <linearGradient id="alipay-plus-blue" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6A80C6" />
          <stop offset="0.45" stopColor="#445EAA" />
          <stop offset="1" stopColor="#2A3882" />
        </linearGradient>
        <linearGradient id="alipay-plus-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFE3A6" />
          <stop offset="0.45" stopColor="#F0B04A" />
          <stop offset="1" stopColor="#D8922A" />
        </linearGradient>
        <radialGradient id="alipay-plus-knob" cx="0.4" cy="0.32" r="0.75">
          <stop offset="0" stopColor="#FFF6DE" />
          <stop offset="0.45" stopColor="#F8C96A" />
          <stop offset="1" stopColor="#E09428" />
        </radialGradient>
        <clipPath id="alipay-plus-card">
          <rect width="176" height="235" rx="40" />
        </clipPath>
      </defs>
      <g clipPath="url(#alipay-plus-card)">
        <rect width="176" height="235" fill="url(#alipay-plus-blue)" />
        <path fill="url(#alipay-plus-cream)" d="M0 0h176v94c-28 8-52 38-88 42-36-4-60-34-88-42V0Z" />
        <path
          d="M0 96c28 8 52 38 88 42 36-4 60-34 88-42"
          fill="none"
          stroke="url(#alipay-plus-gold)"
          strokeWidth="10"
          strokeLinecap="butt"
        />
        <path
          d="M6 94c26 6 48 32 82 36 34-4 56-30 82-36"
          fill="none"
          stroke="#FFF1D0"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.7"
        />
        <circle cx="88" cy="112" r="18" fill="url(#alipay-plus-knob)" />
        <ellipse cx="82" cy="105" rx="7" ry="4.5" fill="#FFF9EE" opacity="0.85" />
        <text
          x="88"
          y="70"
          textAnchor="middle"
          fill="#A15C04"
          fontSize="36"
          fontWeight="700"
          fontFamily="Georgia, 'Iowan Old Style', 'Songti SC', serif"
        >
          Plus
        </text>
        <svg x="50" y="138" width="76" height="76" viewBox="0 0 24 24" aria-hidden>
          <defs>
            <mask id="alipay-plus-zhi">
              <rect width="24" height="24" fill="#fff" />
              <path fill="#000" d={ALIPAY_MARK} />
            </mask>
            <clipPath id="alipay-plus-zhi-clip">
              <rect x="1.4" y="1.2" width="21.2" height="21.6" />
            </clipPath>
          </defs>
          <rect width="24" height="24" fill="#F6E3C4" mask="url(#alipay-plus-zhi)" clipPath="url(#alipay-plus-zhi-clip)" />
        </svg>
      </g>
    </svg>
  )
}
