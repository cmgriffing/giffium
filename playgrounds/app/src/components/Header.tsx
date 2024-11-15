import { A } from '@solidjs/router'
import { Button } from './ui/button'
import { OcMarkgithub2, OcQuestion2 } from 'solid-icons/oc'
import { FaSolidSun, FaSolidMoon } from 'solid-icons/fa'
import { createThemeSwitcher } from '~/components/theme-switcher'
import { authToken } from '~/lib/store'
import { createSignal, Show } from 'solid-js'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { user } from '~/lib/store'
import { TbCode, TbDoorExit, TbQuestionMark } from 'solid-icons/tb'
import { linkStyles } from '~/lib/styles'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog'
import { makePersisted } from '@solid-primitives/storage'

export default function Header() {
  const [isShowingHelpDialog, setIsShowingHelpDialog] = makePersisted(createSignal(true), {
    name: 'isShowingHelpDialog',
  })
  const [isDarkMode, toggleDarkMode] = createThemeSwitcher()

  const handleToggle = () => {
    toggleDarkMode() // Call without arguments
  }

  return (
    <>
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
            <Button
              variant={'ghost'}
              class="flex flex-row items-center px-2"
              onClick={() => setIsShowingHelpDialog(true)}
            >
              <OcQuestion2 size={24} />
            </Button>
            <Button
              variant={'ghost'}
              class="flex flex-row items-center px-2"
              onClick={handleToggle}
              aria-label="Toggle dark mode"
            >
              {isDarkMode() ? (
                <FaSolidMoon size={24} class="text-white" />
              ) : (
                <FaSolidSun size={24} class="text-black" />
              )}
            </Button>
            <Show when={!authToken()}>
              <Button
                as="a"
                class="ml-4"
                href={`https://github.com/login/oauth/authorize?client_id=${
                  import.meta.env.VITE_GITHUB_CLIENT_ID
                }&scope=${encodeURIComponent('read:useruser:email')}&redirect_uri=${
                  window.location.origin
                }/oauth`}
              >
                <OcMarkgithub2 size={24} class="mr-4" />
                Login/Signup
              </Button>
            </Show>
            <Show when={Boolean(authToken())}>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button class="flex flex-row items-center gap-2 ml-4">
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
      <Dialog open={isShowingHelpDialog()} onOpenChange={setIsShowingHelpDialog} modal>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Welcome to Giffium</DialogTitle>
            <DialogDescription>
              <p class="mb-8 text-center font-bold text-lg dark:text-white text-black">
                Create and share beautiful gifs of your source code diffs.
              </p>
              <p class="dark:text-white text-black">Get started by following these steps.</p>
              <ol class="list-disc list-inside pl-8 dark:text-white text-black">
                <li>Enter your start and end code snippets.</li>
                <li>Select the theme and language.</li>
                <li>Click the Next button to preview your snippet animation.</li>
                <li>Click the Generate button to generate a gif.</li>
              </ol>

              <p class="dark:text-white text-black mt-8">
                You can also log in with GitHub to save your snippets.
              </p>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  )
}
