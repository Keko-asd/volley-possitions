<script setup lang="ts">
import { computed } from 'vue'
import VolleyballCourt from '@/components/VolleyballCourt.vue'
import PlayerMarker from '@/components/PlayerMarker.vue'
import AttackArrow from '@/components/AttackArrow.vue'
import OpponentAttackMark from '@/components/OpponentAttackMark.vue'
import ResponsibilityZone from '@/components/ResponsibilityZone.vue'
import ZoneTooltip from '@/components/ZoneTooltip.vue'
import { PLAYERS, PLAYER_IDS } from '@/data/players'
import type { PhaseInfo } from '@/data/phases'
import type { CourtHighlight } from '@/composables/useCourtHighlight'
import type { OpponentZone, PhaseLayout, PlayerId, Point, Rotation } from '@/types/volleyball'

// Правая колонка: что сейчас на площадке и сама площадка с зонами.
const props = defineProps<{
  layout: PhaseLayout
  highlight: CourtHighlight
  rotation: Rotation
  phase: PhaseInfo
  // Заголовок над площадкой: фаза, а для атаки и защиты ещё и начало розыгрыша
  title: string
  // Защита: откуда сейчас атакует соперник; на других фазах null
  opponentZone: OpponentZone | null
  // Идёт показ перехода из расстановки
  playing: boolean
}>()

const emit = defineEmits<{
  play: []
}>()

// Должно совпадать с viewBox в VolleyballCourt
const COURT_VIEW: [number, number, number] = [-1.5, -0.6, 12]

const attackArrows = computed(
  () => Object.entries(props.layout.attacks ?? {}) as [PlayerId, Point][],
)
</script>

<template>
  <div class="court-board" @keydown.esc="props.highlight.closeTip()">
    <div class="court-board__head">
      <div class="court-board__title-group">
        <span class="court-board__caption">
          Выход {{ props.rotation }} · связующий в зоне {{ props.rotation }}
        </span>

        <h2 class="court-board__title">{{ props.title }}</h2>
      </div>

      <button
        v-if="props.phase.id !== 'base'"
        class="court-board__play"
        :disabled="props.playing"
        @click="emit('play')"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M7 4.5v15l12-7.5z" />
        </svg>
        {{ props.playing ? 'Смотрим…' : 'Показать переход' }}
      </button>
    </div>

    <div class="court-board__frame">
      <div class="court-board__court">
        <VolleyballCourt>
          <!-- Зоны под фишками, чтобы фишки оставались кликабельными -->
          <template v-if="props.highlight.shownPlayer">
            <ResponsibilityZone
              v-for="(zone, index) in props.highlight.shownZones"
              :key="`${props.highlight.shownPlayer}-${index}`"
              :x="zone.x"
              :y="zone.y"
              :width="zone.width"
              :height="zone.height"
              :role="PLAYERS[props.highlight.shownPlayer].role"
              :reason="zone.reason"
              :active="
                props.highlight.tip?.id === props.highlight.shownPlayer &&
                props.highlight.tip.index === index
              "
              @hover-start="props.highlight.startZoneHover(props.highlight.shownPlayer, index)"
              @hover-end="props.highlight.endZoneHover()"
              @select="props.highlight.toggleTip(props.highlight.shownPlayer, index)"
            />
          </template>

          <!-- Ключ с точками: при смене расстановки стрелка рисуется заново и снова ждёт игрока -->
          <AttackArrow
            v-for="[id, to] in attackArrows"
            :key="`${id}-${props.layout.positions[id].x}-${props.layout.positions[id].y}-${to.x}-${to.y}`"
            :from="props.layout.positions[id]"
            :to="to"
            :role="PLAYERS[id].role"
            :dimmed="props.highlight.isDimmed(id)"
          />

          <OpponentAttackMark v-if="props.opponentZone" :zone="props.opponentZone" />

          <PlayerMarker
            v-for="id in PLAYER_IDS"
            :key="id"
            :x="props.layout.positions[id].x"
            :y="props.layout.positions[id].y"
            :role="PLAYERS[id].role"
            :label="PLAYERS[id].label"
            :name="PLAYERS[id].name"
            :active="props.highlight.focus === id"
            :dimmed="props.highlight.isDimmed(id)"
            @select="props.highlight.toggleFocus(id)"
            @hover-start="props.highlight.startHover(id)"
            @hover-end="props.highlight.endHover()"
          />
        </VolleyballCourt>

        <ZoneTooltip
          v-if="props.highlight.tipZone"
          :player="PLAYERS[props.highlight.tipZone.id]"
          :zone="props.highlight.tipZone.zone"
          :view="COURT_VIEW"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.court-board {
  display: flex;
  flex-direction: column;
  gap: 14px;

  // Телефон и планшет: доска занимает всю высоту, которую ей дала страница
  @media (max-width: 1024px) {
    gap: 8px;
  }

  &__head {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    justify-content: space-between;
    gap: 12px;
  }

  &__title-group {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__caption {
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--color-muted);
  }

  &__title {
    font-family: var(--font-display);
    font-size: 30px;
    font-weight: 700;
    line-height: 1.15;

    @media (max-width: 1024px) {
      font-size: 22px;
    }
  }

  &__play {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 44px;
    padding: 0 16px;
    border-radius: 8px;
    background-color: var(--color-ink);
    font-size: 15px;
    font-weight: 500;
    color: var(--color-paper);

    &:hover:not(:disabled) {
      background-color: var(--color-ink-soft);
    }

    &:disabled {
      cursor: default;
      opacity: 0.6;
    }

    &:focus-visible {
      outline: 3px solid var(--color-accent);
      outline-offset: 2px;
    }
  }

  &__frame {
    padding: var(--pu-1);
    border: 1px solid var(--color-line);
    border-radius: 12px;
    background-color: var(--color-paper);

    // Рамка забирает остаток высоты, площадка вписывается в неё квадратом по центру.
    // Белую подложку убираем: на узком экране она тянулась бы пустыми полосами над и под площадкой.
    @media (max-width: 1024px) {
      display: grid;
      flex: 1;
      place-items: center;
      min-height: 0;
      padding: 0;
      border: none;
      background-color: transparent;
      container-type: size;
    }
  }

  // Квадратная площадка не выше экрана, чтобы на ноутбуке было видно её целиком
  &__court {
    position: relative;
    width: min(100%, calc(100dvh - 200px));
    min-width: min(100%, 320px);
    margin-inline: auto;

    @media (max-width: 1024px) {
      width: min(100cqw, 100cqh);
      min-width: 0;
    }

    :deep(svg) {
      border-radius: 6px;
    }
  }
}
</style>
