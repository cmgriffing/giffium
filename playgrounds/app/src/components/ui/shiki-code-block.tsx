import { createSignal, onMount, createEffect } from 'solid-js'
import { createHighlighter } from 'shiki'
import { autoload, hookClosingPairs, hookTab } from 'shikicode/plugins'
import { shikiCode } from 'shikicode'
import { cn } from '~/lib/utils'

interface CodeBlockProps {
  code: string
  lang: string
  theme: string
  class?: string
  onChange?: (value: string) => void
}

const CodeBlock = (props: CodeBlockProps) => {
  const [source, setSource] = createSignal(props.code)
  const [theme, setTheme] = createSignal(props.theme)
  const [lang, setLang] = createSignal(props.lang)

  let containerRef: HTMLDivElement | undefined
  let editor: any

  onMount(async () => {
    const highlighter = await createHighlighter({
      langs: [lang()],
      themes: [theme()]
    })
    editor = shikiCode()
      .withPlugins(
        hookClosingPairs(),
        hookTab,
        autoload
      )
      .create(containerRef!, highlighter, {
        value: source(), // Initial code value
        language: lang(),
        theme: theme()
      })

    editor.input.addEventListener('input', (e: Event) => {
      const value = (e.target as HTMLTextAreaElement).value
      setSource(value)
      props.onChange?.(value)
    })
  })

  createEffect(() => {
    const { code, theme: newTheme, lang: newLang } = props

    setSource(code)
    setTheme(newTheme)
    setLang(newLang)

    if (editor) {
      editor.updateOptions({
        theme: newTheme,
        language: newLang
      })
    }
  })

  return (
    <div
      ref={containerRef}
      class={cn("relative min-h-[400px] w-full h-full rounded overflow-hidden", props.class)}
    />
  )
}

export default CodeBlock
