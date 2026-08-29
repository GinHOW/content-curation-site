<template>
  <aside
    class="spatial-model-layer-overlay"
    aria-label="模型图层调试面板"
  >
    <header class="layer-overlay-header">
      <div>
        <p class="layer-overlay-tag">RHINO / GLTF LAYERS</p>
        <h4 class="layer-overlay-title">模型图层层级控制</h4>
      </div>
      <button
        type="button"
        class="layer-overlay-close"
        aria-label="关闭图层面板"
        @click="$emit('close')"
      >
        ✕
      </button>
    </header>

    <div class="layer-overlay-toolbar">
      <p class="layer-toolbar-tip">按 Rhino 原生父子图层树控制模型显隐。</p>
      <div class="layer-toolbar-actions">
        <button type="button" class="layer-toolbar-btn" @click="toggleAll(true)">
          全部显示
        </button>
        <button type="button" class="layer-toolbar-btn" @click="toggleAll(false)">
          全部隐藏
        </button>
        <button type="button" class="layer-toolbar-btn is-reset" @click="$emit('reset')">
          恢复默认
        </button>
      </div>
    </div>

    <div class="layer-overlay-body">
      <div class="layer-tree-container">
        <!-- 遍历父级大类 -->
        <div
          v-for="group in groups"
          :key="group.id"
          class="layer-group-block"
        >
          <!-- 父图层头部 -->
          <div class="layer-group-header">
            <button
              type="button"
              class="layer-fold-btn"
              :aria-label="isFolded(group.id) ? '展开图层' : '折叠图层'"
              @click="toggleFold(group.id)"
            >
              <span class="fold-arrow" :class="{ 'is-folded': isFolded(group.id) }">▾</span>
            </button>

            <label class="layer-parent-label">
              <input
                type="checkbox"
                :checked="isGroupAllChecked(group)"
                :indeterminate.prop="isGroupIndeterminate(group)"
                @change="onParentToggle(group, $event.target.checked)"
              >
              <span class="layer-parent-name">{{ group.label }}</span>
            </label>

            <span class="layer-count-badge">{{ group.children?.length || 0 }} 项</span>
          </div>

          <!-- 子图层树列表（可折叠） -->
          <div v-show="!isFolded(group.id)" class="layer-children-tree">
            <div
              v-for="(child, idx) in group.children"
              :key="child.id"
              class="layer-child-item"
            >
              <!-- 树形连接虚线 -->
              <span class="tree-guide-line" :class="{ 'is-last': idx === group.children.length - 1 }" />

              <label class="layer-child-label">
                <input
                  type="checkbox"
                  :checked="isChildChecked(child)"
                  @change="onChildToggle(child, $event.target.checked)"
                >
                <div class="layer-child-info">
                  <span class="layer-child-title">{{ child.label }}</span>
                  <span class="layer-child-sub">{{ child.assetKey }}</span>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  groups: {
    type: Array,
    required: true,
  },
  visibilityMap: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['toggle-layer', 'reset', 'close'])

const foldedGroups = ref({})

function isFolded(groupId) {
  return Boolean(foldedGroups.value[groupId])
}

function toggleFold(groupId) {
  foldedGroups.value[groupId] = !foldedGroups.value[groupId]
}

function isChildChecked(child) {
  if (child.id in props.visibilityMap) {
    return Boolean(props.visibilityMap[child.id])
  }
  return true // 默认可见
}

function isGroupAllChecked(group) {
  if (!group.children || group.children.length === 0) {
    return group.id in props.visibilityMap ? Boolean(props.visibilityMap[group.id]) : true
  }
  return group.children.every((child) => isChildChecked(child))
}

function isGroupIndeterminate(group) {
  if (!group.children || group.children.length === 0) return false
  const checkedCount = group.children.filter((child) => isChildChecked(child)).length
  return checkedCount > 0 && checkedCount < group.children.length
}

function onParentToggle(group, checked) {
  // 联动所有子图层
  emit('toggle-layer', { layer: group, visible: checked })
  if (group.children) {
    group.children.forEach((child) => {
      emit('toggle-layer', { layer: child, visible: checked })
    })
  }
}

function onChildToggle(child, checked) {
  emit('toggle-layer', { layer: child, visible: checked })
}

