<template>
  <nav class="site-nav" aria-label="网站导航">
    <router-link to="/" exact-active-class="is-current">
      <span class="site-nav-en">Home</span>
      <span class="site-nav-zh">首页</span>
    </router-link>
    <router-link to="/syllabus" exact-active-class="is-current">
      <span class="site-nav-en site-nav-en-full">Course Details</span>
      <span class="site-nav-en site-nav-en-short" aria-hidden="true">Detail</span>
      <span class="site-nav-zh">课程详细</span>
    </router-link>
    <router-link to="/works" exact-active-class="is-current">
      <span class="site-nav-en site-nav-en-full">Selected Works</span>
      <span class="site-nav-en site-nav-en-short" aria-hidden="true">Works</span>
      <span class="site-nav-zh">成果展示</span>
    </router-link>
  </nav>
</template>

