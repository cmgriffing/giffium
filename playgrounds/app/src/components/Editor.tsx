import wasmURL from '@ffmpeg/core/wasm?url'
import coreURL from '@ffmpeg/core?url'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'
import { useNavigate } from '@solidjs/router'
import clsx from 'clsx'

import { Show, createEffect, createSignal, onCleanup, onMount } from 'solid-js'

import { FaSolidCaretDown, FaSolidCaretUp } from 'solid-icons/fa'
import { HiOutlineCog } from 'solid-icons/hi'
import { toast } from 'solid-sonner'

import type { HighlighterGeneric } from 'shiki'
import { bundledLanguages, bundledThemes, createHighlighter } from 'shiki'
import 'shiki-magic-move/dist/style.css'
import { ShikiMagicMove } from 'shiki-magic-move/solid'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '~/components/ui/accordion'
import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import { Collapsible, CollapsibleContent } from '~/components/ui/collapsible'
import {
  Combobox,
  ComboboxContent,
  ComboboxControl,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxItemLabel,
  ComboboxTrigger,
} from '~/components/ui/combobox'
import { Dialog, DialogContent, DialogFooter } from '~/components/ui/dialog'
import { Label } from '~/components/ui/label'
import { ProgressCircle } from '~/components/ui/progress-circle'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Separator } from '~/components/ui/separator'
import {
  Slider,
  SliderFill,
  SliderLabel,
  SliderThumb,
  SliderTrack,
  SliderValueLabel,
} from '~/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { TextField, TextFieldInput } from '~/components/ui/text-field'

import {
  type SelectOption,
  bgTypeOptions,
  gifDataUrl,
  hiddenCode,
  isGenerating,
  isShowingGifDialog,
  magicMoveElements,
  maxContainerDimensions,
  runGeneration,
  selectedTab,
  setHiddenCode,
  setIsShowingGifDialog,
  setMagicMoveElements,
  setMaxContainerDimensions,
  setSelectedTab,
  setSnippetSettings,
  snippetSettings,
  supportedFontFamilies,
} from '~/lib/editor-state'
import { authToken } from '~/lib/store'
import { authFetch } from '~/lib/utils'
import { registerEditorTools } from '~/lib/webmcp/register'

import { ShikiCodeBlock } from './ShikiCodeBlock'

interface EditorProps {
  snippetId?: string
}

