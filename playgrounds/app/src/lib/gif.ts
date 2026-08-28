import { encode } from 'modern-gif'
import workerUrl from 'modern-gif/worker?url'
import { Easing, interpolate, interpolateColors } from 'remotion'

import { MagicMoveElement } from 'shiki-magic-move/types'

import { AnimationFrameConfig, SnippetSettings } from '~/types'

const animationSeconds = 1
const animationFPS = 30
const animationFrames = animationSeconds * animationFPS

export interface GenerateGifOptions {
  settings: SnippetSettings
  elements: MagicMoveElement[]
  maxDimensions?: { width: number; height: number }
  signal?: AbortSignal
}

export interface GenerateGifResult {
  dataUrl: string
  width: number
  height: number
}

function assertNotAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException('GIF generation aborted', 'AbortError')
  }
}

export async function generateGif(options: GenerateGifOptions): Promise<GenerateGifResult> {
  const { settings, elements, maxDimensions, signal } = options

  const container = document.querySelector('.shiki-magic-move-container') as HTMLPreElement

  const canvasFrames: ImageData[] = []
  const backgroundColor = container.style.backgroundColor

  let fontSize = ''
  let fontFamily = ''

  elements.some(el => {
    const computedStyle = window.getComputedStyle(el.el)
    fontSize = computedStyle.getPropertyValue('font-size')
    fontFamily = computedStyle.getPropertyValue('font-family')

    return fontSize && fontFamily
  })

  const pauseFrameLength = 60

  const wrappedCreateAnimationFrame = async (frame: number) => {
    return createAnimationFrame(
      elements,
      frame,
      maxDimensions?.width || 100,
      maxDimensions?.height || 100,
      {
        layout: {
          yPadding: settings.yPadding,
          xPadding: settings.xPadding,
        },
        shadow: {
          shadowEnabled: settings.shadowEnabled,
          shadowOffsetY: settings.shadowOffsetY,
          shadowBlur: settings.shadowBlur,
          shadowColor: settings.shadowColor,
          shadowOpacity: settings.shadowOpacity,
        },
        styling: {
          fontSize,
          fontFamily,
          snippetBackgroundColor: backgroundColor,
          backgroundColor: settings.bgColor,
          backgroundType: settings.bgType,
          backgroundGradientColorStart: settings.bgGradientColorStart,
          backgroundGradientColorEnd: settings.bgGradientColorEnd,
          backgroundGradientDirection: settings.bgGradientDirection,
        },
      },
    )
  }

  const firstFrameCanvas = await wrappedCreateAnimationFrame(0)
  assertNotAborted(signal)
  for (let frame = 0; frame < pauseFrameLength; frame++) {
    canvasFrames.push(firstFrameCanvas)
  }

  const middleFrameNumbers = []

  for (let i = 0; i < animationFrames; i++) {
    middleFrameNumbers.push(i)
  }

  let middleFrames = []
  for (let frame = 0; frame < middleFrameNumbers.length; frame++) {
    assertNotAborted(signal)
    const canvas = await wrappedCreateAnimationFrame(middleFrameNumbers[frame])
    middleFrames.push(canvas)
  }
  canvasFrames.push(...middleFrames)

  const lastFrameCanvas = await wrappedCreateAnimationFrame(animationFrames)
  assertNotAborted(signal)
  for (let frame = 0; frame < pauseFrameLength; frame++) {
    canvasFrames.push(lastFrameCanvas)
  }

  canvasFrames.push(...middleFrames.toReversed())

  assertNotAborted(signal)

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

  return {
    dataUrl: dataUrl?.toString() || '',
    width: canvasFrames[0].width,
    height: canvasFrames[0].height,
  }
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
  } = config.styling

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d', { alpha: false })!
  canvas.width = width + xPadding * 2
  canvas.height = height + yPadding * 2

  const textCanvas = document.createElement('canvas')
  const textCtx = textCanvas.getContext('2d', { alpha: true })!
  textCanvas.width = width + xPadding - 4
  textCanvas.height = height + yPadding

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
    const color = interpolateColors(
      frame,
      [0, animationFrames],
      [el.color.start || 'rgba(0,0,0,0)', el.color.end || 'rgba(0,0,0,0)'],
    )

    textCtx.font = `${fontSize} ${fontFamily}`
    textCtx.fillStyle = color
    textCtx.globalAlpha = opacity
    textCtx.fillText(htmlDecode(el.el.innerHTML), x, y)
  })
  await Promise.all(elementPromises)

  ctx.drawImage(textCanvas, 0, 0)

  return ctx.getImageData(0, 0, canvas.width, canvas.height)
}
