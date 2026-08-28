<template>
  <button
    class="resource-submit-floating"
    type="button"
    aria-label="提交资源"
    title="提交资源"
    :aria-expanded="open"
    @click="open = true"
  >+</button>
  <ResourceSubmissionDialog
    :open="open"
    :default-type="defaultType"
    @close="open = false"
  />
</template>

<script setup>
import { ref } from 'vue'
import ResourceSubmissionDialog from './ResourceSubmissionDialog.vue'

defineProps({
  defaultType: {
    type: String,
    default: '',
  },
})

const open = ref(false)
</script>

<style scoped>
.resource-submit-floating {
  position: fixed;
  right: 0;
  bottom: max(1rem, env(safe-area-inset-bottom));
  z-index: 900;
  display: grid;
  place-items: center;
  width: 3.25rem;
  height: 3.25rem;
  border: 1px solid var(--resources-ink, var(--home-ink));
  border-radius: 50%;
  color: var(--resources-ink, var(--home-ink));
  background: rgb(255 255 255 / 0.62);
  background: color-mix(in srgb, var(--resource-surface, var(--home-paper)) 76%, transparent);
  -webkit-backdrop-filter: blur(12px) saturate(115%);
  backdrop-filter: blur(12px) saturate(115%);
  font: inherit;
  font-size: 1.6rem;
  font-weight: 400;
  line-height: 1;
  cursor: pointer;
  touch-action: manipulation;
  transform: translateX(50%);
  transition: color 180ms ease, background-color 180ms ease, transform 220ms ease-out;
}

.resource-submit-floating:hover,
.resource-submit-floating:focus-visible,
.resource-submit-floating[aria-expanded='true'] {
  color: var(--resource-surface, var(--home-paper));
  background: var(--resources-ink, var(--home-ink));
  transform: translateX(0);
}

.resource-submit-floating:focus-visible {
  outline: 2px solid var(--resources-ink, var(--home-ink));
  outline-offset: 3px;
}

.resource-submit-floating:active {
  transform: translateX(0) scale(0.96);
}

@media (prefers-reduced-motion: reduce) {
  .resource-submit-floating {
    transition: none;
  }
}
</style>
