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
  let sectionObserver
  let frameId

  const scrollToSection = (id, behavior = 'smooth') => {
    const section = document.getElementById(id)
    if (!section) return

    section.scrollIntoView({ behavior, block: 'start' })
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
    if ('IntersectionObserver' in window) {
      const sections = sectionIds
        .map((id) => document.getElementById(id))
        .filter(Boolean)
      const visibleSections = new Map()

      sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visibleSections.set(entry.target.id, entry.boundingClientRect.top)
          } else {
            visibleSections.delete(entry.target.id)
          }
        })

        if (visibleSections.size) {
          const current = [...visibleSections.entries()]
            .sort(([, firstTop], [, secondTop]) => (
              Math.abs(firstTop - 120) - Math.abs(secondTop - 120)
            ))[0]

          if (current) activeSection.value = current[0]
        }
      }, {
        rootMargin: '-12% 0px -68% 0px',
        threshold: [0, 0.15, 0.5],
      })

      sections.forEach((section) => sectionObserver.observe(section))
    }

    window.addEventListener('hashchange', syncFromHash)
    window.addEventListener('popstate', syncFromHash)

    if (getHashId()) {
      frameId = window.requestAnimationFrame(() => syncFromHash())
    }
  })

  onBeforeUnmount(() => {
    sectionObserver?.disconnect()
    window.cancelAnimationFrame(frameId)
    window.removeEventListener('hashchange', syncFromHash)
    window.removeEventListener('popstate', syncFromHash)
  })

  return {
    activeSection,
    navigateTo,
    scrollToSection,
  }
}

