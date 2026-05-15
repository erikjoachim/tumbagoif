<script setup lang="ts"></script>

<template>
  <section class="hero">
    <div class="hero-container">
      <div class="hero-content">
        <div class="hero-badge">
          <span class="pulse"></span>
          Tumba Gymnastik och Idrottsförening
        </div>
        <h1 class="hero-title">
          Glädje i <span class="highlight">rörelse</span>
        </h1>
        <p class="hero-description">
          En idrottsförening för alla, med basket, gymnastik, innebandy och
          gymmix. Här är du alltid välkommen, oavsett ålder eller nivå.
        </p>
        <div class="hero-cta">
          <a href="#sports" class="btn btn-primary">Våra idrotter</a>
          <a href="#about" class="btn btn-secondary">Om oss</a>
        </div>
      </div>
      <div class="hero-visual">
        <div class="visual-grid">
          <div class="grid-item item-1">
            <p class="hero-description">Potentiell bild 1</p>
          </div>
          <div class="grid-item item-2">
            <p class="hero-description">Potentiell bild 2</p>
          </div>
          <div class="grid-item item-3">
            <p class="hero-description">Potentiell bild 3</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: calc(var(--spacing-unit) * 3);
  position: relative;
  overflow: hidden;
}

.hero::before {
  content: "";
  position: absolute;
  top: -50%;
  right: -20%;
  width: 800px;
  height: 800px;
  background: radial-gradient(
    circle,
    rgba(220, 38, 38, 0.15) 0%,
    transparent 70%
  );
  pointer-events: none;
}

.hero-container {
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr;
  gap: calc(var(--spacing-unit) * 6);
  align-items: center;
}

.hero-content {
  z-index: 1;
}

.hero-badge {
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
  margin-bottom: calc(var(--spacing-unit) * 4);
}

.pulse {
  width: 8px;
  height: 8px;
  background: var(--color-red-600);
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
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

.hero-title {
  margin-bottom: calc(var(--spacing-unit) * 3);
  color: var(--color-text-primary);
}

.highlight {
  background: linear-gradient(
    135deg,
    var(--color-red-600) 0%,
    var(--color-red-400) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-description {
  font-size: clamp(1rem, 2vw, 1.25rem);
  color: var(--color-text-secondary);
  margin-bottom: calc(var(--spacing-unit) * 5);
  max-width: 600px;
}

.hero-cta {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--spacing-unit) * 2);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: calc(var(--spacing-unit) * 2) calc(var(--spacing-unit) * 4);
  border-radius: calc(var(--spacing-unit) * 1.5);
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.btn-primary {
  background: var(--color-red-600);
  color: white;
}

.btn-primary:hover {
  background: var(--color-red-700);
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(220, 38, 38, 0.3);
}

.btn-secondary {
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover {
  background: var(--color-bg-tertiary);
  border-color: var(--color-border-hover);
  transform: translateY(-2px);
}

.hero-visual {
  display: none;
}

.visual-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: calc(var(--spacing-unit) * 2);
  height: 500px;
}

.grid-item {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: calc(var(--spacing-unit) * 3);
  transition: all 0.3s ease;
}

.grid-item:hover {
  border-color: var(--color-border-hover);
  transform: translateY(-4px);
}

.item-1 {
  grid-row: span 2;
  background: linear-gradient(
    135deg,
    rgba(220, 38, 38, 0.1) 0%,
    transparent 100%
  );
  p {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100%;
    margin-bottom: 0;
  }
}

.item-2 {
  background: linear-gradient(
    135deg,
    transparent 0%,
    rgba(220, 38, 38, 0.05) 100%
  );
  p {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100%;
    margin-bottom: 0;
  }
}

.item-3 {
  background: var(--color-bg-secondary);
  p {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100%;
    margin-bottom: 0;
  }
}

@media (min-width: 768px) {
  .hero {
    padding: calc(var(--spacing-unit) * 4);
  }

  .hero-container {
    grid-template-columns: 1fr 1fr;
  }

  .hero-visual {
    display: block;
  }
}

@media (min-width: 1024px) {
  .hero {
    padding: calc(var(--spacing-unit) * 6);
  }
}
</style>
