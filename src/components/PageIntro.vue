<script setup lang="ts">
// Шапка страницы: что это за сайт и зачем он нужен
</script>

<template>
  <header class="intro">
    <p class="intro__eyebrow">Волейбол · 5–1</p>
    <h1 class="intro__title">Кто где стоит и за что отвечает</h1>
    <p class="intro__lead">
      Шпаргалка для команды с одним связующим: выберите выход и момент розыгрыша, наведите на игрока
      — увидите его зону ответственности.
    </p>
  </header>
</template>

<style scoped lang="scss">
.intro {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 1200px;

  &__eyebrow {
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-accent);
  }

  &__title {
    font-family: var(--font-display);
    font-size: clamp(28px, 3vw, 38px);
    font-weight: 700;
    line-height: 1.1;
  }

  &__lead {
    font-size: 16px;
    line-height: 1.55;
    color: var(--color-ink-soft);
  }
}
</style>
