import { createSignal } from 'solid-js'
import { makePersisted } from '@solid-primitives/storage'
import Editor from '~/components/Editor'

const left = `
import { render } from "solid-js/web";

function Counter() {
  return <div>Count: 0</div>;
}

render(() => <Counter />, document.getElementById('app'));
`

const right = `
import { render } from "solid-js/web";
import { createSignal } from "solid-js";

function Counter() {
  const [count, setCount] = createSignal(0);
  setInterval(() => setCount(count() + 1), 1000);
  return <div>Count: {count()}</div>;
}

render(() => <Counter />, document.getElementById('app'));
`

export default function Home() {
  const [theme, setTheme] = makePersisted(createSignal('nord'), { name: 'theme' })
  const [language, setLanguage] = makePersisted(createSignal('tsx'), {
    name: 'language',
  })
  const [startCode, setStartCode] = makePersisted(createSignal(left), {
    name: 'startCode',
  })
  const [endCode, setEndCode] = makePersisted(createSignal(right), {
    name: 'endCode',
  })
  const [bgColor, setBgColor] = makePersisted(createSignal('#a3d0ff'), {
    name: 'bgColor',
  })
  const [xPadding, setXPadding] = makePersisted(createSignal(42), {
    name: 'xPadding',
  })
  const [yPadding, setYPadding] = makePersisted(createSignal(42), {
    name: 'yPadding',
  })
  const [shadowEnabled, setShadowEnabled] = makePersisted(createSignal(true), {
    name: 'shadowEnabled',
  })
  const [shadowOffsetY, setShadowOffsetY] = makePersisted(createSignal(10), {
    name: 'shadowOffsetY',
  })
  const [shadowBlur, setShadowBlur] = makePersisted(createSignal(10), {
    name: 'shadowBlur',
  })
  const [shadowColor, setShadowColor] = makePersisted(createSignal('#000000'), {
    name: 'shadowColor',
  })
  const [shadowOpacity, setShadowOpacity] = makePersisted(createSignal(0.6), {
    name: 'shadowOpacity',
  })
  const [snippetWidth, setSnippetWidth] = makePersisted(createSignal(450), {
    name: 'snippetWidth',
  })
  const [fontSize, setFontSize] = makePersisted(createSignal(16), {
    name: 'fontSize',
  })
  const [fontFamily, setFontFamily] = makePersisted(createSignal('Fira Code'), {
    name: 'fontFamily',
  })

  const [bgType, setBgType] = makePersisted(createSignal<'solid' | 'linearGradient'>('solid'), {
    name: 'bgType',
  })
  const [bgGradientColorStart, setBgGradientColorStart] = makePersisted(createSignal('#a3d0ff'), {
    name: 'bgGradientColorStart',
  })
  const [bgGradientColorEnd, setBgGradientColorEnd] = makePersisted(createSignal('#fbc737'), {
    name: 'bgGradientColorEnd',
  })
  const [bgGradientDirection, setBgGradientDirection] = makePersisted(createSignal(45), {
    name: 'bgGradientDirection',
  })

  return (
    <main class="mx-auto text-gray-700 dark:text-gray-100 px-4 min-h-full">
      {/* <p class="mb-16 text-center font-bold text-lg">
        Create and share beautiful gifs of your source code diffs.
      </p> */}
      <Editor
        startCode={startCode()}
        setStartCode={setStartCode}
        endCode={endCode()}
        setEndCode={setEndCode}
        snippetWidth={snippetWidth()}
        setSnippetWidth={setSnippetWidth}
        yPadding={yPadding()}
        setYPadding={setYPadding}
        xPadding={xPadding()}
        setXPadding={setXPadding}
        shadowEnabled={shadowEnabled()}
        setShadowEnabled={setShadowEnabled}
        shadowOffsetY={shadowOffsetY()}
        setShadowOffsetY={setShadowOffsetY}
        shadowBlur={shadowBlur()}
        setShadowBlur={setShadowBlur}
        shadowColor={shadowColor()}
        setShadowColor={setShadowColor}
        shadowOpacity={shadowOpacity()}
        setShadowOpacity={setShadowOpacity}
        bgColor={bgColor()}
        setBgColor={setBgColor}
        bgType={bgType()}
        setBgType={setBgType}
        bgGradientColorStart={bgGradientColorStart()}
        setBgGradientColorStart={setBgGradientColorStart}
        bgGradientColorEnd={bgGradientColorEnd()}
        setBgGradientColorEnd={setBgGradientColorEnd}
        bgGradientDirection={bgGradientDirection()}
        setBgGradientDirection={setBgGradientDirection}
        fontSize={fontSize()}
        setFontSize={setFontSize}
        fontFamily={fontFamily()}
        setFontFamily={setFontFamily}
        language={language()}
        setLanguage={setLanguage}
        theme={theme()}
        setTheme={setTheme}
      />
    </main>
  )
}
