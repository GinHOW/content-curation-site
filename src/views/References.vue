<template>
  <div class="page">
    <header class="page-header">
      <div class="stamp stamp-sm">资料</div>
      <h1>参考资料</h1>
      <p>课程阅读材料与资源索引</p>
    </header>

    <!-- 文本 -->
    <section class="ref-category">
      <div class="shelf-header">
        <div class="stamp stamp-sm" style="background: var(--red-stamp); border-color: var(--red-stamp); color: var(--white); width: 36px; height: 36px; font-size: 0.65rem;">文本</div>
        <h2>TEXTS</h2>
      </div>
      <div v-if="refs.texts.length === 0" class="empty-state">暂无文本资料</div>
      <div v-for="item in refs.texts" :key="item.id" class="ref-item product-box">
        <span class="product-box-label">文献</span>
        <p class="ref-title">
          <a v-if="item.url" :href="item.url" target="_blank" rel="noopener">{{ item.title }}</a>
          <span v-else>{{ item.title }}</span>
        </p>
        <p class="ref-meta">{{ item.author }} · {{ item.year }} · {{ item.source }}</p>
        <p v-if="item.description" class="ref-desc">{{ item.description }}</p>
        <div class="product-box-corner"></div>
      </div>
    </section>

    <!-- 视频 -->
    <section class="ref-category">
      <div class="shelf-header">
        <div class="stamp stamp-sm" style="background: var(--red-stamp); border-color: var(--red-stamp); color: var(--white); width: 36px; height: 36px; font-size: 0.65rem;">视频</div>
        <h2>VIDEOS</h2>
      </div>
      <div v-if="refs.videos.length === 0" class="empty-state">视频资料待补充</div>
      <div v-for="item in refs.videos" :key="item.id" class="ref-item product-box">
        <span class="product-box-label">影像</span>
        <p class="ref-title">
          <a v-if="item.url" :href="item.url" target="_blank" rel="noopener">{{ item.title }}</a>
          <span v-else>{{ item.title }}</span>
        </p>
        <p class="ref-meta">{{ item.description }}</p>
        <div class="product-box-corner"></div>
      </div>
    </section>

    <!-- 图像 -->
    <section class="ref-category">
      <div class="shelf-header">
        <div class="stamp stamp-sm" style="background: var(--red-stamp); border-color: var(--red-stamp); color: var(--white); width: 36px; height: 36px; font-size: 0.65rem;">图像</div>
        <h2>IMAGES</h2>
      </div>
      <div v-if="refs.images.length === 0" class="empty-state">图像资料待补充</div>
      <div v-for="item in refs.images" :key="item.id" class="ref-item product-box">
        <span class="product-box-label">视觉</span>
        <p class="ref-title">{{ item.title }}</p>
        <p class="ref-meta">{{ item.description }}</p>
        <div class="product-box-corner"></div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { references } from '../data/references.js'
const refs = references
</script>

<style scoped>
.page {
  background: var(--white);
  color: var(--blue-light);
}

.page-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 3rem var(--space) 2rem;
  border-bottom: 4px solid var(--blue-light);
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: clamp(2.5rem, 6vw, 4rem);
  line-height: 1;
  margin: 0;
}

.page-header p {
  font-size: 0.9rem;
  color: var(--gray-text);
  margin: 0;
}

.ref-category {
  margin-bottom: 4rem;
}

.shelf-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 4px solid var(--blue-light);
}

.shelf-header h2 {
  font-size: 1.8rem;
  margin: 0;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--gray-text);
  font-style: italic;
  border: 2px dashed var(--blue-light);
  opacity: 0.6;
}

.ref-item {
  margin-bottom: 1.5rem;
}

/* Product Box (shared card style) */
.product-box {
  background: var(--white);
  border: 3px solid var(--blue-light);
  padding: 1.5rem;
  position: relative;
  transition: all 0.25s ease;
  display: block;
  box-shadow: 4px 4px 0 var(--blue-light);
}

.product-box:hover {
  transform: translateY(-4px);
  box-shadow: 6px 6px 0 var(--blue-light);
}

.product-box-label {
  position: absolute;
  top: -12px;
  right: 20px;
  background: var(--blue-light);
  color: var(--white);
  padding: 0.3rem 0.8rem;
  font-family: var(--font-heavy);
  font-weight: 700;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  border: 2px solid var(--blue-light);
}

.product-box-corner {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 40px;
  height: 40px;
  background: var(--blue-light);
  clip-path: polygon(100% 0, 100% 100%, 0 100%);
}

.ref-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.ref-title a {
  color: var(--blue-light);
  border-bottom: 2px solid var(--red-stamp);
  transition: all 0.2s;
}

.ref-title a:hover {
  background: var(--red-stamp);
  color: var(--white);
}

.ref-meta {
  font-size: 0.85rem;
  color: var(--gray-text);
  margin-bottom: 0.75rem;
}

.ref-desc {
  font-size: 0.9rem;
  color: var(--gray-text);
  line-height: 1.7;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px dashed var(--blue-light);
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
</style>
