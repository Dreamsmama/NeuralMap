import type { ExploreNode, NodeDetail } from '../types'

const API_BASE = '/api'

async function request<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`)
  }
  return res.json()
}

export async function expandNodes(params: {
  topic: string
  parentTitle?: string
  contextPath: string[]
}): Promise<ExploreNode[]> {
  const data = await request<{ nodes: ExploreNode[] }>('/explore/expand', {
    topic: params.topic,
    parent_title: params.parentTitle ?? null,
    context_path: params.contextPath,
  })
  return data.nodes
}

export async function getNodeDetail(params: {
  title: string
  description: string
  contextPath: string[]
}): Promise<NodeDetail> {
  const data = await request<{ detail: NodeDetail }>('/explore/detail', {
    title: params.title,
    description: params.description,
    context_path: params.contextPath,
  })
  return data.detail
}

export async function checkHealth(): Promise<{ ai_configured: boolean }> {
  const res = await fetch(`${API_BASE}/health`)
  return res.json()
}
