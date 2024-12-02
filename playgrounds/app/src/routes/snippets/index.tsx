import { A } from '@solidjs/router'

import { Show, createResource } from 'solid-js'

import { bundledLanguages, bundledThemes, createHighlighter } from 'shiki'

import { SnippetPreview } from '~/components/SnippetPreview'
import { authFetch } from '~/lib/utils'
import { Snippet } from '~/types'

export default function Snippets() {
  const [snippets] = createResource<Snippet[]>(async () => {
    const response = await authFetch('/api/snippets')
    if (!response.ok) {
      return []
    }
    const data = await response.json()
    return data.snippets || []
  })

  const [highlighter] = createResource(async () => {
    const newHighlighter = await createHighlighter({
      themes: Object.keys(bundledThemes),
      langs: Object.keys(bundledLanguages),
    })

    return newHighlighter
  })

  return (
    <main class="text-center mx-auto text-gray-700  dark:text-gray-100 p-4 max-w-[480px] flex flex-col justify-center gap-16">
      <h2 class="text-4xl">Snippets</h2>
      <Show when={snippets.loading}>Loading...</Show>
      <Show when={snippets.error}>Error: {snippets.error.message}</Show>
      <Show when={Boolean(snippets.latest?.length) && highlighter()}>
        <div class="flex flex-wrap gap-4 items-center justify-center">
          {snippets.latest?.map(snippet => (
            <A href={`/snippets/${snippet.id}`} class="flex flex-col items-center justify-center">
              <SnippetPreview highlighter={highlighter()!} snippet={snippet} />
              <h4 class="ellipsis w-32 text-nowrap whitespace-nowrap mt-2">{snippet.title}</h4>
            </A>
          ))}
        </div>
      </Show>
      <Show when={!snippets.loading && !Boolean(snippets.latest?.length)}>
        <p>No snippets found</p>
      </Show>
    </main>
  )
}
