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
          <h2 id="retrospective-title">策展<br />超市 1.0</h2>
        </div>
      </div>
      <div class="section-copy-column retrospective-copy">
        <p class="lead-copy">
          2025 课程主题“策展超市”以日常物品为研究对象，通过档案研究、谱系叙事与情境展陈，强调“物象即议题”，引导将微观物品关联至宏观命题如地缘政治、社会结构与文化记忆等，以跨越商业、社会与艺术展示的边界，形成应对多元需求的策展策略，系统训练学生在史观重构、信息提炼、展具设计与体验调控等方面的综合能力。
        </p>
        <p class="micro-copy">轻点贴纸进入项目；拖动或长按拖动，可重新摆放物件。</p>
      </div>
    </div>

    <div class="full-span showcase-frame">
      <StickerShowcase @open-work="$emit('open-work', $event)" />
    </div>
  </section>
</template>

<script setup>
import StickerShowcase from './StickerShowcase.vue'

defineEmits(['open-work'])
</script>

<style scoped>
.retrospective-copy {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: var(--home-column-gap);
  user-select: none;
  pointer-events: none;
}

.showcase-frame {
  position: relative;
  z-index: 1;
  margin-top: clamp(2.5rem, 4vw, 4rem);
}

@media (max-width: 767px) {
  .showcase-frame {
    margin-top: 3rem;
  }
}
</style>
