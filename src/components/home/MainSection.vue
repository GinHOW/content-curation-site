<template>
  <section
    id="city"
    class="home-section city-section"
    data-section
    aria-labelledby="city-title"
  >
    <div class="section-grid section-intro-grid">
      <div class="section-title-column">
        <p class="eyebrow">2026 · New Direction</p>
        <div class="section-title-lockup">
          <h2 id="city-title">
            <span class="city-title-name">策展<br />超市<span class="city-title-version"> 2.0</span></span>
          </h2>
        </div>
      </div>
      <div class="section-copy-column city-copy">
        <p class="lead-copy">
          “策展超市 2.0”把研究从日常物件延伸到城市现场，关注公共空间、地方记忆与人与物的关系，将个人观察组织为可访问的策展项目。
        </p>
        <p class="micro-copy">从对象出发，进入城市；从城市出发，重新组织内容。</p>
      </div>
    </div>

    <SpatialMap :rooms="spatialRooms" />
  </section>
</template>

<script setup>
import SpatialMap from './SpatialMap.vue'
import { spatialRooms } from '../../data/home.js'
</script>

<style scoped>
.city-title-name,
.city-title-version {
  white-space: nowrap;
}
</style>
