import { makePersisted } from '@solid-primitives/storage'

import { createSignal } from 'solid-js'
import { createStore } from 'solid-js/store'

import { MagicMoveElement } from 'shiki-magic-move/types'

import { generateGif } from '~/lib/gif'
import { SnippetSettings } from '~/types'

const defaultLeftCode = `
import { render } from "solid-js/web";

function Counter() {
  return <div>Count: 0</div>;
}

render(() => <Counter />, document.getElementById('app'));
`

const defaultRightCode = `
import { render } from "solid-js/web";
import { createSignal } from "solid-js";

function Counter() {
  const [count, setCount] = createSignal(0);
  setInterval(() => setCount(count() + 1), 1000);
  return <div>Count: {count()}</div>;
}

render(() => <Counter />, document.getElementById('app'));
`

export const [snippetSettings, setSnippetSettings] = makePersisted(
  createStore<SnippetSettings>({
    title: '',
    codeLeft: defaultLeftCode,
    codeRight: defaultRightCode,
    snippetWidth: 450,
    yPadding: 42,
    xPadding: 42,
    shadowEnabled: true,
    shadowOffsetY: 10,
    shadowBlur: 10,
    shadowColor: '#000000',
    shadowOpacity: 0.6,
    bgType: 'solid',
    bgGradientColorStart: '#a3d0ff',
    bgGradientColorEnd: '#fbc737',
    bgGradientDirection: 45,
    bgColor: '#a3d0ff',
    language: 'tsx',
    theme: 'nord',
    fontSize: 16,
    fontFamily: 'Fira Code',
  }),
  { name: 'snippetSettings' },
)

export const [selectedTab, setSelectedTab] = createSignal<'snippets' | 'output'>('snippets')
export const [magicMoveElements, setMagicMoveElements] = createSignal<MagicMoveElement[]>([])
export const [maxContainerDimensions, setMaxContainerDimensions] = createSignal<{
  width: number
  height: number
}>()
export const [hiddenCode, setHiddenCode] = createSignal(snippetSettings.codeLeft)
export const [isGenerating, setIsGenerating] = createSignal(false)
export const [gifDataUrl, setGifDataUrl] = createSignal('')
export const [isShowingGifDialog, setIsShowingGifDialog] = createSignal(false)

export interface SelectOption {
  label: string
  value: string
}

export const bgTypeOptions: SelectOption[] = [
  { label: 'Solid', value: 'solid' },
  { label: 'Linear Gradient', value: 'linearGradient' },
]

export const supportedFontFamilies: { name: string }[] = [
  { name: 'Comic Neue' },
  { name: 'Fira Code' },
  { name: 'IBM Plex Mono' },
  { name: 'Inconsolata' },
  { name: 'JetBrains Mono' },
  { name: 'Roboto Mono' },
  { name: 'Source Code Pro' },
]

export interface GenerationResult {
  ok: boolean
  status?: 'completed' | 'aborted'
  error?: string
  width?: number
  height?: number
}

function nextFrame() {
  return new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
}

function sleep(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms))
}

/**
 * The snippet fonts are loaded from Google Fonts with display=swap and are not
 * used until the output tab first renders. Generation that starts right after
 * the tab mounts would capture token positions with fallback font metrics while
 * the canvas draws with the loaded font, producing misplaced code chunks. Wait
 * (bounded) for the configured font before capturing.
 */
async function waitForFont(fontFamily: string, fontSize: number) {
  try {
    await Promise.race([document.fonts.load(`${fontSize}px "${fontFamily}"`), sleep(1500)])
  } catch {
    // Proceed with whatever font state is available.
  }
}

export async function runGeneration(signal?: AbortSignal): Promise<GenerationResult> {
  if (isGenerating()) {
    return {
      ok: false,
      error:
        'A GIF generation is already in progress. Wait for it to finish before generating again.',
    }
  }
  if (snippetSettings.codeLeft.trim() === '') {
    return {
      ok: false,
      error: 'The start code is empty. Set it with set_code (side: "start") before generating.',
    }
  }
  if (snippetSettings.codeRight.trim() === '') {
    return {
      ok: false,
      error: 'The end code is empty. Set it with set_code (side: "end") before generating.',
    }
  }

  setIsGenerating(true)
  setIsShowingGifDialog(true)

  try {
    if (selectedTab() !== 'output') {
      setSelectedTab('output')
    }
    await nextFrame()
    await waitForFont(snippetSettings.fontFamily, snippetSettings.fontSize)
    setHiddenCode(snippetSettings.codeRight)
    await sleep(100)

    const result = await generateGif({
      settings: snippetSettings,
      elements: magicMoveElements(),
      maxDimensions: maxContainerDimensions(),
      signal,
    })

    setGifDataUrl(result.dataUrl)
    return { ok: true, status: 'completed', width: result.width, height: result.height }
  } catch (error) {
    if (signal?.aborted) {
      return { ok: false, status: 'aborted', error: 'GIF generation was cancelled.' }
    }
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'GIF generation failed.',
    }
  } finally {
    setIsGenerating(false)
    setHiddenCode(snippetSettings.codeLeft)
  }
}
