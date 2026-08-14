<template>
  <section
    id="retrospective"
    class="home-section retrospective-section"
    data-section
    aria-labelledby="retrospective-title"
  >
    <div class="section-grid section-intro-grid">
      <div class="section-title-column">
        <p class="eyebrow">2025 · Selected Outcomes</p>
        <div class="section-title-lockup">
          <h2 id="retrospective-title">策展<br />超市</h2>
        </div>
      </div>
      <div class="section-copy-column retrospective-copy">
        <p class="lead-copy">
          2025 课程主题“策展超市”以日常物品为研究对象，通过档案研究、谱系叙事与情境展陈，强调“物象即议题”，引导将微观物品关联至宏观命题如地缘政治、社会结构与文化记忆等，以跨越商业、社会与艺术展示的边界，形成应对多元需求的策展策略，系统训练学生在史观重构、信息提炼、展具设计与体验调控等方面的综合能力。
        </p>
        <p class="micro-copy">选择货架中的物件，进入对应的课程策展项目。</p>
      </div>
    </div>

    <div class="full-span showcase-frame">
      <ShelfShowcase @open-exhibition="$emit('open-exhibition', $event)" />
    </div>
  </section>
</template>

<script setup>
import ShelfShowcase from '../ShelfShowcase.vue'

defineEmits(['open-exhibition'])
</script>
