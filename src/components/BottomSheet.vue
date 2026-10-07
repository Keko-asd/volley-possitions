<script setup lang="ts">
import { nextTick, onMounted, ref, useTemplateRef, watch } from 'vue'

// Шторка снизу на <dialog>: открывается поверх страницы, закрывается крестиком,
// тапом мимо, Esc или жестом «назад», а ещё свайпом вниз.
const props = defineProps<{
  title: string
}>()

const open = defineModel<boolean>('open', { required: true })

const dialog = useTemplateRef<HTMLDialogElement>('dialog')
const body = useTemplateRef<HTMLDivElement>('body')

// Насколько шторку утянули пальцем вниз, px; null — не тянут
const dragOffset = ref<number | null>(null)

// Закрываем, если утянули дальше порога или резко смахнули
const CLOSE_DISTANCE = 100
const CLOSE_VELOCITY = 0.5

let startY = 0
let startTime = 0
let lastY = 0

watch(open, async (value) => {
  await nextTick()

  if (!dialog.value) {
    return
  }

  if (value && !dialog.value.open) {
    dialog.value.showModal()
  } else if (!value && dialog.value.open) {
    dialog.value.close()
  }
})

// Esc, жест «назад», тап мимо — диалог закрывается сам, синхронизируем состояние
function onClose() {
  dragOffset.value = null
  open.value = false
}

onMounted(() => {
  if (open.value) {
    dialog.value?.showModal()
  }
})

// Safari пока не знает closedby="any": закрываем по тапу на подложку сами
function onClick(event: MouseEvent) {
  if ('closedBy' in HTMLDialogElement.prototype || !dialog.value || event.target !== dialog.value) {
    return
  }

  const rect = dialog.value.getBoundingClientRect()
  const inside =
    rect.top <= event.clientY &&
    event.clientY <= rect.bottom &&
    rect.left <= event.clientX &&
    event.clientX <= rect.right

  if (!inside) {
    open.value = false
  }
}

function onTouchStart(event: TouchEvent) {
  startY = event.touches[0]!.clientY
  lastY = startY
  startTime = event.timeStamp
}

// Тянуть вниз можно за любое место, но содержимое сначала докручивается до верха
function onTouchMove(event: TouchEvent) {
  lastY = event.touches[0]!.clientY
  const delta = lastY - startY

  if (dragOffset.value === null) {
    const atTop = (body.value?.scrollTop ?? 0) <= 0

    if (delta <= 0 || !atTop) {
      return
    }
  }

  event.preventDefault()
  dragOffset.value = Math.max(0, delta)
}

function onTouchEnd(event: TouchEvent) {
  if (dragOffset.value === null) {
    return
  }

  const distance = lastY - startY
  const velocity = distance / Math.max(1, event.timeStamp - startTime)

  // Сбрасываем сдвиг: шторка доедет вниз при закрытии или вернётся на место
  dragOffset.value = null

  if (distance > CLOSE_DISTANCE || velocity > CLOSE_VELOCITY) {
    open.value = false
  }
}
</script>

<template>
  <dialog
    ref="dialog"
    class="sheet"
    :class="{ 'sheet--dragging': dragOffset !== null }"
    :style="dragOffset !== null ? { transform: `translateY(${dragOffset}px)` } : undefined"
    closedby="any"
    aria-labelledby="bottom-sheet-title"
    @close="onClose"
    @click="onClick"
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
    @touchcancel="onTouchEnd"
  >
    <div class="sheet__head">
      <span class="sheet__grabber" aria-hidden="true" />
      <h2 id="bottom-sheet-title" class="sheet__title">{{ props.title }}</h2>
      <button class="sheet__close" aria-label="Закрыть" @click="open = false">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.2"
          stroke-linecap="round"
          aria-hidden="true"
        >
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
    </div>

    <div ref="body" class="sheet__body">
      <slot />
    </div>
  </dialog>
</template>

<style scoped lang="scss">
.sheet {
  // Закрытое состояние: шторка уехала вниз
  display: none;
  flex-direction: column;
  width: 100%;
  max-width: 640px;
  max-height: 88dvh;
  margin: auto auto 0;
  padding: 0;
  border: none;
  border-radius: 16px 16px 0 0;
  background-color: var(--color-beige);
  color: var(--color-ink);
  box-shadow: 0 -8px 32px rgb(31 36 48 / 18%);
  transform: translateY(100%);
  transition:
    transform 0.3s cubic-bezier(0.32, 0.72, 0, 1),
    display 0.3s allow-discrete,
    overlay 0.3s allow-discrete;

  &[open] {
    display: flex;
    transform: translateY(0);

    @starting-style {
      transform: translateY(100%);
    }
  }

  // Пока тянут пальцем, шторка идёт за ним без задержки
  &--dragging {
    transition: none;
  }

  &::backdrop {
    background-color: rgb(31 36 48 / 0%);
    transition:
      background-color 0.3s,
      display 0.3s allow-discrete,
      overlay 0.3s allow-discrete;
  }

  &[open]::backdrop {
    background-color: rgb(31 36 48 / 45%);

    @starting-style {
      background-color: rgb(31 36 48 / 0%);
    }
  }

  &__head {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 20px var(--pu-1) 8px;
  }

  &__grabber {
    position: absolute;
    top: 8px;
    left: 50%;
    width: 40px;
    height: 4px;
    border-radius: 2px;
    background-color: var(--color-line-strong);
    transform: translateX(-50%);
  }

  &__title {
    font-family: var(--font-display);
    font-size: 20px;
    font-weight: 700;
  }

  &__close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    margin-right: -10px;
    border-radius: 50%;
    color: var(--color-ink-soft);

    &:hover {
      background-color: var(--color-panel);
    }

    &:focus-visible {
      outline: 3px solid var(--color-accent);
      outline-offset: 2px;
    }
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: var(--pu-2);
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: 8px var(--pu-1) calc(var(--pu-2) + env(safe-area-inset-bottom));
  }
}

@media (prefers-reduced-motion: reduce) {
  .sheet {
    transition-duration: 0.1s;
  }
}
</style>
