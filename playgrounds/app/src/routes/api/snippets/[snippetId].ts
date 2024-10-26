import type { APIEvent } from '@solidjs/start/server'
import { and, eq } from 'drizzle-orm'
import { db } from '~/db/client'
import { snippetsTable } from '~/db/schema'
import { getUser } from '~/lib/middleware'
import { snippetValidator } from '~/lib/validators'

export async function GET(event: APIEvent) {
  const user = await getUser(event)
  if (!user) {
    return new Response(null, {
      status: 401,
    })
  }

  const snippetId = event.params.snippetId

  if (!snippetId) {
    return new Response(null, {
      status: 404,
    })
  }
  const snippet = await db.query.snippets.findFirst({
    where: and(eq(snippetsTable.id, snippetId), eq(snippetsTable.userId, user.id)),
  })

  if (!snippet) {
    return new Response(null, {
      status: 404,
    })
  }

  return new Response(JSON.stringify(snippet), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

export async function PUT(event: APIEvent) {
  const user = await getUser(event)
  if (!user) {
    return new Response(null, {
      status: 401,
    })
  }

  const snippetId = event.params.snippetId

  if (!snippetId) {
    return new Response(null, {
      status: 404,
    })
  }

  const snippet = await db.query.snippets.findFirst({
    where: eq(snippetsTable.id, snippetId),
  })

  if (!snippet) {
    return new Response(null, {
      status: 404,
    })
  }

  if (snippet.userId !== user.id) {
    return new Response(null, {
      status: 404,
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
  } = await event.request.json()

  const isValid = snippetValidator.safeParse({ title, codeLeft, codeRight })

  if (!isValid.success) {
    return new Response(JSON.stringify(isValid.error.flatten()), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  await db
    .update(snippetsTable)
    .set({
      userId: user.id,
      title,
      codeLeft,
      codeRight,
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
    })
    .where(eq(snippetsTable.id, snippetId))

  return new Response(JSON.stringify(snippet), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

export async function DELETE(event: APIEvent) {
  const user = await getUser(event)
  if (!user) {
    return new Response(null, {
      status: 401,
    })
  }

  const snippetId = event.params.snippetId

  if (!snippetId) {
    return new Response(null, {
      status: 404,
    })
  }

  const snippet = await db.query.snippets.findFirst({
    where: eq(snippetsTable.id, snippetId),
  })

  if (!snippet || snippet?.userId !== user.id) {
    return new Response(null, {
      status: 404,
    })
  }

  await db.delete(snippetsTable).where(eq(snippetsTable.id, snippetId))

  return new Response(null, {
    status: 204,
  })
}
