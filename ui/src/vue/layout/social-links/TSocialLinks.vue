<script setup lang="ts">
import { computed, type Component } from "vue";
import FacebookIcon from "./icons/FacebookIcon.vue";
import InstagramIcon from "./icons/InstagramIcon.vue";
import XIcon from "./icons/XIcon.vue";

export interface SocialLink {
  name: string;
  href: string;
  label?: string;
}

const props = withDefaults(
  defineProps<{
    links: SocialLink[];
  }>(),
  {
    links: () => [],
  },
);

const brandIcons: Record<string, Component> = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  x: XIcon,
  twitter: XIcon,
};

const resolved = computed(() =>
  props.links.map((link) => ({
    ...link,
    icon: brandIcons[link.name.toLowerCase()] ?? FacebookIcon,
  })),
);
</script>

<template>
  <div class="t-social-links">
    <a
      v-for="link in resolved"
      :key="link.name"
      :href="link.href"
      :aria-label="link.label ?? link.name"
      class="t-social-links__link"
      target="_blank"
      rel="noopener"
    >
      <component :is="link.icon" />
    </a>
    <slot />
  </div>
</template>

<style scoped>
.t-social-links {
  display: flex;
  gap: calc(var(--spacing-unit) * 2);
}

.t-social-links__link {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  border-radius: 50%;
  color: var(--color-text-secondary);
  transition: all 0.3s ease;
  text-decoration: none;
}

.t-social-links__link:hover {
  background: var(--color-red-600);
  border-color: var(--color-red-600);
  color: white;
  transform: translateY(-2px);
}
</style>
