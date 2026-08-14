<template>
  <aside class="home-index" aria-label="主页章节索引">
    <nav class="index-nav" aria-label="章节导航">
      <a
        v-for="item in items"
        :key="item.id"
        class="index-link"
        :class="{ 'is-active': activeSection === item.id }"
        :href="`#${item.id}`"
        :aria-current="activeSection === item.id ? 'location' : undefined"
        @click="handleClick($event, item.id)"
      >
        <span class="index-copy" aria-hidden="true">
          <span class="index-label">{{ item.label }}</span>
        </span>
        <span class="sr-only">{{ item.label }}</span>
      </a>
    </nav>
  </aside>
</template>

<script setup>
defineProps({
  items: {
    type: Array,
    required: true,
  },
  activeSection: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['navigate'])

const handleClick = (event, id) => {
  event.preventDefault()
  emit('navigate', id)
}
</script>

