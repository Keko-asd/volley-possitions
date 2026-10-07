import {
  computed,
  onBeforeUnmount,
  reactive,
  ref,
  toValue,
  watch,
  type MaybeRefOrGetter,
} from 'vue'
import type { PhaseLayout, PlayerId } from '@/types/volleyball'

// Сколько ждём после ухода курсора с игрока: успеть дотянуться до его зоны
const HOVER_END_DELAY = 150

export interface ZoneTip {
  id: PlayerId
  index: number
  // Открыта кликом и не закрывается при уходе курсора
  pinned: boolean
}

// Кого выделяем на площадке и чьи зоны ответственности показываем.
// Наведение показывает зоны временно, клик по игроку закрепляет их.
// Общий для списка игроков и площадки, чтобы наведение в одном месте подсвечивало другое.
export function useCourtHighlight(layout: MaybeRefOrGetter<PhaseLayout>) {
  const focus = ref<PlayerId | null>(null)
  const hovered = ref<PlayerId | null>(null)
  const tip = ref<ZoneTip | null>(null)

  let hoverTimer: ReturnType<typeof setTimeout> | undefined

  // Наведение важнее закрепления
  const shownPlayer = computed(() => hovered.value ?? focus.value)

  const shownZones = computed(() => {
    const id = shownPlayer.value

    return id ? (toValue(layout).zones?.[id] ?? []) : []
  })

  const tipZone = computed(() => {
    const current = tip.value

    if (!current || current.id !== shownPlayer.value) {
      return null
    }

    const zone = shownZones.value[current.index]

    return zone ? { id: current.id, zone } : null
  })

  // Сменился выход или фаза — старая подсказка уже не про то
  watch(
    () => toValue(layout),
    () => {
      tip.value = null
    },
  )

  // Зоны другого игрока — подсказку закрываем совсем, даже закреплённую
  watch(shownPlayer, (id) => {
    if (tip.value && tip.value.id !== id) {
      tip.value = null
    }
  })

  onBeforeUnmount(() => clearTimeout(hoverTimer))

  function hasZones(id: PlayerId) {
    return (toValue(layout).zones?.[id]?.length ?? 0) > 0
  }

  function isDimmed(id: PlayerId) {
    if (focus.value === id) {
      return false
    }

    return focus.value !== null || toValue(layout).bench === id
  }

  function toggleFocus(id: PlayerId) {
    focus.value = focus.value === id ? null : id
  }

  function startHover(id: PlayerId) {
    clearTimeout(hoverTimer)
    hovered.value = id
  }

  function endHover() {
    clearTimeout(hoverTimer)
    hoverTimer = setTimeout(() => {
      hovered.value = null
    }, HOVER_END_DELAY)
  }

  function startZoneHover(id: PlayerId, index: number) {
    startHover(id)

    if (!tip.value?.pinned) {
      tip.value = { id, index, pinned: false }
    }
  }

  function endZoneHover() {
    endHover()

    if (!tip.value?.pinned) {
      tip.value = null
    }
  }

  function toggleTip(id: PlayerId, index: number) {
    const current = tip.value
    const same = current?.pinned && current.id === id && current.index === index

    tip.value = same ? null : { id, index, pinned: true }
  }

  function closeTip() {
    tip.value = null
  }

  // reactive разворачивает ref-ы: дочерние компоненты читают highlight.focus без .value
  return reactive({
    focus,
    hovered,
    tip,
    shownPlayer,
    shownZones,
    tipZone,
    hasZones,
    isDimmed,
    toggleFocus,
    startHover,
    endHover,
    startZoneHover,
    endZoneHover,
    toggleTip,
    closeTip,
  })
}

export type CourtHighlight = ReturnType<typeof useCourtHighlight>
