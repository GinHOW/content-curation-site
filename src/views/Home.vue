<template>
  <div class="page">
    <!-- Scrolling Checkerboard Banner -->
    <Checkerboard scroll :size="20" :speed="0" height="30px" />
    
        <!-- Hero Storefront -->
    <section class="hero-storefront">
      <div class="hero-title">
        <h1>内容与策展</h1>
        <p class="subtitle">策展超市</p>
        <p class="subtitle">Curatorial Supermarket</p>

        <img src="/logo/视觉传播学院 logo.svg" alt="视觉传播学院" class="logo-stamp" />
      </div>
      <p class="hero-desc">
        “策展超市”以日常物品为研究对象，通过艺术策展方法，整合档案研究、谱系叙事、情境展陈与先进视觉构建的全流程操作模型。课程强调“物象即议题”，引导将微观物品关联至宏观命题如地缘政治、社会结构与文化记忆等，以跨越商业、社会与艺术展示的边界，形成应对多元需求的策展策略，系统训练学生在史观重构、信息提炼、展具设计与体验调控等方面的综合能力。通过从选题到实施的实际操作，课程致力于推动品牌视觉迭代与文化再策展，构筑个体与集体、地方与全球、历史与未来的对话媒介，最终为新文化消费及策展业态探索可行的创新路径。
      </p>
    </section>

    <!-- Marquee Banner -->
    <MarqueeBanner :items="['策展超市 1.0', '2025 内容与策展教学部分成果']" />

    <!-- Interactive Shelf Showcase -->
    <ShelfShowcase @open-exhibition="openExhibition" />

    <MarqueeBanner :items="['策展超市 2.0', '2026 内容与策展计划']" />

    <!-- Course Calendar -->
    <section class="calendar-section">
      <div class="calendar-header">
        <div class="stamp stamp-sm">日程</div>
        <h2>课程日历</h2>
        <p>{{ courseInfo.cycle }} · 开课 {{ courseStartDate }}</p>
      </div>
      
      <Calendar 
        :events="courseEvents" 
        :start-date="startDate"
        @date-select="handleDateSelect"
      />
    </section>
  </div>

  <!-- Exhibition Detail Overlay -->
  <ExhibitionDetail
    :exhibition-id="activeExhibition"
    @close="closeExhibition"
  />
</template>

<script setup>
import { ref, computed } from 'vue'
import { courseInfo, weeks } from '../data/syllabus.js'
import Checkerboard from '../components/Checkerboard.vue'
import ShelfShowcase from '../components/ShelfShowcase.vue'
import MarqueeBanner from '../components/MarqueeBanner.vue'
import Calendar from '../components/Calendar.vue'
import ExhibitionDetail from './ExhibitionDetail.vue'

// 展览遮罩状态
const activeExhibition = ref(null)
const openExhibition = (id) => { activeExhibition.value = id }
const closeExhibition = () => { activeExhibition.value = null }

// 开课日期：2026年9月7日（周一）
const startDate = new Date(2026, 8, 7)
const courseStartDate = '2026/9/7'

// 生成课程事件列表
const courseEvents = computed(() => {
  const events = []
  
  weeks.forEach(week => {
    // 周一课程
    events.push({
      date: `2026-${String(week.dates.mon.split('/')[0]).padStart(2, '0')}-${String(week.dates.mon.split('/')[1]).padStart(2, '0')}`,
      title: `W${week.week} ${week.sessions[0].title}`,
      type: 'course',
      week: week.week,
      session: week.sessions[0]
    })
    
    // 周三课程
    events.push({
      date: `2026-${String(week.dates.wed.split('/')[0]).padStart(2, '0')}-${String(week.dates.wed.split('/')[1]).padStart(2, '0')}`,
      title: `W${week.week} ${week.sessions[1].title}`,
      type: 'course',
      week: week.week,
      session: week.sessions[1]
    })
    
    // 周四课程
    events.push({
      date: `2026-${String(week.dates.thu.split('/')[0]).padStart(2, '0')}-${String(week.dates.thu.split('/')[1]).padStart(2, '0')}`,
      title: `W${week.week} ${week.sessions[2].title}`,
      type: 'course',
      week: week.week,
      session: week.sessions[2]
    })
    
    // 课后作业（如果有）
    if (week.homework && week.homework.length > 0) {
      events.push({
        date: `2026-${String(week.dates.thu.split('/')[0]).padStart(2, '0')}-${String(week.dates.thu.split('/')[1]).padStart(2, '0')}`,
        title: `W${week.week} 作业提交`,
        type: 'deadline',
        week: week.week,
        homework: week.homework
      })
    }
  })
  
  return events
})

const handleDateSelect = (date) => {
  console.log('Selected:', date)
}
</script>

<style scoped>
.page {
  background: var(--white);
}

/* Hero Storefront */
.hero-storefront {
  background: var(--white);
  color: var(--blue-light);
  min-height: 40vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 4rem var(--space);
  position: relative;
  overflow: hidden;
  border-top: 2px solid #000;
  border-bottom: 2px solid #000;
}

.hero-title {
  margin-bottom: 2rem;
  position: relative;
  z-index: 1;
}

.hero-title h1 {
  font-size: clamp(3.5rem, 10vw, 6rem);
  margin: 0;
  line-height: 1;
  color: #000;
  font-weight: 700;
}

.hero-title .subtitle {
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  font-weight: 700;
  margin-top: 2rem;
  color: var(--blue-light);
  letter-spacing: 0.1em;
  line-height: 0.5;
}

.logo-stamp {
  position: absolute;
  top: 6rem;
  right: -12rem;
  width: 80px;
  height: 80px;
  transform: rotate(18deg);
  transform: 1;
}

.hero-desc {
  max-width: 800px;
  font-size: 0.9rem;
  line-height: 1.8;
  color: var(--gray-text);
  position: relative;
  z-index: 1;
}


/* Calendar Section */
.calendar-section {
  padding: 4rem var(--space);
  border-top: 3px solid #000;
  border-bottom: 3px solid #000;
}

.calendar-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #000;
}

.calendar-header h2 {
  margin: 0;
}

.calendar-header p {
  font-size: 0.9rem;
  color: var(--gray-text);
  margin: 0 0 0 auto;
}

@media (max-width: 768px) {
  .calendar-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .calendar-header p {
    margin: 0;
  }
}

@media (max-width: 768px) {
  .hero-title {
    text-align: center;
  }

  .logo-stamp {
    position: static;
    display: block;
    margin: 1rem auto 0;
    width: 64px;
    height: 64px;
  }
  
  .info-bar-inner {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
}
</style>
