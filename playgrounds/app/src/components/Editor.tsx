import { interpolate, interpolateColors, Easing } from 'remotion'
import { encode } from 'modern-gif'
import workerUrl from 'modern-gif/worker?url'
import 'shiki-magic-move/dist/style.css'
import {
  ComboboxItem,
  ComboboxItemLabel,
  ComboboxItemIndicator,
  ComboboxControl,
  ComboboxInput,
  ComboboxTrigger,
  ComboboxContent,
  Combobox,
} from '~/components/ui/combobox'
import { Button } from '~/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { TextField, TextFieldInput } from '~/components/ui/text-field'
import { MagicMoveElement } from 'shiki-magic-move/types'
import {
  Slider,
  SliderFill,
  SliderLabel,
  SliderThumb,
  SliderTrack,
  SliderValueLabel,
} from '~/components/ui/slider'
import clsx from 'clsx'
import { Checkbox } from '~/components/ui/checkbox'
import { Label } from '~/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import {
  createEffect,
  createMemo,
  createResource,
  createSignal,
  onCleanup,
  Setter,
  Show,
  onMount,
} from 'solid-js'
import type { HighlighterGeneric } from 'shiki'
import { createHighlighter, bundledThemes, bundledLanguages } from 'shiki'
import { ShikiMagicMove } from 'shiki-magic-move/solid'
import { AnimationFrameConfig, SnippetSettings } from '~/types'
import { authFetch } from '~/lib/utils'
import { useNavigate } from '@solidjs/router'
import { authToken } from '~/lib/store'
import { toast } from 'solid-sonner'
import { Separator } from './ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { ShikiCodeBlock } from './ShikiCodeBlock'
import { SetStoreFunction } from 'solid-js/store'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'
import coreURL from '@ffmpeg/core?url'
import wasmURL from '@ffmpeg/core/wasm?url'
import { openDB } from 'idb'
import { ProgressCircle } from './ui/progress-circle'
import { Collapsible, CollapsibleContent } from './ui/collapsible'
import { FaSolidCaretDown, FaSolidCaretUp } from 'solid-icons/fa'
import { HiOutlineCog } from 'solid-icons/hi'

const animationSeconds = 1
const animationFPS = 30
const animationFrames = animationSeconds * animationFPS

const supportedFontFamilies: { name: string }[] = [
  { name: 'Comic Neue' },
  { name: 'Fira Code' },
  { name: 'IBM Plex Mono' },
  { name: 'Inconsolata' },
  { name: 'JetBrains Mono' },
  { name: 'Roboto Mono' },
  { name: 'Source Code Pro' },
]

interface SelectOption {
  label: string
  value: string
}

const bgTypeOptions: SelectOption[] = [
  { label: 'Solid', value: 'solid' },
  { label: 'Linear Gradient', value: 'linearGradient' },
]

interface EditorProps {
  snippetId?: string
  snippetSettings: SnippetSettings
  setSnippetSettings: SetStoreFunction<SnippetSettings>
}

