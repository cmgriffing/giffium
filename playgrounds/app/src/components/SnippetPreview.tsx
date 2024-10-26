import { Highlighter } from 'shiki'
import { ShikiMagicMove } from 'shiki-magic-move/solid'
import { Snippet } from '~/types'

interface SnippetPreviewProps {
  highlighter: Highlighter
  snippet: Snippet
}

export function SnippetPreview(props: SnippetPreviewProps) {
  return (
    <div
      class="w-32 h-32 flex items-center justify-center"
      style={{
        background: props.snippet.bgColor,
        // padding: `${props.snippet.yPadding}px ${props.snippet.xPadding}px`,
      }}
    >
      <ShikiMagicMove
        class="p-4 shadow-xl rounded select-none overflow-hidden h-24 w-24"
        highlighter={props.highlighter}
        lang={props.snippet.language}
        code={props.snippet.codeLeft}
        theme={props.snippet.theme}
        options={{
          duration: 800,
          stagger: 0,
          lineNumbers: false,
        }}
      />
    </div>
  )
}
