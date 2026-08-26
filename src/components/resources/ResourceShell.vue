<template>
  <div
    id="top"
    class="resources-page resource-detail-page home-page"
    :class="{ 'has-surface-tone': surfaceColor }"
    :style="resourceStyle"
  >
    <a class="skip-link" href="#resource-detail-content">跳转到资源内容</a>

    <div class="home-shell resources-shell">
      <HomeEdgeNav
        :items="navItems"
        :active-section="activeSection"
        mobile-mode="toolbar"
        aria-label="课程资源分类"
      />

      <main id="resource-detail-content" class="home-main resources-main">
        <HomeSiteNav />

        <header class="resource-detail-intro">
          <div class="resource-detail-intro-grid">
            <div>
              <p class="resource-detail-eyebrow">{{ eyebrow }}</p>
              <h1>{{ title }}</h1>
            </div>
            <div class="resource-detail-intro-copy">
              <p>{{ intro }}</p>
              <router-link class="resource-back-link" to="/resources">
                <span aria-hidden="true">←</span> 返回课程资源
              </router-link>
            </div>
          </div>
        </header>

        <ResourceFilterBar
          v-if="filterOptions.length"
          :options="filterOptions"
          :groups="filterGroups"
          :active="activeFilter"
          :count="count"
          @select="$emit('filter', $event)"
        />

        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import HomeEdgeNav from '../navigation/HomeEdgeNav.vue'
import HomeSiteNav from '../navigation/HomeSiteNav.vue'
import ResourceFilterBar from './ResourceFilterBar.vue'

const props = defineProps({
  eyebrow: {
    type: String,
    default: 'Course Resource Library',
  },
  title: {
    type: String,
    required: true,
  },
  intro: {
    type: String,
    required: true,
  },
  count: {
    type: Number,
    default: 0,
  },
  activeSection: {
    type: String,
    required: true,
  },
  navItems: {
    type: Array,
    required: true,
  },
  filterOptions: {
    type: Array,
    default: () => [],
  },
  filterGroups: {
    type: Array,
    default: () => [],
  },
  activeFilter: {
    type: String,
    default: 'all',
  },
  surfaceColor: {
    type: String,
    default: '',
  },
  mutedColor: {
    type: String,
    default: '',
  },
  filterAccent: {
    type: String,
    default: '',
  },
})

const sectionAccent = computed(() => ({
  article: 'var(--home-blue)',
  video: 'var(--home-orange)',
  website: 'var(--home-green)',
  tool: 'var(--home-magenta)',
}[props.activeSection] || 'var(--home-yellow)'))

const resourceStyle = computed(() => ({
  '--resource-accent': sectionAccent.value,
  '--resource-surface': props.surfaceColor || 'var(--home-paper)',
  '--resource-muted': props.mutedColor || (props.surfaceColor
    ? 'color-mix(in srgb, var(--home-ink) 58%, var(--resource-surface) 42%)'
    : 'var(--home-muted)'),
  '--resource-rule': props.surfaceColor
    ? 'color-mix(in srgb, var(--home-ink) 28%, var(--resource-surface) 72%)'
    : 'var(--home-rule)',
  '--resource-filter-accent': props.filterAccent || sectionAccent.value,
}))

defineEmits(['filter'])
</script>

<style scoped>
.resource-detail-page {
  --resources-ink: var(--home-ink);
  --resources-muted: var(--resource-muted, var(--home-muted));
  --resources-rule: var(--resource-rule, var(--home-rule));
  min-height: 100vh;
  background: var(--resource-surface, var(--home-paper));
  color: var(--resources-ink);
}

.resource-detail-page .home-shell,
.resource-detail-page .home-main {
  background: var(--resource-surface, var(--home-paper));
}

