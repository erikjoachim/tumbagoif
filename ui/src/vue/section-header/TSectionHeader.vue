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
}

.t-section-header__title {
  margin-bottom: calc(var(--spacing-unit) * 3);
  font-size: clamp(2rem, 6vw, 3.5rem);
  letter-spacing: -0.02em;
  line-height: 1.2;
  font-weight: 700;
  color: var(--color-text-primary);
}

.t-section-header__highlight {
  background: linear-gradient(
    135deg,
    var(--color-red-600) 0%,
    var(--color-red-400) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.t-section-header__description {
  font-size: 1.125rem;
  color: var(--color-text-secondary);
  line-height: 1.8;
}
</style>
