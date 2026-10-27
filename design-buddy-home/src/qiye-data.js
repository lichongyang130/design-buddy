export const QIYE_KEY = 'design-buddy-qiye-v1'
export const destinations = [
  {
    id: 'mountain',
    name: '青岚山谷',
    region: '山野 · 杭州周边',
    tag: '山野露营',
    image: 'mountain',
    gallery: ['mountain', 'forest', 'lake'],
    distance: '约 2 小时',
    budget: 480,
    days: 2,
    description:
      '沿着山间的小路慢慢走，等一场日落，也等心安静下来。把消息调成静音，这个周末只听风经过树梢。',
    highlights: ['在山脊等一场日落', '林间营地的手冲咖啡', '没有闹钟的清晨'],
    schedule: ['午后抵达 · 林间轻徒步', '傍晚 · 营地野餐与日落', '次日清晨 · 山谷散步'],
    kind: '轻徒步',
    season: '秋日推荐',
  },
  {
    id: 'coast',
    name: '白沙海岸',
    region: '海岸 · 浙东灵感',
    tag: '海边漫步',
    image: 'coast',
    gallery: ['coast', 'lake', 'town'],
    distance: '约 3 小时',
    budget: 620,
    days: 2,
    description: '不必赶着去某个景点。沿海岸线走一段，找一块被太阳晒暖的石头坐下，把今天交给潮汐。',
    highlights: ['沿着海岸线慢慢走', '在海边看落日', '小镇巷口的一顿晚餐'],
    schedule: ['午后 · 海岸步道', '傍晚 · 观景台看海', '次日上午 · 小镇早餐'],
    kind: '慢旅行',
    season: '追一场海风',
  },
  {
    id: 'town',
    name: '南溪古镇',
    region: '古镇 · 江南灵感',
    tag: '古镇闲逛',
    image: 'town',
    gallery: ['town', 'lake', 'forest'],
    distance: '约 1.5 小时',
    budget: 320,
    days: 1,
    description: '石板路、白墙和窄窄的河道。走进清晨还没热闹起来的小巷，在临水的窗边坐一会儿。',
    highlights: ['清晨水巷散步', '老街里的独立小店', '临河茶馆的午后'],
    schedule: ['上午 · 石桥与水巷', '午后 · 茶馆与小店', '傍晚 · 河边散步返程'],
    kind: '慢旅行',
    season: '一日小出走',
  },
  {
    id: 'forest',
    name: '隐竹小屋',
    region: '林居 · 山间灵感',
    tag: '林间小住',
    image: 'forest',
    gallery: ['forest', 'mountain', 'lake'],
    distance: '约 2.5 小时',
    budget: 780,
    days: 2,
    description: '一间被竹林围住的小屋，一盏温暖的灯。把行程留白，在露台读完一本没读完的书。',
    highlights: ['竹林环抱的木屋', '露台阅读与手冲', '清晨跟着鸟鸣醒来'],
    schedule: ['下午 · 入住与林间散步', '夜晚 · 露台阅读', '次日 · 慢早餐后返程'],
    kind: '放空休息',
    season: '住进自然里',
  },
  {
    id: 'lake',
    name: '栖霞湖畔',
    region: '湖泊 · 近郊灵感',
    tag: '湖畔放空',
    image: 'lake',
    gallery: ['lake', 'coast', 'mountain'],
    distance: '约 1 小时',
    budget: 260,
    days: 1,
    description: '带一把椅子，坐在湖边。看晨雾缓缓散开，等倒影被风吹皱，什么都不做也很好。',
    highlights: ['湖边野餐与阅读', '清晨的雾与倒影', '平缓的环湖散步'],
    schedule: ['清晨 · 栈道观雾', '午后 · 湖畔野餐', '下午 · 轻松返程'],
    kind: '放空休息',
    season: '离城市近一点',
  },
]
export const imageURL = (key) => `/art/qiye/${key}.webp`
export function initialQiyeState() {
  return {
    version: 1,
    saved: [],
    trips: [],
    activeTrip: null,
    name: '周末旅人',
    preferences: ['慢旅行'],
    compact: false,
  }
}
export function readQiyeState(storage) {
  try {
    const raw = JSON.parse(storage.getItem(QIYE_KEY))
    if (!raw || raw.version !== 1) return initialQiyeState()
    const valid = (id) => destinations.some((d) => d.id === id)
    const ids = new Set()
    const trips = (Array.isArray(raw.trips) ? raw.trips : [])
      .filter(
        (t) =>
          t &&
          typeof t.id === 'string' &&
          !ids.has(t.id) &&
          ids.add(t.id) &&
          typeof t.name === 'string',
      )
      .map((t) => ({
        id: t.id,
        name: t.name.slice(0, 40),
        days: Math.min(3, Math.max(1, Math.trunc(Number(t.days)) || 2)),
        items: (Array.isArray(t.items) ? t.items : [])
          .filter((x, i, a) => x && valid(x.id) && a.findIndex((y) => y?.id === x.id) === i)
          .map((x) => ({
            id: x.id,
            day: Math.min(
              Math.min(3, Math.max(1, Math.trunc(Number(t.days)) || 2)),
              Math.max(1, Math.trunc(Number(x.day)) || 1),
            ),
          })),
      }))
    return {
      version: 1,
      saved: [...new Set((Array.isArray(raw.saved) ? raw.saved : []).filter(valid))],
      trips,
      activeTrip: trips.some((t) => t.id === raw.activeTrip)
        ? raw.activeTrip
        : trips[0]?.id || null,
      name: typeof raw.name === 'string' ? raw.name.slice(0, 24) : '周末旅人',
      preferences: (Array.isArray(raw.preferences) ? raw.preferences : []).filter((x) =>
        ['慢旅行', '轻徒步', '放空休息'].includes(x),
      ),
      compact: raw.compact === true,
    }
  } catch {
    return initialQiyeState()
  }
}
export function filteredDestinations({ query = '', tag = '全部', duration = '全部' } = {}) {
  return destinations.filter(
    (d) =>
      (tag === '全部' || d.tag === tag) &&
      (duration === '全部' || d.days === Number(duration)) &&
      `${d.name} ${d.region} ${d.tag} ${d.description}`.includes(query.trim()),
  )
}
export function addToTrip(trip, id, day = 1) {
  if (!trip || !destinations.some((d) => d.id === id) || trip.items.some((i) => i.id === id))
    return false
  trip.items.push({ id, day: Math.min(trip.days, Math.max(1, Math.trunc(Number(day)) || 1)) })
  return true
}
export function moveTripItem(trip, id, direction) {
  const index = trip?.items.findIndex((x) => x.id === id) ?? -1
  if (index < 0) return false
  const same = trip.items
    .map((x, i) => (x.day === trip.items[index].day ? i : -1))
    .filter((i) => i >= 0)
  const next = same[same.indexOf(index) + direction]
  if (next === undefined) return false
  ;[trip.items[index], trip.items[next]] = [trip.items[next], trip.items[index]]
  return true
}
