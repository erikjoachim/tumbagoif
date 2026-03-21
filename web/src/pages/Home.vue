<script setup lang="ts">
import Hero from '../components/Hero.vue'
import About from '../components/About.vue'
import SportsGrid from '../components/SportsGrid.vue'
import Footer from '../components/Footer.vue'
</script>

<template>
  <div class="home">
    <Hero />
    <About />
    <SportsGrid />
    <Footer />
  </div>
</template>

<style scoped>
.home {
  min-height: 100vh;
}
</style>