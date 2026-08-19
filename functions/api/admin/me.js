import { error, json, requireAdmin } from '../_utils.js'

export async function onRequestGet(context) {
  const auth = await requireAdmin(context.request, context.env)
  if (auth.response) return auth.response
  return json({ authenticated: true })
}
