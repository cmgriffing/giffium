import type { APIEvent } from '@solidjs/start/server'
import 'dotenv/config'
import { eq } from 'drizzle-orm'

import { db } from '~/db/client'
import { usersTable } from '~/db/schema'
import { customNanoid } from '~/lib/ids'
import { encodeAccessToken } from '~/lib/jwt'

export async function POST(event: APIEvent) {
  const { code } = await event.request.json()

  const githubResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      client_id: process.env.VITE_GITHUB_CLIENT_ID!,
      client_secret: process.env.GITHUB_CLIENT_SECRET!,
      code: code,
    }),
  })

  const { access_token } = await githubResponse.json()

  const [githubUserResponse, githubEmailsResponse] = await Promise.all([
    fetch('https://api.github.com/user', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${access_token}`,
      },
    }),
    fetch('https://api.github.com/user/emails', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${access_token}`,
      },
    }),
  ])

  const [githubUser, githubEmails] = await Promise.all([
    githubUserResponse.json(),
    githubEmailsResponse.json(),
  ])

  const githubEmail = githubEmails.find((email: { primary: boolean }) => email.primary)?.email

  let user = await db.query.users.findFirst({
    where: eq(usersTable.githubId, githubUser.id),
  })

  if (!user) {
    const createdAt = Date.now()
    const newUser = {
      id: customNanoid(),
      email: githubUser.email || githubEmail,
      githubId: githubUser.id,
      githubUsername: githubUser.login,
      githubAvatarUrl: githubUser.avatar_url,
      createdAt,
      updatedAt: createdAt,
    }
    await db.insert(usersTable).values(newUser)
    user = newUser
  }

  return new Response(
    JSON.stringify({
      jwt: encodeAccessToken(user),
      user,
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
}
