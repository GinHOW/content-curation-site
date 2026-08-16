import { onBeforeUnmount, onMounted, ref } from 'vue'

const getHashId = () => {
  try {
    return decodeURIComponent(window.location.hash.slice(1))
  } catch {
    return ''
  }
}

export function useHomeSections(sectionIds = []) {
  const activeSection = ref(sectionIds[0] || '')
  let frameId
  let highlightFrameId
  let sections = []
  let anchorOffset = 0

  const getSectionAnchor = (section) => {
    const labelledBy = section.getAttribute('aria-labelledby')
    return labelledBy ? document.getElementById(labelledBy) || section : section
  }

  const readAnchorOffset = (section = sections[0]?.section) => {
    if (!section) return 0

    const offsetSource = section.matches('.home-section')
      ? section
      : section.closest('.home-page')?.querySelector('.home-section')
    const computedStyle = window.getComputedStyle(offsetSource || section)
    const value = Number.parseFloat(computedStyle.scrollMarginTop)
    return Number.isFinite(value) ? value : 0
  }

  const updateActiveSection = () => {
    highlightFrameId = undefined
    if (!sections.length) return

    anchorOffset = readAnchorOffset()
    const current = sections
      .map(({ id, anchor }) => ({
        id,
        distance: Math.abs(anchor.getBoundingClientRect().top - anchorOffset),
      }))
      .sort((first, second) => first.distance - second.distance)[0]

    if (current) activeSection.value = current.id
  }

  const scheduleActiveSectionUpdate = () => {
    if (highlightFrameId !== undefined) return
    highlightFrameId = window.requestAnimationFrame(updateActiveSection)
  }

  const scrollToSection = (id, behavior = 'smooth') => {
    const section = document.getElementById(id)
    if (!section) return

    const anchor = getSectionAnchor(section)
    const top = window.scrollY + anchor.getBoundingClientRect().top - readAnchorOffset(section)

    window.scrollTo({ top, behavior })
  }

  const navigateTo = (id, behavior = 'smooth') => {
    if (!sectionIds.includes(id)) return

    if (window.location.hash !== `#${id}`) {
      window.history.pushState(null, '', `#${id}`)
    }

    activeSection.value = id
    scrollToSection(id, behavior)
  }

  const syncFromHash = () => {
    const id = getHashId()
    if (sectionIds.includes(id)) {
      activeSection.value = id
      scrollToSection(id, 'auto')
    }
  }

  onMounted(() => {
    sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean)
      .map((section) => ({
        id: section.id,
        section,
        anchor: getSectionAnchor(section),
      }))

    window.addEventListener('scroll', scheduleActiveSectionUpdate, { passive: true })
    window.addEventListener('resize', scheduleActiveSectionUpdate)

    window.addEventListener('hashchange', syncFromHash)
    window.addEventListener('popstate', syncFromHash)

    scheduleActiveSectionUpdate()

    if (getHashId()) {
      frameId = window.requestAnimationFrame(() => syncFromHash())
    }
  })

  onBeforeUnmount(() => {
    window.cancelAnimationFrame(frameId)
    if (highlightFrameId !== undefined) {
      window.cancelAnimationFrame(highlightFrameId)
    }
    window.removeEventListener('scroll', scheduleActiveSectionUpdate)
    window.removeEventListener('resize', scheduleActiveSectionUpdate)
    window.removeEventListener('hashchange', syncFromHash)
    window.removeEventListener('popstate', syncFromHash)
  })

  return {
    activeSection,
    navigateTo,
    scrollToSection,
  }
}
