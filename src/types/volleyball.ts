// Амплуа игрока в системе 5-1
export type PlayerRole = 'setter' | 'outside' | 'middle' | 'opposite' | 'libero'

// Конкретные игроки команды: по два доигровщика и центральных
export type PlayerId = 'S' | 'OH1' | 'MB1' | 'OPP' | 'OH2' | 'MB2' | 'L'

// Номер выхода (ротации) = зона, в которой стоит связующий.
// Выходы сменяются по ходу игры: 1 → 6 → 5 → 4 → 3 → 2
export type Rotation = 1 | 2 | 3 | 4 | 5 | 6

export type Phase = 'base' | 'receive' | 'attack' | 'defense'

// С чего начался розыгрыш: с нашей подачи или с приёма подачи соперника.
// От этого зависит расстановка в атаке и защите: делают ли игроки передней линии переход.
export type RallyStart = 'serve' | 'receive'

// Точка на своей половине площадки, в метрах
export interface Point {
  x: number
  y: number
}

export interface PlayerInfo {
  role: PlayerRole
  label: string
  name: string
  nameEn: string
}

// Участок зоны ответственности игрока: прямоугольник на площадке в метрах
export interface ResponsibilityZone {
  x: number
  y: number
  width: number
  height: number
  // Почему этот участок за игроком: текст для подсказки
  reason: string
}

export interface PhaseLayout {
  // Кто из семерых сейчас за площадкой
  bench: PlayerId
  positions: Record<PlayerId, Point>
  // Зоны ответственности из одного или нескольких участков; у кого зоны нет, тот ничего не подсвечивает
  zones?: Partial<Record<PlayerId, ResponsibilityZone[]>>
  // Атака: куда нападающий разбегается на удар; на площадке рисуется стрелкой от игрока
  attacks?: Partial<Record<PlayerId, Point>>
}

// Зона соперника, из которой он атакует, по его протоколу: его зона 4 — напротив нашей зоны 2
export type OpponentZone = 2 | 3 | 4

// Защита: своя расстановка под атаку из каждой зоны соперника
export type DefenseLayouts = Record<OpponentZone, PhaseLayout>

// Атака или защита: одна расстановка, если начало розыгрыша на неё не влияет,
// иначе два варианта — с нашей подачи и с приёма
export type StartLayouts<T> = T | Record<RallyStart, T>

// Все расположения одного выхода
export interface RotationLayouts {
  base: PhaseLayout
  receive: PhaseLayout
  attack: StartLayouts<PhaseLayout>
  defense: StartLayouts<DefenseLayouts>
}

export interface Scheme {
  id: string
  name: string
  layouts: Record<Rotation, RotationLayouts>
}
