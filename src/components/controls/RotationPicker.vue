<script setup lang="ts">
import { computed } from 'vue'
import type { Rotation } from '@/types/volleyball'

// Выходы в порядке смены по ходу игры; номер — зона связующего
const ORDER: Rotation[] = [1, 6, 5, 4, 3, 2]

const rotation = defineModel<Rotation>({ required: true })

const index = computed(() => ORDER.indexOf(rotation.value))
const prev = computed(() => ORDER[(index.value + ORDER.length - 1) % ORDER.length]!)
const next = computed(() => ORDER[(index.value + 1) % ORDER.length]!)
</script>

<template>
  <!-- Стрелки по краям цепочки листают выходы по ходу игры -->
  <div class="rotation-picker">
    <button
      class="rotation-picker__step"
      :aria-label="`Предыдущий: выход ${prev}`"
      :title="`Выход ${prev}`"
      @click="rotation = prev"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </button>

    <ol class="rotation-picker__chain" aria-label="Выходы в порядке смены">
      <li v-for="item in ORDER" :key="item" class="rotation-picker__item">
        <button
          class="rotation-picker__button"
          :aria-pressed="rotation === item"
          :aria-label="`Выход ${item}: связующий в зоне ${item}`"
          @click="rotation = item"
        >
          {{ item }}
        </button>
      </li>
    </ol>

    <button
      class="rotation-picker__step rotation-picker__step--next"
      :aria-label="`Следующий: выход ${next}`"
      :title="`Следующий: выход ${next}`"
      @click="rotation = next"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M9 6l6 6-6 6" />
      </svg>
    </button>
  </div>
</template>

<style scoped lang="scss">
.rotation-picker {
  display: flex;
  align-items: center;
  gap: 8px;

  &__chain {
    display: grid;
    flex-grow: 1;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 12px;
  }

  &__item {
    position: relative;

    // Стрелка к следующему выходу в промежутке между кнопками
    &:not(:last-child)::after {
      content: '';
      position: absolute;
      top: 50%;
      right: -10px;
      width: 6px;
      height: 6px;
      border-top: 2px solid var(--color-line-strong);
      border-right: 2px solid var(--color-line-strong);
      transform: translateY(-50%) rotate(45deg);
    }
  }

  &__button {
    width: 100%;
    height: 44px;
    border: 1px solid var(--color-line-strong);
    border-radius: 10px;
    background-color: var(--color-paper);
    font-family: var(--font-display);
    font-size: 20px;
    font-weight: 600;
    transition:
      background-color 0.2s,
      border-color 0.2s,
      color 0.2s;

    &:hover {
      border-color: var(--color-ink);
    }

    &[aria-pressed='true'] {
      border-color: var(--color-ink);
      background-color: var(--color-ink);
      color: var(--color-paper);
    }
  }

  &__step {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 44px;
    border: 1px solid var(--color-line-strong);
    border-radius: 10px;
    background-color: var(--color-paper);

    &:hover {
      border-color: var(--color-ink);
    }

    &--next {
      border-color: var(--color-ink);
      background-color: var(--color-ink);
      color: var(--color-paper);

      &:hover {
        background-color: var(--color-ink-soft);
      }
    }
  }
}

button:focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 2px;
}
</style>
