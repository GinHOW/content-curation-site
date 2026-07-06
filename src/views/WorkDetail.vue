<template>
  <div class="page">
    <div v-if="!work" class="empty-state">
      <div class="stamp" style="margin-bottom: 1.5rem;">404</div>
      <p>作品未找到</p>
      <router-link to="/works" class="back-link">&larr; 返回作品列表</router-link>
    </div>

    <template v-else>
      <header class="page-header">
        <div class="stamp stamp-sm">{{ work.object || '作品' }}</div>
        <div>
          <h1>{{ work.title }}</h1>
          <p class="header-object">{{ work.object }}</p>
        </div>
      </header>

      <!-- Meta Info Bar -->
      <section class="meta-bar checker-pattern" style="padding: 1.2rem var(--space); border-top: 4px solid var(--blue-light); border-bottom: 4px solid var(--blue-light);">
        <div class="container" style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
          <div><strong>作者：</strong>{{ work.team ? work.team.join('、') : work.author }}</div>
          <div v-if="work.websiteUrl">
            <a :href="work.websiteUrl" target="_blank" rel="noopener" class="visit-link">访问策展网站 &rarr;</a>
          </div>
        </div>
      </section>

      <!-- Concept Section -->
      <section v-if="work.concept" class="detail-section">
        <div class="shelf-header">
          <div class="stamp stamp-sm" style="background: var(--red-stamp); border-color: var(--red-stamp); color: var(--white); width: 36px; height: 36px; font-size: 0.65rem;">概念</div>
          <h2>CURATORIAL CONCEPT</h2>
        </div>
        <div class="product-box">
          <span class="product-box-label">策展概念</span>
          <p class="concept-text">{{ work.concept }}</p>
          <div class="product-box-corner"></div>
        </div>
      </section>

      <!-- Exhibition Section -->
      <section v-if="work.exhibition" class="detail-section">
        <div class="shelf-header">
          <div class="stamp stamp-sm" style="background: var(--red-stamp); border-color: var(--red-stamp); color: var(--white); width: 36px; height: 36px; font-size: 0.65rem;">展具</div>
          <h2>EXHIBITION DESIGN</h2>
        </div>
        <div class="product-box">
          <span class="product-box-label">展具方案</span>
          <p class="concept-text">{{ work.exhibition.description }}</p>
          <div class="product-box-corner"></div>
        </div>
        <div v-if="work.exhibition.images && work.exhibition.images.length > 0" class="exhibition-images">
          <img
            v-for="(img, i) in work.exhibition.images"
            :key="i"
            :src="img"
            :alt="`展具图片 ${i + 1}`"
          />
        </div>
      </section>

      <!-- Back Link -->
      <div style="padding: 2rem var(--space); border-top: 4px solid var(--blue-light);">
        <router-link to="/works" class="back-link">&larr; 返回作品列表</router-link>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { works } from '../data/works.js'

const route = useRoute()
const work = computed(() => works.find(w => w.id === route.params.id))
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
}

.page-header h1 {
  font-size: clamp(2.5rem, 6vw, 4rem);
  line-height: 1;
  margin: 0;
}

.header-object {
  font-size: 0.9rem;
  color: var(--gray-text);
  margin: 0.5rem 0 0;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.meta-bar {
  font-size: 0.9rem;
}

.meta-bar strong {
  color: var(--blue-light);
}

.visit-link {
  color: var(--red-stamp);
  font-weight: 700;
  border-bottom: 2px solid var(--red-stamp);
  padding-bottom: 2px;
  transition: all 0.2s;
}

.visit-link:hover {
  background: var(--red-stamp);
  color: var(--white);
}

.detail-section {
  padding: 2rem var(--space);
}

.shelf-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 4px solid var(--blue-light);
}

.shelf-header h2 {
  font-size: 1.8rem;
  margin: 0;
}

.concept-text {
  font-size: 1rem;
  line-height: 1.8;
  color: var(--blue-light);
  margin: 0;
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

.exhibition-images {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
  padding: 0 var(--space);
}

.exhibition-images img {
  width: 100%;
  border: 3px solid var(--blue-light);
  box-shadow: 4px 4px 0 var(--blue-light);
}

.back-link {
  display: inline-block;
  color: var(--blue-light);
  font-weight: 700;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border: 2px solid var(--blue-light);
  padding: 0.6rem 1.2rem;
  transition: all 0.2s;
}

.back-link:hover {
  background: var(--blue-light);
  color: var(--white);
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--gray-text);
  margin: 2rem var(--space);
}

.empty-state p {
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .exhibition-images {
    grid-template-columns: 1fr;
    padding: 0;
  }
}
</style>