function toggleAll(visible) {
  props.groups.forEach((group) => {
    emit('toggle-layer', { layer: group, visible })
    if (group.children) {
      group.children.forEach((child) => {
        emit('toggle-layer', { layer: child, visible })
      })
    }
  })
}
</script>

<style scoped>
.spatial-model-layer-overlay {
  position: absolute;
  top: 12px;
  right: 48px;
  bottom: 12px;
  z-index: 25;
  display: flex;
  flex-direction: column;
  width: min(22rem, calc(100% - 3.5rem));
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid var(--home-border);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  color: var(--home-ink);
  font-family: inherit;
}

.layer-overlay-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 12px 14px;
  border-bottom: 1px solid var(--home-border);
  background: rgba(245, 245, 243, 0.6);
}

.layer-overlay-tag {
  margin: 0 0 2px;
  font-size: 0.62rem;
  letter-spacing: 0.08em;
  color: var(--home-muted);
  font-weight: 600;
}

.layer-overlay-title {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.layer-overlay-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  padding: 0;
  background: transparent;
  border: 1px solid transparent;
  color: var(--home-muted);
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 120ms ease;
}

.layer-overlay-close:hover {
  color: var(--home-ink);
  border-color: var(--home-border);
  background: rgba(0, 0, 0, 0.04);
}

.layer-overlay-toolbar {
  padding: 10px 14px;
  border-bottom: 1px solid var(--home-border);
  background: #fafaf8;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.layer-toolbar-tip {
  margin: 0;
  font-size: 0.68rem;
  color: var(--home-muted);
  line-height: 1.35;
}

.layer-toolbar-actions {
  display: flex;
  gap: 6px;
}

.layer-toolbar-btn {
  padding: 2px 8px;
  font-size: 0.68rem;
  font-family: inherit;
  background: #ffffff;
  border: 1px solid var(--home-border);
  color: var(--home-ink);
  cursor: pointer;
  transition: all 120ms ease;
}

.layer-toolbar-btn:hover {
  background: rgba(0, 0, 0, 0.04);
  border-color: var(--home-ink);
}

.layer-toolbar-btn.is-reset {
  margin-left: auto;
  color: #b91c1c;
}

.layer-toolbar-btn.is-reset:hover {
  background: #fef2f2;
  border-color: #fca5a5;
}

.layer-overlay-body {
  flex: 1;
  overflow-y: auto;
  padding: 10px 14px;
}

.layer-tree-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.layer-group-block {
  display: flex;
  flex-direction: column;
}

.layer-group-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  background: #f4f3ef;
  border: 1px solid var(--home-border);
}

.layer-fold-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  padding: 0;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--home-muted);
}

.fold-arrow {
  display: inline-block;
  font-size: 0.75rem;
  line-height: 1;
  transition: transform 140ms ease;
}

.fold-arrow.is-folded {
  transform: rotate(-90deg);
}

.layer-parent-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  cursor: pointer;
}

.layer-parent-label input[type="checkbox"] {
  cursor: pointer;
  accent-color: var(--home-ink);
}

.layer-parent-name {
  font-size: 0.76rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.layer-count-badge {
  font-size: 0.62rem;
  color: var(--home-muted);
  background: rgba(0, 0, 0, 0.04);
  padding: 1px 4px;
  border: 1px solid var(--home-border);
}

.layer-children-tree {
  position: relative;
  margin-left: 12px;
  padding-left: 10px;
  border-left: 1px dashed var(--home-border);
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 2px;
}

.layer-child-item {
  position: relative;
  display: flex;
  align-items: center;
  padding: 4px 6px;
  transition: background 100ms ease;
}

.layer-child-item:hover {
  background: rgba(0, 0, 0, 0.02);
}

.tree-guide-line {
  position: absolute;
  left: -10px;
  top: 50%;
  width: 8px;
  height: 1px;
  border-top: 1px dashed var(--home-border);
}

.layer-child-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  cursor: pointer;
}

.layer-child-label input[type="checkbox"] {
  cursor: pointer;
  accent-color: var(--home-ink);
}

.layer-child-info {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  flex: 1;
  gap: 6px;
}

.layer-child-title {
  font-size: 0.72rem;
  color: var(--home-ink);
}

.layer-child-sub {
  font-size: 0.6rem;
  color: var(--home-muted);
}
</style>
