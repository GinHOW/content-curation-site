<template>
  <div class="marquee-banner">
    <div class="marquee-track" :style="{ animationDuration: speed + 's' }">
      <span
        v-for="(item, i) in [...items, ...items, ...items, ...items, ...items]"
        :key="i"
        class="marquee-item"
      >
        {{ item }}
        <span class="sep">·</span>
      </span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  items: {
    type: Array,
    default: () => ['策展超市 1.0', '2025 内容与策展教学部分成果']
  },
  speed: {
    type: Number,
    default: 25
  }
})
</script>

<style scoped>
.marquee-banner {
  background: var(--blue-light);
  color: var(--white);
  padding: 0.6rem 0;
  overflow: hidden;
  user-select: none;
}

.marquee-track {
  display: flex;
  animation: marquee-scroll 25s linear infinite;
}

.marquee-item {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  font-family: var(--font-heavy);
  font-weight: 700;
  font-size: 0.9rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 0 1rem;
  white-space: nowrap;
}

.sep {
  margin: 0 1rem;
  color: var(--red-stamp);
  font-size: 1.2rem;
  font-weight: 900;
}

@keyframes marquee-scroll {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-20%);
  }
}
</style>
