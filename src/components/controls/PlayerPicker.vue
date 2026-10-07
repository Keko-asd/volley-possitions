<script setup lang="ts">
import { computed } from 'vue'
import RoleDot from '@/components/RoleDot.vue'
import { PLAYERS, PLAYER_IDS } from '@/data/players'
import type { CourtHighlight } from '@/composables/useCourtHighlight'
import type { PlayerId } from '@/types/volleyball'

// Список игроков: то же, что клик и наведение на фишку, только крупнее и с подписями.
const props = defineProps<{
  highlight: CourtHighlight
  // Кто сейчас за площадкой
  bench: PlayerId
}>()

// В расстановке зон нет ни у кого — тогда и помечать нечего
const anyZones = computed(() => PLAYER_IDS.some((id) => props.highlight.hasZones(id)))

function status(id: PlayerId) {
  if (id === props.bench) {
    return 'на замене'
  }

  return anyZones.value && !props.highlight.hasZones(id) ? 'нет зоны' : ''
}

// Тап тоже шлёт pointerenter без pointerleave: наведение считаем только от мыши
function onPointerEnter(event: PointerEvent, id: PlayerId) {
  if (event.pointerType === 'mouse') {
    props.highlight.startHover(id)
  }
}

function onPointerLeave(event: PointerEvent) {
  if (event.pointerType === 'mouse') {
    props.highlight.endHover()
  }
}
</script>

<template>
  <ul class="player-picker">
    <li v-for="id in PLAYER_IDS" :key="id">
      <button
        class="player-picker__item"
        :class="{
          'player-picker__item--shown': props.highlight.shownPlayer === id,
          'player-picker__item--off': id === props.bench,
        }"
        :aria-pressed="props.highlight.focus === id"
        @click="props.highlight.toggleFocus(id)"
        @pointerenter="onPointerEnter($event, id)"
        @pointerleave="onPointerLeave"
      >
        <!-- Галочка закрепления сидит на углу кружка и не сдвигает текст -->
        <span class="player-picker__dot">
          <RoleDot :role="PLAYERS[id].role" :label="PLAYERS[id].label" :size="30" />
          <svg
            v-if="props.highlight.focus === id"
            class="player-picker__pin"
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="3.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M5 12l5 5 9-10" />
          </svg>
        </span>

        <!-- Имя по центру карточки, статус появляется под ним мелкой строкой -->
        <span class="player-picker__text">
          <span class="player-picker__name">{{ PLAYERS[id].name }}</span>
          <span v-if="status(id)" class="player-picker__status">{{ status(id) }}</span>
        </span>
      </button>
    </li>
  </ul>
</template>

<style scoped lang="scss">
.player-picker {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;

  @media (max-width: 420px) {
    grid-template-columns: minmax(0, 1fr);
  }

  &__item {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    min-height: 40px;
    padding: 4px 10px 4px 6px;
    border: 1px solid var(--color-line-strong);
    border-radius: 999px;
    background-color: var(--color-paper);
    text-align: left;
    transition:
      border-color 0.2s,
      box-shadow 0.2s,
      opacity 0.2s;

    &:hover,
    &--shown {
      border-color: var(--color-ink);
    }

    &:focus-visible {
      outline: 3px solid var(--color-accent);
      outline-offset: 2px;
    }

    &[aria-pressed='true'] {
      border-color: var(--color-accent);
      box-shadow: inset 0 0 0 1px var(--color-accent);
    }

    &--off {
      opacity: 0.6;
    }
  }

  &__dot {
    position: relative;
    display: inline-flex;
    flex-shrink: 0;
  }

  &__pin {
    position: absolute;
    right: -4px;
    bottom: -4px;
    box-sizing: content-box;
    padding: 2px;
    border: 1.5px solid var(--color-paper);
    border-radius: 50%;
    background-color: var(--color-accent);
    color: var(--color-paper);
  }

  &__text {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    min-width: 0;
  }

  &__name,
  &__status {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__name {
    font-size: 15px;
    font-weight: 500;
    line-height: 1.2;
  }

  &__status {
    font-size: 12px;
    line-height: 1.2;
    color: var(--color-muted);
  }
}
</style>
