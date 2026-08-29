/**
 * 路由组件预加载工具
 * 用于在首页空闲（requestIdleCallback）或用户触控/悬停导航栏时提前加载 Chunk，消除移动端点击跳转延迟。
 */

const routeLoaders = {
  Syllabus: () => import('../views/Syllabus.vue'),
  Resources: () => import('../views/Resources.vue'),
  Works: () => import('../views/Works.vue'),
  ResourceArticles: () => import('../views/resources/ResourceArticles.vue'),
  ResourceVideos: () => import('../views/resources/ResourceVideos.vue'),
  ResourceWebsites: () => import('../views/resources/ResourceWebsites.vue'),
  ResourceTools: () => import('../views/resources/ResourceTools.vue'),
}

const prefetched = new Set()

/**
 * 预加载指定路由
 * @param {string} routeName 路由名称
 */
export function prefetchRoute(routeName) {
  if (!routeName || prefetched.has(routeName)) return
  const loader = routeLoaders[routeName]
  if (typeof loader === 'function') {
    prefetched.add(routeName)
    loader().catch(() => {
      // 预加载失败时不阻塞，允许后续点击时由 Vue Router 再次尝试加载
      prefetched.delete(routeName)
    })
  }
}

/**
 * 在浏览器主线程空闲时预加载核心页面
 * 优先预加载大纲（Syllabus）与资源（Resources）
 */
export function prefetchCoreRoutes() {
  if (typeof window === 'undefined') return

  const task = () => {
    // 优先预加载移动端点击频率最高且信息量最大的 Syllabus 页面
    prefetchRoute('Syllabus')
    prefetchRoute('Resources')
    prefetchRoute('Works')
  }

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(task, { timeout: 2500 })
  } else {
    setTimeout(task, 1200)
  }
}
