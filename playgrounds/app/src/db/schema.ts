import { int, sqliteTable, text, real } from 'drizzle-orm/sqlite-core'

export const usersTable = sqliteTable('users_table', {
  id: text().primaryKey(),
  email: text().notNull().unique(),
  githubId: text().notNull().unique(),
  githubUsername: text().notNull().unique(),
  githubAvatarUrl: text().notNull().unique(),
  createdAt: int().notNull().default(0),
  updatedAt: int().notNull().default(0),
})

export const snippetsTable = sqliteTable('snippets_table', {
  id: text().primaryKey(),
  userId: text()
    .notNull()
    .references(() => usersTable.id),
  title: text().notNull(),
  codeLeft: text().notNull(),
  codeRight: text().notNull(),
  createdAt: int().notNull().default(0),
  updatedAt: int().notNull().default(0),
  snippetWidth: int().notNull().default(450),
  yPadding: int().notNull().default(42),
  xPadding: int().notNull().default(42),
  shadowEnabled: int({ mode: 'boolean' }).notNull().default(true),
  shadowOffsetY: int().notNull().default(10),
  shadowBlur: int().notNull().default(10),
  shadowColor: text().notNull().default('#000000'),
  shadowOpacity: real().notNull().default(0.6),
  bgColor: text().notNull().default('#ffffff'),
  language: text().notNull().default('tsx'),
  theme: text().notNull().default('nord'),
  fontSize: int().notNull().default(16),
  fontFamily: text().notNull().default('Fira Code'),
})

export const schema = {
  users: usersTable,
  snippets: snippetsTable,
}
