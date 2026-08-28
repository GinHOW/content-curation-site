<template>
  <div class="resource-manage-page home-page">
    <HomeSiteNav />
    <main class="resource-manage-main home-main">
      <section class="resource-manage-section" aria-labelledby="resource-manage-title">
        <div class="section-grid resource-manage-heading"><div class="section-title-column"><p class="eyebrow">Resource Control</p><h1 id="resource-manage-title">资源<br />管理</h1></div><div class="section-copy-column"><p class="lead-copy">集中录入、审核、发布与隐藏课程资源；所有四类课程原有资源也会在这里统一管理。</p><router-link class="resource-manage-back" to="/manage">← 返回教师管理</router-link></div></div>
        <form v-if="!authenticated" class="resource-manage-login" @submit.prevent="login"><label><span>教师管理口令</span><input v-model="password" type="password" autocomplete="current-password" required /></label><button type="submit" :disabled="busy">{{ busy ? '验证中……' : '进入资源管理' }}</button><p v-if="authError" class="resource-manage-message is-error" role="alert">{{ authError }}</p></form>
        <template v-else>
          <div class="resource-manage-toolbar"><span>已登录教师管理</span><div><router-link class="resource-manage-toolbar-link" to="/manage/media">媒体库 →</router-link><button type="button" :disabled="busy" @click="loadLibrary">刷新数据</button><button type="button" @click="logout">退出</button></div></div>
          <section class="resource-manage-block" aria-labelledby="resource-create-title">
            <header class="resource-manage-block-heading"><div><p class="eyebrow">01 · New Resource</p><h2 id="resource-create-title">新增资源</h2></div><div class="resource-create-header-actions"><span class="resource-manage-hint">教师录入无需安全验证</span><button class="resource-create-toggle" type="button" aria-controls="resource-create-form" :aria-expanded="createOpen" @click="createOpen = !createOpen">{{ createOpen ? '收起录入' : '展开录入' }}</button></div></header>
            <form v-show="createOpen" id="resource-create-form" class="resource-create-form" @submit.prevent="createResource">
              <label>
                <span>资源类型</span>
                <select v-model="createForm.type" required @change="syncCategory(createForm)">
                  <option value="" disabled>选择资源类型</option>
                  <option v-for="option in typeOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
                </select>
              </label>
              <label v-if="categoryOptionsFor(createForm.type).length">
                <span>前台筛选分类 <small>{{ createForm.type === 'website' ? '网页必选' : '可选' }}</small></span>
                <select v-model="createForm.category" :required="createForm.type === 'website'">
                  <option value="" disabled>选择分类</option>
                  <option v-for="option in categoryOptionsFor(createForm.type)" :key="option.value" :value="option.value">{{ option.label }}</option>
                </select>
              </label>
              <label><span>标题</span><input v-model.trim="createForm.title" maxlength="120" required /></label>
              <label class="is-wide"><span>链接</span><input v-model.trim="createForm.url" type="url" maxlength="2048" placeholder="https://" required /></label>
              <label class="is-wide"><span>内容概述</span><textarea v-model.trim="createForm.contentOverview" rows="4" maxlength="600" required></textarea></label>
              <label class="is-wide"><span>快照 / 封面 <small>可选，JPG、PNG、WebP 或 AVIF；自动压缩至 1MB 以内</small></span><input type="file" accept="image/jpeg,image/png,image/webp,image/avif" @change="handleCreateImage" /><div v-if="createForm.imagePreview" class="resource-admin-image-meta"><img class="resource-admin-image-preview" :src="createForm.imagePreview" alt="待上传的资源快照预览" /><span>{{ createForm.imageMeta.width }} × {{ createForm.imageMeta.height }} px · {{ formatImageBytes(createForm.imageMeta.outputBytes) }}（原图 {{ formatImageBytes(createForm.imageMeta.originalBytes) }}）</span></div><small v-if="createImageProcessing" class="resource-manage-hint" role="status">正在压缩图片……</small></label>
              <label><span>标签 <small>可选，用逗号分隔</small></span><input v-model.trim="createForm.tagsText" maxlength="120" /></label>
              <label><span>发布方式</span><select v-model="createForm.status"><option value="approved">立即发布</option><option value="pending">保存待审</option></select></label>
              <label class="resource-check-label"><input v-model="createForm.isFeatured" type="checkbox" :disabled="createForm.status !== 'approved'" /><span>加入资源总览精选</span></label>
              <div class="resource-create-actions"><button type="submit" :disabled="busy || createImageProcessing">{{ busy ? '保存中……' : '保存资源' }}</button></div>
            </form>
          </section>
          <section class="resource-manage-block" aria-labelledby="resource-list-title">
            <header class="resource-manage-block-heading resource-list-heading"><div><p class="eyebrow">02 · Library</p><h2 id="resource-list-title">资源库</h2></div><div class="resource-status-tabs" aria-label="资源状态"><button v-for="option in statusOptions" :key="option.value" type="button" :class="{ 'is-active': listStatus === option.value }" @click="listStatus = option.value">{{ option.label }}</button></div></header>
            <div v-if="visibleResources.length" class="resource-admin-list" role="list"><article v-for="resource in visibleResources" :key="resource.rowKey" class="resource-admin-row" role="listitem"><div class="resource-admin-summary"><span class="resource-admin-kicker">{{ typeLabel(resource.type) }}</span><div class="resource-admin-title"><strong>{{ resource.title }}</strong><a v-if="resourceLink(resource)" :href="resourceLink(resource)" target="_blank" rel="noreferrer">{{ linkLabel(resource) }} ↗</a><span v-else>未提供外部链接</span></div><span class="resource-admin-source">{{ resource.kind === 'static' ? '课程原有' : sourceLabel(resource.submissionSource) + '投稿' }}</span><span class="resource-admin-status">{{ statusLabel(resource.status) }}</span><span class="resource-admin-featured">{{ resource.isFeatured ? '精选' : '普通' }}</span><footer class="resource-admin-actions" aria-label="快速操作"><template v-if="resource.kind === 'static'"><button type="button" :disabled="busy" @click="updateStaticResource(resource, { isFeatured: !resource.isFeatured })">{{ resource.isFeatured ? '取消精选' : '设为精选' }}</button><button type="button" :disabled="busy" @click="updateStaticResource(resource, { isHidden: !resource.isHidden })">{{ resource.isHidden ? '恢复公开' : '隐藏' }}</button></template><template v-else-if="resource.status === 'pending'"><button type="button" :disabled="busy" @click="changeStatus(resource, 'approved')">发布</button><button type="button" :disabled="busy" @click="changeStatus(resource, 'rejected')">拒绝</button><button type="button" :disabled="busy" @click="toggleEdit(resource)">编辑</button></template><template v-else-if="resource.status === 'approved'"><button type="button" :disabled="busy" @click="toggleSubmissionFeatured(resource)">{{ resource.isFeatured ? '取消精选' : '设为精选' }}</button><button type="button" :disabled="busy" @click="changeStatus(resource, 'rejected')">撤下</button><button type="button" :disabled="busy" @click="toggleEdit(resource)">编辑</button></template><template v-else><button type="button" :disabled="busy" @click="changeStatus(resource, 'pending')">恢复待审</button><button type="button" :disabled="busy" @click="toggleEdit(resource)">编辑</button></template></footer></div>
              <form v-if="resource.kind === 'submission' && editingId === resource.id" class="resource-admin-form" @submit.prevent="saveResource(resource)">
                <label>
                  <span>资源类型 <small>决定前台所属分类页</small></span>
                  <select v-model="resource.type" required @change="syncCategory(resource)">
                    <option v-for="option in typeOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
                  </select>
                </label>
                <label v-if="categoryOptionsFor(resource.type).length">
                  <span>前台筛选分类 <small>{{ resource.type === 'website' ? '网页必选' : '可选' }}</small></span>
                  <select v-model="resource.category" :required="resource.type === 'website'">
                    <option value="" disabled>选择分类</option>
                    <option v-for="option in categoryOptionsFor(resource.type)" :key="option.value" :value="option.value">{{ option.label }}</option>
                  </select>
                </label>
                <label><span>标题</span><input v-model.trim="resource.title" maxlength="120" required /></label>
                <label class="is-wide"><span>链接</span><input v-model.trim="resource.url" type="url" maxlength="2048" required /></label>
                <label class="is-wide"><span>内容概述</span><textarea v-model.trim="resource.contentOverview" rows="3" maxlength="600" required></textarea></label>
                <label class="is-wide"><span>快照 / 封面 <small>选择新图片可替换当前封面</small></span><input type="file" accept="image/jpeg,image/png,image/webp,image/avif" @change="handleResourceImage(resource, $event)" /><div v-if="resource.imagePreview || resource.imageUrl" class="resource-admin-image-meta"><img class="resource-admin-image-preview" :src="resource.imagePreview || resource.imageUrl" alt="资源快照预览" /><span v-if="resource.imageMeta">{{ resource.imageMeta.width || '—' }} × {{ resource.imageMeta.height || '—' }} px · {{ formatImageBytes(resource.imageMeta.outputBytes) }}{{ resource.imageMeta.originalBytes ? `（原图 ${formatImageBytes(resource.imageMeta.originalBytes)}）` : '' }}</span></div><small v-if="resource.imageProcessing" class="resource-manage-hint" role="status">正在压缩图片……</small></label>
                <label><span>标签</span><input v-model.trim="resource.tagsText" maxlength="120" /></label>
                <label class="resource-check-label"><input v-model="resource.isFeatured" type="checkbox" :disabled="resource.status !== 'approved'" /><span>资源总览精选</span></label>
                <label v-if="resource.imageUrl" class="resource-check-label"><input v-model="resource.removeImage" type="checkbox" :disabled="Boolean(resource.imagePreview)" /><span>移除当前封面</span></label>
                <div class="resource-edit-actions"><button type="submit" :disabled="busy || resource.imageProcessing">保存修改</button><button type="button" :disabled="busy" @click="cancelEdit(resource)">取消</button></div>
              </form>
            </article></div>
            <p v-else class="resource-manage-empty" role="status">当前状态下暂无资源。</p>
          </section>
          <p v-if="actionMessage" class="resource-manage-message" role="status">{{ actionMessage }}</p><p v-if="actionError" class="resource-manage-message is-error" role="alert">{{ actionError }}</p>
        </template>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import HomeSiteNav from '../components/navigation/HomeSiteNav.vue'
