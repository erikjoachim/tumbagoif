<script setup lang="ts">
const stats = [
  { value: "4", label: "Idrottsgrenar" },
  { value: "500+", label: "Medlemmar" },
  { value: "15+", label: "År av Gemenskap" },
  { value: "100+", label: "Aktiviteter/Vecka" },
];
</script>

<template>
  <section id="about" class="about">
    <div class="about-container">
      <div class="about-content">
        <h2 class="section-title">En förening för <span class="highlight">alla</span></h2>
        <p class="section-description">
          Vi är en ideell idrottsförening som samlar människor genom rörelse och gemenskap. Vår
          paraplyorganisation förenar fyra idrottsgrenar, var och en med egna anläggningar,
          engagerade ledare och varma sammanhang.
        </p>
        <p class="section-description">
          Hos oss finns plats för alla – oavsett om du vill tävla, hålla dig i form, eller bara ha
          kul tillsammans med andra.
        </p>
      </div>

      <div class="stats-grid">
        <div v-for="stat in stats" :key="stat.label" class="stat-card">
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.about {
  padding: calc(var(--spacing-unit) * 12) calc(var(--spacing-unit) * 3);
  background: var(--color-bg-primary);
}

.about-container {
  max-width: 1400px;
  margin: 0 auto;
}

.about-content {
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
  margin-bottom: calc(var(--spacing-unit) * 3);
  line-height: 1.8;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: calc(var(--spacing-unit) * 3);
}

.stat-card {
  padding: calc(var(--spacing-unit) * 4);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: calc(var(--spacing-unit) * 2);
  transition: all 0.3s ease;
}

.stat-card:hover {
  border-color: var(--color-red-600);
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(220, 38, 38, 0.15);
}

.stat-value {
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 700;
  color: var(--color-red-600);
  margin-bottom: calc(var(--spacing-unit) * 1);
}

.stat-label {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

@media (min-width: 768px) {
  .about {
    padding: calc(var(--spacing-unit) * 15) calc(var(--spacing-unit) * 4);
  }

  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (min-width: 1024px) {
  .about {
    padding: calc(var(--spacing-unit) * 20) calc(var(--spacing-unit) * 6);
  }
}
</style>
