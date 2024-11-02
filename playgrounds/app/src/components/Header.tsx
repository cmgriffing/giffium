import { A } from '@solidjs/router'
import { Button } from './ui/button'
import { OcMarkgithub2 } from 'solid-icons/oc'
import { FaSolidSun, FaSolidMoon } from 'solid-icons/fa'
import { createThemeSwitcher } from '~/components/theme-switcher'
import { authToken } from '~/lib/store'
import { Show } from 'solid-js'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { user } from '~/lib/store'
import { TbCode, TbDoorExit } from 'solid-icons/tb'
import { linkStyles } from '~/lib/styles'

export default function Header() {
  const [isDarkMode, toggleDarkMode] = createThemeSwitcher()

  const handleToggle = () => {
    toggleDarkMode() // Call without arguments
  }

  return (
    <header class="flex flex-col">
      <nav class="flex flex-row gap-2 justify-between p-4">
        <div class="flex flex-row items-center gap-8">
          <div class="flex flex-col items-center justify-center">
            <a href="/">
              <h1 class="text-3xl font-title text-sky-500">Giffium</h1>
            </a>
            <p class="text-left mt-[-10px]">
              by{' '}
              <a href="https://cmgriffing.com" rel="dofollow" target="_blank" class={linkStyles}>
                cmgriffing
              </a>
            </p>
          </div>

          <ul class="flex flex-row gap-4">
            <li class="">
              <A href="/about" class={linkStyles}>
                About
              </A>
            </li>
            <li class="">
              <a
                href="https://github.com/cmgriffing/giffium"
                target="_blank"
                rel="noreferrer"
                class={linkStyles}
              >
                Source
              </a>
            </li>
          </ul>
        </div>
        <div class="flex flex-row items-center gap-2">
          <button
            onClick={handleToggle}
            class="flex items-center justify-center cursor-pointer w-10 h-10 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-600 dark:hover:bg-neutral-600/80 rounded transition"
            aria-label="Toggle dark mode"
          >
            {isDarkMode() ? (
              <FaSolidMoon class="w-4 h-4 text-neutral-200" />
            ) : (
              <FaSolidSun class="w-4 h-4 text-neutral-500" />
            )}
          </button>
          <Show when={!authToken()}>
            <Button
              as="a"
              href={`https://github.com/login/oauth/authorize?client_id=${
                import.meta.env.VITE_GITHUB_CLIENT_ID
              }&redirect_uri=${window.location.origin}/oauth`}
            >
              <OcMarkgithub2 size={24} class="mr-4" />
              Login/Signup
            </Button>
          </Show>
          <Show when={Boolean(authToken())}>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button class="flex flex-row items-center gap-2">
                  <img
                    src={user()?.githubAvatarUrl}
                    alt={user()?.githubUsername}
                    class="w-6 h-6 rounded-full"
                  />
                  {user()?.githubUsername}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <A href="/snippets" class="flex flex-row items-center gap-2">
                    <TbCode /> Snippets
                  </A>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <A href="/logged-out" class="flex flex-row items-center gap-2">
                    <TbDoorExit />
                    Log out
                  </A>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </Show>
        </div>
      </nav>
    </header>
  )
}
