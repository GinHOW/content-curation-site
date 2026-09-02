<template>
  <section class="living-room-archive" aria-labelledby="living-room-archive-title">
    <header class="living-room-archive-header">
      <div>
        <p class="archive-label">Content Archive / Example</p>
        <h3 id="living-room-archive-title">客厅 <span>/ Living Room</span></h3>
      </div>
      <div class="archive-header-tools">
        <div class="archive-meta">
          <strong>40</strong>
          <span>条示范记录<br />4 类采集维度</span>
        </div>
        <button
          type="button"
          class="archive-toggle"
          :aria-expanded="!isCollapsed"
          aria-controls="living-room-archive-content"
          @click="isCollapsed = !isCollapsed"
        >
          <span aria-hidden="true">{{ isCollapsed ? '＋' : '－' }}</span>
          {{ isCollapsed ? '展开' : '折叠' }}
        </button>
      </div>
      <p class="archive-intro">{{ archive.intro }}</p>
    </header>

    <div v-show="!isCollapsed" id="living-room-archive-content" class="archive-category-grid">
      <article v-for="category in archive.categories" :key="category.code" class="archive-category">
        <header class="archive-category-header">
          <span class="archive-category-code">{{ category.code }}</span>
          <div>
            <h4>{{ category.title }}</h4>
            <p>{{ category.note }}</p>
          </div>
        </header>

        <ol class="archive-item-list">
          <li v-for="(item, index) in category.items" :key="`${category.code}-${item[0]}`">
            <span class="archive-item-index">{{ String(index + 1).padStart(2, '0') }}</span>
            <div>
              <h5>{{ item[0] }}</h5>
              <p class="archive-item-source">{{ item[1] }}</p>
              <p class="archive-item-note">{{ item[2] }}</p>
            </div>
          </li>
        </ol>
      </article>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { livingRoomArchive as archive } from '../../data/topics/livingRoomArchive.js'

const isCollapsed = ref(false)
</script>

<style scoped>
.living-room-archive {
  padding: clamp(1.2rem, 3vw, 2.2rem);
  border: 1px solid color-mix(in srgb, var(--week-color) 66%, #ffffff);
  background: color-mix(in srgb, var(--week-color) 6%, #ffffff);
}
.living-room-archive-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 1rem 2rem;
  padding-bottom: 1.4rem;
  border-bottom: 1px solid color-mix(in srgb, var(--week-color) 48%, #ffffff);
}
.archive-label,
.archive-category-code {
  margin: 0;
  color: var(--syllabus-muted);
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  line-height: 1.3;
  text-transform: uppercase;
}
.living-room-archive h3 {
  margin: 0.35rem 0 0;
  color: var(--syllabus-ink);
  font-family: var(--font-heavy);
  font-size: clamp(1.6rem, 3vw, 2.8rem);
  line-height: 1.1;
}
.living-room-archive h3 span {
  color: var(--syllabus-muted);
  font-family: var(--font-body);
  font-size: 0.42em;
  font-weight: 500;
  letter-spacing: 0.05em;
}

.archive-header-tools {
  display: flex;
  align-items: end;
  justify-content: end;
  gap: 1rem;
}

.archive-meta {
  display: flex;
  align-items: end;
  gap: 0.5rem;
  color: var(--syllabus-muted);
  text-align: right;
}

.archive-meta strong {
  color: var(--syllabus-ink);
  font-family: var(--font-heavy);
  font-size: 2rem;
  line-height: 0.9;
}

.archive-meta span {
  font-size: 0.68rem;
  line-height: 1.4;
}

.archive-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  min-height: 2rem;
  padding: 0.35rem 0.6rem;
  color: var(--syllabus-ink);
  border: 1px solid color-mix(in srgb, var(--week-color) 65%, #ffffff);
  background: transparent;
  font: inherit;
  font-size: 0.7rem;
  line-height: 1.2;
  cursor: pointer;
}

.archive-toggle:hover {
  background: color-mix(in srgb, var(--week-color) 12%, #ffffff);
}

.archive-toggle:focus-visible {
  outline: 2px solid var(--week-color);
  outline-offset: 2px;
}

.archive-intro {
  grid-column: 1 / -1;
  max-width: 56rem;
  margin: 0;
  color: var(--syllabus-muted);
  font-size: 0.8rem;
  line-height: 1.7;
}

.archive-category-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.archive-category {
  min-width: 0;
  padding: 1rem;
  border: 1px solid color-mix(in srgb, var(--week-color) 45%, #ffffff);
  background: rgb(255 255 255 / 0.62);
}

.archive-category-header {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 0.75rem;
  align-items: start;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--syllabus-rule);
}

.archive-category-code {
  display: grid;
  place-items: center;
  width: 1.7rem;
  height: 1.7rem;
  color: var(--syllabus-ink);
  border: 1px solid var(--week-color);
  background: color-mix(in srgb, var(--week-color) 18%, #ffffff);
  font-size: 0.72rem;
  letter-spacing: 0;
}

.archive-category h4 {
  margin: 0;
  color: var(--syllabus-ink);
  font-size: 0.98rem;
  line-height: 1.3;
}

.archive-category-header p {
  margin: 0.2rem 0 0;
  color: var(--syllabus-muted);
  font-size: 0.68rem;
}

.archive-item-list {
  display: grid;
  gap: 0.7rem;
  margin: 0.85rem 0 0;
  padding: 0.55rem 0 0;
  list-style: none;
}

.archive-item-list li {
  display: grid;
  grid-template-columns: 1.8rem minmax(0, 1fr);
  gap: 0.55rem;
  min-width: 0;
}

.archive-item-index {
  color: var(--week-color);
  font-size: 0.65rem;
  font-variant-numeric: tabular-nums;
  line-height: 1.4;
}

.archive-item-list h5 {
  margin: 0;
  color: var(--syllabus-ink);
  font-size: 0.78rem;
  font-weight: 600;
  line-height: 1.4;
}

.archive-item-source {
  margin: 0.12rem 0 0;
  color: var(--syllabus-muted);
  font-size: 0.68rem;
  line-height: 1.4;
}

.archive-item-note {
  margin: 0.18rem 0 0;
  color: var(--syllabus-muted);
  font-size: 0.72rem;
  line-height: 1.55;
}

@media (max-width: 767px) {
  .living-room-archive {
    padding: 1rem;
  }

  .living-room-archive-header {
    grid-template-columns: 1fr auto;
    gap: 0.8rem 1rem;
  }

  .archive-header-tools {
    flex-direction: column;
    align-items: end;
    gap: 0.6rem;
  }

  .archive-intro {
    font-size: 0.78rem;
  }

  .archive-category-grid {
    grid-template-columns: 1fr;
  }
}
</style>
