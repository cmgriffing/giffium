import { createSignal, createEffect } from 'solid-js'
import { makePersisted } from '@solid-primitives/storage'

export function createThemeSwitcher() {
  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)')
  const [isDarkMode, setIsDarkMode] = makePersisted(createSignal(prefersDarkScheme.matches), {
    name: 'isDarkMode',
  })

  createEffect(() => {
    if (isDarkMode()) {
      document.body.classList.add('dark')
    } else {
      document.body.classList.remove('dark')
    }
  })

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode())
  }

  return [isDarkMode, toggleDarkMode] as const
}
