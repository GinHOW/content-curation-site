<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="resource-submit-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="resource-submit-title"
      @click.self="requestClose"
    >
      <section ref="dialogRef" class="resource-submit-dialog" @click.stop>
        <button class="resource-submit-close" type="button" aria-label="关闭提交资源" @click="requestClose">×</button>

        <template v-if="submitted">
          <p class="resource-submit-eyebrow">Submission Received</p>
          <h2 id="resource-submit-title">已收到资源</h2>
          <p class="resource-submit-success" role="status">感谢提交。教师审核通过后，资源会出现在对应分类详情页。</p>
          <button class="resource-submit-secondary" type="button" @click="startAnother">继续提交</button>
        </template>

        <template v-else>
          <p class="resource-submit-eyebrow">Resource Submission</p>
          <h2 id="resource-submit-title">提交资源</h2>
          <p class="resource-submit-intro">提交网站、文章、视频或工具链接，内容会先进入教师审核队列。</p>

          <form class="resource-submit-form" @submit.prevent="submit">
            <label>
              <span>资源类型 <em>必填</em></span>
              <select v-model="form.type" required>
                <option value="" disabled>选择资源类型</option>
                <option v-for="option in typeOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
              </select>
              <small v-if="fieldErrors.type" class="resource-submit-error">{{ fieldErrors.type }}</small>
            </label>

            <label>
              <span>标题 <em>必填</em></span>
              <input v-model.trim="form.title" type="text" maxlength="120" autocomplete="off" required />
              <small v-if="fieldErrors.title" class="resource-submit-error">{{ fieldErrors.title }}</small>
            </label>

            <label>
              <span>链接 <em>必填</em></span>
              <input v-model.trim="form.url" type="url" maxlength="2048" inputmode="url" placeholder="https://" required />
              <small v-if="fieldErrors.url" class="resource-submit-error">{{ fieldErrors.url }}</small>
            </label>

            <label>
              <span>内容概述 <em>必填</em></span>
              <textarea v-model.trim="form.contentOverview" rows="4" maxlength="600" required></textarea>
              <small v-if="fieldErrors.contentOverview" class="resource-submit-error">{{ fieldErrors.contentOverview }}</small>
            </label>

            <label class="resource-submit-image-field">
              <span>快照 / 封面 <small>可选，JPG、PNG、WebP 或 AVIF；自动压缩至 1MB 以内</small></span>
              <input
                ref="imageInput"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                @change="onImageChange"
              />
              <div v-if="form.imagePreview" class="resource-submit-image-preview">
                <img :src="form.imagePreview" alt="待提交的资源快照预览" />
                <div class="resource-submit-image-meta">
                  <span>{{ imageMeta.width }} × {{ imageMeta.height }} px</span>
                  <span>{{ formatImageBytes(imageMeta.outputBytes) }}（原图 {{ formatImageBytes(imageMeta.originalBytes) }}）</span>
                  <button type="button" @click="clearImageSelection">移除图片</button>
                </div>
              </div>
              <small v-if="imageProcessing" class="resource-submit-image-processing" role="status">正在压缩图片……</small>
              <small v-if="imageError" class="resource-submit-error">{{ imageError }}</small>
            </label>

            <label>
              <span>标签 <small>可选，用逗号分隔</small></span>
              <input v-model.trim="form.tagsText" type="text" maxlength="120" placeholder="例如：展览，数字媒介" />
              <small v-if="fieldErrors.tags" class="resource-submit-error">{{ fieldErrors.tags }}</small>
            </label>

            <label>
              <span>姓名 <small>{{ isStudent ? '已使用学生账号姓名' : '可选' }}</small></span>
              <input v-model.trim="form.submitterName" type="text" maxlength="40" :readonly="isStudent" autocomplete="name" />
            </label>

            <div ref="turnstileRef" class="resource-submit-turnstile" aria-label="安全验证"></div>
            <p v-if="turnstileError" class="resource-submit-error" role="alert">{{ turnstileError }}</p>
            <p v-if="submitError" class="resource-submit-error" role="alert">{{ submitError }}</p>

            <div class="resource-submit-actions">
              <button class="resource-submit-primary" type="submit" :disabled="busy || imageProcessing || !turnstileReady">{{ busy ? '提交中……' : '提交资源' }}</button>
              <button class="resource-submit-secondary" type="button" :disabled="busy" @click="requestClose">取消</button>
            </div>
          </form>
        </template>
      </section>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { submitResource } from '../../services/courseState.js'
