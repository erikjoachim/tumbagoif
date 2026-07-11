<script setup lang="ts">
import { computed } from "vue"

const props = withDefaults(defineProps<{
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  href?: string
}>(), {
  variant: 'primary',
  size: 'md',
})

const classes = computed(() => [
  't-btn',
  `t-btn--${props.variant}`,
  `t-btn--${props.size}`,
])
</script>

<template>
  <a v-if="href" :href="href" :class="classes">
    <slot />
  </a>
  <button v-else :class="classes">
    <slot />
  </button>
</template>

<style scoped>
.t-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: calc(var(--spacing-unit) * 1.5);
  font-weight: var(--font-weight-semibold);
  transition: all 0.3s ease;
  cursor: pointer;
  border: none;
  font-family: var(--font-family-sans);
}

.t-btn--sm {
  padding: calc(var(--spacing-unit) * 1) calc(var(--spacing-unit) * 2.5);
  font-size: var(--font-size-sm);
}

.t-btn--md {
  padding: calc(var(--spacing-unit) * 2) calc(var(--spacing-unit) * 4);
  font-size: var(--font-size-base);
}

.t-btn--lg {
  padding: calc(var(--spacing-unit) * 2.5) calc(var(--spacing-unit) * 5);
  font-size: var(--font-size-lg);
}

.t-btn--primary {
  background: var(--color-red-600);
  color: white;
}

.t-btn--primary:hover {
  background: var(--color-red-700);
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(220, 38, 38, 0.3);
}

.t-btn--secondary {
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.t-btn--secondary:hover {
  background: var(--color-bg-tertiary);
  border-color: var(--color-border-hover);
  transform: translateY(-2px);
}
</style>
