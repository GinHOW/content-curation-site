<template>
  <a
    class="back-to-top"
    :href="target"
    aria-label="返回页面顶部"
    @click.prevent="scrollToTop"
  >
    <span>返回顶部</span>
    <span aria-hidden="true">↑</span>
  </a>
</template>

<script setup>
const props = defineProps({
  target: {
    type: String,
    default: '#top',
  },
})

function scrollToTop() {
  const targetElement = document.querySelector(props.target)
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (targetElement) {
    targetElement.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start',
    })
    return
  }

  window.scrollTo({
    top: 0,
    behavior: prefersReducedMotion ? 'auto' : 'smooth',
  })
}
</script>

<style scoped>
.back-to-top {
  display: inline-flex;
  align-items: center;
  gap: 0.28rem;
  min-height: 44px;
  padding: 0.55rem 0;
  color: inherit;
  font-size: 0.85rem;
  line-height: 1.2;
  text-decoration: underline;
  text-underline-offset: 0.35rem;
  cursor: pointer;
}

.back-to-top:hover {
  text-decoration-thickness: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .back-to-top {
    transition: none;
  }
}
</style>
