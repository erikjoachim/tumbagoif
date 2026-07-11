<script setup lang="ts">
withDefaults(
  defineProps<{
    stats: Array<{ value: string; label: string }>;
    columns?: number;
  }>(),
  {
    columns: 4,
  },
);
</script>

<template>
  <div class="t-stats-grid" :style="{ '--t-columns': columns }">
    <div v-for="stat in stats" :key="stat.label" class="t-stat-card">
      <div class="t-stat-card__value">{{ stat.value }}</div>
      <div class="t-stat-card__label">{{ stat.label }}</div>
    </div>
  </div>
</template>

<style scoped>
.t-stats-grid {
  display: grid;
  grid-template-columns: repeat(var(--t-columns, 4), 1fr);
  gap: calc(var(--spacing-unit) * 3);
}

@media (max-width: 640px) {
  .t-stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.t-stat-card {
  padding: calc(var(--spacing-unit) * 4);
  font-family: var(--font-family-sans);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: calc(var(--spacing-unit) * 2);
  transition: all 0.3s ease;
  text-align: center;
}

.t-stat-card:hover {
  border-color: var(--color-red-600);
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(220, 38, 38, 0.15);
}

.t-stat-card__value {
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: var(--font-weight-bold);
  background: var(--gradient-red);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: calc(var(--spacing-unit) * 1);
}

.t-stat-card__label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wide);
}
</style>
