<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string;
    description?: string;
    href: string;
    icon?: string;
    size?: "sm" | "md" | "lg";
    showArrow?: boolean;
    external?: boolean;
  }>(),
  {
    description: "",
    icon: "",
    size: "md",
    showArrow: true,
    external: false,
  },
);
</script>

<template>
  <a
    :href="href"
    :target="external ? '_blank' : undefined"
    :rel="external ? 'noopener' : undefined"
    :class="['t-link-card', `t-link-card--${size}`]"
  >
    <div class="t-link-card__content">
      <div class="t-link-card__text">
        <div v-if="icon" class="t-link-card__icon">{{ icon }}</div>
        <h3 class="t-link-card__title">{{ title }}</h3>
        <p v-if="description" class="t-link-card__description">{{ description }}</p>
      </div>
      <div v-if="showArrow" class="t-link-card__arrow" aria-hidden="true">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7 17L17 7M17 7H7M17 7V17"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
    </div>
    <div class="t-link-card__bg" />
  </a>
</template>

<style scoped>
.t-link-card {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: calc(var(--spacing-unit) * 4);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: calc(var(--spacing-unit) * 3);
  overflow: hidden;
  transition: all 0.4s ease;
  cursor: pointer;
  min-height: 300px;
  text-decoration: none;
}

.t-link-card::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(220, 38, 38, 0.1) 0%, transparent 100%);
  opacity: 0;
  transition: opacity 0.4s ease;
}

.t-link-card:hover {
  border-color: var(--color-red-600);
  transform: translateY(-8px);
  box-shadow: 0 16px 40px rgba(220, 38, 38, 0.2);
}

.t-link-card:hover::before {
  opacity: 1;
}

.t-link-card:hover .t-link-card__bg {
  transform: scale(1.1);
}

.t-link-card:hover .t-link-card__arrow {
  transform: translate(4px, -4px);
}

.t-link-card__content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  gap: calc(var(--spacing-unit) * 3);
}

.t-link-card__text {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.t-link-card__icon {
  font-size: 3.5rem;
  margin-bottom: calc(var(--spacing-unit) * 2);
  flex-shrink: 0;
  line-height: 1;
}

.t-link-card__title {
  font-size: clamp(1.5rem, 3vw, 2rem);
  margin-bottom: calc(var(--spacing-unit) * 2);
  color: var(--color-text-primary);
  flex-shrink: 0;
}

.t-link-card__description {
  font-size: 0.9375rem;
  color: var(--color-text-secondary);
  line-height: var(--line-height-normal);
  flex: 1;
  overflow-wrap: break-word;
}

.t-link-card__arrow {
  flex-shrink: 0;
  align-self: flex-end;
  width: 48px;
  height: 48px;
  min-width: 48px;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-red-600);
  border-radius: 50%;
  color: white;
  transition: all 0.3s ease;
  margin-top: calc(var(--spacing-unit) * 2);
}

.t-link-card__bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 80% 20%, rgba(220, 38, 38, 0.05) 0%, transparent 60%);
  transition: transform 0.4s ease;
  pointer-events: none;
}

@media (min-width: 640px) {
  .t-link-card--lg {
    grid-column: span 2;
  }
}

@media (min-width: 768px) {
  .t-link-card--lg {
    grid-column: span 4;
  }

  .t-link-card--md {
    grid-column: span 2;
  }
}
</style>
