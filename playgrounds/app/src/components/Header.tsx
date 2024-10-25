import { A } from '@solidjs/router'
import { Button } from './ui/button'
import { OcMarkgithub2 } from 'solid-icons/oc'
import { FaSolidSun, FaSolidMoon, FaRegularCircleQuestion } from 'solid-icons/fa'
import { AiFillCloseCircle } from 'solid-icons/ai'
import { createThemeSwitcher } from '~/components/theme-switcher'
import { authToken } from '~/lib/store'
import { Show, createSignal } from 'solid-js'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { user } from '~/lib/store'
import { TbCode, TbDoorExit } from 'solid-icons/tb'
import { linkStyles } from '~/lib/styles'
import ModalComponent from './ui/modal'

export default function Header() {
  const [isDarkMode, toggleDarkMode] = createThemeSwitcher()
  const [isModalOpen, setIsModalOpen] = createSignal<boolean>(false)
  const [activeModal, setActiveModal] = createSignal<string>('')

  const [openQuestions, setOpenQuestions] = createSignal<number[]>([])

  const toggleQuestion = (questionIndex: number) => {
    setOpenQuestions(prev => {
      if (prev.includes(questionIndex)) {
        return prev.filter(index => index !== questionIndex)
      } else {
        return [...prev, questionIndex]
      }
    })
  }

  const handleToggle = () => {
    toggleDarkMode()
  }

  const handleOpenModal = (modalType: string) => {
    setActiveModal(modalType)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setActiveModal('')
  }

  return (
    <header class="flex flex-col">
      <nav class="flex flex-row gap-2 justify-end p-4">
        <div class="flex flex-row items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger>
              <button
                class="flex items-center justify-center cursor-pointer w-10 h-10 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-600 dark:hover:bg-neutral-600/80 rounded transition"
                aria-label="Open help options"
              >
                <FaRegularCircleQuestion />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem class="cursor-pointer" onClick={() => handleOpenModal('how-work')}>
                How Work
              </DropdownMenuItem>
              <DropdownMenuItem class="cursor-pointer" onClick={() => handleOpenModal('faqs')}>
                FAQs
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
      <div class="flex flex-col items-center justify-center p-4">
        <a href="/">
          <h1 class="text-6xl font-title text-sky-500">Giffium</h1>
        </a>
        <p class="text-left mt-[-10px]">
          by{' '}
          <a href="https://cmgriffing.com" rel="dofollow" target="_blank" class={linkStyles}>
            cmgriffing
          </a>
        </p>
      </div>

      <ModalComponent
        isOpen={isModalOpen()}
        onClose={handleCloseModal}
        modalType={activeModal()}
        openQuestions={openQuestions()}
        toggleQuestion={toggleQuestion}
      />
    </header>
  )
}
