<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: "default" | "interactive";
    padding?: "sm" | "md" | "lg";
  }>(),
  {
    variant: "default",
    padding: "md",
  },
);
</script>

<template>
  <div :class="['t-card', `t-card--${variant}`, `t-card--pad-${padding}`]">
    <slot />
  </div>
</template>

<style scoped>
.t-card {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: calc(var(--spacing-unit) * 3);
  transition: all 0.3s ease;
}

.t-card--pad-sm {
  padding: calc(var(--spacing-unit) * 2);
}

.t-card--pad-md {
  padding: calc(var(--spacing-unit) * 4);
}

.t-card--pad-lg {
  padding: calc(var(--spacing-unit) * 6);
}

.t-card--interactive {
  cursor: pointer;
}

.t-card--interactive:hover {
  border-color: var(--color-red-600);
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(220, 38, 38, 0.15);
}
</style>
