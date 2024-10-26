import type { APIEvent } from '@solidjs/start/server'
import { eq } from 'drizzle-orm'
import { db } from '~/db/client'
import { snippetsTable } from '~/db/schema'
import { getUser } from '~/lib/middleware'
import { snippetValidator } from '~/lib/validators'
import { customNanoid } from '~/lib/ids'

export async function GET(event: APIEvent): Promise<Response> {
  const user = await getUser(event)
  if (!user) {
    return new Response(null, {
      status: 401,
    })
  }

  const snippets = await db.query.snippets.findMany({
    where: eq(snippetsTable.userId, user.id),
  })

  return new Response(JSON.stringify({ snippets }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

export async function POST(event: APIEvent) {
  const user = await getUser(event)
  if (!user) {
    return new Response(null, {
      status: 401,
    })
  }

  const requestBody = await event.request.json()

  const isValid = snippetValidator.safeParse(requestBody)

  if (!isValid.success) {
    return new Response(JSON.stringify(isValid.error.flatten()), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  const {
    title,
    codeLeft,
    codeRight,
    snippetWidth,
    yPadding,
    xPadding,
    shadowEnabled,
    shadowOffsetY,
    shadowBlur,
    shadowColor,
    shadowOpacity,
    bgColor,
    language,
    theme,
  } = requestBody

  const newSnippet = {
    id: customNanoid(),
    userId: user.id,
    title,
    codeLeft,
    codeRight,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    snippetWidth,
    yPadding,
    xPadding,
    shadowEnabled,
    shadowOffsetY,
    shadowBlur,
    shadowColor,
    shadowOpacity,
    bgColor,
    language,
    theme,
  }

  console.log({ newSnippet })

  await db.insert(snippetsTable).values(newSnippet)

  return new Response(JSON.stringify(newSnippet), {
    status: 201,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}
