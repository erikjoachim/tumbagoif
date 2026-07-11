<script setup lang="ts">
defineProps<{
  title: string
  highlight?: string
  description?: string
}>()
</script>

<template>
  <div class="t-section-header">
    <h2 class="t-section-header__title">
      {{ title }}
      <span v-if="highlight" class="t-section-header__highlight">
        {{ highlight }}
      </span>
    </h2>
    <p v-if="description" class="t-section-header__description">
      {{ description }}
    </p>
  </div>
</template>

<style scoped>
.t-section-header {
  max-width: 800px;
  font-family: var(--font-family-sans);
}

.t-section-header__title {
  margin-bottom: calc(var(--spacing-unit) * 3);
  font-size: clamp(2rem, 6vw, 3.5rem);
  letter-spacing: var(--letter-spacing-tight);
  line-height: var(--line-height-tight);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.t-section-header__highlight {
  background: var(--gradient-red);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.t-section-header__description {
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
  line-height: var(--line-height-loose);
}
</style>
