import { isServer } from 'solid-js/web'

import { editorTools } from '~/lib/webmcp/tools'

function getModelContext(): WebMCP.ModelContext | undefined {
  if (isServer) {
    return undefined
  }
  return 'modelContext' in document ? document.modelContext : undefined
}

export async function registerEditorTools(): Promise<() => void> {
  if (isServer) {
    return () => {}
  }

  if (!getModelContext()) {
    if (!import.meta.env.DEV) {
      return () => {}
    }
    const { installMockModelContext } = await import('~/lib/webmcp/mock')
    installMockModelContext()
    if (!getModelContext()) {
      return () => {}
    }
  }

  const modelContext = getModelContext()!
  const controller = new AbortController()

  for (const tool of editorTools) {
    try {
      await modelContext.registerTool(tool, { signal: controller.signal })
    } catch (error) {
      console.error(`[webmcp] Failed to register tool "${tool.name}"`, error)
    }
  }

  return () => controller.abort()
}
