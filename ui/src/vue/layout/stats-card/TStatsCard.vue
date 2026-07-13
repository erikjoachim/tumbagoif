<script setup lang="ts">
import TCard from "../card/TCard.vue";

withDefaults(
  defineProps<{
    value: string;
    label: string;
    variant?: "default" | "interactive";
    padding?: "sm" | "md" | "lg";
  }>(),
  { variant: "default", padding: "md" },
);
</script>

<template>
  <TCard :variant="variant" :padding="padding">
    <div class="t-stats-card__value">{{ value }}</div>
    <div class="t-stats-card__label">{{ label }}</div>
  </TCard>
</template>

<style scoped>
.t-stats-card__value {
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: var(--font-weight-bold);
  background: var(--gradient-red);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: calc(var(--spacing-unit) * 1);
}

.t-stats-card__label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wide);
}
</style>
