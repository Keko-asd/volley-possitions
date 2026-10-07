<script setup lang="ts">
// Своя половина площадки в метрах: x 0…9 слева направо, y 0…9 от сетки к лицевой линии.
// Всё, что передано в слот, рисуется в тех же координатах (игроки, стрелки, зоны).
const zoneNumbers = [
  { zone: 4, x: 2.8, y: 2.8 },
  { zone: 3, x: 5.8, y: 2.8 },
  { zone: 2, x: 8.8, y: 2.8 },
  { zone: 5, x: 2.8, y: 8.8 },
  { zone: 6, x: 5.8, y: 8.8 },
  { zone: 1, x: 8.8, y: 8.8 },
]
</script>

<template>
  <svg class="court" viewBox="-1.5 -0.6 12 12" role="group" aria-label="Волейбольная площадка">
    <rect class="court__free-zone" x="-1.5" y="-0.6" width="12" height="12" />
    <rect class="court__floor" x="0" y="0" width="9" height="9" />

    <!-- Линия атаки, 3 м от сетки -->
    <line class="court__attack-line" x1="0" y1="3" x2="9" y2="3" />

    <!-- Границы зон -->
    <line class="court__zone-border" x1="3" y1="0" x2="3" y2="9" />
    <line class="court__zone-border" x1="6" y1="0" x2="6" y2="9" />

    <line class="court__net" x1="-1" y1="-0.09" x2="10" y2="-0.09" />
    <line class="court__net-mesh" x1="-1" y1="-0.09" x2="10" y2="-0.09" />

    <g class="court__labels" font-size="0.38" font-weight="700" text-anchor="end">
      <text v-for="item in zoneNumbers" :key="item.zone" :x="item.x" :y="item.y">
        {{ item.zone }}
      </text>
    </g>

    <slot />
  </svg>
</template>

<style scoped lang="scss">
.court {
  --court-ink: #1f2430;
  --court-floor: #e9dcc2;
  --court-free-zone: #f1ebdd;

  width: 100%;
  height: auto;
  font-family: 'IBM Plex Sans', Arial, sans-serif;

  &__free-zone {
    fill: var(--court-free-zone);
  }

  &__floor {
    fill: var(--court-floor);
    stroke: var(--court-ink);
    stroke-width: 0.06;
  }

  &__attack-line {
    stroke: var(--court-ink);
    stroke-width: 0.05;
  }

  &__zone-border {
    stroke: var(--court-ink);
    stroke-width: 0.025;
    stroke-dasharray: 0.11 0.14;
    opacity: 0.45;
  }

  &__net {
    stroke: var(--court-ink);
    stroke-width: 0.14;
  }

  &__net-mesh {
    stroke: #fff;
    stroke-width: 0.035;
    stroke-dasharray: 0.05 0.05;
  }

  &__labels {
    fill: var(--court-ink);
    fill-opacity: 0.45;
  }
}
</style>
