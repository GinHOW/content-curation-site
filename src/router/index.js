import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Syllabus from '../views/Syllabus.vue'
import References from '../views/References.vue'
import Works from '../views/Works.vue'
import WorkDetail from '../views/WorkDetail.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/syllabus', name: 'Syllabus', component: Syllabus },
  { path: '/references', name: 'References', component: References },
  { path: '/works', name: 'Works', component: Works },
  { path: '/works/:id', name: 'WorkDetail', component: WorkDetail, props: true },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

export default router
