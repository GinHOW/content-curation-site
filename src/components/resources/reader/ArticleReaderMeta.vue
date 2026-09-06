<template>
        <aside v-if="!metaCollapsed" class="reader-meta-col" aria-label="文献元数据与资源">
          <div class="meta-sticky-box">
            <button
              type="button"
              class="meta-collapse-toggle"
              :aria-expanded="!metaCollapsed"
              aria-controls="article-meta-content"
              @click="$emit('update:metaCollapsed', !metaCollapsed)"
            >
              <span>文献元信息</span>
              <span class="meta-collapse-icon" aria-hidden="true">{{ metaCollapsed ? '+' : '−' }}</span>
            </button>

            <div v-show="!metaCollapsed" id="article-meta-content" class="meta-content">
              <div class="meta-block">
                <span class="meta-label">文献出处</span>
                <p class="meta-value">{{ metadata.source }}</p>
                <p v-if="metadata.bookSource" class="meta-subvalue">{{ metadata.bookSource }}</p>
              </div>

              <div class="meta-block meta-inline-block">
                <div class="meta-inline-row">
                  <span class="meta-label">发表年份</span>
                  <p class="meta-value">{{ metadata.year }}</p>
                </div>
              </div>

              <div class="meta-block">
                <span class="meta-label">主题标签</span>
                <div class="meta-tags">
                  <span v-for="tag in metadata.tags" :key="tag" class="meta-tag-item">{{ tag }}</span>
                </div>
              </div>

              <!-- 关联外部资源与代码库卡片 -->
              <div v-if="metadata.links && metadata.links.length" class="meta-block">
                <span class="meta-label">关联站点与代码仓库</span>
                <div class="meta-links-list">
                  <a
                    v-for="(link, idx) in metadata.links"
                    :key="idx"
                    :href="link.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="meta-link-item"
                  >
                    <span class="meta-link-badge">{{ link.type === 'github' ? 'CODE' : 'WEB' }}</span>
                    <div class="meta-link-info">
                      <span class="meta-link-name">{{ link.label }}</span>
                      <span class="meta-link-desc">{{ link.desc || link.url }}</span>
                    </div>
                    <span class="meta-link-arrow" aria-hidden="true">↗</span>
                  </a>
                </div>
              </div>

              <!-- 仅当确实有原版 PDF 存档时才显示下载区块 -->
              <div v-if="metadata.pdfUrl && (metadata.pdfUrl.endsWith('.pdf') || metadata.pdfUrl.includes('origin.pdf'))" class="meta-block meta-download">
                <span class="meta-label">原版文献存档</span>
                <a
                  :href="metadata.pdfUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="pdf-download-btn"
                >
                  下载 / 查看原版 PDF <span aria-hidden="true">↗</span>
                </a>
              </div>
            </div>
          </div>
        </aside>

        <button
          v-else
          type="button"
          class="meta-expand-toggle"
          aria-expanded="false"
          aria-controls="article-meta-content"
          aria-label="展开文献元信息"
          @click="$emit('update:metaCollapsed', false)"
        >
          <span class="meta-expand-label" aria-hidden="true">
            <span>·</span>
            <span>·</span>
            <span>·</span>
          </span>
        </button>
</template>

<script setup>
defineProps({
  metadata:      { type: Object,  required: true },
  metaCollapsed: { type: Boolean, required: true },
})

defineEmits(['update:metaCollapsed'])
</script>

<style scoped>
/* 5. 右侧：元数据与档案下载 */
.reader-meta-col {
  position: sticky;
  top: 4.5rem;
  align-self: start;
}

.meta-sticky-box {
  max-height: calc(100vh - 6rem);
  overflow-y: auto;
}

