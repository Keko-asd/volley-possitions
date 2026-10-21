<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import VolleyballCourt from '@/components/VolleyballCourt.vue'
import PlayerMarker from '@/components/PlayerMarker.vue'
import AttackArrow from '@/components/AttackArrow.vue'
import OpponentAttackMark from '@/components/OpponentAttackMark.vue'
import ResponsibilityZone from '@/components/ResponsibilityZone.vue'
import ZoneTooltip from '@/components/ZoneTooltip.vue'
import OverlapLine from '@/components/OverlapLine.vue'
import { PLAYERS, PLAYER_IDS } from '@/data/players'
import type { OverlapLine as OverlapLineData } from '@/data/overlap'
import type { PhaseInfo } from '@/data/phases'
import type { CourtHighlight } from '@/composables/useCourtHighlight'
import type {
  OpponentZone,
  PhaseLayout,
  PlayerId,
  Point,
  ResponsibilityZone as ResponsibilityZoneData,
  Rotation,
} from '@/types/volleyball'

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
  // Приём: линии расстановки для выделенного игрока; на других фазах пусто
  overlapLines: OverlapLineData[]
}>()

const emit = defineEmits<{
  play: []
}>()

// Должно совпадать с viewBox в VolleyballCourt
const COURT_VIEW: [number, number, number] = [-1.5, -0.6, 12]

const attackArrows = computed(
  () => Object.entries(props.layout.attacks ?? {}) as [PlayerId, Point][],
)

// Подсказка по линии расстановки: наведение открывает её временно, клик закрепляет
const overlapTip = ref<{ index: number; pinned: boolean } | null>(null)

// Линии другого игрока или другой фазы — старая подсказка уже не про то
watch(
  () => props.overlapLines,
  () => {
    overlapTip.value = null
  },
)

// Подсказку ставим у середины линии; подсказка зоны ответственности важнее
const overlapTipZone = computed(() => {
  const line = overlapTip.value && props.overlapLines[overlapTip.value.index]
  const id = props.highlight.shownPlayer

  if (!line || !id || props.highlight.tipZone) {
    return null
  }

  const zone: ResponsibilityZoneData = {
    x: line.axis === 'x' ? line.value : 4.5,
    y: line.axis === 'y' ? line.value : 4.5,
    width: 0,
    height: 0,
    reason: line.reason,
  }

  return { player: PLAYERS[id], zone }
})

// Пока курсор на линии или заливке, зоны игрока не гаснут — как при наведении на его зону
function startOverlapHover(index: number) {
  if (props.highlight.shownPlayer) {
    props.highlight.startHover(props.highlight.shownPlayer)
  }

  if (!overlapTip.value?.pinned) {
    overlapTip.value = { index, pinned: false }
  }
}

function endOverlapHover() {
  props.highlight.endHover()

  if (!overlapTip.value?.pinned) {
    overlapTip.value = null
  }
}

function toggleOverlapTip(index: number) {
  const current = overlapTip.value
  const same = current?.pinned && current.index === index

  overlapTip.value = same ? null : { index, pinned: true }
}

function closeTips() {
  props.highlight.closeTip()
  overlapTip.value = null
}
</script>

<template>
  <div class="court-board" @keydown.esc="closeTips()">
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
          <!-- Приём: запретные стороны линий под зонами, чтобы не перекрывать их подсказки -->
          <OverlapLine
            v-for="(line, index) in props.overlapLines"
            :key="`area-${line.neighbor}-${line.axis}`"
            layer="area"
            :line="line"
            :label="PLAYERS[line.neighbor].label"
            :active="overlapTip?.pinned === true && overlapTip.index === index"
            @hover-start="startOverlapHover(index)"
            @hover-end="endOverlapHover()"
            @select="toggleOverlapTip(index)"
          />

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

          <!-- Приём: линии соседей, за которые игрок не заходит до подачи, поверх зон -->
          <OverlapLine
            v-for="(line, index) in props.overlapLines"
            :key="`line-${line.neighbor}-${line.axis}`"
            layer="line"
            :line="line"
            :label="PLAYERS[line.neighbor].label"
            :active="overlapTip?.pinned === true && overlapTip.index === index"
            @hover-start="startOverlapHover(index)"
            @hover-end="endOverlapHover()"
            @select="toggleOverlapTip(index)"
          />

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

        <ZoneTooltip
          v-else-if="overlapTipZone"
          :player="overlapTipZone.player"
          :zone="overlapTipZone.zone"
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
