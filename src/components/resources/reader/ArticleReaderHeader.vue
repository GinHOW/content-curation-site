<template>
    <header class="reader-header">
      <div class="reader-header-inner">
        <router-link :to="returnTarget" class="reader-back-btn" @click="$emit('go-back', $event)">
          <span aria-hidden="true">←</span> {{ returnLabel }}
        </router-link>

        <div class="reader-header-actions">
          <!-- 语言切换开关 -->
          <div class="lang-switch-group" role="group" aria-label="文献语言切换">
            <button
              type="button"
              class="lang-btn"
              :class="{ 'is-active': currentLang === 'zh' }"
              @click="$emit('switch-language', 'zh')"
            >
              中文
            </button>
            <span class="lang-divider">/</span>
            <button
              type="button"
              class="lang-btn"
              :class="{ 'is-active': currentLang === 'en' }"
              :disabled="!availableLanguages.includes('en')"
              :aria-disabled="!availableLanguages.includes('en')"
              @click="$emit('switch-language', 'en')"
            >
              EN
            </button>
          </div>

        </div>
      </div>
    </header>
</template>

<script setup>
defineProps({
  returnTarget: { type: String, required: true },
  returnLabel:  { type: String, required: true },
  currentLang:  { type: String, required: true },
  availableLanguages: { type: Array, required: true },
})

defineEmits(['go-back', 'switch-language'])
</script>

<style scoped>
/* 顶部粘性 Header */
.reader-header {
  position: sticky;
  top: 0;
  z-index: 45;
  border-bottom: 1px solid var(--resources-rule, #d7d7d1);
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(8px);
}

.reader-header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0.85rem 2rem;
}

.reader-back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--resources-ink, #111111);
  font-size: 0.82rem;
  font-weight: 600;
  text-decoration: none;
}

.reader-back-btn:hover {
  color: var(--home-blue, #1976d2);
}

.reader-header-actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

/* 语言切换器 */
.lang-switch-group {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.2rem 0.5rem;
  border: 1px solid var(--resources-rule, #d7d7d1);
  border-radius: 999px;
  background-color: #fafaf9;
}

.lang-btn {
  border: none;
  background: transparent;
  color: var(--resources-muted, #8c8c88);
  font-size: 0.76rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0.1rem 0.3rem;
  transition: all 0.15s ease;
}

.lang-btn:hover {
  color: var(--home-ink, #111111);
}

.lang-btn:disabled {
  color: var(--resources-rule, #d7d7d1);
  cursor: not-allowed;
  opacity: 0.9;
}

.lang-btn:disabled:hover {
  color: var(--resources-rule, #d7d7d1);
}

.lang-btn.is-active {
  color: var(--home-blue, #1976d2);
  font-weight: 700;
}

.lang-divider {
  color: var(--resources-rule, #d7d7d1);
  font-size: 0.72rem;
}
</style>
