<template>
  <nav class="resource-filter-bar" :class="{ 'has-groups': groups.length }" aria-label="资源筛选">
    <span class="resource-filter-label">筛选</span>
    <div v-if="groups.length" class="resource-filter-groups">
      <div v-for="group in groups" :key="group.id" class="resource-filter-group">
        <span v-if="group.label" class="resource-filter-group-label">{{ group.label }}</span>
        <div class="resource-filter-options" role="group" :aria-label="group.label || '选择筛选条件'">
          <button
            v-for="option in group.options"
            :key="option.value"
            class="resource-filter-option"
            :class="{ 'is-active': isActive(option, group) }"
            :style="option.color ? { '--filter-accent': option.color } : undefined"
            type="button"
            :aria-pressed="isActive(option, group)"
            @click="$emit('select', option.value, group)"
          >
            {{ option.label }}
          </button>
        </div>
      </div>
    </div>
    <div v-else class="resource-filter-options" role="group" aria-label="选择筛选条件">
      <button
        v-for="option in options"
        :key="option.value"
        class="resource-filter-option"
        :class="{ 'is-active': active === option.value }"
        :style="option.color ? { '--filter-accent': option.color } : undefined"
        type="button"
        :aria-pressed="active === option.value"
        @click="$emit('select', option.value)"
      >
        {{ option.label }}
      </button>
    </div>
    <span class="resource-filter-count" aria-live="polite">{{ count }} 项</span>
  </nav>
</template>

<script setup>
import { toRefs } from 'vue'

const props = defineProps({
  options: {
    type: Array,
    required: true,
  },
  active: {
    type: [String, Object],
    default: 'all',
  },
  count: {
    type: Number,
    default: 0,
  },
  groups: {
    type: Array,
    default: () => [],
  },
})

const { options, active, count, groups } = toRefs(props)

defineEmits(['select'])

const isActive = (option, group) => {
  if (active.value && typeof active.value === 'object') {
    const currentVal = active.value[group?.id] ?? 'all'
    return currentVal === option.value
  }
  if (option.value === 'all') {
    return active.value === 'all' || !group.options.some(({ value }) => value === active.value)
  }
  return active.value === option.value
}
</script>

<style scoped>
.resource-filter-bar {
  display: grid;
  grid-template-columns: max-content minmax(0, 1fr) max-content;
  column-gap: 0.8rem;
  align-items: start;
  padding: clamp(1.5rem, 2.8vw, 2.25rem) 0 1.25rem;
  border-bottom: 1px solid var(--resources-rule, var(--home-rule));
}

.resource-filter-label {
  min-height: 32px;
  display: flex;
  align-items: center;
  color: var(--resources-muted, var(--home-muted));
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.11em;
  text-transform: uppercase;
}

.resource-filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 0.8rem;
}

.resource-filter-groups {
  display: grid;
  gap: 0.3rem;
  min-width: 0;
}

.resource-filter-group {
  display: grid;
  grid-template-columns: 2.4rem minmax(0, 1fr);
  gap: 0.75rem;
  align-items: start;
}

.resource-filter-group-label {
  min-height: 32px;
  display: flex;
  align-items: center;
  color: var(--resources-muted, var(--home-muted));
  font-size: 0.68rem;
  line-height: 1.2;
}

.resource-filter-group .resource-filter-options {
  min-width: 0;
}

.resource-filter-count {
  min-height: 32px;
  display: flex;
  align-items: center;
  color: var(--resources-muted, var(--home-muted));
  font-size: 0.75rem;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.resource-filter-option {
  min-height: 32px;
  padding: 0.3rem 0.2rem;
  color: var(--resources-muted, var(--home-muted));
  background: transparent;
  border: 1px solid transparent;
  font: inherit;
  font-size: 0.78rem;
  line-height: 1.2;
  cursor: pointer;
  transition: color 180ms ease, border-color 180ms ease, background 180ms ease;
}

.resource-filter-option:hover,
.resource-filter-option:focus-visible {
  color: var(--resources-ink, var(--home-ink));
  border-color: transparent;
  box-shadow: inset 0 -1px 0 currentColor;
}

.resource-filter-option.is-active {
  color: var(--resources-ink, var(--home-ink));
  background: transparent;
  border-color: transparent;
  box-shadow: inset 0 -2px 0 var(--filter-accent, var(--resource-filter-accent, var(--resource-accent, var(--home-yellow, #efe373))));
}

.resource-filter-option:focus-visible {
  outline: 2px solid var(--resources-ink, var(--home-ink));
  outline-offset: 2px;
}

@media (max-width: 767px) {
  .resource-filter-bar {
    grid-template-columns: max-content minmax(0, 1fr);
    row-gap: 0.45rem;
  }

  .resource-filter-label { grid-column: 1 / -1; }

  .resource-filter-options {
    width: 100%;
    grid-column: 1 / -1;
  }

  .resource-filter-groups {
    width: 100%;
    grid-column: 1 / -1;
  }

  .resource-filter-group {
    display: grid;
    grid-template-columns: max-content minmax(0, 1fr);
    gap: 0.7rem;
  }

  .resource-filter-group-label {
    padding-top: 0;
  }

  .resource-filter-option {
    min-height: 44px;
    padding-inline: 0.2rem;
  }

  .resource-filter-count {
    grid-column: 2;
    justify-self: end;
  }
}
</style>
