<template>
  <section class="topic-matcher" aria-labelledby="topic-matcher-title">
    <header class="topic-matcher-header">
      <div>
        <p class="panel-label">选题库 / WORD POOL</p>
        <h3 id="topic-matcher-title">选题匹配</h3>
      </div>
      <p class="topic-matcher-hint">选择一个标签，再点击小组完成匹配；再次点击已匹配小组可清除。</p>
    </header>

    <div class="topic-word-list" aria-label="选题标签">
      <button v-for="word in availableWords" :key="word" type="button" class="topic-word" :class="{ 'is-selected': selectedWord === word }" :aria-pressed="selectedWord === word" @click="toggleWord(word)">
        {{ word }}
      </button>
    </div>
    <label v-if="selectedWord === '自定义'" class="custom-topic-input">
      <span>自定义词</span>
      <input v-model.trim="customWord" type="text" maxlength="24" placeholder="输入一个词" />
    </label>

    <div class="group-matcher-heading">
      <p>16 个小组</p>
      <span>{{ matchedCount }} / {{ groups.length }} 已匹配</span>
    </div>
    <div class="group-list" aria-label="小组匹配状态">
      <button v-for="group in groups" :key="group" type="button" class="group-slot" :class="{ 'has-match': assignments[group], 'is-ready': selectedWord }" :aria-label="assignments[group] ? `${group}，已匹配：${assignments[group]}` : `${group}，待匹配`" @click="matchGroup(group)">
        <strong>{{ group }}</strong>
        <span>{{ assignments[group] || '待匹配' }}</span>
      </button>
    </div>
    <p class="sr-only" aria-live="polite">{{ statusMessage }}</p>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({ words: { type: Array, default: () => [] } })
const groups = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8']
const availableWords = computed(() => [...props.words, '自定义'])
const selectedWord = ref('')
const customWord = ref('')
const assignments = ref(Object.fromEntries(groups.map((group) => [group, ''])))
const statusMessage = ref('')
const matchedCount = computed(() => Object.values(assignments.value).filter(Boolean).length)

const toggleWord = (word) => {
  selectedWord.value = selectedWord.value === word ? '' : word
  statusMessage.value = selectedWord.value ? (word === '自定义' ? '请输入自定义词' : `已选择标签：${word}`) : '已取消标签选择'
}
const matchGroup = (group) => {
  const wordToMatch = selectedWord.value === '自定义' ? customWord.value : selectedWord.value
  if (wordToMatch) {
    assignments.value[group] = wordToMatch
    statusMessage.value = `${group} 已匹配 ${wordToMatch}`
    selectedWord.value = ''
    customWord.value = ''
  } else if (assignments.value[group]) {
    statusMessage.value = `${group} 已清除 ${assignments.value[group]}`
    assignments.value[group] = ''
  } else {
    statusMessage.value = selectedWord.value === '自定义' ? '请输入自定义词后再匹配小组' : '请先选择一个选题标签'
  }
}
</script>

<style scoped>
.topic-matcher { padding: 1.5rem; border: 1px solid color-mix(in srgb, var(--week-color) 66%, #ffffff); background: color-mix(in srgb, var(--week-color) 8%, #ffffff); }
.topic-matcher-header { display: flex; flex-wrap: wrap; gap: 0.8rem 2rem; align-items: end; justify-content: space-between; }
.topic-matcher h3 { margin-top: 0.35rem; font-size: 1.2rem; line-height: 1.2; }
.topic-matcher-hint { max-width: 26rem; margin: 0; color: var(--syllabus-muted); font-size: 0.78rem; line-height: 1.5; }
.topic-word-list { display: flex; flex-wrap: wrap; gap: 0.55rem; margin-top: 1.25rem; }
.topic-word, .group-slot { border: 1px solid color-mix(in srgb, var(--week-color) 62%, #ffffff); color: var(--syllabus-ink); background: #ffffff; font: inherit; cursor: pointer; transition: color 160ms ease, background-color 160ms ease, border-color 160ms ease, transform 160ms ease; }
.topic-word { min-height: 2.5rem; padding: 0.45rem 0.85rem; }
.topic-word:hover, .topic-word.is-selected { border-color: var(--week-color); background: var(--week-color); }
.custom-topic-input {
  display: grid;
  grid-template-columns: auto minmax(10rem, 1fr);
  gap: 0.7rem;
  align-items: center;
  max-width: 24rem;
  margin-top: 0.75rem;
  color: var(--syllabus-muted);
  font-size: 0.78rem;
}
.custom-topic-input input {
  min-height: 2.5rem;
  padding: 0.45rem 0.7rem;
  border: 1px solid var(--week-color);
  color: var(--syllabus-ink);
  background: #ffffff;
  font: inherit;
}
.custom-topic-input input:focus-visible { outline: 2px solid var(--syllabus-ink); outline-offset: 3px; }
.group-matcher-heading { display: flex; justify-content: space-between; gap: 1rem; margin-top: 1.6rem; padding-top: 0.85rem; border-top: 1px solid color-mix(in srgb, var(--week-color) 48%, #ffffff); }
.group-matcher-heading p, .group-matcher-heading span { margin: 0; font-size: 0.75rem; }
.group-matcher-heading span { color: var(--syllabus-muted); }
.group-list { display: grid; grid-template-columns: repeat(8, minmax(0, 1fr)); gap: 0.55rem; margin-top: 0.75rem; }
.group-slot { display: grid; min-width: 0; min-height: 4.6rem; padding: 0.55rem; text-align: left; }
.group-slot strong { font-size: 0.82rem; }
.group-slot span { overflow: hidden; color: var(--syllabus-muted); font-size: 0.68rem; line-height: 1.35; text-overflow: ellipsis; white-space: nowrap; }
.group-slot.is-ready { border-style: dashed; }
.group-slot.has-match { border-color: var(--week-color); background: color-mix(in srgb, var(--week-color) 22%, #ffffff); }
.group-slot:hover { transform: translateY(-1px); }
.topic-word:focus-visible, .group-slot:focus-visible { outline: 2px solid var(--syllabus-ink); outline-offset: 3px; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
@media (max-width: 767px) { .topic-matcher { padding: 1.1rem; } .topic-matcher-header { align-items: start; } .topic-matcher-hint { max-width: none; } .topic-word { min-height: 2.75rem; } .custom-topic-input { grid-template-columns: 1fr; max-width: none; } .custom-topic-input input { min-height: 2.75rem; } .group-list { grid-template-columns: repeat(4, minmax(0, 1fr)); } .group-slot { min-height: 4.8rem; } }
@media (prefers-reduced-motion: reduce) { .topic-word, .group-slot { transition: none; } }
</style>
