<script setup lang="ts">
import Hero from './components/Hero.vue'
import About from './components/About.vue'
import SportsGrid from './components/SportsGrid.vue'
import Footer from './components/Footer.vue'
</script>

<template>
  <div class="app">
    <Hero />
    <About />
    <SportsGrid />
    <Footer />
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  background-color: #0a0a0a;
}
</style>
