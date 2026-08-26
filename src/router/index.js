import { createRouter, createWebHistory } from 'vue-router'

const legacyResourceRoutes = {
  article: 'ResourceArticles',
  video: 'ResourceVideos',
  image: 'ResourceWebsites',
  tool: 'ResourceTools',
}

const firstQueryValue = (value) => (Array.isArray(value) ? value[0] : value)

const cleanLegacyResourceQuery = (query) => {
  const nextQuery = { ...query }
  delete nextQuery.category
  return nextQuery
}

const redirectLegacyResourceQuery = (to) => {
  const category = firstQueryValue(to.query.category)
  const targetName = typeof category === 'string' ? legacyResourceRoutes[category] : undefined

  if (targetName) {
    return {
      name: targetName,
      query: cleanLegacyResourceQuery(to.query),
      replace: true,
    }
  }

  if ('category' in to.query) {
    return {
      name: 'Resources',
      query: cleanLegacyResourceQuery(to.query),
      replace: true,
    }
  }

  return true
}

// 旧网页资源书签只做兼容跳转，不再挂载旧的 images 页面。
const redirectLegacyWebsitePath = (to) => ({
  name: 'ResourceWebsites',
  query: to.query,
  hash: to.hash,
})

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { title: '内容与策展 · 2026 课程网站' },
  },
  {
    path: '/syllabus',
    name: 'Syllabus',
    component: () => import('../views/Syllabus.vue'),
    meta: { title: '教学大纲 · 内容与策展 2026' },
  },
  {
    path: '/resources',
    name: 'Resources',
    component: () => import('../views/Resources.vue'),
    beforeEnter: redirectLegacyResourceQuery,
    meta: { title: '课程资源 · 内容与策展 2026' },
  },
  {
    path: '/resources/articles',
    name: 'ResourceArticles',
    component: () => import('../views/resources/ResourceArticles.vue'),
    meta: { title: '文章资源 · 内容与策展 2026' },
  },
  {
    path: '/resources/articles/:id',
    name: 'ResourceArticleDetail',
    component: () => import('../views/resources/ArticleDetail.vue'),
    props: true,
    meta: { title: '文献阅读 · 内容与策展 2026' },
  },
  {
    path: '/resources/videos',
    name: 'ResourceVideos',
    component: () => import('../views/resources/ResourceVideos.vue'),
    meta: { title: '视频资源 · 内容与策展 2026' },
  },
  {
    path: '/resources/websites',
    name: 'ResourceWebsites',
    component: () => import('../views/resources/ResourceWebsites.vue'),
    meta: { title: '网页 · 内容与策展 2026' },
  },
  {
    path: '/resources/images',
    redirect: redirectLegacyWebsitePath,
  },
  {
    path: '/resources/website',
    redirect: redirectLegacyWebsitePath,
  },
  {
    path: '/resources/tools',
    name: 'ResourceTools',
    component: () => import('../views/resources/ResourceTools.vue'),
    meta: { title: '工具资源 · 内容与策展 2026' },
  },
  {
    path: '/references',
    redirect: { name: 'Resources' },
  },
  {
    path: '/works',
    name: 'Works',
    component: () => import('../views/Works.vue'),
    meta: { title: '学生作品 · 内容与策展 2026' },
  },
  {
    path: '/works/:id',
    name: 'WorkDetail',
    component: () => import('../views/WorkDetail.vue'),
    props: true,
    meta: { title: '作品详情 · 内容与策展 2026' },
  },
  {
    path: '/manage',
    name: 'Admin',
    component: () => import('../views/Admin.vue'),
    meta: { title: '管理员入口 · 内容与策展 2026' },
  },
  {
    path: '/student',
    name: 'Student',
    component: () => import('../views/Student.vue'),
    meta: { title: '学生入口 · 内容与策展 2026' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.afterEach((to) => {
  if (to.meta?.title) {
    document.title = to.meta.title
  }
})

export default router
