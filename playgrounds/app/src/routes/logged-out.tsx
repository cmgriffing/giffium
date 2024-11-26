import { onMount } from 'solid-js'

import { OcMarkgithub2 } from 'solid-icons/oc'

import { Button } from '~/components/ui/button'

import { setAuthToken } from '~/lib/store'

export default function LoggedOut() {
  onMount(() => {
    setAuthToken('')
  })

  return (
    <main class="text-center mx-auto text-gray-700  dark:text-gray-100 p-4 max-w-[480px] flex flex-col justify-center gap-16">
      <p>
        You have been logged out. If you would like to log back in, please click the button below.
      </p>
      <Button
        as="a"
        href={`https://github.com/login/oauth/authorize?client_id=${
          import.meta.env.VITE_GITHUB_CLIENT_ID
        }&scope=${encodeURIComponent('read:user user:email')}&redirect_uri=${
          window.location.origin
        }/oauth`}
      >
        <OcMarkgithub2 size={24} class="mr-4" />
        Login
      </Button>
    </main>
  )
}