export default function Editor(props: EditorProps) {
  const navigate = useNavigate()
  const [selectedTab, setSelectedTab] = createSignal<'snippets' | 'output'>('snippets')
  const [toggled, setToggled] = createSignal(false)

  const [magicMoveElements, setMagicMoveElements] = createSignal<MagicMoveElement[]>([])
  const [maxContainerDimensions, setMaxContainerDimensions] = createSignal<{
    width: number
    height: number
  }>()
  const [code, setCode] = createSignal(props.snippetSettings.codeLeft)
  const [hiddenCode, setHiddenCode] = createSignal(props.snippetSettings.codeLeft)
  const [isResizing, setIsResizing] = createSignal(false)
  const [isLooping, setIsLooping] = createSignal(true)
  const [isGenerating, setIsGenerating] = createSignal(false)
  const [gifDataUrl, setGifDataUrl] = createSignal('')
  const [isShowingGifDialog, setIsShowingGifDialog] = createSignal(false)
  const [title, setTitle] = createSignal(props.snippetSettings.title)
  const [isSaving, setIsSaving] = createSignal(false)
  const [highlighter, setHighlighter] = createSignal<HighlighterGeneric<any, any> | undefined>()

  const [isShowingFfmpegDialog, setIsShowingFfmpegDialog] = createSignal(false)
  const [ffmpegLoaded, setFfmpegLoaded] = createSignal(false)
  const [isDownloadingFfmpeg, setIsDownloadingFfmpeg] = createSignal(false)
  const [isGeneratingVideo, setIsGeneratingVideo] = createSignal(false)
  const [videoProgress, setVideoProgress] = createSignal(0)
  const ffmpeg = new FFmpeg()
  const [settingsCollapsed, setSettingsCollapsed] = createSignal(false)

  onMount(() => {
    if (document.body.clientWidth < 768) {
      setSettingsCollapsed(true)
    }
  })

  createEffect(() => {
    createHighlighter({
      themes: [props.snippetSettings.theme],
      langs: [props.snippetSettings.language],
    }).then(newHighlighter => {
      setHighlighter(newHighlighter)
    })
  })

  createEffect(() => {
    setCode(props.snippetSettings.codeLeft)
    setHiddenCode(props.snippetSettings.codeLeft)
  })

  const intervalId = setInterval(() => {
    if (
      selectedTab() === 'output' &&
      props.snippetSettings.codeLeft !== '' &&
      props.snippetSettings.codeRight !== '' &&
      !isResizing() &&
      !isShowingGifDialog() &&
      !isShowingFfmpegDialog() &&
      isLooping()
    ) {
      if (toggled()) {
        setCode(props.snippetSettings.codeLeft)
      } else {
        setCode(props.snippetSettings.codeRight)
      }
      setToggled(!toggled())
    }
  }, 3000)

  onCleanup(() => {
    clearInterval(intervalId)
  })

  document.body.addEventListener('mousemove', e => {
    if (isResizing()) {
      const deltaX = e.movementX
      props.setSnippetSettings('snippetWidth', props.snippetSettings.snippetWidth + deltaX)
    }
  })

  document.body.addEventListener('mouseup', e => {
    if (isResizing()) {
      setIsResizing(false)
    }
  })

  const generateGifDataUrl = createMemo(() => {
    return async function () {
      const container = document.querySelector('.shiki-magic-move-container') as HTMLPreElement

      const canvasFrames: ImageData[] = []
      const backgroundColor = container.style.backgroundColor

      let fontSize = ''
      let fontFamily = ''

      magicMoveElements().some(el => {
        const computedStyle = window.getComputedStyle(el.el)
        fontSize = computedStyle.getPropertyValue('font-size')
        fontFamily = computedStyle.getPropertyValue('font-family')

        return fontSize && fontFamily
      })

      const pauseFrameLength = 60

      const wrappedCreateAnimationFrame = async (frame: number) => {
        return createAnimationFrame(
          magicMoveElements(),
          frame,
          maxContainerDimensions()?.width || 100,
          maxContainerDimensions()?.height || 100,
          {
            layout: {
              yPadding: props.snippetSettings.yPadding,
              xPadding: props.snippetSettings.xPadding,
            },
            shadow: {
              shadowEnabled: props.snippetSettings.shadowEnabled,
              shadowOffsetY: props.snippetSettings.shadowOffsetY,
              shadowBlur: props.snippetSettings.shadowBlur,
              shadowColor: props.snippetSettings.shadowColor,
              shadowOpacity: props.snippetSettings.shadowOpacity,
            },
            styling: {
              fontSize,
              fontFamily,
              snippetBackgroundColor: backgroundColor,
              backgroundColor: props.snippetSettings.bgColor,
              backgroundType: props.snippetSettings.bgType,
              backgroundGradientColorStart: props.snippetSettings.bgGradientColorStart,
              backgroundGradientColorEnd: props.snippetSettings.bgGradientColorEnd,
              backgroundGradientDirection: props.snippetSettings.bgGradientDirection,
              lineNumberColor: props.snippetSettings.lineNumberColor,
            },
          },
        )
      }

      const firstFrameCanvas = await wrappedCreateAnimationFrame(0)
      for (let frame = 0; frame < pauseFrameLength; frame++) {
        canvasFrames.push(firstFrameCanvas)
      }

      const middleFrameNumbers = []

      for (let i = 0; i < animationFrames; i++) {
        middleFrameNumbers.push(i)
      }

      let middleFrames = []
      for (let frame = 0; frame < middleFrameNumbers.length; frame++) {
        const canvas = await wrappedCreateAnimationFrame(middleFrameNumbers[frame])
        middleFrames.push(canvas)
      }
      canvasFrames.push(...middleFrames)

      const lastFrameCanvas = await wrappedCreateAnimationFrame(animationFrames)
      for (let frame = 0; frame < pauseFrameLength; frame++) {
        canvasFrames.push(lastFrameCanvas)
      }

      canvasFrames.push(...middleFrames.toReversed())

      const blob = await encode({
        workerUrl,
        format: 'blob',
        width: canvasFrames[0].width,
        height: canvasFrames[0].height,
        frames: canvasFrames.map(el => ({
          data: el.data.buffer,
          delay: (animationSeconds * 1000) / animationFPS,
        })),
      })

      const dataUrl = await blobToDataURL(blob)

      return dataUrl?.toString() || ''
    }
  })

  return (
    <>
      <div class="flex flex-col md:flex-row min-h-full min-w-full md:gap-4">
        <div class=" w-[calc(100vw-2rem)] md:w-[280px] md:min-w-[280px] h-full bg-gray flex flex-col md:max-h-[calc(100vh-82px)] overflow-scroll md:px-4 md:pb-8">
          <Button
            class="md:hidden mb-2 flex gap-2"
            onClick={() => setSettingsCollapsed(!settingsCollapsed())}
          >
            <HiOutlineCog size={24} />
            Settings
            <Show when={settingsCollapsed()} fallback={<FaSolidCaretUp size={16} />}>
              <FaSolidCaretDown size={16} />
            </Show>
          </Button>
          <Collapsible open={!settingsCollapsed()}>
            <CollapsibleContent title="Snippet Settings" class="collapsible__content">
              <div class="pb-4">
                <Label for="theme-selector">Theme</Label>
                <Combobox
                  id="theme-selector"
                  value={props.snippetSettings.theme}
                  options={Object.keys(bundledThemes)}
                  onChange={newTheme => props.setSnippetSettings('theme', newTheme || '')}
                  placeholder="Search a theme..."
                  itemComponent={props => (
                    <ComboboxItem item={props.item}>
                      <ComboboxItemLabel>{props.item.rawValue}</ComboboxItemLabel>
                      <ComboboxItemIndicator />
                    </ComboboxItem>
                  )}
                >
                  <ComboboxControl aria-label="Theme" class="bg-white">
                    <ComboboxInput />
                    <ComboboxTrigger />
                  </ComboboxControl>
                  <ComboboxContent style={{ 'max-height': '200px', overflow: 'auto' }} />
                </Combobox>
              </div>

              <div class="pb-4">
                <Label for="language-selector">Language</Label>
                <Combobox
                  id="language-selector"
                  value={props.snippetSettings.language}
                  options={Object.keys(bundledLanguages)}
                  onChange={newLanguage => props.setSnippetSettings('language', newLanguage || '')}
                  placeholder="Search a Language..."
                  itemComponent={props => (
                    <ComboboxItem item={props.item}>
                      <ComboboxItemLabel>{props.item.rawValue}</ComboboxItemLabel>
                      <ComboboxItemIndicator />
                    </ComboboxItem>
                  )}
                >
                  <ComboboxControl aria-label="Language" class="bg-white">
                    <ComboboxInput />
                    <ComboboxTrigger />
                  </ComboboxControl>
                  <ComboboxContent style={{ 'max-height': '200px', overflow: 'auto' }} />
                </Combobox>
              </div>

              <Separator />

              <Accordion
                multiple={true}
                collapsible
                defaultValue={['background', 'layout', 'shadow', 'font']}
              >
                <AccordionItem value="background">
                  <AccordionTrigger>Line Numbers</AccordionTrigger>
                  <AccordionContent>
                    <div class="flex flex-col gap-4">
                      <div class="flex flex-row items-center justify-between">
                        <Label
                          for="line-numbers-checkbox"
                          onClick={() =>
                            props.setSnippetSettings(
                              'lineNumbersEnabled',
                              !props.snippetSettings.lineNumbersEnabled,
                            )
                          }
                        >
                          Show Line Numbers
                        </Label>
                        <Checkbox
                          id="line-numbers-checkbox"
                          checked={props.snippetSettings.lineNumbersEnabled}
                          onChange={() => {
                            props.setSnippetSettings(
                              'lineNumbersEnabled',
                              !props.snippetSettings.lineNumbersEnabled,
                            )
                          }}
                        />
                      </div>
                      <div class="flex flex-row items-center justify-between">
                        <Label for="line-number-color" class="font-normal">
                          Color
                        </Label>
                        <input
                          id="line-number-color"
                          class="h-6 w-6 rounded"
                          type="color"
                          value={props.snippetSettings.lineNumberColor}
                          onInput={e => {
                            props.setSnippetSettings('lineNumberColor', e.target.value)
                          }}
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="background">
                  <AccordionTrigger>Background</AccordionTrigger>
                  <AccordionContent>
                    <div class="flex flex-col gap-4">
                      <div>
                        <Label for="bg-type" class="font-normal text-sm">
                          Type
                        </Label>

                        <Select<SelectOption>
                          id="bg-type"
                          value={bgTypeOptions.find(
                            option => option.value === props.snippetSettings.bgType,
                          )}
                          optionValue="value"
                          optionTextValue="label"
                          onChange={newType =>
                            newType &&
                            props.setSnippetSettings(
                              'bgType',
                              newType.value as 'solid' | 'linearGradient',
                            )
                          }
                          options={bgTypeOptions}
                          itemComponent={props => (
                            <SelectItem item={props.item}>{props.item.rawValue.label}</SelectItem>
                          )}
                        >
                          <SelectTrigger
                            aria-label="BG Type"
                            class="w-full"
                            value={props.snippetSettings.bgType}
                          >
                            <SelectValue<{ label: string; value: string }>>
                              {state => state.selectedOption()?.label}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent />
                        </Select>
                      </div>

                      {props.snippetSettings.bgType === 'linearGradient' && (
                        <>
                          <div class="flex flex-row items-center justify-between">
                            <Label for="bg-color-input-grad-start" class="font-normal">
                              Color Start
                            </Label>
                            <input
                              id="bg-color-input-grad-start"
                              class="h-6 w-6 rounded"
                              type="color"
                              value={props.snippetSettings.bgGradientColorStart}
                              onInput={e => {
                                props.setSnippetSettings('bgGradientColorStart', e.target.value)
                              }}
                            />
                          </div>
                          <div class="flex flex-row items-center justify-between">
                            <Label for="bg-color-input-grad-end" class="font-normal">
                              Color End
                            </Label>
                            <input
                              id="bg-color-input-grad-end"
                              class="h-6 w-6 rounded"
                              type="color"
                              value={props.snippetSettings.bgGradientColorEnd}
                              onInput={e => {
                                props.setSnippetSettings('bgGradientColorEnd', e.target.value)
                              }}
                            />
                          </div>
                          <Slider
                            value={[props.snippetSettings.bgGradientDirection]}
                            minValue={0}
                            maxValue={359}
                            onChange={e => {
                              props.setSnippetSettings('bgGradientDirection', e[0])
                            }}
                          >
                            <div class="flex justify-between items-center w-full">
                              <SliderLabel>Direction</SliderLabel>

                              <div class="flex flex-row">
                                <SliderValueLabel />
                                <span class="text-xs">deg</span>
                              </div>
                            </div>
                            <SliderTrack class="my-2">
                              <SliderFill />
                              <SliderThumb />
                            </SliderTrack>
                          </Slider>
                        </>
                      )}
                      {props.snippetSettings.bgType === 'solid' && (
                        <div class="flex flex-row items-center justify-between">
                          <Label for="bg-color-input" class="font-normal">
                            Background Color
                          </Label>
                          <input
                            id="bg-color-input"
                            class="h-6 w-6 rounded"
                            type="color"
                            value={props.snippetSettings.bgColor}
                            onInput={e => {
                              props.setSnippetSettings('bgColor', e.target.value)
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="layout">
                  <AccordionTrigger>Layout</AccordionTrigger>
                  <AccordionContent>
                    <div class="flex flex-col gap-4">
                      <Slider
                        value={[props.snippetSettings.snippetWidth]}
                        minValue={0}
                        maxValue={1500}
                        onChange={e => {
                          props.setSnippetSettings('snippetWidth', e[0])
                        }}
                      >
                        <div class="flex w-full justify-between mb-2">
                          <SliderLabel>Width</SliderLabel>
                          <div class="flex flex-row">
                            <SliderValueLabel />
                            <span class="text-xs">px</span>
                          </div>
                        </div>
                        <SliderTrack>
                          <SliderFill />
                          <SliderThumb />
                        </SliderTrack>
                      </Slider>

                      <Slider
                        value={[props.snippetSettings.yPadding]}
                        minValue={0}
                        maxValue={200}
                        onChange={e => {
                          props.setSnippetSettings('yPadding', e[0])
                        }}
                      >
                        <div class="flex w-full justify-between mb-2">
                          <SliderLabel>Padding (y)</SliderLabel>
                          <div class="flex flex-row">
                            <SliderValueLabel />
                            <span class="text-xs">px</span>
                          </div>
                        </div>
                        <SliderTrack>
                          <SliderFill />
                          <SliderThumb />
                        </SliderTrack>
                      </Slider>

                      <Slider
                        value={[props.snippetSettings.xPadding]}
                        minValue={0}
                        maxValue={200}
                        onChange={e => {
                          props.setSnippetSettings('xPadding', e[0])
                        }}
                      >
                        <div class="flex w-full justify-between mb-2">
                          <SliderLabel>Padding (x)</SliderLabel>
                          <div class="flex flex-row">
                            <SliderValueLabel />
                            <span class="text-xs">px</span>
                          </div>
                        </div>
                        <SliderTrack>
                          <SliderFill />
                          <SliderThumb />
                        </SliderTrack>
                      </Slider>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="shadow">
                  <AccordionTrigger>Shadow</AccordionTrigger>
                  <AccordionContent>
                    <div class="flex flex-col gap-4">
                      <div class="flex flex-row items-center justify-between">
                        <Label
                          for="shadow-checkbox"
                          onClick={() =>
                            props.setSnippetSettings(
                              'shadowEnabled',
                              !props.snippetSettings.shadowEnabled,
                            )
                          }
                        >
                          Show Shadow
                        </Label>
                        <Checkbox
                          id="shadow-checkbox"
                          checked={props.snippetSettings.shadowEnabled}
                          onChange={() => {
                            props.setSnippetSettings(
                              'shadowEnabled',
                              !props.snippetSettings.shadowEnabled,
                            )
                          }}
                        />
                      </div>
                      //
                      <div class="flex flex-row items-center justify-between">
                        <Label for="shadow-color-input" class="font-normal">
                          Color
                        </Label>

                        <input
                          id="shadow-color-input"
                          class="h-6 w-6 rounded"
                          type="color"
                          value={props.snippetSettings.shadowColor}
                          onInput={e => props.setSnippetSettings('shadowColor', e.target.value)}
                        />
                      </div>
                      <div class="flex flex-row items-center justify-between">
                        <Slider
                          value={[props.snippetSettings.shadowOpacity]}
                          step={0.01}
                          minValue={0}
                          maxValue={1}
                          onChange={e => {
                            props.setSnippetSettings('shadowOpacity', e[0])
                          }}
                        >
                          <div class="flex w-full justify-between mb-2">
                            <SliderLabel>Opacity</SliderLabel>
                            <SliderValueLabel />
                          </div>
                          <SliderTrack>
                            <SliderFill />
                            <SliderThumb />
                          </SliderTrack>
                        </Slider>
                      </div>
                      <div>
                        <Slider
                          value={[props.snippetSettings.shadowOffsetY]}
                          minValue={0}
                          maxValue={props.snippetSettings.yPadding}
                          onChange={e => {
                            props.setSnippetSettings('shadowOffsetY', e[0])
                          }}
                        >
                          <div class="flex w-full justify-between mb-2">
                            <SliderLabel>Offset Y</SliderLabel>
                            <div class="flex flex-row">
                              <SliderValueLabel />
                              <span class="text-xs">px</span>
                            </div>
                          </div>
                          <SliderTrack>
                            <SliderFill />
                            <SliderThumb />
                          </SliderTrack>
                        </Slider>
                      </div>
                      <div>
                        <Slider
                          value={[props.snippetSettings.shadowBlur]}
                          minValue={0}
                          maxValue={200}
                          onChange={e => {
                            props.setSnippetSettings('shadowBlur', e[0])
                          }}
                        >
                          <div class="flex w-full justify-between mb-2">
                            <SliderLabel>Blur</SliderLabel>
                            <div class="flex flex-row">
                              <SliderValueLabel />
                              <span class="text-xs">px</span>
                            </div>
                          </div>
                          <SliderTrack>
                            <SliderFill />
                            <SliderThumb />
                          </SliderTrack>
                        </Slider>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="font">
                  <AccordionTrigger>Font</AccordionTrigger>
                  <AccordionContent>
                    <div class="flex flex-col gap-4">
                      <div>
                        <Label for="font-family">Family</Label>

                        <Select<{ name: string }>
                          id="font-family"
                          value={supportedFontFamilies.find(
                            option => option.name === props.snippetSettings.fontFamily,
                          )}
                          optionValue="name"
                          optionTextValue="name"
                          onChange={newFamily =>
                            newFamily && props.setSnippetSettings('fontFamily', newFamily.name)
                          }
                          options={supportedFontFamilies}
                          itemComponent={props => (
                            <SelectItem item={props.item}>{props.item.rawValue.name}</SelectItem>
                          )}
                        >
                          <SelectTrigger
                            aria-label="Font Family"
                            class="w-full"
                            value={props.snippetSettings.fontFamily}
                          >
                            <SelectValue<{ name: string }>>
                              {state => state.selectedOption()?.name}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent />
                        </Select>
                      </div>

                      <Slider
                        value={[props.snippetSettings.fontSize]}
                        minValue={1}
                        maxValue={64}
                        onChange={e => {
                          props.setSnippetSettings('fontSize', e[0])
                        }}
                      >
                        <div class="flex w-full justify-between mb-2">
                          <SliderLabel>Size</SliderLabel>
                          <div class="flex flex-row">
                            <SliderValueLabel />
                            <span class="text-xs">px</span>
                          </div>
                        </div>
                        <SliderTrack>
                          <SliderFill />
                          <SliderThumb />
                        </SliderTrack>
                      </Slider>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CollapsibleContent>
          </Collapsible>
        </div>
        <div class="w-full h-full min-h-full">
          <Tabs
            defaultValue="snippets"
            class="w-full"
            value={selectedTab()}
            onChange={setSelectedTab}
          >
            <TabsList class="grid w-full grid-cols-2">
              <TabsTrigger value="snippets">Step 1: Snippets</TabsTrigger>
              <TabsTrigger value="output">Step 2: Output</TabsTrigger>
            </TabsList>
            <TabsContent value="snippets">
              <div class="flex flex-row p-2 gap-2 dark:bg-[#27272a] bg-gray-100 rounded-t justify-between">
                <div class="flex flex-row gap-2 items-center">
                  <div class="">Enter the code snippets you would like to diff</div>
                </div>
                <div class="flex flex-row gap-2">
                  <Button
                    onClick={() => {
                      setSelectedTab('output')
                    }}
                    disabled={
                      props.snippetSettings.codeLeft === '' ||
                      props.snippetSettings.codeRight === ''
                    }
                  >
                    Next
                  </Button>
                </div>
              </div>

              <div class="dark:bg-[#27272a] bg-gray-100 p-2 rounded-b flex flex-row flex-wrap md:flex-nowrap gap-2">
                <div class="flex flex-col w-full md:w-1/2 gap-1">
                  <p class="w-full text-sm">Start Code</p>
                  <ShikiCodeBlock
                    code={props.snippetSettings.codeLeft}
                    lang={props.snippetSettings.language}
                    theme={props.snippetSettings.theme}
                    class="min-h-[400px]"
                    onChange={newCodeLeft => props.setSnippetSettings('codeLeft', newCodeLeft)}
                  />
                </div>
                <div class="flex flex-col w-full md:w-1/2 gap-1">
                  <p class="w-full text-sm">End Code</p>
                  <ShikiCodeBlock
                    code={props.snippetSettings.codeRight}
                    lang={props.snippetSettings.language}
                    theme={props.snippetSettings.theme}
                    class="min-h-[400px]"
                    onChange={newEndCode => props.setSnippetSettings('codeRight', newEndCode)}
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="output">
              <div
                class="flex flex-row p-2 gap-2 dark:bg-[#27272a] bg-gray-100 rounded-t justify-between"
                id="toolbar"
              >
                <div class="flex flex-row gap-2" id="toolbar-left"></div>
                <div class="flex flex-row gap-2" id="toolbar-right">
                  <Button
                    disabled={isGenerating()}
                    onClick={async () => {
                      setIsGenerating(true)
                      setHiddenCode(props.snippetSettings.codeRight)
                      setIsShowingGifDialog(true)
                      setTimeout(async () => {
                        const dataUrl = await generateGifDataUrl()()
                        setGifDataUrl(dataUrl)
                        setIsGenerating(false)
                        setHiddenCode(props.snippetSettings.codeLeft)
                      }, 100)
                    }}
                  >
                    Generate
                  </Button>
                </div>
              </div>

              <div
                id="preview-wrapper"
                class="dark:bg-[#27272a] bg-gray-100 p-2 rounded-b"
                style={{
                  'min-height': `${(maxContainerDimensions()?.height || 100) + 40}px`,
                }}
              >
                <p class="text-center">Preview</p>
                <div id="snippet-wrapper" class="flex flex-row items-center justify-center">
                  <div
                    id="styled-snippet"
                    class="flex flex-row items-center justify-center overflow-hidden"
                    style={{
                      ...(props.snippetSettings.bgType === 'linearGradient'
                        ? {
                            background: `linear-gradient(${props.snippetSettings.bgGradientDirection}deg, ${props.snippetSettings.bgGradientColorStart}, ${props.snippetSettings.bgGradientColorEnd})`,
                          }
                        : {
                            background: props.snippetSettings.bgColor,
                          }),
                      padding: `${props.snippetSettings.yPadding}px ${props.snippetSettings.xPadding}px`,
                    }}
                  >
                    <div class="flex flex-row items-center justify-center relative margin-auto w-fit">
                      <Show when={highlighter()}>
                        {highlighter => (
                          <>
                            <div
                              class="rounded"
                              style={{
                                width: `${props.snippetSettings.snippetWidth}px`,
                                'overflow-x': 'hidden',
                                'box-shadow': props.snippetSettings.shadowEnabled
                                  ? `0 ${props.snippetSettings.shadowOffsetY}px ${
                                      props.snippetSettings.shadowBlur
                                    }px ${props.snippetSettings.shadowColor}${(
                                      props.snippetSettings.shadowOpacity * 255
                                    ).toString(16)}`
                                  : 'none',
                                'font-family': props.snippetSettings.fontFamily,
                                'font-size': `${props.snippetSettings.fontSize}px`,
                              }}
                            >
                              <ShikiMagicMove
                                lang={props.snippetSettings.language}
                                theme={props.snippetSettings.theme}
                                class="p-4 shadow-xl rounded select-none overflow-hidden"
                                highlighter={highlighter()}
                                code={code()}
                                options={{
                                  duration: 800,
                                  stagger: 0,
                                  lineNumbers: props.snippetSettings.lineNumbersEnabled,
                                }}
                              />
                              {/* The hidden shiki that we use to generate the magic move elements */}
                              <div
                                aria-hidden="true"
                                class=" absolute top-[-20000px] left-[-20000px]"
                                style={{
                                  width: `${props.snippetSettings.snippetWidth}px`,
                                }}
                              >
                                <ShikiMagicMove
                                  lang={props.snippetSettings.language}
                                  theme={props.snippetSettings.theme}
                                  class="p-4 shadow-xl rounded select-none overflow-hidden"
                                  highlighter={highlighter()}
                                  code={hiddenCode()}
                                  options={{
                                    duration: 800,
                                    stagger: 0,
                                    lineNumbers: props.snippetSettings.lineNumbersEnabled,
                                    onAnimationStart: async (elements, maxContainerDimensions) => {
                                      if (elements.length === 0) {
                                        return
                                      }

                                      setMagicMoveElements(elements)
                                      setMaxContainerDimensions(maxContainerDimensions)
                                    },
                                  }}
                                />
                              </div>
                            </div>
                            <div
                              class={clsx(
                                'w-[8px] bg-slate-400 opacity-10 hover:opacity-60 rounded-r h-full absolute top-0 left-[calc(100%-8px)] bottom-0 transition-opacity',
                                {
                                  'opacity-60': isResizing(),
                                },
                              )}
                              style={{
                                cursor: isResizing() ? 'grabbing' : 'grab',
                              }}
                              onMouseDown={e => {
                                setIsResizing(true)
                              }}
                            ></div>
                          </>
                        )}
                      </Show>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* TODO: If the app grows, this logic should be surfaced to the top level route */}
          <Show when={Boolean(authToken())}>
            <div class="flex flex-row items-end justify-between dark:bg-[#27272a] bg-gray-100 rounded p-2 mt-2">
              <TextField>
                <TextFieldInput
                  type="text"
                  class="bg-white text-black"
                  value={title()}
                  placeholder={'Snippet Title'}
                  aria-label="Snippet Title"
                  onInput={e => setTitle(e.currentTarget.value)}
                />
              </TextField>
              <Button
                disabled={
                  isSaving() ||
                  props.snippetSettings.codeLeft === '' ||
                  props.snippetSettings.codeRight === '' ||
                  !title()
                }
                onClick={async () => {
                  setIsSaving(true)
                  const body = JSON.stringify({
                    title: title(),
                    codeLeft: props.snippetSettings.codeLeft,
                    codeRight: props.snippetSettings.codeRight,
                    snippetWidth: props.snippetSettings.snippetWidth,
                    yPadding: props.snippetSettings.yPadding,
                    xPadding: props.snippetSettings.xPadding,
                    shadowEnabled: props.snippetSettings.shadowEnabled,
                    shadowOffsetY: props.snippetSettings.shadowOffsetY,
                    shadowBlur: props.snippetSettings.shadowBlur,
                    shadowColor: props.snippetSettings.shadowColor,
                    shadowOpacity: props.snippetSettings.shadowOpacity,
                    bgColor: props.snippetSettings.bgColor,
                    bgType: props.snippetSettings.bgType,
                    bgGradientColorStart: props.snippetSettings.bgGradientColorStart,
                    bgGradientColorEnd: props.snippetSettings.bgGradientColorEnd,
                    bgGradientDirection: props.snippetSettings.bgGradientDirection,
                    fontFamily: props.snippetSettings.fontFamily,
                    fontSize: props.snippetSettings.fontSize,
                    language: props.snippetSettings.language,
                    theme: props.snippetSettings.theme,
                  })

                  let url = '/api/snippets'
                  let method = 'POST'

                  if (props.snippetId) {
                    url = `/api/snippets/${props.snippetId}`
                    method = 'PUT'
                  }

                  const result = await authFetch(url, {
                    method,
                    headers: {
                      'Content-Type': 'application/json',
                      Accept: 'application/json',
                    },
                    body,
                  })

                  if (result.ok) {
                    const newSnippet = await result.json()
                    navigate(`/snippets/${newSnippet.id}`)
                  } else {
                    // notify with a toast
                    toast.error('Error creating Snippet')
                  }

                  setIsSaving(false)
                }}
              >
                {isSaving() ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </Show>
        </div>
      </div>
      <Dialog open={isShowingGifDialog()} onOpenChange={setIsShowingGifDialog} modal>
        <DialogContent>
          <Show when={isGenerating()}>
            <div class="flex flex-col items-center justify-center gap-2 my-12">
              <span class="text-xl">Generating...</span>
              <span class="text-sm">On slower devices, this could take up to 30 seconds.</span>
            </div>
          </Show>
          <Show when={!isGenerating()}>
            <img src={gifDataUrl()} alt="Generated gif" class="mt-10" />
            <p class="">
              Copying the image via right click will only copy the current frame. Please download
              the GIF below by using the Download button or right clicking and using "Save Image
              as...".
            </p>
          </Show>
          <DialogFooter>
            <Show when={!isGenerating()}>
              <Button
                onClick={async () => {
                  const blob = dataURItoBlob(gifDataUrl())
                  const filename = 'giffium.gif'
                  const link = document.createElement('a')
                  link.href = URL.createObjectURL(blob)
                  link.download = filename
                  link.click()
                }}
              >
                Download GIF
              </Button>

              <Show
                when={ffmpegLoaded()}
                fallback={
                  <Button
                    onClick={() => {
                      setIsShowingFfmpegDialog(true)
                    }}
                  >
                    Enable Video
                  </Button>
                }
              >
                <Button
                  disabled={isGeneratingVideo()}
                  onClick={async () => {
                    setIsGeneratingVideo(true)
                    setVideoProgress(0)
                    await ffmpeg.writeFile('input.gif', dataURItoUInt8Array(gifDataUrl()))
                    await ffmpeg.exec(['-i', 'input.gif', 'output.mp4'])
                    const data = await ffmpeg.readFile('output.mp4')
                    const blob = new Blob([data], { type: 'video/mp4' })
                    const filename = 'giffium.mp4'
                    const link = document.createElement('a')
                    link.href = URL.createObjectURL(blob)
                    link.download = filename
                    link.click()
                    setIsGeneratingVideo(false)
                  }}
                >
                  <Show when={isGeneratingVideo()} fallback="Download MP4">
                    <span class="flex flex-row gap-1 items-center justify-center">
                      <span>Generating...</span>
                      <ProgressCircle
                        radius={12}
                        value={videoProgress()}
                        strokeWidth={4}
                        color="green"
                        class="border-green-500"
                      />
                    </span>
                  </Show>
                </Button>
              </Show>
            </Show>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isShowingFfmpegDialog()} onOpenChange={setIsShowingFfmpegDialog} modal>
        <DialogContent>
          <Show when={!isDownloadingFfmpeg()} fallback={<p>Downloading...</p>}>
            <p class="">
              To create video, must download ffmpeg.wasm. It's approximately 30MB. If you have
              downloaded it here before, your browser cache should kick in.
            </p>
          </Show>
          <DialogFooter>
            <Button
              disabled={isDownloadingFfmpeg()}
              onClick={() => setIsShowingFfmpegDialog(false)}
            >
              Cancel
            </Button>
            <Button
              disabled={isDownloadingFfmpeg()}
              onClick={async () => {
                setIsDownloadingFfmpeg(true)
                const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm'
                ffmpeg.on('log', ({ message }) => {
                  console.log(message)
                })
                ffmpeg.on('progress', ({ progress, time }) => {
                  setVideoProgress(Math.round(progress * 100))
                })
                try {
                  // toBlobURL is used to bypass CORS issue, urls with the same
                  // domain can be used directly.
                  await ffmpeg.load({
                    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
                    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
                    // We use the unpkg to reduce bandwidth usage to netlify
                    // coreURL,
                    // wasmURL,
                  })
                  setFfmpegLoaded(true)
                } catch (e) {
                  console.error(e)
                  setFfmpegLoaded(false)
                  // TODO: show error
                }
                setIsDownloadingFfmpeg(false)
                setIsShowingFfmpegDialog(false)
              }}
            >
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function dataURItoUInt8Array(dataURI: string) {
  // convert base64 to raw binary data held in a string
  // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
  var byteString = atob(dataURI.split(',')[1])

  // separate out the mime component
  var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

  // write the bytes of the string to an ArrayBuffer
  var ab = new ArrayBuffer(byteString.length)

  // create a view into the buffer
  var ia = new Uint8Array(ab)

  // set the bytes of the buffer to the correct values
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i)
  }

  return ia
}

function dataURItoBlob(dataURI: string) {
  // convert base64 to raw binary data held in a string
  // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
  var byteString = atob(dataURI.split(',')[1])

  // separate out the mime component
  var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

  // write the bytes of the string to an ArrayBuffer
  var ab = new ArrayBuffer(byteString.length)

  // create a view into the buffer
  var ia = new Uint8Array(ab)

  // set the bytes of the buffer to the correct values
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i)
  }

  // write the ArrayBuffer to a blob, and you're done
  var blob = new Blob([ab], { type: mimeString })
  return blob
}

function blobToDataURL(blob: Blob): Promise<string | ArrayBuffer | null | undefined> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = function (e) {
      resolve(e.target?.result)
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

function htmlDecode(str: string) {
  const txt = document.createElement('textarea')
  txt.innerHTML = str
  return txt.value
}

async function createAnimationFrame(
  elements: MagicMoveElement[],
  frame: number,
  width: number = 100,
  height: number = 100,
  config: AnimationFrameConfig,
) {
  console.log({ elements })
  const { yPadding, xPadding } = config.layout
  const { shadowEnabled, shadowOffsetY, shadowBlur, shadowColor, shadowOpacity } = config.shadow
  const {
    fontSize,
    fontFamily,
    backgroundColor,
    snippetBackgroundColor,
    backgroundType,
    backgroundGradientColorStart,
    backgroundGradientColorEnd,
    backgroundGradientDirection,
    lineNumberColor,
  } = config.styling

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d', { alpha: false })!
  canvas.width = width + xPadding * 2
  canvas.height = height + yPadding * 2

  if (backgroundType === 'linearGradient') {
    // Convert angle to match CSS gradient angle (0deg = to top, 90deg = to right)
    const cssAngle = (backgroundGradientDirection + 90) % 360
    const angle = cssAngle * (Math.PI / 180)
    // canvas use points x1,y1,x2,y2 instead of degree of angle like in css
    // calculate the points based on the angle
    const w = canvas.width
    const h = canvas.height
    const diagonal = Math.sqrt(w * w + h * h)

    const x1 = w / 2 + (Math.cos(angle) * diagonal) / 2
    const y1 = h / 2 + (Math.sin(angle) * diagonal) / 2
    const x2 = w / 2 - (Math.cos(angle) * diagonal) / 2
    const y2 = h / 2 - (Math.sin(angle) * diagonal) / 2

    const grad = ctx.createLinearGradient(x1, y1, x2, y2)

    grad.addColorStop(0, backgroundGradientColorStart)
    grad.addColorStop(1, backgroundGradientColorEnd)

    ctx.fillStyle = grad
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  } else {
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  ctx.fillStyle = snippetBackgroundColor
  if (shadowEnabled) {
    ctx.shadowColor = `${shadowColor}${(shadowOpacity * 255).toString(16)}`
    ctx.shadowBlur = shadowBlur
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = shadowOffsetY
  }

  ctx.beginPath()
  ctx.roundRect(xPadding, yPadding, width, height, 4)
  ctx.fill()

  ctx.shadowColor = 'transparent'

  const xModifier = xPadding
  const yModifier = yPadding + parseInt(fontSize)

  const elementPromises = elements.map(async el => {
    const x = interpolate(
      frame,
      [0, animationFrames],
      [el.x.start + xModifier, el.x.end + xModifier],
      {
        easing: Easing.inOut(Easing.quad),
      },
    )
    const y = interpolate(
      frame,
      [0, animationFrames],
      [el.y.start + yModifier, el.y.end + yModifier],
      {
        easing: Easing.inOut(Easing.quad),
      },
    )
    const opacity = interpolate(frame, [0, animationFrames], [el.opacity.start, el.opacity.end], {
      easing: Easing.inOut(Easing.quad),
    })

    let fallbackColor = 'rgba(0,0,0,0)'
    if (el.el.classList.contains('shiki-magic-move-line-number')) {
      fallbackColor = lineNumberColor || '#aaaaaa'
    }

    const color = interpolateColors(
      frame,
      [0, animationFrames],
      [el.color.start || fallbackColor, el.color.end || fallbackColor],
    )

    ctx.font = `${fontSize} ${fontFamily}`
    ctx.fillStyle = color
    ctx.globalAlpha = opacity
    ctx.fillText(htmlDecode(el.el.innerHTML), x, y, width - x + xPadding / 2)
  })
  await Promise.all(elementPromises)

  return ctx.getImageData(0, 0, canvas.width, canvas.height)
}

// Not actually necessary since the browser will cache the wasm file
async function wrappedToBlobURL(url: string, mimeType: string) {
  const storeName = 'ffmpegCache'
  const db = await openDB(storeName, 1, {})

  return db.get(storeName, url).catch(() => {
    return toBlobURL(url, mimeType)
  })
}
