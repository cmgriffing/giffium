import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { authToken } from './store'
import { useNavigate } from '@solidjs/router'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface Contributor {
  username: string
  avatarUrl: string
}

export async function getGithubContributors(owner: string, repo: string): Promise<Contributor[]> {
  let contributors: Contributor[] = []
  let page = 1
  const perPage = 100 // Maximum allowed by GitHub API

  while (true) {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contributors?page=${page}&per_page=${perPage}`,
        {
          headers: {
            Accept: 'application/vnd.github.v3+json',
          },
        },
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: Array<{ login: string; avatar_url: string }> = await response.json()

      if (data.length === 0) {
        break
      }

      contributors = contributors.concat(
        data.map(contributor => ({
          username: contributor.login,
          avatarUrl: contributor.avatar_url,
        })),
      )

      page++
    } catch (error) {
      console.error('Error fetching contributors:', error)
      break
    }
  }

  return contributors
}

export async function authFetch(url: string, options?: RequestInit) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options?.headers,
      Authorization: `Bearer ${authToken()}`,
    },
  })

  if (!response.ok && response.status === 401) {
    location.href = '/logged-out'
  }

  return response
}

export function parseJwt(token: string) {
  try {
    var base64Url = token.split('.')[1]
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    var jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        })
        .join(''),
    )

    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Error parsing JWT:', error)
  }
}
