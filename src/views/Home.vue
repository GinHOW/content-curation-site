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
    <ShelfShowcase />

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



    <!-- Shelf Grid -->
    <section class="shelf-section">
      <div class="shelf-header">
        <div class="stamp stamp-sm">货架</div>
        <h2>课程板块</h2>
      </div>

      <div class="shelf-grid">
        <router-link to="/syllabus" class="product-box fade-in" style="animation-delay: 0.1s;">
          <span class="product-box-label">NO.01</span>
          <svg class="product-box-icon" viewBox="0 0 24 24">
            <path d="M3 3h18v2H3V3zm0 4h18v2H3V7zm0 4h18v2H3v-2zm0 4h18v2H3v-2zm0 4h18v2H3v-2z"/>
          </svg>
          <h3>课程大纲</h3>
          <p>8 周课程安排，每周一、三、四上课。包含 Session 详情与课后作业。</p>
          <div class="product-box-corner"></div>
        </router-link>

        <router-link to="/references" class="product-box fade-in" style="animation-delay: 0.2s;">
          <span class="product-box-label">NO.02</span>
          <svg class="product-box-icon" viewBox="0 0 24 24">
            <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"/>
          </svg>
          <h3>参考资料</h3>
          <p>文本、视频、图像等课程阅读材料索引。含 Bruce Andrews《电子诗学》等核心理论文献。</p>
          <div class="product-box-corner"></div>
        </router-link>

        <router-link to="/works" class="product-box fade-in" style="animation-delay: 0.3s;">
          <span class="product-box-label">NO.03</span>
          <svg class="product-box-icon" viewBox="0 0 24 24">
            <path d="M4 6h16v12H4V6zm2 2v8h12V8H6zm3 3h6v2H9v-2z"/>
          </svg>
          <h3>学生作品</h3>
          <p>策展网站项目成果展示。每位/每组学生完成一个以自选对象为主题的策展网站。</p>
          <div class="product-box-corner"></div>
        </router-link>
      </div>
    </section>

    <!-- Additional Info -->
    <section class="shelf-section shelf-section--dark">
      <div class="shelf-header shelf-header--dark">
        <div class="stamp stamp-sm stamp--dark">说明</div>
        <h2>课程特色</h2>
      </div>
      
      <div class="feature-grid">
        <div class="feature-box fade-in" style="animation-delay: 0.4s;">
          <h3>Vibe Coding</h3>
          <p>AI 辅助编码工作流。用自然语言描述意图，AI 生成代码，再阅读、理解、修改。</p>
        </div>
        
        <div class="feature-box fade-in" style="animation-delay: 0.5s;">
          <h3>双轨并行</h3>
          <p>数字端（网站）+ 空间端（展具设计）同步推进，最终汇合为完整展览方案。</p>
        </div>
        
        <div class="feature-box fade-in" style="animation-delay: 0.6s;">
          <h3>对象策展</h3>
          <p>从绳结、假发、棋盘、邮轮等候选对象中选择，围绕具体物件展开完整策展流程。</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { courseInfo, weeks } from '../data/syllabus.js'
import Checkerboard from '../components/Checkerboard.vue'
import ShelfShowcase from '../components/ShelfShowcase.vue'
import MarqueeBanner from '../components/MarqueeBanner.vue'
import Calendar from '../components/Calendar.vue'

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


/* Shelf Section */
.shelf-section {
  padding: 4rem var(--space);
}

.shelf-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #000;
}

.shelf-header h2 {
  margin: 0;
}

/* Brutalist grid: no gap, borders as dividers */
.shelf-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  border-left: 2px solid #000;
  border-top: 2px solid #000;
}

/* Product Box Card — raw industrial edge */
.product-box {
  background: var(--white);
  border-right: 2px solid #000;
  border-bottom: 2px solid #000;
  padding: 1.5rem;
  position: relative;
  cursor: pointer;
  transition: all 0.25s ease;
  display: block;
  border-radius: 0;
}

.product-box:hover {
  background: #f5f5f5;
}

.product-box-label {
  position: absolute;
  top: -1px;
  right: -1px;
  background: #000;
  color: var(--white);
  padding: 0.3rem 0.8rem;
  font-family: var(--font-heavy);
  font-weight: 700;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  border-radius: 0;
}

.product-box-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 1rem;
  fill: var(--red-stamp);
}

.product-box h3 {
  margin: 0 0 0.5rem;
  font-size: 1.3rem;
  line-height: 1.3;
}

.product-box p {
  font-size: 0.9rem;
  color: var(--gray-text);
  margin: 0;
  line-height: 1.6;
}

.product-box-corner {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 40px;
  height: 40px;
  background: #000;
  clip-path: polygon(100% 0, 100% 100%, 0 100%);
}

/* Dark section variant */
.shelf-section--dark {
  background: var(--blue-light);
  color: var(--white);
}

.shelf-header--dark {
  border-bottom-color: var(--white);
}

.stamp--dark {
  border-color: var(--white);
  color: var(--white);
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  border-left: 2px solid var(--white);
  border-top: 2px solid var(--white);
}

.feature-box {
  padding: 1.5rem;
  border-right: 2px solid var(--white);
  border-bottom: 2px solid var(--white);
  border-radius: 0;
}

.feature-box h3 {
  color: var(--white);
  margin-bottom: 0.5rem;
}

.feature-box p {
  opacity: 0.85;
  font-size: 0.9rem;
  margin: 0;
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
  
  .shelf-grid,
  .feature-grid {
    grid-template-columns: 1fr;
  }
  
  .info-bar-inner {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
}
</style>
