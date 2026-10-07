<script setup lang="ts">
import { computed } from 'vue'
import type { PlayerRole, Point } from '@/types/volleyball'

// Стрелка разбега нападающего для слота VolleyballCourt: от фишки к точке удара.
// Координаты в метрах, как у поля. Рисуется под фишками, цветом амплуа.
const props = withDefaults(
  defineProps<{
    from: Point
    to: Point
    role: PlayerRole
    dimmed?: boolean
  }>(),
  {
    dimmed: false,
  },
)

// Стрелка начинается от края фишки, а не из её центра
const MARKER_GAP = 0.55
const HEAD_LENGTH = 0.32
const HEAD_HALF_WIDTH = 0.18

const shape = computed(() => {
  const dx = props.to.x - props.from.x
  const dy = props.to.y - props.from.y
  const length = Math.hypot(dx, dy)
  const ux = dx / length
  const uy = dy / length

  const start = { x: props.from.x + ux * MARKER_GAP, y: props.from.y + uy * MARKER_GAP }
  const base = { x: props.to.x - ux * HEAD_LENGTH, y: props.to.y - uy * HEAD_LENGTH }
  const head = [
    `${props.to.x},${props.to.y}`,
    `${base.x - uy * HEAD_HALF_WIDTH},${base.y + ux * HEAD_HALF_WIDTH}`,
    `${base.x + uy * HEAD_HALF_WIDTH},${base.y - ux * HEAD_HALF_WIDTH}`,
  ].join(' ')

  return { start, base, head }
})
</script>

<template>
  <g
    class="attack-arrow"
    :class="[`attack-arrow--${props.role}`, { 'attack-arrow--dimmed': props.dimmed }]"
    aria-hidden="true"
  >
    <line
      class="attack-arrow__line"
      :x1="shape.start.x"
      :y1="shape.start.y"
      :x2="shape.base.x"
      :y2="shape.base.y"
    />
    <polygon class="attack-arrow__head" :points="shape.head" />
  </g>
</template>

<style scoped lang="scss">
.attack-arrow {
  --arrow-color: var(--color-ink);

  pointer-events: none;
  // Появляется, когда игроки добежали до мест: переезд фишки длится 0.8s
  animation: arrow-in 0.3s ease-out 0.8s backwards;
  transition: opacity 0.3s;

  &__line {
    stroke: var(--arrow-color);
    stroke-width: 0.08;
    stroke-dasharray: 0.2 0.12;
  }

  &__head {
    fill: var(--arrow-color);
  }

  &--dimmed {
    opacity: 0.25;
  }

  &--outside {
    --arrow-color: var(--role-outside);
  }

  &--middle {
    --arrow-color: var(--role-middle);
  }

  &--opposite {
    --arrow-color: var(--role-opposite);
  }
}

@keyframes arrow-in {
  from {
    opacity: 0;
  }
}
</style>
