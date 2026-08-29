<script setup lang="ts">
import { computed } from "vue";
import TSocialLinks, { type SocialLink } from "../social-links/TSocialLinks.vue";

export interface FooterLink {
  name: string;
  href: string;
}

export interface FooterLinkGroup {
  title: string;
  items: FooterLink[];
}

export interface FooterContact {
  email?: string;
  phone?: string;
}

const props = withDefaults(
  defineProps<{
    brandName: string;
    tagline?: string;
    links?: FooterLinkGroup[];
    socials?: SocialLink[];
    copyright?: string;
    contact?: FooterContact;
    brandHighlight?: boolean;
  }>(),
  {
    tagline: "",
    links: () => [],
    socials: () => [],
    copyright: "",
    contact: () => ({}),
    brandHighlight: true,
  },
);

const copyrightText = computed(() => {
  const year = new Date().getFullYear();
  if (props.copyright) return props.copyright;
  return `© ${year}`;
});
</script>

<template>
  <footer class="t-footer">
    <div class="t-footer__container">
      <div class="t-footer__grid">
        <div class="t-footer__brand">
          <h3
            :class="['t-footer__brand-name', { 't-footer__brand-name--highlight': brandHighlight }]"
          >
            {{ brandName }}
          </h3>
          <p v-if="tagline" class="t-footer__tagline">{{ tagline }}</p>
          <TSocialLinks v-if="socials.length" :links="socials" />
        </div>

        <div v-if="links.length" class="t-footer__links">
          <div v-for="group in links" :key="group.title" class="t-footer__link-group">
            <h4 class="t-footer__link-title">{{ group.title }}</h4>
            <ul class="t-footer__link-list">
              <li v-for="item in group.items" :key="item.name">
                <a :href="item.href" class="t-footer__link">{{ item.name }}</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div v-if="copyrightText || contact?.email || contact?.phone" class="t-footer__bottom">
        <p v-if="copyrightText" class="t-footer__copyright">{{ copyrightText }}</p>
        <div v-if="contact?.email || contact?.phone" class="t-footer__contact">
          <a v-if="contact?.email" :href="`mailto:${contact.email}`" class="t-footer__contact-link">
            {{ contact.email }}
          </a>
          <span v-if="contact?.email && contact?.phone" class="t-footer__separator">•</span>
          <a v-if="contact?.phone" :href="`tel:${contact.phone}`" class="t-footer__contact-link">
            {{ contact.phone }}
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.t-footer {
  background: var(--color-bg-secondary);
  border-top: 1px solid var(--color-border);
  padding: calc(var(--spacing-unit) * 8) calc(var(--spacing-unit) * 3);
}

.t-footer__container {
  max-width: 1400px;
  margin: 0 auto;
}

.t-footer__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: calc(var(--spacing-unit) * 6);
  margin-bottom: calc(var(--spacing-unit) * 6);
}

.t-footer__brand {
  max-width: 400px;
}

.t-footer__brand-name {
  font-size: 1.5rem;
  margin-bottom: calc(var(--spacing-unit) * 2);
  color: var(--color-text-primary);
}

.t-footer__brand-name--highlight {
  background: linear-gradient(135deg, var(--color-text-primary) 0%, var(--color-red-600) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.t-footer__tagline {
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin-bottom: calc(var(--spacing-unit) * 3);
}

.t-footer__links {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: calc(var(--spacing-unit) * 4);
}

.t-footer__link-group {
  display: flex;
  flex-direction: column;
}

.t-footer__link-title {
  font-size: 0.875rem;
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wide);
  color: var(--color-text-primary);
  margin-bottom: calc(var(--spacing-unit) * 2);
}

.t-footer__link-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing-unit) * 1.5);
}

.t-footer__link {
  color: var(--color-text-secondary);
  font-size: 0.9375rem;
  transition: color 0.3s ease;
  text-decoration: none;
}

.t-footer__link:hover {
  color: var(--color-red-600);
}

.t-footer__bottom {
  padding-top: calc(var(--spacing-unit) * 4);
  border-top: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing-unit) * 2);
  align-items: center;
  text-align: center;
}

.t-footer__copyright {
  color: var(--color-text-tertiary);
  font-size: var(--font-size-sm);
}

.t-footer__contact {
  display: flex;
  align-items: center;
  gap: calc(var(--spacing-unit) * 2);
  flex-wrap: wrap;
  justify-content: center;
}

.t-footer__contact-link {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  transition: color 0.3s ease;
  text-decoration: none;
}

.t-footer__contact-link:hover {
  color: var(--color-red-600);
}

.t-footer__separator {
  color: var(--color-text-tertiary);
}

@media (min-width: 768px) {
  .t-footer {
    padding: calc(var(--spacing-unit) * 10) calc(var(--spacing-unit) * 4);
  }

  .t-footer__grid {
    grid-template-columns: 1.5fr 2fr;
  }

  .t-footer__bottom {
    flex-direction: row;
    justify-content: space-between;
  }
}

@media (min-width: 1024px) {
  .t-footer {
    padding: calc(var(--spacing-unit) * 12) calc(var(--spacing-unit) * 6);
  }
}
</style>
