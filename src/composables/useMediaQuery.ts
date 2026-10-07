import { onBeforeUnmount, ref } from 'vue'

// Совпадает ли медиазапрос сейчас; обновляется при повороте и ресайзе
export function useMediaQuery(query: string) {
  const media = window.matchMedia(query)
  const matches = ref(media.matches)

  function update(event: MediaQueryListEvent) {
    matches.value = event.matches
  }

  media.addEventListener('change', update)
  onBeforeUnmount(() => media.removeEventListener('change', update))

  return matches
}
