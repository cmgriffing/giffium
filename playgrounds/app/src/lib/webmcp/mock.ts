interface MockExecuteOptions {
  signal?: AbortSignal
}

type MockModelContext = WebMCP.ModelContext & {
  executeTool(
    tool: WebMCP.RegisteredTool | string,
    input: string | Record<string, unknown>,
    options?: MockExecuteOptions,
  ): Promise<string>
}

export function installMockModelContext() {
  if ('modelContext' in document) {
    return
  }

  const registrations = new Map<string, { tool: WebMCP.ModelContextTool; signal?: AbortSignal }>()

  const toRegisteredTool = (tool: WebMCP.ModelContextTool): WebMCP.RegisteredTool => ({
    name: tool.name,
    title: tool.title ?? tool.name,
    description: tool.description,
    inputSchema: tool.inputSchema ? JSON.parse(JSON.stringify(tool.inputSchema)) : undefined,
    annotations: tool.annotations ? { ...tool.annotations } : undefined,
    window: window,
    origin: window.location.origin,
  })

  const implementation: Omit<MockModelContext, keyof EventTarget> = {
    ontoolchange: null,
    async registerTool(tool, options) {
      registrations.set(tool.name, { tool, signal: options?.signal })
      options?.signal?.addEventListener('abort', () => {
        registrations.delete(tool.name)
      })
    },
    async getTools() {
      return Array.from(registrations.values()).map(({ tool }) => toRegisteredTool(tool))
    },
    async executeTool(toolOrName, input, options) {
      const name = typeof toolOrName === 'string' ? toolOrName : toolOrName.name
      const registration = registrations.get(name)
      if (!registration) {
        throw new Error(`[webmcp] Unknown tool: ${name}`)
      }

      const parsedInput: Record<string, unknown> =
        typeof input === 'string' ? (input.trim() === '' ? {} : JSON.parse(input)) : input ?? {}

      const executeOptions: WebMCP.ToolExecuteCallbackOptions = {
        signal: options?.signal ?? registration.signal ?? new AbortController().signal,
      }

      const result = await registration.tool.execute(parsedInput, executeOptions)
      return JSON.stringify(result)
    },
  }

  const modelContext = Object.assign(new EventTarget(), implementation) as MockModelContext

  ;(document as { modelContext?: unknown }).modelContext = modelContext

  console.info(
    '[webmcp] Dev mock ModelContext installed (no native WebMCP support detected). Test tools via document.modelContext.executeTool(name, JSON.stringify(input)).',
  )
}
