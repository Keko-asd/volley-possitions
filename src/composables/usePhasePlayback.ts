import { onBeforeUnmount, ref, type Ref } from 'vue'
import type { Phase } from '@/types/volleyball'

// Пауза на расстановке перед тем, как игроки побегут на места
const HOLD_ON_BASE = 900

// Показывает переход «расстановка → текущая фаза»: на секунду возвращаем игроков
// по зонам протокола, затем они перебегают на свои позиции.
export function usePhasePlayback(phase: Ref<Phase>) {
  const playing = ref(false)

  let timer: ReturnType<typeof setTimeout> | undefined

  function stop() {
    clearTimeout(timer)
    playing.value = false
  }

  function play() {
    const target = phase.value

    if (target === 'base') {
      return
    }

    stop()
    playing.value = true
    phase.value = 'base'
    timer = setTimeout(() => {
      phase.value = target
      playing.value = false
    }, HOLD_ON_BASE)
  }

  onBeforeUnmount(stop)

  return { playing, play, stop }
}
