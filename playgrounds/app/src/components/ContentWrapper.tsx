import { JSX } from 'solid-js'

export function ContentWrapper(props: { children: JSX.Element }) {
  return (
    <main class="mx-auto text-gray-700 dark:text-gray-100 px-4 min-h-full max-w-[640]">
      {props.children}
    </main>
  )
}