export default function Editor(props: EditorProps) {
  const navigate = useNavigate()
  const [toggled, setToggled] = createSignal(false)

  const [code, setCode] = createSignal(snippetSettings.codeLeft)
  const [isResizing, setIsResizing] = createSignal(false)
  const [isLooping, setIsLooping] = createSignal(true)
  const [title, setTitle] = createSignal(snippetSettings.title)
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

    const registration = registerEditorTools()
    onCleanup(() => {
      registration.then(dispose => dispose())
    })
  })

  createEffect(() => {
    createHighlighter({
      themes: [snippetSettings.theme],
      langs: [snippetSettings.language],
    }).then(newHighlighter => {
      setHighlighter(newHighlighter)
    })
  })

  createEffect(() => {
    setCode(snippetSettings.codeLeft)
    setHiddenCode(snippetSettings.codeLeft)
  })

  const intervalId = setInterval(() => {
    if (
      selectedTab() === 'output' &&
      snippetSettings.codeLeft !== '' &&
      snippetSettings.codeRight !== '' &&
      !isResizing() &&
      !isShowingGifDialog() &&
      !isShowingFfmpegDialog() &&
      isLooping()
    ) {
      if (toggled()) {
        setCode(snippetSettings.codeLeft)
      } else {
        setCode(snippetSettings.codeRight)
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
      setSnippetSettings('snippetWidth', snippetSettings.snippetWidth + deltaX)
    }
  })

  document.body.addEventListener('mouseup', e => {
    if (isResizing()) {
      setIsResizing(false)
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
                  value={snippetSettings.theme}
                  options={Object.keys(bundledThemes)}
                  onChange={newTheme => setSnippetSettings('theme', newTheme || '')}
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
                  value={snippetSettings.language}
                  options={Object.keys(bundledLanguages)}
                  onChange={newLanguage => setSnippetSettings('language', newLanguage || '')}
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
                            option => option.value === snippetSettings.bgType,
                          )}
                          optionValue="value"
                          optionTextValue="label"
                          onChange={newType =>
                            newType &&
                            setSnippetSettings(
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
                            value={snippetSettings.bgType}
                          >
                            <SelectValue<{ label: string; value: string }>>
                              {state => state.selectedOption()?.label}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent />
                        </Select>
                      </div>

                      {snippetSettings.bgType === 'linearGradient' && (
                        <>
                          <div class="flex flex-row items-center justify-between">
                            <Label for="bg-color-input-grad-start" class="font-normal">
                              Color Start
                            </Label>
                            <input
                              id="bg-color-input-grad-start"
                              class="h-6 w-6 rounded"
                              type="color"
                              value={snippetSettings.bgGradientColorStart}
                              onInput={e => {
                                setSnippetSettings('bgGradientColorStart', e.target.value)
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
                              value={snippetSettings.bgGradientColorEnd}
                              onInput={e => {
                                setSnippetSettings('bgGradientColorEnd', e.target.value)
                              }}
                            />
                          </div>
                          <Slider
                            value={[snippetSettings.bgGradientDirection]}
                            minValue={0}
                            maxValue={359}
                            onChange={e => {
                              setSnippetSettings('bgGradientDirection', e[0])
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
                      {snippetSettings.bgType === 'solid' && (
                        <div class="flex flex-row items-center justify-between">
                          <Label for="bg-color-input" class="font-normal">
                            Background Color
                          </Label>
                          <input
                            id="bg-color-input"
                            class="h-6 w-6 rounded"
                            type="color"
                            value={snippetSettings.bgColor}
                            onInput={e => {
                              setSnippetSettings('bgColor', e.target.value)
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
                        value={[snippetSettings.snippetWidth]}
                        minValue={0}
                        maxValue={1500}
                        onChange={e => {
                          setSnippetSettings('snippetWidth', e[0])
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
                        value={[snippetSettings.yPadding]}
                        minValue={0}
                        maxValue={200}
                        onChange={e => {
                          setSnippetSettings('yPadding', e[0])
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
                        value={[snippetSettings.xPadding]}
                        minValue={0}
                        maxValue={200}
                        onChange={e => {
                          setSnippetSettings('xPadding', e[0])
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
                            setSnippetSettings('shadowEnabled', !snippetSettings.shadowEnabled)
                          }
                        >
                          Show Shadow
                        </Label>
                        <Checkbox
                          id="shadow-checkbox"
                          checked={snippetSettings.shadowEnabled}
                          onChange={() => {
                            setSnippetSettings('shadowEnabled', !snippetSettings.shadowEnabled)
                          }}
                        />
                      </div>

                      <div class="flex flex-row items-center justify-between">
                        <Label for="shadow-color-input" class="font-normal">
                          Color
                        </Label>

                        <input
                          id="shadow-color-input"
                          class="h-6 w-6 rounded"
                          type="color"
                          value={snippetSettings.shadowColor}
                          onInput={e => setSnippetSettings('shadowColor', e.target.value)}
                        />
                      </div>
                      <div class="flex flex-row items-center justify-between">
                        <Slider
                          value={[snippetSettings.shadowOpacity]}
                          step={0.01}
                          minValue={0}
                          maxValue={1}
                          onChange={e => {
                            setSnippetSettings('shadowOpacity', e[0])
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
                          value={[snippetSettings.shadowOffsetY]}
                          minValue={0}
                          maxValue={snippetSettings.yPadding}
                          onChange={e => {
                            setSnippetSettings('shadowOffsetY', e[0])
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
                          value={[snippetSettings.shadowBlur]}
                          minValue={0}
                          maxValue={200}
                          onChange={e => {
                            setSnippetSettings('shadowBlur', e[0])
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
                            option => option.name === snippetSettings.fontFamily,
                          )}
                          optionValue="name"
                          optionTextValue="name"
                          onChange={newFamily =>
                            newFamily && setSnippetSettings('fontFamily', newFamily.name)
                          }
                          options={supportedFontFamilies}
                          itemComponent={props => (
                            <SelectItem item={props.item}>{props.item.rawValue.name}</SelectItem>
                          )}
                        >
                          <SelectTrigger
                            aria-label="Font Family"
                            class="w-full"
                            value={snippetSettings.fontFamily}
                          >
                            <SelectValue<{ name: string }>>
                              {state => state.selectedOption()?.name}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent />
                        </Select>
                      </div>

                      <Slider
                        value={[snippetSettings.fontSize]}
                        minValue={1}
                        maxValue={64}
                        onChange={e => {
                          setSnippetSettings('fontSize', e[0])
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
                    disabled={snippetSettings.codeLeft === '' || snippetSettings.codeRight === ''}
                  >
                    Next
                  </Button>
                </div>
              </div>

              <div class="dark:bg-[#27272a] bg-gray-100 p-2 rounded-b flex flex-row flex-wrap md:flex-nowrap gap-2">
                <div class="flex flex-col w-full md:w-1/2 gap-1">
                  <p class="w-full text-sm">Start Code</p>
                  <ShikiCodeBlock
                    code={snippetSettings.codeLeft}
                    lang={snippetSettings.language}
                    theme={snippetSettings.theme}
                    class="min-h-[400px]"
                    onChange={newCodeLeft => setSnippetSettings('codeLeft', newCodeLeft)}
                  />
                </div>
                <div class="flex flex-col w-full md:w-1/2 gap-1">
                  <p class="w-full text-sm">End Code</p>
                  <ShikiCodeBlock
                    code={snippetSettings.codeRight}
                    lang={snippetSettings.language}
                    theme={snippetSettings.theme}
                    class="min-h-[400px]"
                    onChange={newEndCode => setSnippetSettings('codeRight', newEndCode)}
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
                    onClick={() => {
                      runGeneration()
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
                      ...(snippetSettings.bgType === 'linearGradient'
                        ? {
                            background: `linear-gradient(${snippetSettings.bgGradientDirection}deg, ${snippetSettings.bgGradientColorStart}, ${snippetSettings.bgGradientColorEnd})`,
                          }
                        : {
                            background: snippetSettings.bgColor,
                          }),
                      padding: `${snippetSettings.yPadding}px ${snippetSettings.xPadding}px`,
                    }}
                  >
                    <div class="flex flex-row items-center justify-center relative margin-auto w-fit">
                      <Show when={highlighter()}>
                        {highlighter => (
                          <>
                            <div
                              class="rounded"
                              style={{
                                width: `${snippetSettings.snippetWidth}px`,
                                'overflow-x': 'hidden',
                                'box-shadow': snippetSettings.shadowEnabled
                                  ? `0 ${snippetSettings.shadowOffsetY}px ${
                                      snippetSettings.shadowBlur
                                    }px ${snippetSettings.shadowColor}${(
                                      snippetSettings.shadowOpacity * 255
                                    ).toString(16)}`
                                  : 'none',
                                'font-family': snippetSettings.fontFamily,
                                'font-size': `${snippetSettings.fontSize}px`,
                              }}
                            >
                              <ShikiMagicMove
                                lang={snippetSettings.language}
                                theme={snippetSettings.theme}
                                class="p-4 shadow-xl rounded select-none overflow-hidden"
                                highlighter={highlighter()}
                                code={code()}
                                options={{
                                  duration: 800,
                                  stagger: 0,
                                  lineNumbers: false,
                                }}
                              />
                              {/* The hidden shiki that we use to generate the magic move elements */}
                              <div
                                aria-hidden="true"
                                class=" absolute top-[-20000px] left-[-20000px]"
                                style={{
                                  width: `${snippetSettings.snippetWidth}px`,
                                }}
                              >
                                <ShikiMagicMove
                                  lang={snippetSettings.language}
                                  theme={snippetSettings.theme}
                                  class="p-4 shadow-xl rounded select-none overflow-hidden"
                                  highlighter={highlighter()}
                                  code={hiddenCode()}
                                  options={{
                                    duration: 800,
                                    stagger: 0,
                                    lineNumbers: false,
                                    onAnimationStart: async (
                                      newElements,
                                      newMaxContainerDimensions,
                                    ) => {
                                      if (newElements.length === 0) {
                                        return
                                      }

                                      setMagicMoveElements(newElements)
                                      setMaxContainerDimensions(newMaxContainerDimensions)
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
                  snippetSettings.codeLeft === '' ||
                  snippetSettings.codeRight === '' ||
                  !title()
                }
                onClick={async () => {
                  setIsSaving(true)
                  const body = JSON.stringify({
                    title: title(),
                    codeLeft: snippetSettings.codeLeft,
                    codeRight: snippetSettings.codeRight,
                    snippetWidth: snippetSettings.snippetWidth,
                    yPadding: snippetSettings.yPadding,
                    xPadding: snippetSettings.xPadding,
                    shadowEnabled: snippetSettings.shadowEnabled,
                    shadowOffsetY: snippetSettings.shadowOffsetY,
                    shadowBlur: snippetSettings.shadowBlur,
                    shadowColor: snippetSettings.shadowColor,
                    shadowOpacity: snippetSettings.shadowOpacity,
                    bgColor: snippetSettings.bgColor,
                    bgType: snippetSettings.bgType,
                    bgGradientColorStart: snippetSettings.bgGradientColorStart,
                    bgGradientColorEnd: snippetSettings.bgGradientColorEnd,
                    bgGradientDirection: snippetSettings.bgGradientDirection,
                    fontFamily: snippetSettings.fontFamily,
                    fontSize: snippetSettings.fontSize,
                    language: snippetSettings.language,
                    theme: snippetSettings.theme,
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
                    await ffmpeg.exec([
                      '-i',
                      'input.gif',
                      '-vcodec',
                      'libx264',
                      '-pix_fmt',
                      'yuv420p',
                      'output.mp4',
                    ])
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