import { useAuthSession } from '../../composables/useAuthSession.js'
import { compressResourceImage, formatImageBytes, RESOURCE_IMAGE_MAX_RAW_BYTES } from '../../utils/compressResourceImage.js'

const props = defineProps({
  open: { type: Boolean, default: false },
  defaultType: { type: String, default: '' },
})
const emit = defineEmits(['close', 'submitted'])

const typeOptions = [
  { value: 'article', label: '文章' },
  { value: 'video', label: '视频' },
  { value: 'website', label: '网页' },
  { value: 'tool', label: '工具' },
]
const emptyForm = () => ({ type: props.defaultType || '', title: '', url: '', contentOverview: '', tagsText: '', submitterName: '', imageFile: null, imagePreview: '' })
const form = ref(emptyForm())
const fieldErrors = ref({})
const submitError = ref('')
const imageError = ref('')
const imageProcessing = ref(false)
const imageMeta = ref({ width: 0, height: 0, originalBytes: 0, outputBytes: 0 })
const turnstileError = ref('')
const submitted = ref(false)
const busy = ref(false)
const dialogRef = ref(null)
const turnstileRef = ref(null)
const imageInput = ref(null)
const turnstileWidget = ref(null)
const turnstileToken = ref('')
const turnstileReady = ref(false)
const lastTrigger = ref(null)
let imageRequestId = 0
const { initialize: initializeAuth, student } = useAuthSession()
const isStudent = computed(() => Boolean(student.value?.displayName))
const isDirty = computed(() => Object.entries(form.value).some(([key, value]) => key !== 'type' && Boolean(value)))

const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif'])

const revokeImagePreview = () => {
  if (form.value.imagePreview) URL.revokeObjectURL(form.value.imagePreview)
  form.value.imagePreview = ''
}

const clearImageSelection = () => {
  imageRequestId += 1
  revokeImagePreview()
  form.value.imageFile = null
  imageMeta.value = { width: 0, height: 0, originalBytes: 0, outputBytes: 0 }
  imageError.value = ''
  if (imageInput.value) imageInput.value.value = ''
}

const onImageChange = async (event) => {
  const file = event.target.files?.[0]
  clearImageSelection()
  if (!file) return
  if (!allowedImageTypes.has(file.type) || file.size > RESOURCE_IMAGE_MAX_RAW_BYTES) {
    imageError.value = '图片需为 JPG、PNG、WebP 或 AVIF，且不超过 10MB'
    return
  }
  const requestId = imageRequestId
  imageProcessing.value = true
  try {
    const result = await compressResourceImage(file)
    if (requestId !== imageRequestId) return
    form.value.imageFile = result.file
    form.value.imagePreview = URL.createObjectURL(result.file)
    imageMeta.value = result
  } catch (cause) {
    imageError.value = cause.message || '图片压缩失败，请重新选择'
  } finally {
    imageProcessing.value = false
  }
}

