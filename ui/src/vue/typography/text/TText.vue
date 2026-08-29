<script setup lang="ts">
import { computed } from "vue";
import { parseHighlight, type HighlightSegment } from "../../../shared/parser/highlight";

const props = withDefaults(
  defineProps<{
    as?: "p" | "span" | "div" | "label";
    text?: string;
    segments?: HighlightSegment[];
    size?: "sm" | "base" | "lg";
    muted?: "none" | "secondary" | "tertiary";
    align?: "left" | "center" | "right";
  }>(),
  {
    as: "p",
    size: "base",
    muted: "secondary",
    align: "left",
  },
);

const parsedContent = computed<HighlightSegment[]>(() => {
  if (props.segments) return props.segments;
  if (props.text) return parseHighlight(props.text);
  return [];
});
</script>

<template>
  <component
    :is="as"
    :class="['t-text', `t-text--${size}`, `t-text--muted-${muted}`, `t-text--${align}`]"
  >
    <slot>
      <template v-for="seg in parsedContent" :key="seg.text">
        <span v-if="seg.highlighted" class="t-text__highlight">{{ seg.text }}</span>
        <template v-else>{{ seg.text }}</template>
      </template>
    </slot>
  </component>
</template>

<style scoped>
.t-text {
  font-size: var(--font-size-base);
  line-height: var(--line-height-normal);
  margin: 0;
}

.t-text--sm {
  font-size: var(--font-size-sm);
}

.t-text--lg {
  font-size: var(--font-size-lg);
  line-height: var(--line-height-relaxed);
}

.t-text--muted-secondary {
  color: var(--color-text-secondary);
}

.t-text--muted-tertiary {
  color: var(--color-text-tertiary);
}

.t-text--muted-none {
  color: var(--color-text-primary);
}

.t-text--center {
  text-align: center;
}

.t-text--right {
  text-align: right;
}
</style>

<style>
.t-text__highlight {
  background: var(--gradient-red);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
</style>
