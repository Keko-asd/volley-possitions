<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import PageIntro from '@/components/PageIntro.vue'
import BottomSheet from '@/components/BottomSheet.vue'
import CourtBoard from '@/components/CourtBoard.vue'
import ControlStep from '@/components/controls/ControlStep.vue'
import RotationPicker from '@/components/controls/RotationPicker.vue'
import PhasePicker from '@/components/controls/PhasePicker.vue'
import PlayerPicker from '@/components/controls/PlayerPicker.vue'
import { PHASES, RALLY_STARTS, dependsOnStart, getPhaseLayout } from '@/data/phases'
import { receiveThreeSixBack } from '@/data/schemes/receiveThreeSixBack'
import { useCourtHighlight } from '@/composables/useCourtHighlight'
import { usePhasePlayback } from '@/composables/usePhasePlayback'
import { useOpponentAttack } from '@/composables/useOpponentAttack'
import { useMediaQuery } from '@/composables/useMediaQuery'
import type { Phase, RallyStart, Rotation } from '@/types/volleyball'

const rotation = ref<Rotation>(1)
const phase = ref<Phase>('base')
const rallyStart = ref<RallyStart>('receive')
const opponentAttack = useOpponentAttack(phase)

const layout = computed(() =>
  getPhaseLayout(
    receiveThreeSixBack,
    rotation.value,
    phase.value,
    rallyStart.value,
    opponentAttack.zone.value,
  ),
)
const phaseInfo = computed(() => PHASES.find((item) => item.id === phase.value)!)
const startMatters = computed(() =>
  dependsOnStart(receiveThreeSixBack, rotation.value, phase.value),
)
// «Атака с приёма»: начало розыгрыша дописываем только туда, где оно что-то меняет
const phaseTitle = computed(() => {
  if (!startMatters.value) {
    return phaseInfo.value.label
  }

  const start = RALLY_STARTS.find((item) => item.id === rallyStart.value)!

  return `${phaseInfo.value.label} ${start.label.toLowerCase()}`
})

const highlight = useCourtHighlight(layout)
const playback = usePhasePlayback(phase)

// Ручной выбор фазы прерывает показ перехода, иначе таймер перебьёт выбор
const selectedPhase = computed({
  get: () => phase.value,
  set: (value: Phase) => {
    playback.stop()
    phase.value = value
  },
})

// Телефоны и планшеты: площадка на весь экран, настройки в шторке снизу.
// Должно совпадать с медиазапросами в стилях ниже и в CourtBoard.
const isCompact = useMediaQuery('(max-width: 1024px)')
const settingsOpen = ref(false)

// Повернули планшет и вышли из компактной вёрстки — шторка больше не нужна
watch(isCompact, (value) => {
  if (!value) {
    settingsOpen.value = false
  }
})

// Шапка и шаги рендерятся один раз внутри обёртки: на телефоне это шторка,
// на компьютере — div с display: contents, чтобы шапка и шаги остались ячейками сетки
const settingsWrapper = computed(() =>
  isCompact.value
    ? {
        is: BottomSheet,
        attrs: {
          title: 'Настройки',
          open: settingsOpen.value,
          'onUpdate:open': (value: boolean) => (settingsOpen.value = value),
        },
      }
    : { is: 'div', attrs: { class: 'home-page__settings' } },
)
</script>

<template>
  <div class="home-page">
    <!-- На телефоне и планшете шапка и настройки в шторке, на компьютере стоят на странице -->
    <component :is="settingsWrapper.is" v-bind="settingsWrapper.attrs">
      <PageIntro class="home-page__intro" />

      <div class="home-page__controls">
        <ControlStep
          :step="1"
          title="Выберите выход"
          hint="Номер выхода — зона, где стоит связующий."
        >
          <RotationPicker v-model="rotation" />
        </ControlStep>

        <ControlStep
          :step="2"
          title="Выберите момент розыгрыша"
          hint="Для атаки и защиты укажите, с чего начался розыгрыш, для защиты — откуда бьёт соперник."
        >
          <PhasePicker
            v-model="selectedPhase"
            v-model:start="rallyStart"
            v-model:opponent="opponentAttack.choice.value"
            :start-enabled="startMatters"
          />
        </ControlStep>

        <ControlStep
          :step="3"
          title="Следите за игроком"
          hint="Наведите — увидите зону, нажмите — закрепите."
        >
          <PlayerPicker :highlight="highlight" :bench="layout.bench" />
        </ControlStep>
      </div>
    </component>

    <CourtBoard
      class="home-page__court"
      :layout="layout"
      :highlight="highlight"
      :rotation="rotation"
      :phase="phaseInfo"
      :title="phaseTitle"
      :opponent-zone="phase === 'defense' ? opponentAttack.zone.value : null"
      :playing="playback.playing.value"
      @play="playback.play()"
    />

    <button
      v-if="isCompact"
      class="home-page__settings-button"
      aria-haspopup="dialog"
      @click="settingsOpen = true"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        aria-hidden="true"
      >
        <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
        <circle cx="16" cy="7" r="2" />
        <circle cx="10" cy="17" r="2" />
      </svg>
      Настройки
    </button>
  </div>
</template>

<style scoped lang="scss">
// Компьютер: слева настраиваем, справа смотрим.
// Телефон и планшет: площадка на весь экран, снизу кнопка настроек, сами настройки в шторке.
.home-page {
  display: grid;
  grid-template-columns: minmax(340px, 440px) minmax(0, 1fr);
  grid-template-areas:
    'intro intro'
    'controls court';
  align-items: start;
  gap: var(--pu-2) var(--pu-4);
  max-width: 1440px;
  margin-inline: auto;
  padding: var(--pu-2) var(--pu-4) var(--pu-4);

  @media (max-width: 1024px) {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    height: 100dvh;
    padding: 12px var(--pu-1) calc(12px + env(safe-area-inset-bottom));
  }

  &__intro {
    grid-area: intro;
  }

  &__controls {
    grid-area: controls;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  // Площадка остаётся на экране, пока листаешь настройки
  &__court {
    grid-area: court;
    position: sticky;
    top: var(--pu-1);

    @media (max-width: 1024px) {
      position: static;
      flex: 1;
      min-height: 0;
    }
  }

  &__settings {
    display: contents;
  }

  &__settings-button {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    max-width: 640px;
    min-height: 52px;
    margin-inline: auto;
    border-radius: 12px;
    background-color: var(--color-ink);
    font-size: 16px;
    font-weight: 600;
    color: var(--color-paper);

    &:hover {
      background-color: var(--color-ink-soft);
    }

    &:focus-visible {
      outline: 3px solid var(--color-accent);
      outline-offset: 2px;
    }
  }
}
</style>
