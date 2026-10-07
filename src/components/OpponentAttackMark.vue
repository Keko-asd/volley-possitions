<script setup lang="ts">
import type { OpponentZone } from '@/types/volleyball'

// Мяч у сетки на стороне соперника, напротив места удара. Координаты в метрах, как у поля.
const props = defineProps<{
  zone: OpponentZone
}>()

// Соперник смотрит на нас, поэтому его зона 4 — напротив нашей зоны 2, а его 2 — напротив нашей 4
const NET_X: Record<OpponentZone, number> = {
  4: 7.5,
  3: 4.5,
  2: 1.5,
}

// Над сеткой, в полосе свободной зоны за ней
const NET_Y = -0.38
</script>

<template>
  <!-- Ключ по зоне: при смене атаки метка появляется заново -->
  <g
    :key="props.zone"
    class="opponent-attack"
    :style="{ transform: `translate(${NET_X[props.zone]}px, ${NET_Y}px)` }"
    role="img"
    :aria-label="`Соперник атакует из зоны ${props.zone}`"
  >
    <circle class="opponent-attack__pulse" r="0.2" />
    <circle class="opponent-attack__ball" r="0.2" />
    <text class="opponent-attack__label" text-anchor="middle" dominant-baseline="central">
      {{ props.zone }}
    </text>
  </g>
</template>

<style scoped lang="scss">
.opponent-attack {
  pointer-events: none;
  animation: mark-in 0.25s ease-out;

  &__ball {
    fill: var(--color-accent);
    stroke: #fff;
    stroke-width: 0.04;
  }

  &__pulse {
    fill: none;
    stroke: var(--color-accent);
    stroke-width: 0.05;
    transform-origin: center;
    transform-box: fill-box;
    animation: mark-pulse 1.2s ease-out infinite;
  }

  &__label {
    fill: #fff;
    font-size: 0.24px;
    font-weight: 700;
    user-select: none;
  }
}

@keyframes mark-in {
  from {
    opacity: 0;
  }
}

@keyframes mark-pulse {
  from {
    opacity: 0.8;
    transform: scale(1);
  }

  to {
    opacity: 0;
    transform: scale(2.2);
  }
}

@media (prefers-reduced-motion: reduce) {
  .opponent-attack__pulse {
    display: none;
  }
}
</style>
