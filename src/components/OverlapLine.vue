<script setup lang="ts">
import { computed } from 'vue'
import type { OverlapLine } from '@/data/overlap'

// Линия расстановки для слота VolleyballCourt: центр соседа по протоколу,
// за который игрок не должен заходить в момент подачи. Координаты в метрах, как у поля.
// Рисуется в два слоя: заливка запретной стороны под зонами ответственности,
// чтобы не перекрывать их подсказки, и сама линия поверх зон.
// Наведение на любой слой показывает подсказку, клик её закрепляет.
const props = withDefaults(
  defineProps<{
    line: OverlapLine
    layer: 'area' | 'line'
    // Подпись соседа: «Д1», «ЛБ»
    label: string
    // По линии сейчас открыта подсказка
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

const COURT_SIZE = 9

const geometry = computed(() => {
  const { axis, value, forbidden } = props.line
  const start = forbidden === 'before' ? 0 : value
  const size = forbidden === 'before' ? value : COURT_SIZE - value

  // Вертикальная линия подписана под лицевой, горизонтальная — справа за боковой
  return axis === 'x'
    ? {
        line: { x1: value, y1: 0, x2: value, y2: COURT_SIZE },
        area: { x: start, y: 0, width: size, height: COURT_SIZE },
        text: { x: value, y: COURT_SIZE + 0.4, 'text-anchor': 'middle' },
      }
    : {
        line: { x1: 0, y1: value, x2: COURT_SIZE, y2: value },
        area: { x: 0, y: start, width: COURT_SIZE, height: size },
        text: { x: COURT_SIZE + 0.15, y: value, 'text-anchor': 'start' },
      }
})

// Как у ResponsibilityZone: тап не считаем наведением, только мышь и клавиатуру
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
    v-if="props.layer === 'area'"
    class="overlap-line__area"
    :class="{ 'overlap-line__area--active': props.active }"
    v-bind="geometry.area"
    @click="emit('select')"
    @pointerenter="onPointerEnter"
    @pointerleave="onPointerLeave"
  />

  <!-- С клавиатуры подсказка открывается по линии: заливка в порядок табуляции не входит -->
  <g
    v-else
    class="overlap-line"
    :class="{ 'overlap-line--active': props.active }"
    role="button"
    tabindex="0"
    :aria-label="props.line.reason"
    :aria-pressed="props.active"
    @click="emit('select')"
    @keydown.enter.prevent="emit('select')"
    @keydown.space.prevent="emit('select')"
    @pointerenter="onPointerEnter"
    @pointerleave="onPointerLeave"
    @focus="onFocus"
    @blur="emit('hover-end')"
  >
    <!-- Тонкую линию трудно поймать курсором, поэтому ловим широкой прозрачной -->
    <line class="overlap-line__hit" v-bind="geometry.line" />
    <line class="overlap-line__stroke" v-bind="geometry.line" />
    <text class="overlap-line__label" v-bind="geometry.text" dominant-baseline="central">
      {{ props.label }}
    </text>
  </g>
</template>

<style scoped lang="scss">
.overlap-line {
  cursor: help;
  outline: none;
  animation: overlap-line-in 0.25s ease-out;

  // Где запретные стороны соседей перекрываются, заливка темнее
  &__area {
    fill: var(--color-ink);
    fill-opacity: 0.18;
    cursor: help;
    animation: overlap-line-in 0.25s ease-out;
    transition: fill-opacity 0.2s;

    &:hover,
    &--active {
      fill-opacity: 0.28;
    }
  }

  &__hit {
    stroke: transparent;
    stroke-width: 0.4;
  }

  &__stroke {
    stroke: var(--color-ink);
    stroke-width: 0.06;
    stroke-dasharray: 0.22 0.12;
    pointer-events: none;
  }

  &:hover &__stroke,
  &:focus-visible &__stroke,
  &--active &__stroke {
    stroke-width: 0.09;
    stroke-dasharray: none;
  }

  &__label {
    fill: var(--color-ink);
    font-size: 0.3px;
    font-weight: 700;
    user-select: none;
  }
}

@keyframes overlap-line-in {
  from {
    opacity: 0;
  }
}
</style>
