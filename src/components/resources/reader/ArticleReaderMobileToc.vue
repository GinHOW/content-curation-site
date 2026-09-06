<template>
    <nav v-if="tocSections.length" class="mobile-toc-bar" aria-label="移动端目录">
      <button type="button" class="mobile-toc-toggle" @click="$emit('update:mobileTocOpen', !mobileTocOpen)">
        <span class="toggle-icon">☰</span>
        <span class="current-section-text">
          大纲：{{ currentSectionLabel }}
        </span>
        <span class="arrow-icon">{{ mobileTocOpen ? '▲' : '▼' }}</span>
      </button>
      <div v-show="mobileTocOpen" class="mobile-toc-dropdown">
        <ul class="mobile-toc-list">
          <li
            v-for="sec in tocSections"
            :key="sec.id"
            :class="{ 'is-active': isTocSectionActive(sec) }"
          >
            <div class="toc-section-row">
              <a :href="`#${sec.id}`" @click.prevent="$emit('section-click', sec.id)">
                <span class="sec-label">{{ sec.label }}</span>
              </a>
              <button
                v-if="sec.children?.length"
                type="button"
                class="toc-expand-toggle"
                :aria-expanded="isTocSectionExpanded(sec.id)"
                :aria-label="isTocSectionExpanded(sec.id) ? '收起子目录' : '展开子目录'"
                @click.stop="$emit('toggle-section', sec.id)"
              >
                {{ isTocSectionExpanded(sec.id) ? '−' : '+' }}
              </button>
            </div>
            <ul v-if="sec.children?.length" v-show="isTocSectionExpanded(sec.id)" class="toc-sublist">
              <li v-for="child in sec.children" :key="child.id" :class="{ 'is-active': activeSectionId === child.id }">
                <a :href="`#${child.id}`" @click.prevent="$emit('section-click', child.id)">
                  <span class="sec-label">{{ child.label }}</span>
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </nav>
</template>

<script setup>
const props = defineProps({
  tocSections:        { type: Array,   required: true },
  mobileTocOpen:      { type: Boolean, required: true },
  currentSectionLabel:{ type: String,  required: true },
  activeSectionId:    { type: String,  required: true },
  expandedSectionIds: { type: Object,  required: true }, // Set
})

defineEmits(['update:mobileTocOpen', 'section-click', 'toggle-section'])

const isTocSectionExpanded = (sectionId) => props.expandedSectionIds.has(sectionId)

const isTocSectionActive = (section) =>
  section.id === props.activeSectionId ||
  (section.children || []).some((child) => child.id === props.activeSectionId)
</script>

<style scoped>
/* 移动端吸顶大纲栏 */
.mobile-toc-bar {
  display: none;
  position: sticky;
  top: 3.7rem;
  z-index: 40;
  border-bottom: 1px solid var(--resources-rule, #d7d7d1);
  background: #ffffff;
}

.mobile-toc-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.65rem 1.2rem;
  border: none;
  background: transparent;
  color: var(--home-ink, #111111);
  font-size: 0.82rem;
  cursor: pointer;
}

.mobile-toc-dropdown {
  padding: 0.6rem 1.2rem 1rem;
  border-top: 1px solid var(--resources-rule, #d7d7d1);
  background: #fafaf9;
}

.mobile-toc-dropdown ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.mobile-toc-dropdown li {
  margin-bottom: 0.6rem;
}

.mobile-toc-list .toc-section-row,
.toc-list .toc-section-row {
  display: flex;
  align-items: flex-start;
  gap: 0.25rem;
}

.mobile-toc-list .toc-section-row > a,
.toc-list .toc-section-row > a {
  flex: 1;
  min-width: 0;
}

.toc-expand-toggle {
  flex: 0 0 1rem;
  width: 1rem;
  height: 1rem;
  margin-top: 0.2rem;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--resources-muted, #8c8c88);
  font-size: 0.95rem;
  line-height: 1;
  cursor: pointer;
}

.toc-expand-toggle:hover {
  color: var(--home-blue, #1976d2);
}

.toc-nav .toc-sublist {
  list-style: none;
  margin: 0.75rem 0 0.2rem;
  padding: 0 0 0 1rem;
}

.toc-nav .toc-sublist li {
  margin-bottom: 0.7rem;
}

.toc-nav .toc-sublist a {
  padding-left: 0.65rem;
  border-left-width: 1px;
}

.toc-nav .toc-sublist .sec-label {
  font-size: 0.75rem;
  font-weight: 500;
}

.toc-nav .toc-sublist .sec-en {
  font-size: 0.62rem;
}

.mobile-toc-list .toc-sublist {
  margin-top: 0.7rem;
  padding-left: 0.9rem;
}

.mobile-toc-list .toc-sublist li {
  margin-bottom: 0.6rem;
}

.mobile-toc-list .toc-sublist a {
  padding-left: 0.55rem;
}

.mobile-toc-dropdown a {
  display: flex;
  flex-direction: column;
  color: var(--resources-muted, #8c8c88);
  text-decoration: none;
}

.mobile-toc-dropdown li.is-active a {
  color: var(--home-blue, #1976d2);
  font-weight: 600;
}

@media (max-width: 1024px) {
  .mobile-toc-bar {
    display: block;
  }
}
</style>
