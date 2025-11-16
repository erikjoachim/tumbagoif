<script setup lang="ts">
const currentYear = new Date().getFullYear()

const navigation = {
  sports: [
    { name: 'Basket', href: '#' },
    { name: 'Gymnastik', href: '#' },
    { name: 'Innebandy', href: '#' },
    { name: 'Gymmix', href: '#' }
  ],
  company: [
    { name: 'Om oss', href: '#about' },
    { name: 'Kontakt', href: '#' },
    { name: 'Bli medlem', href: '#' },
    { name: 'Nyheter', href: '#' }
  ],
  legal: [
    { name: 'Integritetspolicy', href: '#' },
    { name: 'Stadgar', href: '#' },
    { name: 'Cookies', href: '#' }
  ]
}
</script>

<template>
  <footer class="footer">
    <div class="footer-container">
      <div class="footer-grid">
        <div class="footer-brand">
          <h3 class="brand-name">Tumba Gymnastik och Idrottsförening</h3>
          <p class="brand-tagline">
            En ideell förening som skapar gemenskap och glädje genom idrott för alla.
          </p>
          <div class="social-links">
            <a href="#" class="social-link" aria-label="Facebook">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            <a href="#" class="social-link" aria-label="Instagram">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a href="#" class="social-link" aria-label="Twitter">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
            </a>
          </div>
        </div>

        <div class="footer-links">
          <div class="link-group">
            <h4 class="link-title">Våra idrotter</h4>
            <ul class="link-list">
              <li v-for="item in navigation.sports" :key="item.name">
                <a :href="item.href" class="link">{{ item.name }}</a>
              </li>
            </ul>
          </div>

          <div class="link-group">
            <h4 class="link-title">Föreningen</h4>
            <ul class="link-list">
              <li v-for="item in navigation.company" :key="item.name">
                <a :href="item.href" class="link">{{ item.name }}</a>
              </li>
            </ul>
          </div>

          <div class="link-group">
            <h4 class="link-title">Information</h4>
            <ul class="link-list">
              <li v-for="item in navigation.legal" :key="item.name">
                <a :href="item.href" class="link">{{ item.name }}</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <p class="copyright">
          &copy; {{ currentYear }} Tumba Gymnastik och Idrottsförening. Alla rättigheter förbehållna.
        </p>
        <div class="contact-info">
          <a href="mailto:info@idrottsforeningen.se" class="contact-link">info@tumbagoif.se</a>
          <span class="separator">•</span>
          <a href="tel:+46101234567" class="contact-link">010-123 45 67</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: var(--color-bg-secondary);
  border-top: 1px solid var(--color-border);
  padding: calc(var(--spacing-unit) * 8) calc(var(--spacing-unit) * 3);
}

.footer-container {
  max-width: 1400px;
  margin: 0 auto;
}

.footer-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: calc(var(--spacing-unit) * 6);
  margin-bottom: calc(var(--spacing-unit) * 6);
}

.footer-brand {
  max-width: 400px;
}

.brand-name {
  font-size: 1.5rem;
  margin-bottom: calc(var(--spacing-unit) * 2);
  background: linear-gradient(135deg, var(--color-text-primary) 0%, var(--color-red-600) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.brand-tagline {
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin-bottom: calc(var(--spacing-unit) * 3);
}

.social-links {
  display: flex;
  gap: calc(var(--spacing-unit) * 2);
}

.social-link {
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
}

.social-link:hover {
  background: var(--color-red-600);
  border-color: var(--color-red-600);
  color: white;
  transform: translateY(-2px);
}

.footer-links {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: calc(var(--spacing-unit) * 4);
}

.link-group {
  display: flex;
  flex-direction: column;
}

.link-title {
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-primary);
  margin-bottom: calc(var(--spacing-unit) * 2);
}

.link-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing-unit) * 1.5);
}

.link {
  color: var(--color-text-secondary);
  font-size: 0.9375rem;
  transition: color 0.3s ease;
}

.link:hover {
  color: var(--color-red-600);
}

.footer-bottom {
  padding-top: calc(var(--spacing-unit) * 4);
  border-top: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing-unit) * 2);
  align-items: center;
  text-align: center;
}

.copyright {
  color: var(--color-text-tertiary);
  font-size: 0.875rem;
}

.contact-info {
  display: flex;
  align-items: center;
  gap: calc(var(--spacing-unit) * 2);
  flex-wrap: wrap;
  justify-content: center;
}

.contact-link {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  transition: color 0.3s ease;
}

.contact-link:hover {
  color: var(--color-red-600);
}

.separator {
  color: var(--color-text-tertiary);
}

@media (min-width: 768px) {
  .footer {
    padding: calc(var(--spacing-unit) * 10) calc(var(--spacing-unit) * 4);
  }

  .footer-grid {
    grid-template-columns: 1.5fr 2fr;
  }

  .footer-bottom {
    flex-direction: row;
    justify-content: space-between;
  }
}

@media (min-width: 1024px) {
  .footer {
    padding: calc(var(--spacing-unit) * 12) calc(var(--spacing-unit) * 6);
  }
}
</style>