.meta-collapse-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin: 0 0 1.2rem;
  padding: 0 0 0.75rem;
  border: 0;
  border-bottom: 1px solid var(--resources-rule, #d7d7d1);
  background: transparent;
  color: var(--resources-muted, #8c8c88);
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-align: left;
  text-transform: uppercase;
  cursor: pointer;
}

.meta-collapse-toggle:hover {
  color: var(--home-blue, #1976d2);
}

.meta-collapse-icon {
  color: inherit;
  font-size: 1rem;
  line-height: 1;
}

.meta-expand-toggle {
  position: fixed;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  z-index: 35;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 0.9rem;
  min-height: 2.6rem;
  padding: 0.45rem 0.1rem;
  border: 1px solid var(--resources-rule, #d7d7d1);
  border-right: 0;
  border-radius: 0.3rem 0 0 0.3rem;
  background: rgba(255, 255, 255, 0.96);
  color: var(--resources-muted, #8c8c88);
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  cursor: pointer;
}

.meta-expand-label {
  display: flex;
  flex-direction: column;
  gap: 0.08rem;
  line-height: 0.45;
}

.meta-expand-toggle:hover {
  border: 1px solid var(--home-ink, #111111);
  border-right: 0;
  color: var(--home-ink, #111111);
}

.meta-block {
  margin-bottom: 0.8rem;
  padding-bottom: 0.65rem;
  border-bottom: 1px solid var(--resources-rule, #d7d7d1);
}

.meta-inline-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
}

.meta-inline-row .meta-label,
.meta-inline-row .meta-value {
  margin: 0;
}

.meta-inline-row .meta-value {
  text-align: right;
}

.meta-label {
  display: block;
  margin-bottom: 0.4rem;
  color: var(--resources-muted, #8c8c88);
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.meta-value {
  margin: 0;
  color: var(--home-ink, #111111);
  font-size: 0.9rem;
  font-weight: 600;
}

.meta-subvalue {
  margin: 0.2rem 0 0;
  color: var(--resources-muted, #8c8c88);
  font-size: 0.78rem;
}

.meta-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-top: 0.5rem;
}

.meta-tag-item {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.55rem;
  border: 1px solid var(--resources-rule, #d7d7d1);
  background-color: #fafaf9;
  color: var(--home-ink, #111111);
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  line-height: 1.25;
  transition: all 0.15s ease;
}

.meta-tag-item:hover {
  border-color: var(--home-blue, #1976d2);
  color: var(--home-blue, #1976d2);
  background-color: #f0f7ff;
}

/* 侧边栏外链卡片 */
.meta-links-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-top: 0.5rem;
}

.meta-link-item {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.55rem 0.7rem;
  border: 1px solid var(--resources-rule, #d7d7d1);
  background-color: #fafaf9;
  text-decoration: none;
  transition: all 0.15s ease;
}

.meta-link-item:hover {
  border-color: var(--home-blue, #1976d2);
  background-color: #ffffff;
}

.meta-link-badge {
  font-size: 0.64rem;
  font-weight: 700;
  padding: 0.1rem 0.3rem;
  border: 1px solid var(--resources-rule, #d7d7d1);
  background-color: #ffffff;
  color: var(--home-ink, #111111);
}

.meta-link-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.meta-link-name {
  color: var(--home-ink, #111111);
  font-size: 0.8rem;
  font-weight: 600;
  line-height: 1.3;
}

.meta-link-desc {
  margin-top: 0.15rem;
  color: var(--resources-muted, #8c8c88);
  font-size: 0.7rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.meta-link-arrow {
  color: var(--resources-muted, #8c8c88);
  font-size: 0.78rem;
}

.meta-link-item:hover .meta-link-arrow {
  color: var(--home-blue, #1976d2);
}

.pdf-download-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin-top: 0.4rem;
  color: var(--home-blue, #1976d2);
  font-size: 0.82rem;
  font-weight: 700;
  text-decoration: none;
}

.pdf-download-btn:hover {
  color: var(--accent-orange, #e65100);
}

@media (max-width: 1024px) {
  .reader-meta-col {
    position: static;
  }
}
</style>
