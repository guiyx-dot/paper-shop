import { useEffect, useState } from 'react'

export type ShopGood = {
  id: string
  name: string
  price: string
  categoryId: string
  origin?: string
  drop?: string
  spec?: string
  detail?: string
  image?: string
  tags: string[]
  tone: string
  onShelf: boolean
}

export type ShopCategory = {
  id: string
  name: string
  sort: number
}

export type HomeSlot = {
  id: string
  positionId: string
  image: string
  goodIds: string[]
  enabled: boolean
}

export type HomeBanner = {
  id: string
  title: string
  subtitle: string
  image: string
  place: string
  positionId: string
  enabled: boolean
  createdAt: string
}

export type ShopShelf = {
  id: string
  title: string
  group: '频道' | '板块'
  kind: 'goods' | 'channels'
  blurb: string
  goodIds: string[]
}

export type MallConfig = {
  goods: ShopGood[]
  shelves: ShopShelf[]
  categories: ShopCategory[]
  slots: HomeSlot[]
  banners: HomeBanner[]
}

const tones = ['#fff1e6', '#eef4ff', '#eefaf3', '#fff1f6', '#f6f3ee', '#fff6ec']

function good(
  id: string,
  name: string,
  price: string,
  extra: Partial<ShopGood> = {},
  tone = tones[0],
): ShopGood {
  return { tags: [], onShelf: true, tone, categoryId: extra.categoryId ?? 'c-home', ...extra, id, name, price }
}

export const DEFAULT_CATEGORIES: ShopCategory[] = [
  { id: 'c-audio', name: '视听会员', sort: 1 },
  { id: 'c-food', name: '粮油干货', sort: 2 },
  { id: 'c-snack', name: '休闲零食', sort: 3 },
  { id: 'c-care', name: '个护清洁', sort: 4 },
  { id: 'c-fresh', name: '生鲜水果', sort: 5 },
  { id: 'c-home', name: '日用家居', sort: 6 },
]

export const DEFAULT_GOODS: ShopGood[] = [
  good('ejiao', '【张太和】阿胶糕 60g*6盒', '178.18', { categoryId: 'c-home', tags: ['包邮', '省心购'] }, tones[0]),
  good('eye', '【倍轻松】眼部按摩器 EM002', '456.36', { categoryId: 'c-home', tags: ['包邮', '省心购'] }, tones[1]),
  good('paw', '【伟易达】汪汪队立大功救援套装', '198.99', { categoryId: 'c-home', tags: ['包邮', '省心购'] }, tones[2]),
  good('wood', '【乡村振兴】山真美椴木细木耳 200g', '54.99', { categoryId: 'c-food', tags: ['包邮', '省心购'] }, tones[3]),
  good('oil', '【刀唛】压榨花生油 5L', '169.89', { categoryId: 'c-food', tags: ['包邮', '省心购'] }, tones[4]),
  good('mushroom', '【神农唛】精选猴头菇 180g', '42', { categoryId: 'c-food', tags: ['包邮'] }, tones[5]),
  good('morel', '【神农唛】精选羊肚菌 100g', '218', { categoryId: 'c-food', tags: ['包邮'] }, tones[0]),
  good('crisp', '【雅觅】原味晶沙酥 360g', '57.99', { categoryId: 'c-snack', tags: ['包邮', '省心购'] }, tones[1]),
  good('datecake', '【雅觅】元气蜂蜜枣糕 1000g', '59.79', { categoryId: 'c-snack', tags: ['包邮', '省心购'] }, tones[2]),
  good('pullcake', '【雅觅】拔丝蛋糕 500g', '33.89', { categoryId: 'c-snack', tags: ['包邮', '省心购'] }, tones[3]),
  good('pastry', '【雅觅】蝴蝶酥 210g', '39.89', { categoryId: 'c-snack', tags: ['包邮', '省心购'] }, tones[4]),
  good('tide', '【碧浪】云感内衣洗衣液泡沫 200g', '29.49', { categoryId: 'c-care', tags: ['包邮', '省心购'] }, tones[5]),
  good('beads', '【蔬果园】幸福四叶草香氛洗衣凝珠', '58.89~119', { categoryId: 'c-care', tags: ['包邮', '省心购'] }, tones[0]),
  good('jurlique', '【茱莉蔻】玫瑰柔肤沐浴露 300ml', '219.99', { categoryId: 'c-care', tags: ['包邮', '省心购'] }, tones[1]),
  good('rooster', '【大公鸡管家】厨房清洁剂', '37.27', { categoryId: 'c-care', tags: ['包邮', '省心购'] }, tones[2]),
  good('iqiyi', '爱奇艺年卡', '377.5', { categoryId: 'c-audio', drop: '直降240.5点', tags: ['视听'] }, tones[2]),
  good('tencent', '腾讯视频年卡', '379', { categoryId: 'c-audio', drop: '直降109点', tags: ['视听'] }, tones[1]),
  good('birthday', '生日蛋糕', '234.1', { categoryId: 'c-snack', drop: '直降14.9点', tags: ['蛋糕'] }, tones[3]),
  good('apple', '大凉山盐源丑苹果', '41.5', { categoryId: 'c-fresh', origin: '45.8', spec: '4.5斤（70-75mm）', tags: ['包邮'] }, tones[0]),
  good('scrub', '安野屋磨砂膏', '72', { categoryId: 'c-care', origin: '85', tags: ['特价'] }, tones[4]),
  good('sausage', '香肠', '40', { categoryId: 'c-snack', tags: ['买手'] }, tones[5]),
  good('seat', '座椅', '880', { categoryId: 'c-home', tags: ['买手'] }, tones[1]),
  good('lotion', '身体乳', '74.9', { categoryId: 'c-care', tags: ['新品'] }, tones[3]),
]

