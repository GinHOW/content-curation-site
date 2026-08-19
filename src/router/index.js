import { createRouter, createWebHistory } from 'vue-router'

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
    path: '/references',
    name: 'References',
    component: () => import('../views/References.vue'),
    meta: { title: '参考资料 · 内容与策展 2026' },
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
    meta: { title: '选题库管理 · 内容与策展 2026' },
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
