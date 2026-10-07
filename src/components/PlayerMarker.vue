<script setup lang="ts">
import type { PlayerRole } from '@/types/volleyball'

// Фишка игрока для слота VolleyballCourt. Координаты в метрах, как у поля.
// При смене x/y фишка плавно переезжает; если смена пришла посреди движения,
// переезд начинается с текущего места, а не с прошлой точки.
const props = withDefaults(
  defineProps<{
    x: number
    y: number
    role: PlayerRole
    // Короткая подпись на фишке: «СВ», «Д1», «ЛБ»
    // todo потом типизовать тоже по PlayerRole
    label: string
    // Полное название для подсказки и скринридера: «Связующий»
    name: string
    active?: boolean
    dimmed?: boolean
    // Задержка старта движения, мс: связующий срывается раньше остальных
    delay?: number
  }>(),
  {
    active: false,
    dimmed: false,
    delay: 0,
  },
)

const emit = defineEmits<{
  select: []
  // Наведение мышью или фокус с клавиатуры: показать зоны игрока, пока он под курсором
  'hover-start': []
  'hover-end': []
}>()

// Тап на телефоне тоже шлёт pointerenter, но без pointerleave: его считаем кликом, не наведением
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

// Фокус от клика или тапа не считаем наведением, только с клавиатуры
function onFocus(event: FocusEvent) {
  if ((event.target as Element).matches(':focus-visible')) {
    emit('hover-start')
  }
}
</script>

<template>
  <g
    class="player-marker"
    :class="[
      `player-marker--${props.role}`,
      { 'player-marker--active': props.active, 'player-marker--dimmed': props.dimmed },
    ]"
    :style="{
      transform: `translate(${props.x}px, ${props.y}px)`,
      transitionDelay: `${props.delay}ms`,
    }"
    role="button"
    tabindex="0"
    :aria-label="props.name"
    :aria-pressed="props.active"
    @click="emit('select')"
    @pointerenter="onPointerEnter"
    @pointerleave="onPointerLeave"
    @focus="onFocus"
    @blur="emit('hover-end')"
    @keydown.enter.prevent="emit('select')"
    @keydown.space.prevent="emit('select')"
  >
    <title>{{ props.name }}</title>
    <circle class="player-marker__ring" r="0.47" />
    <circle class="player-marker__body" r="0.35" />
    <text class="player-marker__label" text-anchor="middle" dominant-baseline="central">
      {{ props.label }}
    </text>
  </g>
</template>

<style scoped lang="scss">
.player-marker {
  --marker-fill: #fff;
  --marker-text: #1f2430;
  --marker-ink: #1f2430;
  --marker-accent: #c2410c;

  cursor: pointer;
  outline: none;
  // В SVG пиксели в transform равны единицам viewBox, то есть метрам
  transition:
    transform 0.8s cubic-bezier(0.45, 0, 0.2, 1),
    opacity 0.3s;

  &__ring {
    fill: none;
    stroke: var(--marker-accent);
    stroke-width: 0.07;
    opacity: 0;
    transition: opacity 0.2s;
  }

  &__body {
    fill: var(--marker-fill);
    stroke: var(--marker-ink);
    stroke-width: 0.05;
  }

  &__label {
    fill: var(--marker-text);
    font-size: 0.26px;
    font-weight: 600;
    letter-spacing: -0.01px;
    pointer-events: none;
    user-select: none;
  }

  &:hover &__ring,
  &:focus-visible &__ring,
  &--active &__ring {
    opacity: 1;
  }

  &--dimmed {
    opacity: 0.25;
  }

  &--setter {
    --marker-fill: var(--role-setter);
  }

  &--outside {
    --marker-fill: var(--role-outside);
    --marker-text: #fff;
  }

  &--middle {
    --marker-fill: var(--role-middle);
    --marker-text: #fff;
  }

  &--opposite {
    --marker-fill: var(--role-opposite);
    --marker-text: #fff;
  }

  &--libero {
    --marker-fill: var(--role-libero);
  }
}
</style>
