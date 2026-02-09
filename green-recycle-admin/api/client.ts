import { API_BASE } from '../constants'

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: any
  query?: Record<string, string | number | boolean | undefined | null>
}

const buildUrl = (path: string, query?: RequestOptions['query']) => {
  const url = new URL(`${API_BASE}${path}`)
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null) continue
      url.searchParams.set(k, String(v))
    }
  }
  return url.toString()
}

export const apiRequest = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const url = buildUrl(path, options.query)
  const headers = new Headers(options.headers)
  headers.set('Accept', 'application/json')

  // ⚠️4修复: 自动携带管理后台鉴权 token
  const token = localStorage.getItem('gr_admin_token')
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  let body: BodyInit | undefined = undefined
  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json')
    body = JSON.stringify(options.body)
  }

  const resp = await fetch(url, { ...options, headers, body })
  const contentType = resp.headers.get('content-type') || ''
  const isJson = contentType.toLowerCase().includes('application/json')
  const data = isJson ? await resp.json().catch(() => undefined) : await resp.text().catch(() => undefined)

  if (!resp.ok) {
    // ⚠️4修复: 401 时自动清除 token 并跳转登录
    if (resp.status === 401) {
      localStorage.removeItem('gr_admin_token')
      localStorage.removeItem('gr_admin_authed')
      window.location.reload()
    }
    const detail =
      typeof data === 'string'
        ? data
        : (data as any)?.detail || (data as any)?.message || JSON.stringify(data)
    throw new Error(detail || `HTTP ${resp.status}`)
  }

  return data as T
}

