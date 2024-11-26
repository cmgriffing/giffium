import { createSignal } from 'solid-js'
import { makePersisted } from '@solid-primitives/storage'
import Editor from '~/components/Editor'
import { SnippetSettings } from '~/types'
import { createStore } from 'solid-js/store'

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
  const [snippetSettings, setSnippetSettings] = makePersisted(
    createStore<SnippetSettings>({
      title: '',
      codeLeft: left,
      codeRight: right,
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
      lineNumbersEnabled: true,
      lineNumberColor: '#aaaaaa',
    }),
    { name: 'snippetSettings' },
  )

  return (
    <main class="mx-auto text-gray-700 dark:text-gray-100 px-4 min-h-full w-full flex-1 max-w-screen-2xl">
      <Editor snippetSettings={snippetSettings} setSnippetSettings={setSnippetSettings} />
    </main>
  )
}
