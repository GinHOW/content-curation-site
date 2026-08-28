import { error } from './_utils.js'

const STATIC_ID_PATTERN = /^[a-z0-9][a-z0-9._-]{0,119}$/i

export function staticResourceOverride(row) {
  return {
    staticId: row.static_id,
    featuredOverride: row.featured_override === null || row.featured_override === undefined
      ? null
      : Boolean(row.featured_override),
    isHidden: Boolean(row.is_hidden),
    updatedAt: row.updated_at,
  }
}

export function cleanStaticResourceId(value) {
  const id = typeof value === 'string' ? value.trim() : ''
  return STATIC_ID_PATTERN.test(id) ? id : ''
}

export function staticOverrideError() {
  return error('静态资源标识无效', 400)
}
