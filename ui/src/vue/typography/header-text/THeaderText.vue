<script setup lang="ts">
import { computed } from "vue";
import { parseHighlight, type HighlightSegment } from "../../../shared/parser/highlight";

const props = withDefaults(
  defineProps<{
    as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
    text?: string;
    segments?: HighlightSegment[];
  }>(),
  { as: "h2" },
);

const parsedContent = computed<HighlightSegment[]>(() => {
  if (props.segments) return props.segments;
  if (props.text) return parseHighlight(props.text);
  return [];
});
</script>

<template>
  <component :is="as" class="t-header-text">
    <slot>
      <template v-for="seg in parsedContent" :key="seg.text">
        <span v-if="seg.highlighted" class="highlight">{{ seg.text }}</span>
        <template v-else>{{ seg.text }}</template>
      </template>
    </slot>
  </component>
</template>

<style scoped>
.t-header-text {
  font-family: var(--font-family-sans);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  letter-spacing: var(--letter-spacing-tight);
  line-height: var(--line-height-tight);
}

.t-header-text:is(h1) {
  font-size: clamp(2.5rem, 8vw, 5rem);
}

.t-header-text:is(h2) {
  font-size: clamp(2rem, 6vw, 3.5rem);
}

.t-header-text:is(h3) {
  font-size: clamp(1.5rem, 4vw, 2rem);
}

.t-header-text:is(h4) {
  font-size: clamp(1.25rem, 3vw, 1.5rem);
}

.t-header-text:is(h5) {
  font-size: clamp(1rem, 2vw, 1.25rem);
}

.t-header-text:is(h6) {
  font-size: clamp(0.875rem, 1.5vw, 1rem);
  letter-spacing: var(--letter-spacing-normal);
}
</style>

<style>
.t-header-text .highlight {
  background: var(--gradient-red);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
</style>
