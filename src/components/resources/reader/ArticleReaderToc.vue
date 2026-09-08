<template>
        <aside class="reader-toc-col" aria-label="章节大纲">
          <div class="toc-sticky-box">
            <span class="toc-title">目录大纲 / CONTENTS</span>
            <nav class="toc-nav">
              <ul class="toc-list">
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
            </nav>

            <div class="toc-foot">
              <button type="button" class="back-top-btn" @click="$emit('scroll-to-top')">
                ↑ 回到顶部
              </button>
            </div>
          </div>
        </aside>
</template>

<script setup>
const props = defineProps({
  tocSections:        { type: Array,  required: true },
  activeSectionId:    { type: String, required: true },
  expandedSectionIds: { type: Object, required: true }, // Set
})

defineEmits(['section-click', 'toggle-section', 'scroll-to-top'])

const isTocSectionExpanded = (sectionId) => props.expandedSectionIds.has(sectionId)

const isTocSectionActive = (section) =>
  section.id === props.activeSectionId ||
  (section.children || []).some((child) => child.id === props.activeSectionId)
</script>

<style scoped>
/* 1. 左侧：跟随视图吸顶固定目录大纲 */
.reader-toc-col {
  position: sticky;
  top: 4.5rem;
  align-self: start;
}

.toc-sticky-box {
  max-height: calc(100vh - 6rem);
  overflow-y: auto;
  padding-right: 0.5rem;
}

.toc-title {
  display: block;
  margin-bottom: 1.2rem;
  color: var(--resources-muted, #8c8c88);
  font-size: 0.72rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.toc-nav ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.toc-nav li {
  margin-bottom: 1.1rem;
}

.toc-nav a {
  display: flex;
  flex-direction: column;
  padding-left: 0.75rem;
  border-left: 2px solid transparent;
  color: var(--resources-muted, #8c8c88);
  text-decoration: none;
  transition: all 0.2s ease;
}

.toc-nav a:hover {
  color: var(--home-ink, #111111);
}

.toc-nav li.is-active a {
  border-left-color: transparent;
  color: var(--home-ink, #111111);
}

.toc-list .toc-section-row {
  display: flex;
  align-items: flex-start;
  gap: 0.25rem;
}

.toc-list .toc-section-row > a {
  flex: 1;
  min-width: 0;
}

/* 给父级章节与展开的子级章节留出明确的层级呼吸空间。 */
.toc-list > li > .toc-sublist {
  margin-top: 0.85rem;
}

.toc-list > li > .toc-sublist a {
  padding-left: 1.75rem;
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

.sec-label {
  font-size: 0.85rem;
  font-weight: 600;
  line-height: 1.35;
}

.sec-en {
  margin-top: 0.15rem;
  font-size: 0.68rem;
  opacity: 0.75;
}

.toc-foot {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid var(--resources-rule, #d7d7d1);
}

.back-top-btn {
  padding: 0;
  border: none;
  background: transparent;
  color: var(--resources-muted, #8c8c88);
  font-size: 0.75rem;
  cursor: pointer;
}

.back-top-btn:hover {
  color: var(--home-blue, #1976d2);
}

@media (max-width: 1024px) {
  .reader-toc-col {
    display: none;
  }
}
</style>
