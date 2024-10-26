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

  const githubUserResponse = await fetch('https://api.github.com/user', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${access_token}`,
    },
  })

  const githubUser = await githubUserResponse.json()

  let user = await db.query.users.findFirst({
    where: eq(usersTable.githubId, githubUser.id),
  })

  if (!user) {
    await db.insert(usersTable).values({
      id: customNanoid(),
      email: githubUser.email,
      githubId: githubUser.id,
      githubUsername: githubUser.login,
      githubAvatarUrl: githubUser.avatar_url,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
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