import { getResourceCategoryOptions } from '../data/resourceCategories.js'
import { resourceArticles, resourceTools, resourceVideos, resourceWebsites } from '../data/resources.js'
import { useAuthSession } from '../composables/useAuthSession.js'
import { adminLogin, adminLogout, createAdminResource, getAdminResources, getAdminStaticResourceOverrides, updateAdminResource, updateAdminStaticResourceOverride } from '../services/courseState.js'
import { compressResourceImage, formatImageBytes, RESOURCE_IMAGE_MAX_RAW_BYTES } from '../utils/compressResourceImage.js'

const typeOptions = [{ value: 'article', label: '文章' }, { value: 'video', label: '视频' }, { value: 'website', label: '网页' }, { value: 'tool', label: '工具' }]
const categoryOptionsFor = (type) => getResourceCategoryOptions(type)
const statusOptions = [{ value: 'all', label: '全部' }, { value: 'pending', label: '待审核' }, { value: 'approved', label: '已发布' }, { value: 'hidden', label: '已隐藏' }, { value: 'rejected', label: '已拒绝' }]
const { isTeacher: authenticated, initialize: initializeAuth, refresh: refreshAuth, clearTeacher } = useAuthSession()
const password = ref(''); const authError = ref(''); const actionError = ref(''); const actionMessage = ref(''); const busy = ref(false); const createOpen = ref(false); const listStatus = ref('all'); const submissions = ref([]); const staticOverrides = ref({}); const editingId = ref(''); let imageRequestId = 0
const createForm = reactive({ type: '', category: '', title: '', url: '', contentOverview: '', tagsText: '', status: 'approved', isFeatured: false, imageFile: null, imagePreview: '', imageMeta: { width: 0, height: 0, originalBytes: 0, outputBytes: 0 } })
const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']); const createImageProcessing = ref(false)
const revokePreview = (resource) => { if (resource?.imagePreview) URL.revokeObjectURL(resource.imagePreview); if (resource) resource.imagePreview = '' }
const selectImage = async (file, target, input, processingTarget = null) => { imageRequestId += 1; const requestId = imageRequestId; revokePreview(target); target.imageFile = null; target.imageMeta = { width: 0, height: 0, originalBytes: 0, outputBytes: 0 }; target.removeImage = false; if (!file) return; if (!allowedImageTypes.has(file.type) || file.size > RESOURCE_IMAGE_MAX_RAW_BYTES) { if (input) input.value = ''; actionError.value = '图片需为 JPG、PNG、WebP 或 AVIF，且不超过 10MB'; return }; if (processingTarget) processingTarget.value = true; else target.imageProcessing = true; try { const result = await compressResourceImage(file); if (requestId !== imageRequestId) return; target.imageFile = result.file; target.imagePreview = URL.createObjectURL(result.file); target.imageMeta = result } catch (cause) { if (requestId === imageRequestId) actionError.value = cause.message || '图片压缩失败，请重新选择' } finally { if (processingTarget) processingTarget.value = false; else target.imageProcessing = false } }
const handleCreateImage = (event) => selectImage(event.target.files?.[0], createForm, event.target, createImageProcessing); const handleResourceImage = (resource, event) => selectImage(event.target.files?.[0], resource, event.target)
const decorate = (resource) => ({ ...resource, kind: 'submission', rowKey: `submission-${resource.id}`, category: resource.category || '', tagsText: (resource.tags || []).join('，'), imageFile: null, imagePreview: '', imageMeta: { width: 0, height: 0, originalBytes: 0, outputBytes: 0 }, imageProcessing: false, removeImage: false })
const categoryLabel = (type, category) => categoryOptionsFor(type).find((option) => option.value === category)?.label || ''
const typeLabel = (value, category = '') => [typeOptions.find((option) => option.value === value)?.label || value, categoryLabel(value, category)].filter(Boolean).join(' · '); const statusLabel = (value) => ({ pending: '待审核', approved: '已发布', hidden: '已隐藏', rejected: '已拒绝' }[value] || value); const sourceLabel = (value) => ({ visitor: '访客', student: '学生', teacher: '教师' }[value] || '用户')
const resourceLink = (resource) => resource.url || resource.fallbackUrl || resource.downloadUrl || resource.sourcePath || ''; const linkLabel = (resource) => { try { return new URL(resourceLink(resource)).hostname.replace(/^www\./, '') } catch { return resourceLink(resource) } }
const tagsFromText = (value) => value.split(/[,，\n]/).map((item) => item.trim()).filter(Boolean)
const payloadFrom = (resource, changes = {}) => ({ type: resource.type, category: resource.category || '', title: resource.title, url: resource.url, contentOverview: resource.contentOverview, tags: tagsFromText(resource.tagsText || ''), submitterName: resource.submitterName || '教师', status: resource.status, isFeatured: resource.status === 'approved' && Boolean(resource.isFeatured), imageFile: resource.imageFile, imageWidth: resource.imageMeta?.width, imageHeight: resource.imageMeta?.height, imageOriginalBytes: resource.imageMeta?.originalBytes, imageOriginalName: resource.imageMeta?.originalName, removeImage: Boolean(resource.removeImage), ...changes })
const staticCatalog = computed(() => [resourceArticles, resourceVideos, resourceWebsites, resourceTools].flat().map((item) => { const override = staticOverrides.value[item.id] || {}; const isHidden = Boolean(override.isHidden); const category = item.articleCategory || item.videoCategory || item.websiteCategory || (item.format === 'SKILL.md' ? 'skill' : item.format ? 'external' : ''); return { ...item, kind: 'static', rowKey: `static-${item.id}`, staticId: item.id, category, url: resourceLink(item), status: isHidden ? 'hidden' : 'approved', isHidden, isFeatured: typeof override.featuredOverride === 'boolean' ? override.featuredOverride : Boolean(item.featured) } }))
const visibleResources = computed(() => { const items = [...submissions.value, ...staticCatalog.value]; const shown = listStatus.value === 'all' ? items : items.filter((item) => item.status === listStatus.value); const order = { pending: 0, approved: 1, hidden: 2, rejected: 3 }; return shown.sort((a, b) => order[a.status] - order[b.status] || a.kind.localeCompare(b.kind) || a.title.localeCompare(b.title, 'zh-CN')) })
const loadLibrary = async () => { actionError.value = ''; try { const [resourcePayload, overridePayload] = await Promise.all([getAdminResources('all'), getAdminStaticResourceOverrides()]); submissions.value.forEach(revokePreview); submissions.value = (resourcePayload.resources || []).map(decorate); staticOverrides.value = Object.fromEntries((overridePayload.overrides || []).map((item) => [item.staticId, item])); editingId.value = '' } catch (cause) { actionError.value = cause.message || '资源列表读取失败，请重试' } }
const login = async () => { busy.value = true; authError.value = ''; try { await adminLogin(password.value); password.value = ''; await refreshAuth(); await loadLibrary() } catch (cause) { authError.value = cause.message || '登录失败，请重试' } finally { busy.value = false } }
const logout = async () => { await adminLogout().catch(() => {}); clearTeacher(); submissions.value.forEach(revokePreview); submissions.value = []; editingId.value = '' }
const syncCategory = (resource) => { if (!categoryOptionsFor(resource.type).some((option) => option.value === resource.category)) resource.category = categoryOptionsFor(resource.type)[0]?.value || '' }
const resetCreateForm = () => { revokePreview(createForm); Object.assign(createForm, { type: '', category: '', title: '', url: '', contentOverview: '', tagsText: '', status: 'approved', isFeatured: false, imageFile: null, imagePreview: '', imageMeta: { width: 0, height: 0, originalBytes: 0, outputBytes: 0 } }) }
const createResource = async () => { busy.value = true; actionError.value = ''; actionMessage.value = ''; try { await createAdminResource({ ...createForm, tags: tagsFromText(createForm.tagsText), submitterName: '教师', imageWidth: createForm.imageMeta.width, imageHeight: createForm.imageMeta.height, imageOriginalBytes: createForm.imageMeta.originalBytes, imageOriginalName: createForm.imageMeta.originalName }); resetCreateForm(); await loadLibrary(); actionMessage.value = '资源已保存' } catch (cause) { actionError.value = cause.message || '资源保存失败，请重试' } finally { busy.value = false } }
const saveResource = async (resource) => { busy.value = true; actionError.value = ''; actionMessage.value = ''; try { await updateAdminResource(resource.id, payloadFrom(resource)); revokePreview(resource); resource.imageFile = null; resource.removeImage = false; await loadLibrary(); actionMessage.value = '资源修改已保存' } catch (cause) { actionError.value = cause.message || '资源修改失败，请重试' } finally { busy.value = false } }
const changeStatus = async (resource, status) => { busy.value = true; actionError.value = ''; actionMessage.value = ''; try { const isFeatured = status === 'approved' ? resource.isFeatured : false; await updateAdminResource(resource.id, payloadFrom(resource, { status, isFeatured })); await loadLibrary(); actionMessage.value = status === 'approved' ? '资源已发布' : status === 'pending' ? '资源已恢复为待审' : '资源已撤下或拒绝' } catch (cause) { actionError.value = cause.message || '资源状态更新失败，请重试' } finally { busy.value = false } }
const toggleSubmissionFeatured = async (resource) => { resource.isFeatured = !resource.isFeatured; await saveResource(resource) }
const updateStaticResource = async (resource, changes) => { busy.value = true; actionError.value = ''; actionMessage.value = ''; try { await updateAdminStaticResourceOverride(resource.staticId, { isFeatured: changes.isFeatured ?? resource.isFeatured, isHidden: changes.isHidden ?? resource.isHidden }); await loadLibrary(); actionMessage.value = changes.isHidden === true ? '课程资源已隐藏' : changes.isHidden === false ? '课程资源已恢复公开' : changes.isFeatured ? '已设为精选' : '已取消精选' } catch (cause) { actionError.value = cause.message || '课程资源状态更新失败，请重试' } finally { busy.value = false } }
const toggleEdit = (resource) => { editingId.value = editingId.value === resource.id ? '' : resource.id }; const cancelEdit = (resource) => { revokePreview(resource); loadLibrary() }
onMounted(async () => { await initializeAuth(); if (authenticated.value) await loadLibrary() }); onBeforeUnmount(() => { revokePreview(createForm); submissions.value.forEach(revokePreview) })
</script>