const focusables = () => [...dialogRef.value?.querySelectorAll('button, input, select, textarea, [tabindex]:not([tabindex="-1"])') || []]
const onKeydown = (event) => {
  if (!props.open) return
  if (event.key === 'Escape') {
    event.preventDefault()
    requestClose()
    return
  }
  if (event.key !== 'Tab') return
  const elements = focusables()
  if (!elements.length) return
  const first = elements[0]
  const last = elements[elements.length - 1]
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

const loadTurnstile = () => new Promise((resolve, reject) => {
  if (window.turnstile) return resolve(window.turnstile)
  const existing = document.querySelector('script[data-resource-turnstile]')
  if (existing) {
    existing.addEventListener('load', () => resolve(window.turnstile), { once: true })
    existing.addEventListener('error', reject, { once: true })
    return
  }
  const script = document.createElement('script')
  script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
  script.async = true
  script.defer = true
  script.dataset.resourceTurnstile = 'true'
  script.onload = () => window.turnstile ? resolve(window.turnstile) : reject(new Error('Turnstile 未加载'))
  script.onerror = reject
  document.head.appendChild(script)
})

const renderTurnstile = async () => {
  turnstileReady.value = false
  turnstileError.value = ''
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost' && window.location.port === '8788') {
    turnstileToken.value = 'local-sim-turnstile'
    turnstileReady.value = true
    return
  }
  const sitekey = import.meta.env.VITE_TURNSTILE_SITE_KEY
  if (!sitekey) {
    turnstileError.value = '投稿验证尚未配置，请联系教师。'
    return
  }
  try {
    const turnstile = await loadTurnstile()
    if (!turnstileRef.value || !props.open) return
    turnstileWidget.value = turnstile.render(turnstileRef.value, {
      sitekey,
      action: 'resource_submission',
      theme: 'light',
      size: 'flexible',
      callback: (token) => {
        turnstileToken.value = token
        turnstileReady.value = true
      },
      'expired-callback': () => {
        turnstileToken.value = ''
        turnstileReady.value = false
        turnstileError.value = '安全验证已过期，请重新完成验证。'
      },
      'error-callback': () => {
        turnstileToken.value = ''
        turnstileReady.value = false
        turnstileError.value = '安全验证暂时不可用，请重试。'
      },
    })
  } catch {
    turnstileError.value = '安全验证暂时不可用，请重试。'
  }
}

const resetTurnstile = () => {
  if (typeof window !== 'undefined' && window.turnstile && turnstileWidget.value !== null) {
    if (typeof window.turnstile.remove === 'function') window.turnstile.remove(turnstileWidget.value)
    else window.turnstile.reset(turnstileWidget.value)
  }
  turnstileRef.value?.replaceChildren()
  turnstileWidget.value = null
  turnstileToken.value = ''
  turnstileReady.value = false
}

