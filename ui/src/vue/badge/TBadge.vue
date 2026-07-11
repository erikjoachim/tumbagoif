<script setup lang="ts">
withDefaults(defineProps<{
  label?: string
  variant?: 'default' | 'pulse'
}>(), {
  variant: 'default'
})
</script>

<template>
  <span :class="['t-badge', `t-badge--${variant}`]">
    <span v-if="variant === 'pulse'" class="t-badge__dot" />
    <slot>{{ label }}</slot>
  </span>
</template>

<style scoped>
.t-badge {
  display: inline-flex;
  align-items: center;
  gap: calc(var(--spacing-unit) * 1.5);
  padding: calc(var(--spacing-unit) * 1.5) calc(var(--spacing-unit) * 3);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 100px;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.t-badge__dot {
  width: 8px;
  height: 8px;
  background: var(--color-red-600);
  border-radius: 50%;
  animation: t-badge-pulse 2s infinite;
}

@keyframes t-badge-pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.2);
  }
}
</style>
