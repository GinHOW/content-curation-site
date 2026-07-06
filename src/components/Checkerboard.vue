<template>
  <div
    class="checkerboard"
    :class="{ 'checkerboard-scroll': scroll }"
    :style="checkerStyle"
  ></div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  size: { type: Number, default: 20 },
  color1: { type: String, default: '#1B4ED8' },
  color2: { type: String, default: '#ffffff' },
  height: { type: String, default: '100%' },
  opacity: { type: Number, default: 1 },
  scroll: { type: Boolean, default: false },
  speed: { type: Number, default: 40 },
})

const checkerStyle = computed(() => ({
  backgroundImage: `repeating-conic-gradient(${props.color1} 0% 25%, ${props.color2} 0% 50%)`,
  backgroundSize: `${props.size}px ${props.size}px`,
  height: props.height,
  opacity: props.opacity,
  '--scroll-speed': `${props.speed}s`,
}))
</script>

<style scoped>
.checkerboard {
  width: 100%;
}

@keyframes scroll-x {
  from {
    background-position: 0 0;
  }
  to {
    background-position: 100% 0;
  }
}

.checkerboard-scroll {
  animation: scroll-x var(--scroll-speed, 3s) linear infinite;
}
</style>