const carefulIds = DEFAULT_GOODS.filter((item) => item.tags.includes('省心购')).map((item) => item.id)

export const DEFAULT_SHELVES: ShopShelf[] = [
  { id: 'jd', title: '京东优购', group: '频道', kind: 'goods', blurb: '京东优购在售商品', goodIds: ['ejiao', 'eye', 'paw', 'wood', 'oil'] },
  { id: 'ceo', title: 'CEO星推荐', group: '频道', kind: 'goods', blurb: 'CEO 本周推荐', goodIds: ['apple'] },
  { id: 'subsidy', title: '多多补贴', group: '频道', kind: 'goods', blurb: '补贴进行中的商品', goodIds: ['iqiyi', 'tencent', 'birthday', 'ejiao'] },
  { id: 'select', title: '多多优选', group: '频道', kind: 'goods', blurb: '优选零食', goodIds: ['crisp', 'datecake', 'pullcake', 'pastry'] },
  { id: 'video', title: '视听会员', group: '频道', kind: 'goods', blurb: '视听会员 5 折起', goodIds: ['iqiyi', 'tencent'] },
  { id: 'tmall', title: '天猫优购', group: '频道', kind: 'goods', blurb: '天猫优购在售商品', goodIds: ['tide', 'beads', 'jurlique', 'rooster'] },
  { id: 'netease', title: '网易严选', group: '频道', kind: 'goods', blurb: '网易严选在售商品', goodIds: ['scrub', 'lotion'] },
  { id: 'cake', title: '生日蛋糕', group: '频道', kind: 'goods', blurb: '蛋糕补贴商品', goodIds: ['birthday'] },
  { id: 'film', title: '多多影视', group: '频道', kind: 'goods', blurb: '影视会员', goodIds: ['iqiyi', 'tencent'] },
  { id: 'more', title: '更多频道', group: '频道', kind: 'channels', blurb: '全部频道', goodIds: [] },
  { id: 'video-sub', title: '视听补贴', group: '板块', kind: 'goods', blurb: '补贴 50 款+', goodIds: ['iqiyi', 'tencent'] },
  { id: 'cake-sub', title: '蛋糕补贴', group: '板块', kind: 'goods', blurb: '补贴 100 款+', goodIds: ['birthday'] },
  { id: 'daily', title: '每日特价', group: '板块', kind: 'goods', blurb: '今日特价', goodIds: ['scrub'] },
  { id: 'buyer', title: '买手推荐', group: '板块', kind: 'goods', blurb: '用心精选', goodIds: ['sausage', 'seat'] },
  { id: 'fresh', title: '新品首发', group: '板块', kind: 'goods', blurb: '每日上新', goodIds: ['lotion'] },
  { id: 'careful', title: '一站省心购', group: '板块', kind: 'goods', blurb: '提前比对商品，优选划算好物', goodIds: carefulIds },
]

