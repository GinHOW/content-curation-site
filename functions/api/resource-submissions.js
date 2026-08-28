import { assertSameOrigin, error, getOptionalStudent, json } from './_utils.js'
import {
  newResourceId,
  parseResourceRequest,
  prepareResourceImage,
  rateLimitHash,
  validateResourcePayload,
} from './_resourceUtils.js'

const verifyTurnstile = async (request, env, token) => {
  if (env.TURNSTILE_SECRET_KEY === 'local-sim') return { configured: true, success: token === 'local-sim-turnstile' }
  if (!env.TURNSTILE_SECRET_KEY) return { configured: false }
  if (typeof token !== 'string' || !token || token.length > 2048) return { success: false }

  const form = new URLSearchParams({
    secret: env.TURNSTILE_SECRET_KEY,
    response: token,
  })
  const ip = request.headers.get('CF-Connecting-IP')
  if (ip) form.set('remoteip', ip)
  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form,
    })
    const payload = await response.json()
    const hostname = new URL(request.url).hostname
    return {
      success: Boolean(payload?.success)
        && payload.action === 'resource_submission'
        && payload.hostname === hostname,
    }
  } catch (cause) {
    console.error('turnstile verification failed', cause)
    return { success: false, unavailable: true }
  }
}

export async function onRequestPost(context) {
  const { request, env } = context
  if (!env.DB) return error('D1 数据库尚未绑定', 503)
  if (!assertSameOrigin(request)) return error('来源校验失败', 403)
  const contentLength = Number(request.headers.get('Content-Length') || 0)
  if (contentLength > 1024 * 1024 + 20000) return error('提交内容过大，请重新选择图片', 413)

  const { body, imageFile } = await parseResourceRequest(request)
  const validated = validateResourcePayload(body)
  if (validated.error) return validated.error

  const turnstile = await verifyTurnstile(request, env, body?.turnstileToken)
  if (!turnstile.configured) return error('投稿验证尚未配置，请稍后再试', 503)
  if (!turnstile.success) return error(turnstile.unavailable ? '投稿验证暂时不可用，请稍后重试' : '请先完成安全验证', 400)

  const student = await getOptionalStudent(request, env)
  const value = validated.value
  const submitterName = student?.displayName || value.submitterName
  const submissionSource = student ? 'student' : 'visitor'
  const sourceIpHash = await rateLimitHash(request, env)
  const recent = await env.DB.prepare(
    `SELECT COUNT(*) AS count FROM resource_submissions WHERE source_ip_hash = ? AND created_at > datetime('now', '-1 hour')`,
  ).bind(sourceIpHash).first()
  if (Number(recent?.count || 0) >= 10) return error('投稿次数过多，请一小时后再试', 429)

  const duplicate = await env.DB.prepare(
    `SELECT id FROM resource_submissions WHERE normalized_url = ? AND status IN ('pending', 'approved') LIMIT 1`,
  ).bind(value.normalizedUrl).first()
  if (duplicate) return error('这条链接已经在资源审核队列或资源库中', 409)

  const id = newResourceId()
  const image = await prepareResourceImage(imageFile, env, id, {
    imageWidth: body?.imageWidth,
    imageHeight: body?.imageHeight,
    imageOriginalBytes: body?.imageOriginalBytes,
    imageOriginalName: body?.imageOriginalName,
  })
  if (image.error) return image.error
  try {
    await env.DB.prepare(`
      INSERT INTO resource_submissions (
        id, type, resource_category, title, url, normalized_url, content_overview, tags_json,
        image_key, image_content_type, submitter_name, submission_source, status, source_ip_hash
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
    `).bind(
      id,
      value.type,
      null,
      value.title,
      value.url,
      value.normalizedUrl,
      value.contentOverview,
      JSON.stringify(value.tags),
      image.value?.key || null,
      image.value?.contentType || null,
      submitterName || null,
      submissionSource,
      sourceIpHash,
    ).run()
  } catch (cause) {
    if (image.value?.key) await env.RESOURCE_IMAGES.delete(image.value.key).catch(() => {})
    if (String(cause?.message || cause).includes('UNIQUE')) return error('这条链接已经在资源审核队列或资源库中', 409)
    console.error('resource submission failed', cause)
    return error('资源提交失败，请稍后重试', 503)
  }

  return json({ submission: { id, status: 'pending' } }, 201)
}
