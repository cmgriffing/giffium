import { A } from '@solidjs/router'

import { linkStyles } from '~/lib/styles'

export default function Footer() {
  return (
    <footer class="flex flex-col items-center justify-center p-4 py-16 gap-2">
      <ul class="flex flex-row gap-4">
        <li class="">
          <A href="/about" class={linkStyles}>
            about
          </A>
        </li>
        <li class="">
          <a
            href="https://github.com/cmgriffing/giffium"
            target="_blank"
            rel="noreferrer"
            class={linkStyles}
          >
            source
          </a>
        </li>
      </ul>
      <p>
        created by{' '}
        <a href="https://cmgriffing.com" target="_blank" class={linkStyles}>
          @cmgriffing
        </a>
      </p>
    </footer>
  )
}
