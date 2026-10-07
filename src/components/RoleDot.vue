<script setup lang="ts">
import type { PlayerRole } from '@/types/volleyball'

// Кружок цвета амплуа, как фишка на площадке. С подписью или без.
const props = withDefaults(
  defineProps<{
    role: PlayerRole
    label?: string
    size?: number
  }>(),
  {
    label: '',
    size: 28,
  },
)
</script>

<template>
  <span
    class="role-dot"
    :class="`role-dot--${props.role}`"
    :style="{
      width: `${props.size}px`,
      height: `${props.size}px`,
      fontSize: `${props.size * 0.38}px`,
    }"
    aria-hidden="true"
  >
    <span v-if="props.label" class="role-dot__label">{{ props.label }}</span>
  </span>
</template>

<style scoped lang="scss">
.role-dot {
  --dot-fill: var(--role-libero);
  --dot-text: var(--color-ink);

  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border: 1.5px solid var(--color-ink);
  border-radius: 50%;
  background-color: var(--dot-fill);
  font-weight: 600;
  line-height: 1;
  color: var(--dot-text);

  // Обрезаем межстрочные поля шрифта по высоте заглавных: буквы встают ровно в центр круга.
  // text-box не наследуется, поэтому он на самой подписи. Где не поддерживается — центр по строке.
  &__label {
    text-box: trim-both cap alphabetic;
  }

  &--setter {
    --dot-fill: var(--role-setter);
  }

  &--outside {
    --dot-fill: var(--role-outside);
    --dot-text: #fff;
  }

  &--middle {
    --dot-fill: var(--role-middle);
    --dot-text: #fff;
  }

  &--opposite {
    --dot-fill: var(--role-opposite);
    --dot-text: #fff;
  }
}
</style>
