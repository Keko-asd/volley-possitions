<script setup lang="ts">
import { computed } from 'vue'
import { OPPONENT_ZONES, PHASES, RALLY_STARTS, type PhaseInfo } from '@/data/phases'
import type { OpponentAttack } from '@/composables/useOpponentAttack'
import type { Phase, RallyStart } from '@/types/volleyball'

const props = defineProps<{
  // Влияет ли начало розыгрыша на расстановку в выбранном выходе и фазе
  startEnabled: boolean
}>()

const phase = defineModel<Phase>({ required: true })
const rallyStart = defineModel<RallyStart>('start', { required: true })
const opponentAttack = defineModel<OpponentAttack>('opponent', { required: true })

const OPPONENT_ATTACKS: { id: OpponentAttack; label: string }[] = [
  ...OPPONENT_ZONES.map((zone) => ({ id: zone, label: String(zone) })),
  { id: 'loop', label: 'По очереди' },
]

// Расстановка — общий старт, дальше розыгрыш идёт в одно из трёх положений
const start = computed(() => PHASES.find((item) => item.id === 'base')!)
const branches = computed(() => PHASES.filter((item) => item.id !== 'base'))
const current = computed(() => PHASES.find((item) => item.id === phase.value)!)

function cardClass(item: PhaseInfo) {
  return { 'phase-card--active': phase.value === item.id }
}
</script>

<template>
  <div class="phase-picker">
    <button
      class="phase-card"
      :class="cardClass(start)"
      :aria-pressed="phase === start.id"
      @click="phase = start.id"
    >
      <span class="phase-card__label">{{ start.label }}</span>
    </button>

    <div class="phase-picker__fork" aria-hidden="true">
      <svg viewBox="0 0 200 20" preserveAspectRatio="none" class="phase-picker__fork-lines">
        <path d="M100 0 V20 M100 6 H33 V20 M100 6 H167 V20" />
      </svg>
    </div>

    <div class="phase-picker__branches">
      <button
        v-for="item in branches"
        :key="item.id"
        class="phase-card"
        :class="cardClass(item)"
        :aria-pressed="phase === item.id"
        @click="phase = item.id"
      >
        <span class="phase-card__label">{{ item.label }}</span>
      </button>
    </div>

    <!-- Описание одной выбранной фазы вместо четырёх: так блок не растёт в высоту -->
    <p class="phase-picker__description" aria-live="polite">{{ current.description }}</p>

    <fieldset class="rally-start" :disabled="!props.startEnabled">
      <legend class="rally-start__legend">Розыгрыш начался</legend>

      <div class="rally-start__options">
        <label v-for="item in RALLY_STARTS" :key="item.id" class="rally-start__option">
          <input
            v-model="rallyStart"
            class="rally-start__input"
            type="radio"
            name="rally-start"
            :value="item.id"
          />
          {{ item.label }}
        </label>
      </div>
    </fieldset>

    <!-- Тот же сегментный переключатель: откуда бьёт соперник, только для защиты -->
    <fieldset class="rally-start" :disabled="phase !== 'defense'">
      <legend class="rally-start__legend">Соперник атакует из зоны</legend>

      <div class="rally-start__options">
        <label v-for="item in OPPONENT_ATTACKS" :key="item.id" class="rally-start__option">
          <input
            v-model="opponentAttack"
            class="rally-start__input"
            type="radio"
            name="opponent-attack"
            :value="item.id"
          />
          {{ item.label }}
        </label>
      </div>
    </fieldset>
  </div>
</template>

<style scoped lang="scss">
.phase-picker {
  display: flex;
  flex-direction: column;

  &__fork {
    height: 22px;
  }

  &__fork-lines {
    display: block;
    width: 100%;
    height: 20px;
    margin-top: 1px;
    fill: none;
    stroke: var(--color-line-strong);
    stroke-width: 1.5;
    vector-effect: non-scaling-stroke;
  }

  &__branches {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
  }

  &__description {
    min-height: 1.45em;
    margin-top: 8px;
    font-size: 13px;
    line-height: 1.45;
    color: var(--color-muted);
  }
}

// Сегментный переключатель на радиокнопках: стрелки клавиатуры и скринридеры работают сами
.rally-start {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 12px;
  min-width: 0;
  margin: 8px 0 0;
  padding: 0;
  border: none;

  &__legend {
    float: left;
    padding: 0;
    font-size: 13px;
    font-weight: 600;
    color: var(--color-ink-soft);
  }

  &__options {
    display: flex;
    flex-grow: 1;
    padding: 3px;
    border: 1px solid var(--color-line-strong);
    border-radius: 999px;
    background-color: var(--color-paper);
  }

  &__option {
    flex: 1 1 0;
    padding: 7px 12px;
    border-radius: 999px;
    font-size: 14px;
    font-weight: 500;
    text-align: center;
    white-space: nowrap;
    cursor: pointer;
    transition:
      background-color 0.2s,
      color 0.2s;

    &:hover {
      background-color: var(--color-beige);
    }

    &:has(:checked) {
      background-color: var(--color-ink);
      color: var(--color-paper);
    }

    &:has(:focus-visible) {
      outline: 3px solid var(--color-accent);
      outline-offset: 2px;
    }
  }

  &__input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  &:disabled {
    .rally-start__options {
      opacity: 0.45;
    }

    .rally-start__option {
      cursor: default;

      &:hover {
        background-color: transparent;
      }
    }
  }
}

.phase-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  padding: 8px 12px;
  border: 1px solid var(--color-line-strong);
  border-radius: 10px;
  background-color: var(--color-paper);
  text-align: center;
  transition:
    background-color 0.2s,
    border-color 0.2s,
    color 0.2s;

  &:hover {
    border-color: var(--color-ink);
  }

  &:focus-visible {
    outline: 3px solid var(--color-accent);
    outline-offset: 2px;
  }

  &__label {
    font-family: var(--font-display);
    font-size: 17px;
    font-weight: 600;
  }

  &--active {
    border-color: var(--color-ink);
    background-color: var(--color-ink);
    color: var(--color-paper);
  }
}
</style>
