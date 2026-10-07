<script setup lang="ts">
import { computed } from 'vue'
import RoleDot from '@/components/RoleDot.vue'
import type { PlayerInfo, ResponsibilityZone } from '@/types/volleyball'

// Подсказка «почему эта зона за игроком». Ставится поверх площадки в процентах от её размера,
// поэтому родитель должен быть position: relative и совпадать по размеру с SVG площадки.
const props = defineProps<{
  player: PlayerInfo
  zone: ResponsibilityZone
  // viewBox площадки: [x, y, size], площадка квадратная
  view: [number, number, number]
}>()

const placement = computed(() => {
  const { zone } = props
  const [viewX, viewY, size] = props.view
  // У сетки подсказку ставим под зоной, в глубине площадки — над ней
  const below = zone.y < 3
  const centerX = zone.x + zone.width / 2
  // Крайние зоны выравниваем по своему краю, чтобы подсказка не вылезала за площадку
  const align = centerX < 3 ? 'start' : centerX > 6 ? 'end' : 'center'
  const anchorX = align === 'start' ? zone.x : align === 'end' ? zone.x + zone.width : centerX
  const anchorY = below ? zone.y + zone.height : zone.y

  return {
    class: [`zone-tooltip--${align}`, { 'zone-tooltip--below': below }],
    style: {
      left: `${((anchorX - viewX) / size) * 100}%`,
      top: `${((anchorY - viewY) / size) * 100}%`,
    },
  }
})
</script>

<template>
  <div class="zone-tooltip" :class="placement.class" :style="placement.style" role="tooltip">
    <span class="zone-tooltip__title">
      <RoleDot :role="props.player.role" :size="14" />
      {{ props.player.name }}
    </span>
    {{ props.zone.reason }}
  </div>
</template>

<style scoped lang="scss">
.zone-tooltip {
  --tip-gap: 8px;

  position: absolute;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: max-content;
  max-width: min(280px, 90%);
  padding: 12px 14px;
  border: 1px solid var(--color-line);
  border-radius: 10px;
  background-color: var(--color-paper);
  box-shadow: 0 12px 32px rgba(31, 36, 48, 0.16);
  font-size: 14px;
  line-height: 1.45;
  color: var(--color-ink-soft);
  pointer-events: none;
  transform: translate(var(--tip-x), calc(-100% - var(--tip-gap)));
  animation: tip-in 0.15s ease-out;

  &--start {
    --tip-x: 0;
  }

  &--center {
    --tip-x: -50%;
  }

  &--end {
    --tip-x: -100%;
  }

  &--below {
    transform: translate(var(--tip-x), var(--tip-gap));
  }

  &__title {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    color: var(--color-ink);
  }
}

@keyframes tip-in {
  from {
    opacity: 0;
  }
}
</style>
