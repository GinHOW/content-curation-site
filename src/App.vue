<template>
  <div id="app">
    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted } from 'vue'
import router from './router'
import { useAuthSession } from './composables/useAuthSession.js'

const { initialize, refresh } = useAuthSession()
let removeRouteHook

const refreshAuth = () => refresh().catch(() => {})
const refreshWhenVisible = () => {
  if (document.visibilityState === 'visible') refreshAuth()
}

onMounted(() => {
  initialize()
  removeRouteHook = router.afterEach(refreshAuth)
  window.addEventListener('focus', refreshAuth)
  document.addEventListener('visibilitychange', refreshWhenVisible)
})

onBeforeUnmount(() => {
  removeRouteHook?.()
  window.removeEventListener('focus', refreshAuth)
  document.removeEventListener('visibilitychange', refreshWhenVisible)
})
</script>

<style scoped>
#app {
  min-height: 100vh;
}
</style>
