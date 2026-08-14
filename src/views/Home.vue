<template>
  <div class="home-page">
    <a class="skip-link" href="#overview">跳转到主要内容</a>

    <div class="home-shell">
      <HomeEdgeNav
        :items="homeNavItems"
        :active-section="activeSection"
        @navigate="navigateTo"
      />

      <div id="main-content" class="home-main">
        <OverviewSection :team="teachingTeam" :meta="overviewMeta" />
        <RetrospectiveSection @open-exhibition="openExhibition" />
        <MainSection />
        <RulesSection />
        <CalendarSection
          :events="courseEvents"
          :start-date="startDate"
          :course-start-date="courseStartDate"
          :cycle="courseInfo.cycle"
        />
      </div>
    </div>
  </div>

  <ExhibitionDetail
    :exhibition-id="activeExhibition"
    @close="closeExhibition"
  />
</template>

<script setup>
import { computed, ref } from 'vue'
import { courseInfo } from '../data/syllabus.js'
import {
  homeNavItems,
  overviewMeta,
  teachingTeam,
} from '../data/home.js'
import { useHomeSections } from '../composables/useHomeSections.js'
import { buildCourseEvents } from '../utils/buildCourseEvents.js'
import HomeEdgeNav from '../components/home/HomeEdgeNav.vue'
import OverviewSection from '../components/home/OverviewSection.vue'
import RetrospectiveSection from '../components/home/RetrospectiveSection.vue'
import MainSection from '../components/home/MainSection.vue'
import RulesSection from '../components/home/RulesSection.vue'
import CalendarSection from '../components/home/CalendarSection.vue'
import ExhibitionDetail from './ExhibitionDetail.vue'

const sectionIds = homeNavItems.map((item) => item.id)
const { activeSection, navigateTo } = useHomeSections(sectionIds)

const activeExhibition = ref(null)
const openExhibition = (id) => { activeExhibition.value = id }
const closeExhibition = () => { activeExhibition.value = null }

const startDate = new Date(2026, 8, 7)
const courseStartDate = '2026/09/07'
const courseEvents = computed(() => buildCourseEvents(2026))
</script>

<style src="../styles/home.css"></style>
