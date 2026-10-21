import type { PlayerId, Point, RotationLayouts } from '@/types/volleyball'

// Зона по протоколу: передняя линия 4 / 3 / 2, задняя 5 / 6 / 1
type CourtZone = 1 | 2 | 3 | 4 | 5 | 6

// Линия, которую игрок не должен пересекать своим центром в момент подачи соперника
export interface OverlapLine {
  // x — вертикальная линия, y — горизонтальная
  axis: 'x' | 'y'
  // Координата центра соседа, м
  value: number
  // С какой стороны от линии стоять нельзя: before — левее или ближе к сетке, after — правее или дальше
  forbidden: 'before' | 'after'
  // Чья это линия
  neighbor: PlayerId
  // Подсказка: за какую сторону линии нельзя заходить
  reason: string
}

const DIRECTIONS: Record<OverlapLine['axis'], Record<OverlapLine['forbidden'], string>> = {
  x: { before: 'левее этой линии', after: 'правее этой линии' },
  y: { before: 'ближе к сетке, чем эта линия', after: 'дальше от сетки, чем эта линия' },
}

interface ZoneNeighbors {
  left?: CourtZone
  right?: CourtZone
  // Игрок той же колонки из другой линии
  counterpart: CourtZone
  front: boolean
}

// Соседи по протоколу: игрок не левее левого соседа, не правее правого,
// задняя линия не ближе к сетке, чем игрок перед ней
const NEIGHBORS: Record<CourtZone, ZoneNeighbors> = {
  4: { right: 3, counterpart: 5, front: true },
  3: { left: 4, right: 2, counterpart: 6, front: true },
  2: { left: 3, counterpart: 1, front: true },
  5: { right: 6, counterpart: 4, front: false },
  6: { left: 5, right: 1, counterpart: 3, front: false },
  1: { left: 6, counterpart: 2, front: false },
}

// Зону определяем по расстановке из протокола. На приёме либеро стоит вместо
// игрока, ушедшего за площадку, и отвечает за его зону.
function getZones(layouts: RotationLayouts): Map<CourtZone, PlayerId> {
  const { base, receive } = layouts
  const zones = new Map<CourtZone, PlayerId>()

  for (const [id, { x, y }] of Object.entries(base.positions) as [PlayerId, Point][]) {
    if (id === base.bench) {
      continue
    }

    const column = x < 3 ? 0 : x < 6 ? 1 : 2
    const zone = (y < 4.5 ? [4, 3, 2] : [5, 6, 1])[column] as CourtZone

    zones.set(zone, id === receive.bench ? base.bench : id)
  }

  return zones
}

export function getOverlapLines(layouts: RotationLayouts, id: PlayerId): OverlapLine[] {
  const zones = getZones(layouts)
  const own = [...zones].find(([, player]) => player === id)?.[0]

  if (!own) {
    return []
  }

  const positions = layouts.receive.positions
  const { left, right, counterpart, front } = NEIGHBORS[own]
  const lines: OverlapLine[] = []

  const add = (
    zone: CourtZone | undefined,
    axis: OverlapLine['axis'],
    forbidden: OverlapLine['forbidden'],
  ) => {
    const neighbor = zone && zones.get(zone)

    if (zone && neighbor) {
      lines.push({
        axis,
        value: positions[neighbor][axis],
        forbidden,
        neighbor,
        reason:
          `Пока соперник не подал, нельзя заходить ${DIRECTIONS[axis][forbidden]}: ` +
          `она проходит через центр игрока из зоны ${zone}. ` +
          'Выход в закрашенную часть — ошибка расстановки.',
      })
    }
  }

  add(left, 'x', 'before')
  add(right, 'x', 'after')
  add(counterpart, 'y', front ? 'after' : 'before')

  return lines
}