export const HOME_AREAS = [
  {
    id: 'channel',
    name: '频道',
    positions: [
      { id: 'jd', name: '京东优购' },
      { id: 'subsidy', name: '多多补贴' },
      { id: 'select', name: '多多优选' },
      { id: 'video', name: '视听会员' },
      { id: 'tmall', name: '天猫优购' },
      { id: 'netease', name: '网易严选' },
      { id: 'cake', name: '生日蛋糕' },
      { id: 'film', name: '多多影视' },
      { id: 'more', name: '更多频道' },
    ],
  },
  {
    id: 'ceo-zone',
    name: 'CEO星推荐',
    positions: [{ id: 'ceo', name: 'CEO星推荐' }],
  },
  {
    id: 'subsidy-zone',
    name: '补贴专区',
    positions: [
      { id: 'video-sub', name: '视听补贴' },
      { id: 'cake-sub', name: '蛋糕补贴' },
    ],
  },
  {
    id: 'picks',
    name: '精选推荐',
    positions: [
      { id: 'daily', name: '每日特价' },
      { id: 'buyer', name: '买手推荐' },
      { id: 'fresh', name: '新品首发' },
    ],
  },
]

export const BANNER_PLACES = [
  { id: 'hero', name: '首页顶部' },
  { id: 'careful', name: '一站省心购' },
]

export const HOME_POSITIONS = HOME_AREAS.flatMap((area) =>
  area.positions.map((item) => ({ ...item, areaId: area.id, areaName: area.name })),
)

export const HOME_BLOCKS = [
  { name: '顶部横幅', content: '视听会员 5折起', jump: '视听会员' },
  { name: '积分条', content: '当前会员积分 7500', jump: '积分账户' },
  { name: '频道', content: '京东优购到更多频道', jump: '对应频道货架' },
  { name: '积分权益专区', content: '进入权益列表', jump: '权益专区' },
  { name: '视听补贴', content: '爱奇艺年卡、腾讯视频年卡', jump: '视听补贴' },
  { name: '蛋糕补贴', content: '生日蛋糕', jump: '蛋糕补贴' },
  { name: 'CEO星推荐', content: '大凉山盐源丑苹果', jump: 'CEO星推荐' },
  { name: '每日特价', content: '安野屋磨砂膏', jump: '每日特价' },
  { name: '买手推荐', content: '香肠、座椅', jump: '买手推荐' },
  { name: '新品首发', content: '身体乳', jump: '新品首发' },
  { name: '底部商品', content: '按类目管理的一级类目展示在售商品', jump: '对应商品详情' },
]

const KEY = 'paper-shop-mall-config-v2'

function cloneGood(item: ShopGood): ShopGood {
  return { ...item, tags: [...item.tags] }
}

function defaultSlots(): HomeSlot[] {
  return HOME_POSITIONS.map((item) => {
    const shelf = DEFAULT_SHELVES.find((row) => row.id === item.id)
    return {
      id: `slot-${item.id}`,
      positionId: item.id,
      image: '',
      goodIds: [...(shelf?.goodIds ?? [])],
      enabled: true,
    }
  })
}

function isBannerJump(id: string) {
  return id === 'careful' || HOME_POSITIONS.some((position) => position.id === id)
}

export function bannerPlaceName(place: string) {
  return BANNER_PLACES.find((item) => item.id === place)?.name ?? '首页顶部'
}

export function jumpName(id: string) {
  if (!id) return '—'
  if (id === 'careful') return '一站省心购'
  return positionName(id)
}

function carefulBanner(): HomeBanner {
  return {
    id: 'banner-careful',
    title: '一站省心购',
    subtitle: '提前比对商品，优选划算好物',
    image: '',
    place: 'careful',
    positionId: 'careful',
    enabled: true,
    createdAt: '2026-10-20 10:01',
  }
}

function defaultBanners(): HomeBanner[] {
  return [
    {
      id: 'banner-hero',
      title: '视听会员',
      subtitle: '5折起',
      image: '',
      place: 'hero',
      positionId: 'video',
      enabled: true,
      createdAt: '2026-10-20 10:00',
    },
    carefulBanner(),
  ]
}

function cloneConfig(): MallConfig {
  return {
    goods: DEFAULT_GOODS.map(cloneGood),
    shelves: DEFAULT_SHELVES.map((item) => ({ ...item, goodIds: [...item.goodIds] })),
    categories: DEFAULT_CATEGORIES.map((item) => ({ ...item })),
    slots: defaultSlots(),
    banners: defaultBanners(),
  }
}

