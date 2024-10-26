import { usersTable } from '~/db/schema'
import { decodeToken } from './jwt'
import { db } from '~/db/client'
import { eq } from 'drizzle-orm'
import type { APIEvent } from '@solidjs/start/server'

export async function getUser({ request }: APIEvent) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')

  if (!token) {
    return null
  }

  try {
    const decoded = await decodeToken(token)

    const user = await db.query.users.findFirst({
      // @ts-ignore
      where: eq(usersTable.id, decoded?.sub?.id),
    })

    return user
  } catch (error) {
    console.error('Error getting user:', error) // Handle the error
    return null
  }
}
