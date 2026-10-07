<script setup lang="ts">
import type { PlayerRole } from '@/types/volleyball'

// Зона ответственности игрока для слота VolleyballCourt. Координаты в метрах, как у поля.
// Рисуется под фишками, цветом амплуа игрока.
const props = withDefaults(
  defineProps<{
    x: number
    y: number
    width: number
    height: number
    role: PlayerRole
    // Почему зона за игроком: для скринридера
    reason: string
    // По зоне сейчас открыта подсказка
    active?: boolean
  }>(),
  {
    active: false,
  },
)

const emit = defineEmits<{
  select: []
  'hover-start': []
  'hover-end': []
}>()

// Как у PlayerMarker: тап не считаем наведением, только мышь и клавиатуру
function onPointerEnter(event: PointerEvent) {
  if (event.pointerType === 'mouse') {
    emit('hover-start')
  }
}

function onPointerLeave(event: PointerEvent) {
  if (event.pointerType === 'mouse') {
    emit('hover-end')
  }
}

function onFocus(event: FocusEvent) {
  if ((event.target as Element).matches(':focus-visible')) {
    emit('hover-start')
  }
}
</script>

<template>
  <rect
    class="zone"
    :class="[`zone--${props.role}`, { 'zone--active': props.active }]"
    :x="props.x"
    :y="props.y"
    :width="props.width"
    :height="props.height"
    role="button"
    tabindex="0"
    :aria-label="props.reason"
    :aria-pressed="props.active"
    @click="emit('select')"
    @keydown.enter.prevent="emit('select')"
    @keydown.space.prevent="emit('select')"
    @pointerenter="onPointerEnter"
    @pointerleave="onPointerLeave"
    @focus="onFocus"
    @blur="emit('hover-end')"
  />
</template>

<style scoped lang="scss">
.zone {
  --zone-color: var(--color-ink);
  --zone-stroke: var(--zone-color);

  fill: var(--zone-color);
  fill-opacity: 0.3;
  stroke: var(--zone-stroke);
  stroke-width: 0.05;
  stroke-dasharray: 0.16 0.1;
  cursor: help;
  outline: none;
  animation: zone-in 0.25s ease-out;
  transition: fill-opacity 0.2s;

  &:hover,
  &:focus-visible,
  &--active {
    fill-opacity: 0.45;
    stroke-dasharray: none;
  }

  &--setter {
    --zone-color: var(--role-setter);
  }

  &--outside {
    --zone-color: var(--role-outside);
  }

  &--middle {
    --zone-color: var(--role-middle);
  }

  &--opposite {
    --zone-color: var(--role-opposite);
  }

  // Белая заливка либеро на светлом полу почти не видна, поэтому обводка тёмная
  &--libero {
    --zone-color: var(--role-libero);
    --zone-stroke: var(--color-ink);

    fill-opacity: 0.6;

    &:hover,
    &:focus-visible,
    &.zone--active {
      fill-opacity: 0.8;
    }
  }
}

@keyframes zone-in {
  from {
    opacity: 0;
  }
}
</style>
