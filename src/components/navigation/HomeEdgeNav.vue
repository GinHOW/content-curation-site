<template>
  <aside class="home-index" :class="{ 'is-mobile-toolbar': mobileMode === 'toolbar' }" :aria-label="ariaLabel">
    <nav class="index-nav" aria-label="章节导航">
      <template v-for="item in items" :key="item.id">
        <RouterLink
          v-if="item.to"
          :to="item.to"
          :class="['index-link', { 'is-active': activeSection === item.id }]"
          :style="item.color ? { '--tab-color': item.color, '--tab-ink': '#111111' } : undefined"
          :aria-current="activeSection === item.id ? 'page' : undefined"
        >
          <span class="index-copy" aria-hidden="true">
            <span class="index-label">{{ item.label }}</span>
          </span>
          <span class="sr-only">{{ item.label }}</span>
        </RouterLink>
        <a
          v-else
          class="index-link"
          :class="{ 'is-active': activeSection === item.id }"
          :style="item.color ? { '--tab-color': item.color, '--tab-ink': '#111111' } : undefined"
          :href="`#${item.id}`"
          :aria-current="activeSection === item.id ? 'location' : undefined"
          @click="handleClick($event, item.id)"
        >
          <span class="index-copy" aria-hidden="true">
            <span class="index-label">{{ item.label }}</span>
          </span>
          <span class="sr-only">{{ item.label }}</span>
        </a>
      </template>
    </nav>
  </aside>
</template>

<script setup>
import { RouterLink } from 'vue-router'

defineProps({
  items: {
    type: Array,
    required: true,
  },
  activeSection: {
    type: String,
    default: '',
  },
  mobileMode: {
    type: String,
    default: 'hidden',
  },
  ariaLabel: {
    type: String,
    default: '主页章节索引',
  },
})

const emit = defineEmits(['navigate'])

const handleClick = (event, id) => {
  event.preventDefault()
  emit('navigate', id)
}
</script>

<style scoped>
:global(.home-page .home-index) {
  position: sticky;
  top: 0;
  align-self: start;
  width: 28px;
  min-height: 100vh;
  padding: 0;
  overflow: visible;
  background: transparent;
  z-index: 30;
}

:global(.home-page .index-nav) {
  position: absolute;
  top: clamp(1.5rem, 4vh, 3rem);
  left: 0;
  display: flex;
  flex-direction: column;
  gap: clamp(0.75rem, 1.35vh, 1.1rem);
  width: max-content;
  height: 66.666vh;
  margin: 0;
}

:global(.home-page .index-link) {
  position: relative;
  display: flex;
  flex: 1 1 0;
  flex-direction: row;
  gap: 0.35rem;
  align-items: center;
  width: 12px;
  min-height: 0;
  margin: 0;
  padding: 0.45rem 0.3rem;
  overflow: visible;
  border: 0;
  color: var(--home-ink);
  background: var(--tab-color);
  text-decoration: none;
  transition: filter 180ms ease;
}

:global(.home-page .index-link:nth-child(1)) { --tab-color: var(--home-yellow); }
:global(.home-page .index-link:nth-child(2)) { --tab-color: var(--home-blue); }
:global(.home-page .index-link:nth-child(3)) { --tab-color: var(--home-orange); }
:global(.home-page .index-link:nth-child(4)) { --tab-color: var(--home-green); }
:global(.home-page .index-link:nth-child(5)) { --tab-color: var(--home-magenta); }
:global(.home-page .index-link:nth-child(6)) { --tab-color: var(--home-yellow); }
:global(.home-page .index-link:nth-child(7)) { --tab-color: var(--home-blue); }
:global(.home-page .index-link:nth-child(8)) { --tab-color: var(--home-orange); }
:global(.home-page .index-link:nth-child(9)) { --tab-color: var(--home-green); }
:global(.home-page .index-link:nth-child(10)) { --tab-color: var(--home-magenta); }

:global(.home-page .index-link:hover),
:global(.home-page .index-link:focus-visible),
:global(.home-page .index-link.is-active) {
  width: 12px;
  border: 0;
  background: var(--tab-color);
  filter: saturate(1.05) brightness(0.98);
}

:global(.home-page .index-copy) {
  position: absolute;
  top: 50%;
  left: calc(100% + 0.38rem);
  display: inline-flex;
  gap: 0.35rem;
  align-items: center;
  width: max-content;
  color: var(--tab-ink, var(--home-muted));
  white-space: nowrap;
  pointer-events: none;
  transform: translate(-50%, -50%) rotate(90deg);
  transform-origin: center;
}

:global(.home-page .index-link.is-active .index-copy),
:global(.home-page .index-link:hover .index-copy),
:global(.home-page .index-link:focus-visible .index-copy) {
  color: var(--home-ink);
}

:global(.home-page .index-label) {
  display: inline-block;
  color: inherit;
  font-family: var(--font-body);
  font-size: 0.64rem;
  line-height: 1.15;
  letter-spacing: 0.03em;
  white-space: nowrap;
}

@media (max-width: 1023px) and (min-width: 768px) {
  :global(.home-page .home-index) {
    width: 28px;
  }
}

@media (max-width: 767px) {
  :global(.home-page .home-index) {
    display: none;
  }
}
</style>
