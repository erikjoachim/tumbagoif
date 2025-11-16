<script setup lang="ts">
const sports = [
  {
    name: 'Gymnastik',
    description: 'Utveckla styrka, rörlighet och koordination i en trygg miljö.',
    icon: '🤸',
    url: '#',
    size: 'large'
  },
  {
    name: 'Basket',
    description: 'Träning och matcher för alla åldrar. Från nybörjare till erfarna spelare.',
    icon: '🏀',
    url: '#',
    size: 'medium'
  },
  {
    name: 'Innebandy',
    description: 'Lagsport med tempo och glädje. Lag för alla nivåer.',
    icon: '🏑',
    url: '#',
    size: 'medium'
  },
  {
    name: 'Gymmix',
    description: 'Träna tillsammans i grupp med fokus på glädje och hälsa.',
    icon: '💪',
    url: '#',
    size: 'large'
  }
]
</script>

<template>
  <section id="sports" class="sports">
    <div class="sports-container">
      <div class="sports-header">
        <h2 class="section-title">
          Hitta din <span class="highlight">grej</span>
        </h2>
        <p class="section-description">
          Utforska våra fyra idrottsgrenar, var och en med egna träningsmöjligheter och sammanhang.
        </p>
      </div>

      <div class="bento-grid">
        <a
          v-for="sport in sports"
          :key="sport.name"
          :href="sport.url"
          :class="['sport-card', `size-${sport.size}`]"
        >
          <div class="card-content">
            <div class="card-text">
              <div class="sport-icon">{{ sport.icon }}</div>
              <h3 class="sport-name">{{ sport.name }}</h3>
              <p class="sport-description">{{ sport.description }}</p>
            </div>
            <div class="card-arrow">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
          <div class="card-bg"></div>
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.sports {
  padding: calc(var(--spacing-unit) * 12) calc(var(--spacing-unit) * 3);
  background: var(--color-bg-primary);
}

.sports-container {
  max-width: 1400px;
  margin: 0 auto;
}

.sports-header {
  max-width: 800px;
  margin-bottom: calc(var(--spacing-unit) * 8);
}

.section-title {
  margin-bottom: calc(var(--spacing-unit) * 3);
}

.highlight {
  background: linear-gradient(135deg, var(--color-red-600) 0%, var(--color-red-400) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.section-description {
  font-size: 1.125rem;
  color: var(--color-text-secondary);
  line-height: 1.8;
}

.bento-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: calc(var(--spacing-unit) * 3);
  grid-auto-rows: minmax(320px, auto);
}

.sport-card {
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
}

.sport-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(220, 38, 38, 0.1) 0%, transparent 100%);
  opacity: 0;
  transition: opacity 0.4s ease;
}

.sport-card:hover {
  border-color: var(--color-red-600);
  transform: translateY(-8px);
  box-shadow: 0 16px 40px rgba(220, 38, 38, 0.2);
}

.sport-card:hover::before {
  opacity: 1;
}

.sport-card:hover .card-bg {
  transform: scale(1.1);
}

.sport-card:hover .card-arrow {
  transform: translate(4px, -4px);
}

.card-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  gap: calc(var(--spacing-unit) * 3);
}

.card-text {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.sport-icon {
  font-size: 3.5rem;
  margin-bottom: calc(var(--spacing-unit) * 2);
  flex-shrink: 0;
  line-height: 1;
}

.sport-name {
  font-size: clamp(1.5rem, 3vw, 2rem);
  margin-bottom: calc(var(--spacing-unit) * 2);
  color: var(--color-text-primary);
  flex-shrink: 0;
}

.sport-description {
  font-size: 0.9375rem;
  color: var(--color-text-secondary);
  line-height: 1.6;
  flex: 1;
  overflow-wrap: break-word;
}

.card-arrow {
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

.card-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 80% 20%, rgba(220, 38, 38, 0.05) 0%, transparent 60%);
  transition: transform 0.4s ease;
  pointer-events: none;
}

@media (min-width: 640px) {
  .bento-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .size-large {
    grid-column: span 2;
  }
}

@media (min-width: 768px) {
  .sports {
    padding: calc(var(--spacing-unit) * 15) calc(var(--spacing-unit) * 4);
  }

  .bento-grid {
    grid-template-columns: repeat(6, 1fr);
  }

  .size-large {
    grid-column: span 4;
  }

  .size-medium {
    grid-column: span 2;
  }
}

@media (min-width: 1024px) {
  .sports {
    padding: calc(var(--spacing-unit) * 20) calc(var(--spacing-unit) * 6);
  }
}
</style>
