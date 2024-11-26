import { useNavigate, useSearchParams } from '@solidjs/router'

import { Show, createSignal, onMount } from 'solid-js'

import { setAuthToken, setUser, user } from '~/lib/store'

export default function OAuth() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = createSignal(true)

  onMount(async () => {
    if (!searchParams?.code) {
      setIsLoading(false)
      return
    }
    const response = await fetch('/api/oauth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        code: searchParams?.code,
      }),
    })

    if (!response.ok) {
      setIsLoading(false)
      return
    }

    const data = await response.json()

    setAuthToken(data.jwt)
    setUser(data.user)

    navigate('/snippets')
  })

  return (
    <div class="min-h-[400px] flex flex-col items-center justify-center gap-16">
      <Show when={!isLoading() && !user()}>
        <h2 class="text-4xl">Error Logging In</h2>
      </Show>
      <Show when={isLoading()}>
        <h2 class="text-4xl">Authenticating...</h2>
      </Show>
    </div>
  )
}