const validate = () => {
  const errors = {}
  if (!form.value.type) errors.type = '请选择资源类型'
  if (!form.value.title) errors.title = '请填写标题'
  if (!form.value.url || !/^https?:\/\//i.test(form.value.url)) errors.url = '请输入 HTTP 或 HTTPS 链接'
  if (!form.value.contentOverview) errors.contentOverview = '请填写内容概述'
  const tags = form.value.tagsText.split(/[,，\n]/).map((item) => item.trim()).filter(Boolean)
  if (tags.length > 5 || tags.some((tag) => tag.length > 20)) errors.tags = '标签最多 5 个，每个不能超过 20 个字符'
  fieldErrors.value = errors
  return { valid: !Object.keys(errors).length, tags }
}

const submit = async () => {
  submitError.value = ''
  const result = validate()
  if (!result.valid) return
  if (!turnstileToken.value) {
    turnstileError.value = '请先完成安全验证。'
    return
  }
  busy.value = true
  try {
    await submitResource({
      type: form.value.type,
      title: form.value.title,
      url: form.value.url,
      contentOverview: form.value.contentOverview,
      tags: result.tags,
      submitterName: isStudent.value ? undefined : form.value.submitterName,
      imageFile: form.value.imageFile,
      imageWidth: imageMeta.value.width,
      imageHeight: imageMeta.value.height,
      imageOriginalBytes: imageMeta.value.originalBytes,
      imageOriginalName: imageMeta.value.originalName,
      turnstileToken: turnstileToken.value,
    })
    submitted.value = true
    clearImageSelection()
    resetTurnstile()
    emit('submitted')
  } catch (cause) {
    submitError.value = cause.message || '提交失败，请重试'
    resetTurnstile()
    await nextTick()
    renderTurnstile()
  } finally {
    busy.value = false
  }
}

const requestClose = () => {
  if (busy.value) return
  if (!submitted.value && isDirty.value && !window.confirm('表单尚未提交，确认关闭吗？')) return
  emit('close')
}

const startAnother = () => {
  submitted.value = false
  clearImageSelection()
  form.value = emptyForm()
  fieldErrors.value = {}
  submitError.value = ''
  renderTurnstile()
}

watch(() => props.open, async (open) => {
  if (open) {
    lastTrigger.value = document.activeElement
    await initializeAuth()
    clearImageSelection()
    form.value = emptyForm()
    if (student.value?.displayName) form.value.submitterName = student.value.displayName
    submitted.value = false
    fieldErrors.value = {}
    submitError.value = ''
    document.documentElement.classList.add('resource-submit-is-open')
    await nextTick()
    dialogRef.value?.querySelector('select, input, button')?.focus()
    renderTurnstile()
  } else {
    clearImageSelection()
    resetTurnstile()
    document.documentElement.classList.remove('resource-submit-is-open')
    lastTrigger.value?.focus?.()
  }
}, { immediate: true })

watch(() => props.defaultType, (value) => {
  if (!props.open) form.value.type = value || ''
})

watch(() => student.value?.displayName, (value) => {
  if (props.open && value) form.value.submitterName = value
})

if (typeof window !== 'undefined') window.addEventListener('keydown', onKeydown)
onBeforeUnmount(() => {
  if (typeof window !== 'undefined') window.removeEventListener('keydown', onKeydown)
  document.documentElement.classList.remove('resource-submit-is-open')
  revokeImagePreview()
})
</script>

<style scoped>
.resource-submit-overlay {
  position: fixed;
  z-index: 1000;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 1.25rem;
  background: rgb(17 17 17 / 42%);
}

.resource-submit-dialog {
  position: relative;
  width: min(44rem, 100%);
  max-height: min(90vh, 52rem);
  overflow: auto;
  padding: clamp(1.35rem, 4vw, 2.75rem);
  --home-paper: var(--color-surface, #ffffff);
  --home-ink: var(--color-text, #111111);
  --home-muted: var(--color-text-muted, #747474);
  --home-blue: var(--color-blue, #78a2ed);
  --home-yellow: var(--color-yellow, #efe373);
  --accent-orange: var(--color-orange, #f05a2a);
  border: 1px solid var(--home-ink);
  background: var(--home-paper);
  color: var(--home-ink);
}

.resource-submit-close {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  display: grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  border: 1px solid var(--home-ink);
  border-radius: 50%;
  color: var(--home-ink);
  background: transparent;
  font: inherit;
  font-size: 1.45rem;
  line-height: 1;
  cursor: pointer;
}

.resource-submit-close:hover,
.resource-submit-close:focus-visible {
  color: var(--home-paper);
  background: var(--home-ink);
}

.resource-submit-eyebrow {
  color: var(--home-muted);
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.11em;
  text-transform: uppercase;
}

.resource-submit-dialog h2 {
  margin-top: 0.45rem;
  font-size: clamp(2.3rem, 7vw, 4.8rem);
  line-height: 1.05;
  letter-spacing: -0.05em;
}

.resource-submit-intro,
.resource-submit-success {
  max-width: 34rem;
  margin-top: 0.8rem;
  color: var(--home-muted);
  font-size: 0.92rem;
  line-height: 1.7;
}

.resource-submit-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.1rem 1.25rem;
  margin-top: 2rem;
}

.resource-submit-form label,
.resource-submit-turnstile,
.resource-submit-actions,
.resource-submit-form > p {
  grid-column: 1 / -1;
}

.resource-submit-form label {
  display: grid;
  gap: 0.45rem;
}

.resource-submit-form label span {
  font-size: 0.78rem;
  font-weight: 700;
}

.resource-submit-form label em {
  color: var(--accent-orange);
  font-size: 0.68rem;
  font-style: normal;
  font-weight: 400;
}

.resource-submit-form label span small {
  color: var(--home-muted);
  font-size: 0.68rem;
  font-weight: 400;
}

.resource-submit-form input,
.resource-submit-form select,
.resource-submit-form textarea {
  width: 100%;
  min-height: 44px;
  padding: 0.65rem 0.7rem;
  border: 1px solid var(--home-ink);
  border-radius: 0;
  color: var(--home-ink);
  background: var(--home-paper);
  font: inherit;
  font-size: 0.88rem;
}

.resource-submit-form input[type='file'] {
  padding: 0.45rem 0.55rem;
  font-size: 0.78rem;
}

.resource-submit-image-preview {
  display: grid;
  grid-template-columns: minmax(0, 12rem) auto;
  align-items: end;
  gap: 0.7rem;
  max-width: 26rem;
}

.resource-submit-image-preview img {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 10;
  object-fit: cover;
  border: 1px solid var(--home-ink);
  background: #f2f2ee;
}

.resource-submit-image-preview button {
  min-height: 2.25rem;
  padding: 0.45rem 0.65rem;
  border: 1px solid var(--home-ink);
  color: var(--home-ink);
  background: transparent;
  font: inherit;
  font-size: 0.72rem;
  cursor: pointer;
}

.resource-submit-image-meta {
  display: grid;
  gap: 0.35rem;
  align-self: end;
  color: var(--home-muted);
  font-size: 0.68rem;
  line-height: 1.45;
}

.resource-submit-image-processing {
  color: var(--home-muted);
  font-size: 0.72rem;
}

.resource-submit-image-preview button:hover,
.resource-submit-image-preview button:focus-visible {
  color: var(--home-paper);
  background: var(--home-ink);
}

.resource-submit-form textarea {
  resize: vertical;
}

.resource-submit-form input:focus,
.resource-submit-form select:focus,
.resource-submit-form textarea:focus,
.resource-submit-close:focus-visible,
.resource-submit-primary:focus-visible,
.resource-submit-secondary:focus-visible {
  outline: 2px solid var(--home-blue);
  outline-offset: 2px;
}

.resource-submit-form input[readonly] {
  color: var(--home-muted);
  background: #f2f2ee;
}

.resource-submit-turnstile {
  min-height: 65px;
  margin-top: 0.25rem;
}

.resource-submit-error {
  color: #a32f22;
  font-size: 0.72rem;
  line-height: 1.5;
}

.resource-submit-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
  margin-top: 0.25rem;
}

.resource-submit-primary,
.resource-submit-secondary {
  min-height: 44px;
  padding: 0.65rem 0.9rem;
  border: 1px solid var(--home-ink);
  border-radius: 0;
  font: inherit;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
}

.resource-submit-primary {
  color: var(--home-paper);
  background: var(--home-ink);
}

.resource-submit-primary:hover:not(:disabled),
.resource-submit-primary:focus-visible {
  color: var(--home-ink);
  background: var(--home-yellow);
}

.resource-submit-secondary {
  color: var(--home-ink);
  background: transparent;
}

.resource-submit-secondary:hover:not(:disabled),
.resource-submit-secondary:focus-visible {
  color: var(--home-paper);
  background: var(--home-ink);
}

.resource-submit-primary:disabled,
.resource-submit-secondary:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

@media (max-width: 600px) {
  .resource-submit-overlay {
    place-items: stretch;
    padding: 0;
  }

  .resource-submit-dialog {
    width: 100%;
    max-height: 100%;
    min-height: 100%;
    padding: 4rem 1rem 1.5rem;
  }

  .resource-submit-form {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .resource-submit-close,
  .resource-submit-primary,
  .resource-submit-secondary {
    transition: none;
  }
}
</style>
