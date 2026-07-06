<template>
  <div class="page">
    <header class="page-header">
      <div class="stamp stamp-sm">作品</div>
      <h1>学生作品</h1>
      <p>策展网站项目成果展示</p>
    </header>

    <div v-if="works.length === 0" class="empty-state">
      <div class="stamp" style="margin-bottom: 1.5rem;">待发布</div>
      <p>学生作品将在课程后期发布</p>
    </div>

    <section v-else class="shelf-section">
      <div class="shelf-header">
        <div class="stamp stamp-sm" style="background: var(--red-stamp); border-color: var(--red-stamp); color: var(--white); width: 36px; height: 36px; font-size: 0.65rem;">货架</div>
        <h2>STUDENT WORKS</h2>
      </div>

      <div class="shelf-grid">
        <router-link
          v-for="(work, index) in works"
          :key="work.id"
          :to="`/works/${work.id}`"
          class="product-box fade-in"
          :style="{ animationDelay: `${index * 0.1}s` }"
        >
          <span class="product-box-label">{{ work.object || '作品' }}</span>
          <h3>{{ work.title }}</h3>
          <p class="work-author">{{ work.team ? work.team.join('、') : work.author }}</p>
          <p v-if="work.concept" class="work-concept">{{ work.concept }}</p>
          <div class="product-box-corner"></div>
        </router-link>
      </div>
    </section>
  </div>
</template>

<script setup>
import { works } from '../data/works.js'
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

.shelf-section {
  padding: 2rem var(--space) 4rem;
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
  padding: 4rem 2rem;
  color: var(--gray-text);
  border: 3px dashed var(--blue-light);
  margin: 2rem var(--space);
}

.empty-state p {
  font-size: 1.1rem;
  font-style: italic;
  margin: 0;
}

.shelf-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
}

.product-box {
  background: var(--white);
  border: 3px solid var(--blue-light);
  padding: 1.5rem;
  position: relative;
  cursor: pointer;
  transition: all 0.25s ease;
  display: block;
  box-shadow: 4px 4px 0 var(--blue-light);
}

.product-box:hover {
  transform: translateY(-8px) rotate(-1deg);
  box-shadow: 8px 8px 0 var(--blue-light);
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

.product-box h3 {
  margin: 0 0 0.5rem;
  font-size: 1.3rem;
  line-height: 1.3;
}

.product-box p {
  font-size: 0.9rem;
  color: var(--gray-text);
  margin: 0;
  line-height: 1.6;
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

.work-author {
  font-size: 0.85rem;
  color: var(--red-stamp);
  font-weight: 700;
  margin: 0.5rem 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.work-concept {
  font-size: 0.9rem;
  color: var(--gray-text);
  line-height: 1.6;
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
