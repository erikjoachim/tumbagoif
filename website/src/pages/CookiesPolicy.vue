<script setup lang="ts"></script>

<template>
  <div class="page">
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">Cookiepolicy</h1>
        <p class="page-subtitle">Information om cookies</p>
      </div>

      <div class="page-content">
        <section class="content-section">
          <h2>Vad är cookies?</h2>
          <p>
            Cookies är små textfiler som lagras på din enhet när du besöker en webbplats. De används
            för att webbplatsen ska fungera så bra som möjligt och för att ge information till
            webbplatsens ägare.
          </p>
        </section>

        <section class="content-section">
          <h2>Cookies på denna webbplats</h2>
          <p>
            <strong
              >Denna webbplats använder för närvarande inga cookies, men kan komma att ändras i
              framtiden.</strong
            >
          </p>
          <p>
            Vi samlar inte in någon information om ditt besök via cookies, analytics eller liknande
            tekniker. Du kan besöka vår webbplats helt anonymt.
          </p>
        </section>

        <section class="content-section">
          <h2>Medlemssystem</h2>
          <p>
            När du använder våra externa medlemssystem (Sportadmin och Svenskalag) kan dessa använda
            cookies för att deras tjänster ska fungera korrekt. Information om deras användning av
            cookies finns i respektive systems cookie-policy:
          </p>
          <ul>
            <li><strong>Sportadmin:</strong> Se Sportadmins cookiepolicy på deras webbplats</li>
            <li><strong>Svenskalag:</strong> Se Svenskalags cookiepolicy på deras webbplats</li>
          </ul>
        </section>

        <section class="content-section">
          <h2>Ändringar i denna policy</h2>
          <p>
            Om vi i framtiden väljer att använda cookies på vår webbplats kommer vi att uppdatera
            denna sida med information om vilka cookies vi använder och varför. Vi kommer också att
            ge dig möjlighet att välja om du vill acceptera cookies eller inte.
          </p>
        </section>

        <section class="content-section">
          <h2>Kontakta oss</h2>
          <p>Om du har frågor om vår cookiepolicy, kontakta oss på:</p>
          <p>
            <strong>E-post:</strong>
            <a href="mailto:info@idrottsforeningen.se">info@idrottsforeningen.se</a><br />
            <strong>Telefon:</strong>
            <a href="tel:+46101234567">010-123 45 67</a>
          </p>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  padding: calc(var(--spacing-unit) * 12) calc(var(--spacing-unit) * 3);
  background: var(--color-bg-primary);
}

.page-container {
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: calc(var(--spacing-unit) * 6);
}

.page-title {
  font-size: clamp(2rem, 5vw, 3rem);
  margin-bottom: calc(var(--spacing-unit) * 2);
  color: var(--color-text-primary);
}

.page-subtitle {
  color: var(--color-text-secondary);
  font-size: 1rem;
}

.page-content {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing-unit) * 6);
}

.content-section h2 {
  font-size: 1.5rem;
  margin-bottom: calc(var(--spacing-unit) * 2);
  color: var(--color-text-primary);
}

.content-section p {
  font-size: 1rem;
  line-height: 1.8;
  color: var(--color-text-secondary);
  margin-bottom: calc(var(--spacing-unit) * 2);
}

.content-section p:last-child {
  margin-bottom: 0;
}

.content-section ul {
  list-style-type: disc;
  padding-left: calc(var(--spacing-unit) * 4);
  margin-bottom: calc(var(--spacing-unit) * 2);
}

.content-section li {
  font-size: 1rem;
  line-height: 1.8;
  color: var(--color-text-secondary);
  margin-bottom: calc(var(--spacing-unit) * 1);
}

.content-section a {
  color: var(--color-red-600);
  transition: color 0.3s ease;
}

.content-section a:hover {
  color: var(--color-red-700);
}

@media (min-width: 768px) {
  .page {
    padding: calc(var(--spacing-unit) * 15) calc(var(--spacing-unit) * 4);
  }
}
</style>
