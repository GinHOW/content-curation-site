import { computed, watch } from 'vue'

const firstQueryValue = (value) => (Array.isArray(value) ? value[0] : value)

export function useResourceFilter({
  route,
  router,
  routeName,
  items,
  getValues,
  labels = {},
  getFilterGroups,
  filterPredicate,
}) {
  const filterValues = computed(() => [...new Set(
    items.flatMap((item) => getValues(item)).filter(Boolean),
  )])

  const defaultFilterOptions = computed(() => [
    { value: 'all', label: '全部' },
    ...filterValues.value.map((value) => ({
      value,
      label: labels[value] || value,
    })),
  ])

  const filterGroups = computed(() => {
    if (typeof getFilterGroups !== 'function') return []

    const configuredGroups = getFilterGroups({ filterValues: filterValues.value, labels })

    return Array.isArray(configuredGroups) ? configuredGroups : []
  })

  const filterOptions = computed(() => filterGroups.value.length
    ? filterGroups.value.flatMap((group) => group.options || [])
    : defaultFilterOptions.value)

  const validValues = computed(() => new Set(filterOptions.value.map((option) => option.value)))

  const activeFilter = computed(() => {
    const raw = firstQueryValue(route.query.filter)
    return typeof raw === 'string' && validValues.value.has(raw) ? raw : 'all'
  })

  const filteredItems = computed(() => {
    if (activeFilter.value === 'all') return items
    if (typeof filterPredicate === 'function') {
      return items.filter((item) => filterPredicate(item, activeFilter.value))
    }
    return items.filter((item) => getValues(item).includes(activeFilter.value))
  })

  const cleanQuery = () => {
    const query = { ...route.query }
    delete query.filter
    return query
  }

  const setFilter = (value) => {
    const query = cleanQuery()
    if (validValues.value.has(value) && value !== 'all') query.filter = value
    return router.push({ name: routeName, query })
  }

  watch(() => route.query.filter, (value) => {
    if (value === undefined) return
    const raw = firstQueryValue(value)
    if (typeof raw === 'string' && validValues.value.has(raw)) return
    router.replace({ name: routeName, query: cleanQuery() })
  }, { immediate: true })

  return {
    activeFilter,
    filterOptions,
    filterGroups,
    filteredItems,
    setFilter,
  }
}
