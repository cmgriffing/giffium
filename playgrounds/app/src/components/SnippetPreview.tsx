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
      class="w-32 h-32 flex items-center justify-center  text-[6px]"
      style={{
        ...(props.snippet.bgType === 'linearGradient'
          ? {
              background: `linear-gradient(${props.snippet.bgGradientDirection}deg, ${props.snippet.bgGradientColorStart}, ${props.snippet.bgGradientColorEnd})`,
            }
          : {
              background: props.snippet.bgColor,
            }),
        // padding: `${props.snippet.yPadding}px ${props.snippet.xPadding}px`,
      }}
    >
      <div
        class="rounded"
        style={{
          'box-shadow': props.snippet.shadowEnabled
            ? `0 ${props.snippet.shadowOffsetY}px ${props.snippet.shadowBlur}px ${
                props.snippet.shadowColor
              }${(props.snippet.shadowOpacity * 255).toString(16)}`
            : 'none',
          'font-family': props.snippet.fontFamily,
        }}
      >
        <ShikiMagicMove
          class="p-2 shadow-xl rounded select-none overflow-hidden h-24 w-24 text-[6px]"
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
    </div>
  )
}
