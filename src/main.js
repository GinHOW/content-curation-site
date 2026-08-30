import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './styles/global.css'

// 捕获动态 chunk 预加载或加载失败（通常发生于发版后旧 hash 文件 404），自动刷新拉取最新资源
window.addEventListener('vite:preloadError', (event) => {
  console.warn('Vite preload error detected, reloading page to fetch newest assets...', event)
  window.location.reload()
})

createApp(App).use(router).mount('#app')