function asGood(raw: unknown): ShopGood | null {
  if (!raw || typeof raw !== 'object') return null
  const item = raw as ShopGood
  if (!item.id || !item.name) return null
  const base = DEFAULT_GOODS.find((row) => row.id === item.id)
  return {
    ...(base ? cloneGood(base) : { tags: [], onShelf: true, tone: tones[0], categoryId: 'c-home', price: '', id: item.id, name: item.name }),
    ...item,
    tags: Array.isArray(item.tags) ? item.tags.filter((tag) => typeof tag === 'string') : base?.tags ?? [],
    onShelf: item.onShelf !== false,
    price: typeof item.price === 'string' && item.price.trim() ? item.price : base?.price ?? '',
    categoryId: item.categoryId || base?.categoryId || 'c-home',
    image: typeof item.image === 'string' ? item.image : base?.image,
  }
}

export function areaOf(positionId: string) {
  return HOME_AREAS.find((area) => area.positions.some((item) => item.id === positionId))
}

export function positionName(id: string) {
  const area = areaOf(id)
  const child = area?.positions.find((item) => item.id === id)
  if (!area || !child) return id
  if (child.name === area.name) return area.name
  return `${area.name} / ${child.name}`
}

export function applySlots(config: MallConfig, slots: HomeSlot[]): MallConfig {
  const shelves = config.shelves.map((shelf) => {
    if (!HOME_POSITIONS.some((item) => item.id === shelf.id)) return shelf
    const related = slots.filter((item) => item.positionId === shelf.id && item.enabled)
    const goodIds = [...new Set(related.flatMap((item) => item.goodIds))]
    return { ...shelf, goodIds }
  })
  return { ...config, slots, shelves }
}

export function loadMallConfig(): MallConfig {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return cloneConfig()
    const parsed = JSON.parse(raw) as MallConfig
    if (!Array.isArray(parsed.goods) || !Array.isArray(parsed.categories) || !Array.isArray(parsed.slots)) return cloneConfig()
    const goods = parsed.goods.map(asGood).filter((item): item is ShopGood => Boolean(item))
    const categories = parsed.categories
      .filter((item) => item && item.id && item.name)
      .map((item) => ({ id: item.id, name: item.name, sort: Number(item.sort) || 0 }))
    const slots = parsed.slots
      .filter((item) => item && item.id && HOME_POSITIONS.some((position) => position.id === item.positionId))
      .map((item) => ({
        id: item.id,
        positionId: item.positionId,
        image: typeof item.image === 'string' ? item.image : '',
        goodIds: Array.isArray(item.goodIds) ? item.goodIds.filter((id) => goods.some((good) => good.id === id)) : [],
        enabled: item.enabled !== false,
      }))
    const shelves = DEFAULT_SHELVES.map((item) => {
      const saved = parsed.shelves?.find((row) => row.id === item.id)
      return { ...item, goodIds: [...item.goodIds], blurb: saved?.blurb?.trim() || item.blurb }
    })
    const storedBanners = Array.isArray(parsed.banners) ? parsed.banners : null
    const banners = storedBanners
      ? storedBanners
          .filter((item) => item && item.id && item.title)
          .map((item) => ({
            id: item.id,
            title: item.title,
            subtitle: typeof item.subtitle === 'string' ? item.subtitle : '',
            image: typeof item.image === 'string' ? item.image : '',
            place: item.place === 'careful' ? 'careful' : 'hero',
            positionId: isBannerJump(item.positionId) ? item.positionId : '',
            enabled: item.enabled !== false,
            createdAt: typeof item.createdAt === 'string' ? item.createdAt : '',
          }))
      : defaultBanners()
    if (storedBanners && storedBanners.every((item) => !item?.place) && !banners.some((item) => item.place === 'careful')) {
      banners.push(carefulBanner())
    }
    return applySlots({ goods, categories, slots, shelves, banners }, slots)
  } catch {
    return cloneConfig()
  }
}

export function saveMallConfig(next: MallConfig) {
  sessionStorage.setItem(KEY, JSON.stringify(next))
  window.dispatchEvent(new Event('paper-shop-mall-config'))
}

export function useMallConfig() {
  const [config, setConfig] = useState(loadMallConfig)
  useEffect(() => {
    const sync = () => setConfig(loadMallConfig())
    window.addEventListener('paper-shop-mall-config', sync)
    return () => window.removeEventListener('paper-shop-mall-config', sync)
  }, [])
  return config
}

export function productIdByName(name: string) {
  return DEFAULT_GOODS.find((item) => item.name === name)?.id
}

export function pointCost(price: string) {
  const value = Number(price.split('~')[0])
  return Number.isFinite(value) ? value : 0
}

export function shelfTitle(id: string) {
  return DEFAULT_SHELVES.find((item) => item.id === id)?.title ?? id
}
