import { Show, createEffect, createResource } from 'solid-js'

import Editor from '~/components/Editor'
import { setSnippetSettings } from '~/lib/editor-state'
import { authFetch } from '~/lib/utils'
import { Snippet, SnippetSettings } from '~/types'

function toSnippetSettings(snippet: Snippet): SnippetSettings {
  const { id, userId, createdAt, updatedAt, ...settings } = snippet
  return settings
}

export default function ViewSnippet({ params }: { params: { snippetId: string } }) {
  const [snippet] = createResource<Snippet>(async () => {
    const response = await authFetch(`/api/snippets/${params.snippetId}`)
    if (!response.ok) {
      return undefined
    }

    const data = await response.json()
    return data
  })

  createEffect(value => {
    const updatedSnippet = snippet()
    if (value !== updatedSnippet && updatedSnippet) {
      setSnippetSettings(toSnippetSettings(updatedSnippet))
    }
    return updatedSnippet
  })

  return (
    <main class="mx-auto text-gray-700  dark:text-gray-100 px-4 flex flex-col justify-center w-full flex-1 max-w-screen-2xl">
      <Show when={snippet()}>
        <Editor snippetId={params.snippetId} />
      </Show>
    </main>
  )
}
