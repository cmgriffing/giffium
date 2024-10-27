import 'dotenv/config'
import { drizzle } from 'drizzle-orm/libsql'
import { schema } from './schema'

export const db = drizzle({
  schema: schema,
  connection: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
})
