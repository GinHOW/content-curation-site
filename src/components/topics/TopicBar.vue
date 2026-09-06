<template>
  <section class="screen-universe-topic-library" aria-label="选题库">
    <div class="screen-universe-topic-grid">
      <button
        v-for="keyword in keywords"
        :key="keyword"
        type="button"
        :style="{ '--topic-color': colorFor(keyword) }"
        :class="{ 'is-active': activeKeyword === keyword }"
        :aria-pressed="activeKeyword === keyword"
        :aria-label="`${activeKeyword === keyword ? '再次进入' : '显示'}${keyword}`"
        @click.stop="selectTopic(keyword)"
      >
        <span>{{ keyword.length === 2 ? `${keyword[0]}　${keyword[1]}` : keyword }}</span>
      </button>
    </div>
  </section>
</template>

<script setup>
import { topicColors as catalogTopicColors } from '../../data/topics/catalog.js'

const props = defineProps({
  keywords: {
    type: Array,
    required: true,
  },
  activeKeyword: {
    type: String,
    default: '',
  },
  topicColors: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['select-topic'])

function colorFor(keyword) {
  return props.topicColors[keyword] || catalogTopicColors[keyword] || 'var(--home-ink, #111111)'
}

function selectTopic(keyword) {
  emit('select-topic', keyword)
}
</script>

<style scoped>
.screen-universe-topic-library {
  margin-bottom: clamp(1.75rem, 3vw, 2.75rem);
}

.screen-universe-topic-grid {
  display: grid;
  grid-template-columns: repeat(17, minmax(0, 1fr));
  gap: clamp(0.35rem, 0.8vw, 0.7rem);
}

.screen-universe-topic-grid button {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  justify-self: center;
  min-width: 0;
  width: clamp(2.8rem, 3.8vw, 3.5rem);
  max-width: calc(100% - 0.25rem);
  min-height: clamp(4.25rem, 7.2vw, 6.5rem);
  padding: 0.65rem 0.3rem;
  border: 1px solid var(--universe-rule, var(--home-rule, #dddddd));
  border-radius: 999px;
  color: var(--topic-color);
  background: var(--universe-paper, var(--home-paper, #ffffff));
  font: inherit;
  font-size: clamp(0.72rem, 1.2vw, 0.95rem);
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
  transition: color 180ms ease, background-color 180ms ease, box-shadow 180ms ease;
}

.screen-universe-topic-grid button span {
  writing-mode: vertical-rl;
}

.screen-universe-topic-grid button:hover,
.screen-universe-topic-grid button:focus-visible,
.screen-universe-topic-grid button.is-active {
  color: #ffffff;
  background: var(--topic-color);
  box-shadow: inset 0 0 0 2px var(--topic-color);
}

.screen-universe-topic-grid button:focus-visible {
  outline: 2px solid var(--universe-ink, var(--home-ink, #111111));
  outline-offset: 3px;
}

@media (max-width: 767px) {
  .screen-universe-topic-grid {
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 0.45rem;
  }

  .screen-universe-topic-library {
    margin-inline: -1rem;
    padding-inline: 1rem;
    padding-bottom: 0.45rem;
  }

  .screen-universe-topic-grid button {
    width: 100%;
    min-height: 3.25rem;
    padding: 0.7rem 0.4rem;
    font-size: 0.86rem;
  }

  .screen-universe-topic-grid button span {
    writing-mode: horizontal-tb;
  }
}

@media (prefers-reduced-motion: reduce) {
  .screen-universe-topic-grid button {
    transition: none;
  }
}
</style>
