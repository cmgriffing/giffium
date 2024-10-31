import { createResource, Show } from 'solid-js'
import Editor from '~/components/Editor'
import { authFetch } from '~/lib/utils'
import { Snippet } from '~/types'

export default function ViewSnippet({ params }: { params: { snippetId: string } }) {
  const [snippet] = createResource<Snippet>(async () => {
    const response = await authFetch(`/api/snippets/${params.snippetId}`)
    if (!response.ok) {
      return undefined
    }
    const data = await response.json()
    return data
  })

  return (
    <main class="text-center mx-auto text-gray-700  dark:text-gray-100 p-4 flex flex-col justify-center">
      <Show when={snippet()}>
        <Editor
          startCode={snippet()!.codeLeft}
          setStartCode={() => {}}
          endCode={snippet()!.codeRight}
          setEndCode={() => {}}
          snippetWidth={snippet()!.snippetWidth}
          setSnippetWidth={() => {}}
          yPadding={snippet()!.yPadding}
          setYPadding={() => {}}
          xPadding={snippet()!.xPadding}
          setXPadding={() => {}}
          shadowEnabled={snippet()!.shadowEnabled}
          setShadowEnabled={() => {}}
          shadowOffsetY={snippet()!.shadowOffsetY}
          setShadowOffsetY={() => {}}
          shadowBlur={snippet()!.shadowBlur}
          setShadowBlur={() => {}}
          shadowColor={snippet()!.shadowColor}
          setShadowColor={() => {}}
          shadowOpacity={snippet()!.shadowOpacity}
          setShadowOpacity={() => {}}
          bgColor={snippet()!.bgColor}
          setBgColor={() => {}}
          bgType={snippet()!.bgType}
          setBgType={() => {}}
          bgGradientColorStart={snippet()!.bgGradientColorStart}
          setBgGradientColorStart={() => {}}
          bgGradientColorEnd={snippet()!.bgGradientColorEnd}
          setBgGradientColorEnd={() => {}}
          bgGradientDirection={snippet()!.bgGradientDirection}
          setBgGradientDirection={() => {}}
          fontSize={snippet()!.fontSize}
          setFontSize={() => {}}
          fontFamily={snippet()!.fontFamily}
          setFontFamily={() => {}}
          language={snippet()!.language}
          setLanguage={() => {}}
          theme={snippet()!.theme}
          setTheme={() => {}}
          title={snippet()!.title}
        />
      </Show>
    </main>
  )
}
