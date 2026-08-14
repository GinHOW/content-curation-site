<template>
  <section
    id="course-rules"
    class="home-section rules-section"
    data-section
    aria-labelledby="rules-title"
  >
    <div class="section-grid rules-header-grid">
      <div class="section-title-column">
        <p class="eyebrow">Course Protocol</p>
        <h2 id="rules-title">课程<br />规则</h2>
      </div>
      <div class="section-copy-column">
        <p class="lead-copy">
          课程以一个兼具观念容量与空间类型性的“词”为入口，完成从内容研究到展览落地的整体策划。
        </p>
        <router-link class="text-link" to="/syllabus">查看完整课程大纲 <span aria-hidden="true">→</span></router-link>
      </div>
    </div>

    <div class="section-grid rules-body-grid">
      <div class="method-panel">
        <span class="panel-label">策展方法 / METHOD</span>
        <ol class="method-list">
          <li v-for="(step, index) in methodSteps" :key="step">
            <span>{{ String(index + 1).padStart(2, '0') }}</span>{{ step }}
          </li>
        </ol>
        <p class="micro-copy">从内容数据库、策展逻辑到公共展览，判断力贯穿每一步。</p>
      </div>

      <div class="rules-detail">
        <dl class="rules-facts">
          <div>
            <dt>工作方式</dt>
            <dd class="rules-work-mode">
              <strong>小组为单位</strong>
              <span>每组 2–3 人，共计约 20 组</span>
              <span>每组从选题库中选定一个“词”作为内容对象，</span>
              <span>它同时就是展览的内容主题。</span>
            </dd>
          </div>
          <div>
            <dt>核心产出</dt>
            <dd class="rules-output">
              <strong>1 个完整展览</strong>
              <span>内容档案、内容网站、策展提案、空间方案、视觉与展具方案、活动方案及商业计划书</span>
            </dd>
          </div>
        </dl>

        <div class="grading-summary">
          <span class="panel-label">评分摘要 / EVALUATION</span>
          <div v-for="item in grading.overview" :key="item.item" class="grading-row">
            <span>{{ item.item }}</span>
            <strong>{{ item.weight }}</strong>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { grading } from '../../data/syllabus.js'

const methodSteps = ['选题', '建库', '结构', '网站', '展具', '视觉', '事件', '商业']
</script>
