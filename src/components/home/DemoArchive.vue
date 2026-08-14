<template>
  <section class="demo-archive" aria-label="内容数据库示范">
    <p class="demo-archive-intro">{{ archive.intro }}</p>

    <div class="demo-archive-grid">
      <article
        v-for="category in archive.categories"
        :key="category.code"
        class="demo-archive-category"
      >
        <header class="demo-archive-category-head">
          <span class="demo-archive-category-code">{{ category.code }}</span>
          <div>
            <h4>{{ category.title }}</h4>
            <p>{{ category.note }}</p>
          </div>
        </header>

        <ol class="demo-archive-items">
          <li v-for="(item, index) in category.items" :key="item[0]">
            <span class="demo-archive-item-number">{{ String(index + 1).padStart(2, '0') }}</span>
            <div>
              <h5>
                {{ item[0] }}
                <small>{{ item[1] }}</small>
              </h5>
              <p>{{ item[2] }}</p>
            </div>
          </li>
        </ol>
      </article>
    </div>
  </section>
</template>

<script setup>
defineProps({
  archive: {
    type: Object,
    required: true,
  },
})
</script>

<style scoped>
.demo-archive {
  margin-top: clamp(3.5rem, 7vw, 6rem);
  padding-top: clamp(2rem, 4vw, 3rem);
  border-top: 1px solid var(--home-rule);
}

.demo-archive-intro {
  margin: 0;
  color: var(--home-ink);
  font-family: var(--font-body);
  font-size: clamp(1rem, 1.3vw, 1.18rem);
  line-height: 1.75;
  text-wrap: pretty;
}

.demo-archive-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(3rem, 6vw, 6rem) var(--home-column-gap);
  margin-top: clamp(3rem, 6vw, 5rem);
}

.demo-archive-category-head {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 1.1rem;
  align-items: start;
}

.demo-archive-category-code {
  color: var(--home-orange);
  font-family: var(--font-heavy);
  font-size: clamp(2.8rem, 5vw, 4.5rem);
  font-weight: 700;
  line-height: 0.9;
}

.demo-archive-category h4 {
  margin: 0;
  font-family: var(--font-heavy);
  font-size: clamp(1.15rem, 1.8vw, 1.55rem);
  font-weight: 700;
  line-height: 1.2;
}

.demo-archive-category-head p {
  margin: 0.45rem 0 0;
  color: var(--home-muted);
  font-size: 0.78rem;
  line-height: 1.4;
}

.demo-archive-items {
  margin: 1.7rem 0 0;
  padding: 0;
  list-style: none;
}

.demo-archive-items li {
  display: grid;
  grid-template-columns: 2.2rem minmax(0, 1fr);
  gap: 0.9rem;
  padding: 1rem 0;
  border-top: 1px solid var(--home-rule);
}

.demo-archive-item-number {
  color: var(--home-muted);
  font-size: 0.8rem;
  line-height: 1.5;
}

.demo-archive-items h5 {
  margin: 0;
  font-family: var(--font-heavy);
  font-size: 0.98rem;
  font-weight: 700;
  line-height: 1.45;
}

.demo-archive-items h5 small {
  display: inline;
  margin-left: 0.5rem;
  color: var(--home-muted);
  font-family: var(--font-body);
  font-size: 0.78rem;
  font-weight: 400;
}

.demo-archive-items p {
  margin: 0.35rem 0 0;
  color: var(--home-muted);
  font-family: var(--font-body);
  font-size: 0.84rem;
  line-height: 1.55;
  text-wrap: pretty;
}

@media (max-width: 767px) {
  .demo-archive {
    margin-top: 3.5rem;
    padding-top: 1.8rem;
  }

  .demo-archive-grid {
    grid-template-columns: 1fr;
    gap: 3rem;
  }

  .demo-archive-intro {
    line-height: 1.65;
  }

  .demo-archive-items h5 small {
    display: block;
    margin: 0.18rem 0 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .demo-archive * {
    scroll-behavior: auto;
  }
}
</style>
