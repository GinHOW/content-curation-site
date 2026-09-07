<template>
  <nav class="resource-filter-bar" :class="{ 'has-filter-label': filterLabel, 'has-groups': groups.length }" aria-label="资源筛选">
    <span v-if="filterLabel" class="resource-filter-label">{{ filterLabel }}</span>
    <div v-if="groups.length" class="resource-filter-groups">
      <div v-for="group in displayGroups" :key="group.id" class="resource-filter-group" :class="{ 'has-section-label': group.sectionLabel }">
        <span v-if="group.sectionLabel" class="resource-filter-section-label">{{ group.sectionLabel }}</span>
        <span v-if="group.label" class="resource-filter-group-label">{{ group.label }}</span>
        <div class="resource-filter-options-wrap">
          <div :id="groupOptionsId(group)" :ref="(element) => setOptionsRef(group.id, element)" class="resource-filter-options" :class="{ 'is-collapsible': isCollapsible(group), 'is-expanded': isGroupExpanded(group) }" :style="collapsedGroupStyle(group)" role="group" :aria-label="group.label || '选择筛选条件'">
            <button v-for="option in group.options" :key="option.value" class="resource-filter-option" :class="{ 'is-active': isActive(option, group) }" :style="option.color ? { '--filter-accent': option.color } : undefined" type="button" :aria-pressed="isActive(option, group)" @click="$emit('select', option.value, group)">{{ option.label }}</button>
          </div>
          <button v-if="shouldShowToggle(group)" class="resource-filter-toggle" type="button" :aria-controls="groupOptionsId(group)" :aria-expanded="isGroupExpanded(group)" :aria-label="isGroupExpanded(group) ? `收起${group.label || '筛选项'}` : `展开全部${group.label || '筛选项'}`" @click="toggleGroup(group)">
            <span aria-hidden="true">{{ isGroupExpanded(group) ? '收起' : '…' }}</span>
            <span class="resource-filter-sr-only">{{ isGroupExpanded(group) ? `收起${group.label || '筛选项'}` : `展开全部${group.label || '筛选项'}` }}</span>
          </button>
        </div>
      </div>
    </div>
    <div v-else class="resource-filter-options" role="group" aria-label="选择筛选条件">
      <button v-for="option in options" :key="option.value" class="resource-filter-option" :class="{ 'is-active': active === option.value }" type="button" :aria-pressed="active === option.value" @click="$emit('select', option.value)">{{ option.label }}</button>
    </div>
    <span class="resource-filter-count" aria-live="polite">{{ count }} 项</span>
    <div v-if="selected.length" class="resource-filter-selected" aria-label="已选标签">
      <span>已选</span>
      <button v-for="item in selected" :key="`${item.group}-${item.value}`" type="button" :aria-label="`移除 ${item.label}`" @click="$emit('deselect', item)">{{ item.label }} ×</button>
      <button type="button" @click="$emit('clear')">清除标签</button>
    </div>
  </nav>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, toRefs, watch } from 'vue'

const props = defineProps({
  options: { type: Array, required: true },
  active: { type: [String, Object], default: 'all' },
  count: { type: Number, default: 0 },
  groups: { type: Array, default: () => [] },
  filterLabel: { type: String, default: '筛选' },
  selected: { type: Array, default: () => [] },
})

const { options, active, count, groups, selected } = toRefs(props)
defineEmits(['select', 'deselect', 'clear'])

const displayGroups = computed(() => groups.value.flatMap((group) => {
  if (!Array.isArray(group.subgroups)) return [group]
  return group.subgroups.map((subgroup, index) => ({ ...subgroup, sectionLabel: index === 0 ? group.label : '' }))
}))
const expandedGroups = reactive(new Set())
const overflowingGroups = reactive({})
const optionContainers = new Map()
let resizeObserver

const isCollapsible = (group) => Boolean(group?.collapsible && group?.collapsedRows > 0)
const isGroupExpanded = (group) => expandedGroups.has(group.id)
const groupOptionsId = (group) => `resource-filter-options-${group.id}`
const collapsedGroupStyle = (group) => !isCollapsible(group) ? undefined : {
  '--filter-collapsed-height': `${Number(group.collapsedRows) * 32 + (Number(group.collapsedRows) - 1) * 4}px`,
  '--filter-collapsed-height-mobile': `${Number(group.collapsedRows) * 44 + (Number(group.collapsedRows) - 1) * 4}px`,
}
const measureOverflow = () => {
  for (const group of displayGroups.value) {
    if (!isCollapsible(group)) {
      delete overflowingGroups[group.id]
      continue
    }
    const container = optionContainers.get(group.id)
    overflowingGroups[group.id] = Boolean(container && container.scrollHeight > container.clientHeight + 1)
  }
}
const scheduleMeasurement = () => nextTick(measureOverflow)
const setOptionsRef = (groupId, element) => {
  const previous = optionContainers.get(groupId)
  if (previous && previous !== element) resizeObserver?.unobserve(previous)
  if (!element) {
    optionContainers.delete(groupId)
    return
  }
  optionContainers.set(groupId, element)
  resizeObserver?.observe(element)
  scheduleMeasurement()
}
const shouldShowToggle = (group) => isCollapsible(group) && (Boolean(overflowingGroups[group.id]) || isGroupExpanded(group))
const toggleGroup = (group) => {
  isGroupExpanded(group) ? expandedGroups.delete(group.id) : expandedGroups.add(group.id)
  scheduleMeasurement()
}
const isActive = (option, group) => {
  if (active.value && typeof active.value === 'object') {
    const current = active.value[group?.id]
    const values = Array.isArray(current) ? current : current && current !== 'all' ? [current] : []
    return option.value === 'all' ? values.length === 0 : values.includes(option.value)
  }
  return option.value === 'all'
    ? active.value === 'all' || !group.options.some(({ value }) => value === active.value)
    : active.value === option.value
}

