<template>
  <div class="resource-submit-control">
    <button
      class="resource-submit-floating"
      type="button"
      aria-label="提交资源"
      title="提交资源"
      :aria-expanded="open"
      @click="open = true"
    >
      <span class="resource-submit-icon" aria-hidden="true">+</span>
      <span class="resource-submit-label" aria-hidden="true">提交资源</span>
    </button>
  </div>
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
.resource-submit-control {
  position: fixed;
  top: max(5.5rem, calc(env(safe-area-inset-top) + 4.5rem));
  right: 0;
  z-index: 900;
}

.resource-submit-floating {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  width: 3.25rem;
  min-width: 3.25rem;
  height: 3.25rem;
  padding: 0 0 0 0.85rem;
  overflow: hidden;
  border: 1px solid var(--resources-ink, var(--home-ink));
  border-right: 0;
  border-radius: 1.75rem 0 0 1.75rem;
  color: var(--resources-ink, var(--home-ink));
  background: rgb(255 255 255 / 0.62);
  background: color-mix(in srgb, var(--resource-surface, var(--home-paper)) 76%, transparent);
  -webkit-backdrop-filter: blur(12px) saturate(115%);
  backdrop-filter: blur(12px) saturate(115%);
  font: inherit;
  cursor: pointer;
  touch-action: manipulation;
  transition: width 220ms ease-out, color 180ms ease, background-color 180ms ease, padding 220ms ease-out;
}

.resource-submit-icon {
  display: grid;
  place-items: center;
  flex: 0 0 1.45rem;
  font-size: 1.6rem;
  font-weight: 400;
  line-height: 1;
}

.resource-submit-label {
  width: 0;
  margin-left: 0;
  overflow: hidden;
  opacity: 0;
  white-space: nowrap;
  font-size: 0.78rem;
  font-weight: 700;
  line-height: 1;
  transition: width 180ms ease-out, margin-left 180ms ease-out, opacity 120ms ease;
}

.resource-submit-floating:hover,
.resource-submit-floating:focus-visible,
.resource-submit-floating[aria-expanded='true'] {
  width: 8.5rem;
  padding-inline: 0.85rem 1rem;
  color: var(--resource-surface, var(--home-paper));
  background: var(--resources-ink, var(--home-ink));
}

.resource-submit-floating:hover .resource-submit-label,
.resource-submit-floating:focus-visible .resource-submit-label,
.resource-submit-floating[aria-expanded='true'] .resource-submit-label {
  width: 4.8rem;
  margin-left: 0.45rem;
  opacity: 1;
}

.resource-submit-floating:focus-visible {
  outline: 2px solid var(--resources-ink, var(--home-ink));
  outline-offset: 3px;
}

.resource-submit-floating:active {
  transform: scale(0.96);
}

@media (prefers-reduced-motion: reduce) {
  .resource-submit-floating {
    transition: none;
  }

  .resource-submit-label {
    transition: none;
  }
}
</style>