/* 有色沉浸底上，导航默认保留纸面灰度，当前项和交互状态回到正文墨色。 */
:global(.home-page.resource-detail-page.has-surface-tone .site-nav a),
:global(.home-page.resource-detail-page.has-surface-tone .site-nav-en),
:global(.home-page.resource-detail-page.has-surface-tone .site-nav-zh) {
  color: color-mix(in srgb, var(--resources-ink) 58%, var(--resource-surface) 42%);
}

:global(.home-page.resource-detail-page.has-surface-tone .site-nav a.is-current),
:global(.home-page.resource-detail-page.has-surface-tone .site-nav a:hover),
:global(.home-page.resource-detail-page.has-surface-tone .site-nav a:focus-visible),
:global(.home-page.resource-detail-page.has-surface-tone .site-nav a.is-current .site-nav-en),
:global(.home-page.resource-detail-page.has-surface-tone .site-nav a.is-current .site-nav-zh) {
  color: var(--resources-ink);
}

/* 侧边分类与站点导航使用同一套对比度逻辑：未选中项微弱，选中项清晰。 */
:global(.home-page.resource-detail-page.has-surface-tone .home-index .index-copy) {
  color: color-mix(in srgb, var(--resources-ink) 58%, var(--resource-surface) 42%);
}

:global(.home-page.resource-detail-page.has-surface-tone .home-index .index-link.is-active .index-copy),
:global(.home-page.resource-detail-page.has-surface-tone .home-index .index-link:hover .index-copy),
:global(.home-page.resource-detail-page.has-surface-tone .home-index .index-link:focus-visible .index-copy) {
  color: var(--resources-ink);
}

.resources-main {
  min-width: 0;
  width: 100%;
  margin: 0;
  padding: clamp(1.5rem, 3vw, 2.75rem) clamp(3.5rem, 4vw, 4.5rem) clamp(5rem, 10vw, 9rem);
}

.resources-main > .site-nav {
  margin-bottom: clamp(3.5rem, 8vw, 7rem);
}

.resource-detail-intro {
  padding-bottom: clamp(3rem, 7vw, 6rem);
  border-bottom: 1px solid var(--resources-ink);
}

.resource-detail-intro-grid {
  display: grid;
  grid-template-columns: minmax(0, 7fr) minmax(15rem, 5fr);
  gap: clamp(2.5rem, 7vw, 8rem);
  align-items: end;
  margin-top: 1rem;
}

.resource-detail-eyebrow {
  color: var(--resources-muted);
  font-size: 0.68rem;
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: 0.11em;
  text-transform: uppercase;
}

.resource-detail-intro h1 {
  max-width: 7em;
  margin-top: 0.45rem;
  color: var(--resources-ink);
  font-size: clamp(4.5rem, 11vw, 10.5rem);
  line-height: 1.02;
  letter-spacing: -0.07em;
}

.resource-detail-intro-copy {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  align-self: stretch;
  max-width: 32rem;
}

.resource-detail-intro-copy > p {
  font-size: clamp(1.05rem, 1.45vw, 1.3rem);
  line-height: 1.75;
}

.resource-back-link {
  display: inline-flex;
  align-items: flex-end;
  gap: 0.35rem;
  justify-self: start;
  margin-top: auto;
  min-height: 44px;
  padding: 0;
  color: var(--resources-ink);
  font-size: 0.78rem;
  font-weight: 700;
  text-decoration: none;
}

.resource-back-link:hover,
.resource-back-link:focus-visible {
  color: var(--accent-orange);
}

@media (max-width: 1023px) {
  .resources-main {
    width: 100%;
  }
}

@media (max-width: 767px) {
  .resources-main {
    width: 100%;
    padding: 2.5rem 1rem 5rem;
  }

  .resources-main > .site-nav {
    margin-bottom: 3.5rem;
  }

  .resource-detail-intro-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .resource-detail-intro h1 {
    font-size: clamp(4.1rem, 20vw, 6.5rem);
  }

  .resource-detail-intro-copy {
    align-self: auto;
    padding-bottom: 0;
  }

  .resource-back-link {
    align-items: center;
    margin-top: 0;
  }
}
</style>