<style scoped>
.resource-manage-page{min-height:100vh;color:var(--home-ink);background:var(--home-paper)}.resource-manage-page>.site-nav{margin-inline:clamp(3.5rem,4vw,4.5rem);padding-top:clamp(1.5rem,4vh,3rem)}.resource-manage-main{padding:2rem clamp(1rem,4vw,4rem) 5rem}.resource-manage-section{max-width:1240px;margin:0 auto}.resource-manage-heading{margin-bottom:3rem}.resource-manage-back{display:inline-flex;min-height:44px;align-items:center;margin-top:1.5rem;color:var(--home-ink);font-size:.78rem;font-weight:700;text-decoration:none}.resource-manage-back:hover,.resource-manage-back:focus-visible{color:var(--accent-orange)}.resource-manage-login{display:flex;flex-wrap:wrap;align-items:end;gap:.8rem;max-width:32rem;padding:1.25rem 0;border-top:1px solid var(--home-rule);border-bottom:1px solid var(--home-rule)}.resource-manage-login label,.resource-create-form label,.resource-admin-form label{display:grid;gap:.35rem;color:var(--home-muted);font-size:.72rem}.resource-manage-login label{flex:1 1 15rem}.resource-manage-login input,.resource-create-form input,.resource-create-form select,.resource-create-form textarea,.resource-admin-form input,.resource-admin-form select,.resource-admin-form textarea{width:100%;min-height:44px;padding:.4rem .6rem;border:1px solid var(--home-ink);border-radius:0;color:var(--home-ink);background:var(--home-paper);font:inherit}.resource-create-form textarea,.resource-admin-form textarea{resize:vertical}.resource-create-form input[type='file'],.resource-admin-form input[type='file']{padding:.4rem .5rem;font-size:.72rem}.resource-admin-image-preview{display:block;width:min(18rem,100%);aspect-ratio:16/10;object-fit:cover;border:1px solid var(--home-ink);background:#f2f2ee}.resource-manage-login button,.resource-create-actions button,.resource-edit-actions button,.resource-admin-actions button,.resource-manage-toolbar button,.resource-status-tabs button,.resource-create-toggle{min-height:44px;padding:.4rem .8rem;border:1px solid var(--home-ink);border-radius:0;color:var(--home-ink);background:transparent;font:inherit;font-size:.75rem;cursor:pointer}.resource-manage-login button,.resource-create-actions button,.resource-edit-actions button:first-child{color:var(--home-paper);background:var(--home-ink)}button:disabled{cursor:wait;opacity:.45}button:focus-visible,a:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible{outline:2px solid var(--accent-orange);outline-offset:2px}.resource-manage-toolbar,.resource-manage-block-heading{display:flex;align-items:end;justify-content:space-between;gap:1rem}.resource-manage-toolbar{padding:.8rem 0;border-top:1px solid var(--home-rule);border-bottom:1px solid var(--home-rule);font-size:.8rem}.resource-manage-toolbar div,.resource-status-tabs,.resource-admin-actions,.resource-create-header-actions,.resource-edit-actions{display:flex;flex-wrap:wrap;gap:.4rem}.resource-manage-block{margin-top:3rem}.resource-manage-block-heading{margin-bottom:1rem}.resource-manage-block-heading h2{margin-top:.35rem;font-size:clamp(1.3rem,2.4vw,2rem)}.resource-create-header-actions{align-items:center;justify-content:end}.resource-manage-hint,.resource-admin-source,.resource-admin-title a,.resource-admin-title span{color:var(--home-muted);font-size:.72rem}.resource-create-form,.resource-admin-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.9rem 1rem;padding-top:1rem;border-top:1px solid var(--home-rule)}.resource-create-form label>span,.resource-admin-form label>span{color:var(--home-ink);font-weight:700}.resource-create-form label small{color:var(--home-muted);font-weight:400}.resource-create-form .is-wide,.resource-admin-form .is-wide,.resource-create-actions,.resource-edit-actions{grid-column:1/-1}.resource-check-label{display:flex!important;align-items:center;grid-template-columns:auto 1fr;gap:.5rem!important;align-self:end;min-height:44px}.resource-check-label input{width:1rem;min-height:1rem}.resource-create-actions,.resource-edit-actions{display:flex;justify-content:flex-start;padding-top:.2rem}.resource-status-tabs button.is-active,.resource-status-tabs button:hover,.resource-status-tabs button:focus-visible{color:var(--home-paper);background:var(--home-ink)}.resource-admin-list{display:grid;border-top:1px solid var(--home-rule)}.resource-admin-row{border-bottom:1px solid var(--home-rule)}.resource-admin-summary{display:grid;grid-template-columns:4.5rem minmax(13rem,2fr) minmax(5rem,.8fr) 4.5rem 3.4rem auto;align-items:center;gap:.8rem;min-height:72px;padding:.75rem 0}.resource-admin-kicker,.resource-admin-status,.resource-admin-featured{font-size:.72rem;font-weight:700}.resource-admin-status,.resource-admin-featured{white-space:nowrap}.resource-admin-title{display:grid;gap:.25rem;min-width:0}.resource-admin-title strong,.resource-admin-title a{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.resource-admin-actions{justify-content:end}.resource-admin-actions button{min-height:44px;padding-inline:.6rem}.resource-admin-form{padding:1rem 0 1.25rem}.resource-manage-message{margin-top:1rem;color:var(--home-muted);font-size:.78rem}.resource-manage-message.is-error{color:#a32f22}.resource-manage-empty{padding:2rem 0;border-top:1px solid var(--home-rule);color:var(--home-muted);font-size:.82rem}@media(max-width:980px){.resource-admin-summary{grid-template-columns:4rem minmax(12rem,1fr) 4.5rem auto}.resource-admin-source,.resource-admin-featured{display:none}}@media(max-width:767px){.resource-manage-page>.site-nav{width:auto;margin-inline:1rem;padding-top:2.5rem}.resource-manage-main{padding-inline:1rem}.resource-manage-toolbar,.resource-manage-block-heading{align-items:start;flex-direction:column}.resource-create-header-actions{width:100%;justify-content:space-between}.resource-create-form,.resource-admin-form{grid-template-columns:1fr}.resource-create-form .is-wide,.resource-admin-form .is-wide,.resource-create-actions,.resource-edit-actions{grid-column:auto}.resource-status-tabs{width:100%}.resource-status-tabs button{flex:1 1 4rem}.resource-admin-summary{grid-template-columns:3.8rem minmax(0,1fr) auto;gap:.55rem}.resource-admin-status{grid-column:2}.resource-admin-actions{grid-column:1/-1;justify-content:flex-start}.resource-admin-title strong{white-space:normal}}@media(prefers-reduced-motion:reduce){*,*::before,*::after{scroll-behavior:auto!important;transition-duration:.01ms!important;animation-duration:.01ms!important}}
</style>

<style scoped>
.resource-admin-image-meta { display: grid; gap: .35rem; color: var(--home-muted); font-size: .68rem; }
.resource-manage-toolbar-link { display: inline-flex; min-height: 44px; align-items: center; padding: .4rem .75rem; border: 1px solid var(--home-ink); color: var(--home-ink); font-size: .75rem; text-decoration: none; }
.resource-admin-form label small { color: var(--home-muted); font-weight: 400; }
</style>

<style scoped>
@media (max-width: 767px) {
  .resource-admin-summary {
    grid-template-columns: 3.8rem minmax(0, 1fr) minmax(4.25rem, auto);
    align-items: start;
  }

  .resource-admin-actions {
    grid-column: 3;
    grid-row: 1 / span 3;
    flex-direction: column;
    align-items: stretch;
    justify-content: start;
  }

  .resource-admin-actions button {
    width: 100%;
    white-space: nowrap;
  }
}
</style>
