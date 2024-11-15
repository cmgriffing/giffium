import { A } from '@solidjs/router'
import { createResource } from 'solid-js'
import { linkStyles } from '~/lib/styles'
import { getGithubContributors } from '~/lib/utils'

export default function About() {
  const [contributors] = createResource(async () => {
    const contributors = await getGithubContributors('cmgriffing', 'giffium')
    return [
      ...contributors,
      { username: 'crutchcorn', avatarUrl: 'https://avatars.githubusercontent.com/u/9100169?v=4' },
    ]
  })

  return (
    <main class="text-center mx-auto text-gray-700  dark:text-gray-100 p-4 max-w-[480px] flex flex-col justify-center gap-16">
      <div>
        <p>This project was started as part of the SolidJS Hackathon.</p>
        <p>
          <A href="https://hack.solidjs.com/" class={linkStyles}>
            Read more about the SolidJS Hackathon
          </A>
        </p>
      </div>
      <div>
        This app is heavily inspired by{' '}
        <a href="https://carbon.now.sh" class={linkStyles} rel="noreferrer">
          Carbon
        </a>{' '}
        and{' '}
        <a href="https://ray.so" class={linkStyles} rel="noreferrer">
          Ray.so
        </a>
        .
      </div>
      <p class="text-left">
        Special thanks{' '}
        <a href="https://github.com/antfu" class={linkStyles}>
          @antfu
        </a>{' '}
        and his{' '}
        <a href="https://github.com/shikijs/shiki" class={linkStyles}>
          Shiki
        </a>{' '}
        project for the syntax highlighting and for his{' '}
        <a href="https://github.com/shikijs/shiki-magic-move" class={linkStyles}>
          Shiki Magic Move
        </a>{' '}
        project for the animations.
      </p>
      <div class="flex flex-col gap-4">
        <h2 class="max-6-xs text-2xl text-gray-700 dark:text-gray-100">Contributors</h2>
        <ul class="flex flex-wrap gap-4 justify-center">
          {contributors.loading ? (
            <li class="flex flex-col items-center justify-center gap-2">
              <span class="text-xl text-sky-700  dark:text-sky-100">Loading...</span>
            </li>
          ) : (
            contributors?.latest?.map(contributor => (
              <li class="flex flex-col items-center justify-center gap-2">
                <a href={`https://github.com/${contributor.username}`}>
                  <img
                    src={contributor.avatarUrl}
                    alt={contributor.username}
                    class="w-16 h-16 rounded-full"
                  />
                </a>
              </li>
            ))
          )}
        </ul>
      </div>
    </main>
  )
}
