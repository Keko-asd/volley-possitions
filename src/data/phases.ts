import type {
  OpponentZone,
  Phase,
  PhaseLayout,
  RallyStart,
  Rotation,
  Scheme,
  StartLayouts,
} from '@/types/volleyball'

export interface PhaseInfo {
  id: Phase
  label: string
  // Что происходит на площадке, одной короткой фразой: показывается под карточками
  description: string
}

export interface RallyStartInfo {
  id: RallyStart
  label: string
}

export const PHASES: PhaseInfo[] = [
  {
    id: 'base',
    label: 'Расстановка',
    description: 'Порядок из протокола: кто в какой зоне стоит.',
  },
  {
    id: 'receive',
    label: 'Приём',
    description: 'Подаёт соперник: трое принимают, связующий у сетки.',
  },
  {
    id: 'attack',
    label: 'Атака',
    description: 'Мяч у нас: связующий у сетки, нападающие на разбеге.',
  },
  {
    id: 'defense',
    label: 'Защита',
    description: 'Мяч у соперника: блок у сетки, остальные в защите.',
  },
]

export const RALLY_STARTS: RallyStartInfo[] = [
  { id: 'serve', label: 'С нашей подачи' },
  { id: 'receive', label: 'С приёма' },
]

// Порядок, в котором соперник атакует в режиме «По очереди»
export const OPPONENT_ZONES: OpponentZone[] = [4, 3, 2]

// Два варианта узнаём по ключу: у расстановки и у защиты по зонам ключа serve нет
function hasVariants<T extends object>(layouts: StartLayouts<T>): layouts is Record<RallyStart, T> {
  return 'serve' in layouts
}

function pickStart<T extends object>(layouts: StartLayouts<T>, start: RallyStart): T {
  return hasVariants(layouts) ? layouts[start] : layouts
}

// От начала розыгрыша могут зависеть только атака и защита, и то не в каждом выходе
export function dependsOnStart(scheme: Scheme, rotation: Rotation, phase: Phase): boolean {
  if (phase === 'base' || phase === 'receive') {
    return false
  }

  const layouts = scheme.layouts[rotation]

  return phase === 'attack' ? hasVariants(layouts.attack) : hasVariants(layouts.defense)
}

export function getPhaseLayout(
  scheme: Scheme,
  rotation: Rotation,
  phase: Phase,
  start: RallyStart,
  opponentZone: OpponentZone,
): PhaseLayout {
  const layouts = scheme.layouts[rotation]

  if (phase === 'base' || phase === 'receive') {
    return layouts[phase]
  }

  if (phase === 'attack') {
    return pickStart(layouts.attack, start)
  }

  return pickStart(layouts.defense, start)[opponentZone]
}