watch(displayGroups, scheduleMeasurement, { deep: true, flush: 'post' })
watch(() => active.value?.type, (type, previousType) => {
  if (type !== previousType && previousType !== undefined) {
    expandedGroups.clear()
    scheduleMeasurement()
  }
})
onMounted(() => {
  resizeObserver = new ResizeObserver(scheduleMeasurement)
  optionContainers.forEach((element) => resizeObserver.observe(element))
  scheduleMeasurement()
})
onBeforeUnmount(() => resizeObserver?.disconnect())
</script>

<style scoped>
.resource-filter-bar { display:grid; grid-template-columns:max-content minmax(0,1fr) max-content; column-gap:.8rem; align-items:start; padding:clamp(1.5rem,2.8vw,2.25rem) 0 1.25rem; border-bottom:1px solid var(--resources-rule,var(--home-rule)); }
.resource-filter-bar:not(.has-filter-label) { grid-template-columns:minmax(0,1fr) max-content; }
.resource-filter-label,.resource-filter-section-label,.resource-filter-group-label,.resource-filter-count { min-height:32px; display:flex; align-items:center; color:var(--resources-muted,var(--home-muted)); font-size:.68rem; line-height:1.2; }
.resource-filter-label { font-weight:700; letter-spacing:.11em; text-transform:uppercase; }
.resource-filter-groups { display:grid; gap:.3rem; min-width:0; }
.resource-filter-group { display:grid; grid-template-columns:4rem minmax(0,1fr); gap:.3rem .75rem; align-items:start; }
.resource-filter-group.has-section-label { grid-template-columns:4rem minmax(0,1fr); }
.resource-filter-section-label { grid-column:1 / -1; grid-row:1; font-weight:700; letter-spacing:.08em; }
.resource-filter-group-label { grid-column:1; }
.resource-filter-group.has-section-label .resource-filter-group-label { grid-row:2; }
.resource-filter-group.has-section-label .resource-filter-options-wrap { grid-row:2; }
.resource-filter-group:not(.has-section-label) .resource-filter-group-label { grid-column:1; }
.resource-filter-groups > .resource-filter-group:first-child .resource-filter-group-label { font-weight:700; letter-spacing:.08em; }
.resource-filter-options-wrap { grid-column:-2; position:relative; min-width:0; }
.resource-filter-options { display:flex; flex-wrap:wrap; gap:.25rem .8rem; min-width:0; }
.resource-filter-options.is-collapsible:not(.is-expanded) { max-height:var(--filter-collapsed-height); padding-right:2rem; overflow:hidden; }
.resource-filter-option,.resource-filter-toggle,.resource-filter-selected button { min-height:32px; padding:.3rem .2rem; color:var(--resources-muted,var(--home-muted)); background:transparent; border:1px solid transparent; font:inherit; font-size:.78rem; line-height:1.2; cursor:pointer; }
.resource-filter-option:hover,.resource-filter-option:focus-visible,.resource-filter-toggle:hover,.resource-filter-toggle:focus-visible,.resource-filter-selected button:hover,.resource-filter-selected button:focus-visible { color:var(--resources-ink,var(--home-ink)); box-shadow:inset 0 -1px 0 currentColor; }
.resource-filter-option.is-active { color:var(--resources-ink,var(--home-ink)); box-shadow:inset 0 -2px 0 var(--filter-accent,var(--resource-filter-accent,var(--resource-accent,var(--home-yellow,#efe373)))); }
.resource-filter-option:focus-visible,.resource-filter-toggle:focus-visible,.resource-filter-selected button:focus-visible { outline:2px solid var(--resources-ink,var(--home-ink)); outline-offset:2px; }
.resource-filter-toggle { position:absolute; right:0; bottom:0; min-width:1.6rem; }
.resource-filter-count { font-size:.75rem; font-variant-numeric:tabular-nums; white-space:nowrap; }
.resource-filter-selected { grid-column:1 / -1; display:flex; flex-wrap:wrap; align-items:center; gap:.25rem .65rem; padding-top:.55rem; color:var(--resources-muted,var(--home-muted)); font-size:.68rem; }
.resource-filter-selected button { min-height:28px; padding-block:.18rem; }
.resource-filter-sr-only { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0; }
@media (max-width:767px) { .resource-filter-bar,.resource-filter-bar:not(.has-filter-label) { grid-template-columns:minmax(0,1fr) max-content; row-gap:.45rem; } .resource-filter-label,.resource-filter-groups { grid-column:1 / -1; } .resource-filter-group,.resource-filter-group.has-section-label { grid-template-columns:3.8rem minmax(0,1fr); gap:.3rem .7rem; } .resource-filter-options.is-collapsible:not(.is-expanded) { max-height:var(--filter-collapsed-height-mobile); } .resource-filter-label,.resource-filter-section-label,.resource-filter-group-label,.resource-filter-option,.resource-filter-toggle { min-height:44px; } .resource-filter-count { align-self:start; min-height:44px; } }
</style>
