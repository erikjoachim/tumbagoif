<script setup lang="ts"></script>

<template>
  <div class="page">
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">Integritetspolicy</h1>
        <p class="page-subtitle">Senast uppdaterad: November 2025</p>
      </div>

      <div class="page-content">
        <section class="content-section">
          <h2>Om denna policy</h2>
          <p>
            Idrottsföreningen respekterar din integritet och är engagerad i att
            skydda dina personuppgifter. Denna integritetspolicy förklarar hur
            vi hanterar information på vår webbplats.
          </p>
        </section>

        <section class="content-section">
          <h2>Webbplatsen samlar ingen data</h2>
          <p>
            Vår webbplats samlar för närvarande ingen personlig information och
            använder inga cookies. Du kan besöka och läsa information på vår
            webbplats helt anonymt.
          </p>
        </section>

        <section class="content-section">
          <h2>Medlemssystem</h2>
          <p>
            Våra olika idrottsgrenar använder externa medlemssystem för
            hantering av medlemskap, tävlingsanmälningar och administration:
          </p>
          <ul>
            <li>Vissa verksamheter använder Sportadmin</li>
            <li>Andra verksamheter använder Svenskalag</li>
          </ul>
          <p>
            Dessa system är ansvariga för regelefterlevnad och säker hantering
            av personuppgifter enligt gällande dataskyddsförordning (GDPR).
            Information om hur dessa system hanterar dina uppgifter finns i
            respektive systems integritetspolicy.
          </p>
        </section>

        <section class="content-section">
          <h2>Dina rättigheter</h2>
          <p>
            När du registrerar dig i något av våra medlemssystem har du enligt
            GDPR rätt att:
          </p>
          <ul>
            <li>Få information om vilka personuppgifter vi har om dig</li>
            <li>Få felaktiga uppgifter rättade</li>
            <li>Få dina uppgifter raderade</li>
            <li>Begränsa behandlingen av dina uppgifter</li>
            <li>Invända mot behandling av dina uppgifter</li>
            <li>Få ut dina uppgifter i ett strukturerat format</li>
          </ul>
        </section>

        <section class="content-section">
          <h2>Kontakta oss</h2>
          <p>
            Om du har frågor om hur vi hanterar personuppgifter, kontakta oss
            på:
          </p>
          <p>
            <strong>E-post:</strong>
            <a href="mailto:info@idrottsforeningen.se"
              >info@idrottsforeningen.se</a
            ><br />
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
