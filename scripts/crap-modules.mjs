export const CRAP_THRESHOLD = 30
export const CRAP_WARNING_THRESHOLD = 15

export const CRAP_MODULES = [
  {
    name: 'stickerLayout',
    src: 'src/utils/stickerLayout.js',
  },
  {
    name: 'screenUniverseSphere',
    src: 'src/utils/screenUniverseSphere.js',
  },
  {
    name: 'stickerInteraction',
    src: 'src/composables/useStickerInteraction.js',
  },
  {
    name: 'screenUniverseScene',
    src: 'src/composables/useScreenUniverseScene.js',
  },
  {
    name: 'articleMarkdown',
    src: 'src/utils/markdown/articleMarkdown.js',
  },
  {
    name: 'articleOutline',
    src: 'src/utils/markdown/articleOutline.js',
  },
  {
    name: 'resourceBlocks',
    src: 'src/utils/markdown/resourceBlocks.js',
  },
]

export const CRAP_SOURCE_FILES = CRAP_MODULES.map(({ src }) => src)
