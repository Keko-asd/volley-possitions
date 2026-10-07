<script setup lang="ts">
// Пронумерованный шаг настройки: номер, заголовок, подсказка и сами контролы в слоте.
// Номера подсказывают порядок: сначала выход, потом момент, потом игрок.
const props = defineProps<{
  step: number
  title: string
  hint?: string
}>()
</script>

<template>
  <section class="control-step" :aria-labelledby="`control-step-${props.step}`">
    <span class="control-step__number" aria-hidden="true">{{ props.step }}</span>
    <div class="control-step__body">
      <h2 :id="`control-step-${props.step}`" class="control-step__title">{{ props.title }}</h2>
      <p v-if="props.hint" class="control-step__hint">{{ props.hint }}</p>
      <div class="control-step__content">
        <slot />
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.control-step {
  display: grid;
  grid-template-columns: 36px minmax(0, 1fr);
  gap: 16px;

  &__number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background-color: var(--color-ink);
    font-family: var(--font-display);
    font-size: 17px;
    font-weight: 600;
    color: var(--color-paper);
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
    padding-top: 4px;
  }

  &__title {
    font-family: var(--font-display);
    font-size: 19px;
    font-weight: 600;
  }

  &__hint {
    font-size: 13px;
    line-height: 1.45;
    color: var(--color-muted);
  }

  &__content {
    margin-top: 8px;
  }
}
</style>
