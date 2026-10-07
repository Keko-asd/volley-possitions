import { computed, onBeforeUnmount, ref, watch, type Ref } from 'vue'
import { OPPONENT_ZONES } from '@/data/phases'
import type { OpponentZone, Phase } from '@/types/volleyball'

// Выбор в переключателе: одна зона или все по очереди
export type OpponentAttack = OpponentZone | 'loop'

// Сколько показываем одну атаку: 0.8s игроки перебегают, остальное стоят на местах
const LOOP_STEP = 2200

// Откуда атакует соперник в защите. В режиме «По очереди» зона сама сменяется по кругу,
// пока выбрана защита; на других фазах цикл стоит.
export function useOpponentAttack(phase: Ref<Phase>) {
  const choice = ref<OpponentAttack>('loop')
  const loopIndex = ref(0)

  const zone = computed<OpponentZone>(() =>
    choice.value === 'loop' ? OPPONENT_ZONES[loopIndex.value]! : choice.value,
  )

  let timer: ReturnType<typeof setInterval> | undefined

  function stop() {
    clearInterval(timer)
    timer = undefined
  }

  watch(
    [phase, choice],
    ([currentPhase, currentChoice]) => {
      stop()

      if (currentPhase !== 'defense' || currentChoice !== 'loop') {
        return
      }

      loopIndex.value = 0
      timer = setInterval(() => {
        loopIndex.value = (loopIndex.value + 1) % OPPONENT_ZONES.length
      }, LOOP_STEP)
    },
    { immediate: true },
  )

  onBeforeUnmount(stop)

  return { choice, zone }
}
