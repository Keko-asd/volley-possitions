import type { PlayerId, PlayerInfo } from '@/types/volleyball'

export const PLAYERS: Record<PlayerId, PlayerInfo> = {
  S: { role: 'setter', label: 'СВ', name: 'Связующий', nameEn: 'Setter' },
  OH1: { role: 'outside', label: 'Д1', name: 'Доигровщик 1', nameEn: 'Outside hitter' },
  MB1: { role: 'middle', label: 'Ц1', name: 'Центральный 1', nameEn: 'Middle blocker' },
  OPP: { role: 'opposite', label: 'ДИ', name: 'Диагональный', nameEn: 'Opposite hitter' },
  OH2: { role: 'outside', label: 'Д2', name: 'Доигровщик 2', nameEn: 'Outside hitter' },
  MB2: { role: 'middle', label: 'Ц2', name: 'Центральный 2', nameEn: 'Middle blocker' },
  L: { role: 'libero', label: 'ЛБ', name: 'Либеро', nameEn: 'Libero' },
}

export const PLAYER_IDS = Object.keys(PLAYERS) as PlayerId[]
