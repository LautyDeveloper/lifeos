import "dotenv/config"

import { sql } from "drizzle-orm"

import { validateDemoResetEnvironment } from "@/lib/demo-mode"

async function main() {
  const demoDatabaseUrl = validateDemoResetEnvironment()
  process.env.DATABASE_URL = demoDatabaseUrl
  process.env.DEMO_READ_ONLY = "false"

  const [{ getDbOrThrow }, { notes }, { seedDatabase }] = await Promise.all([
    import("@/db"),
    import("@/db/schema"),
    import("@/db/seed"),
  ])
  const database = getDbOrThrow()

  await database.execute(sql.raw(
    "truncate table notes, tasks, projects, inbox_items, containers, areas restart identity cascade"
  ))
  await seedDatabase()

  const staleDate = new Date()
  staleDate.setDate(staleDate.getDate() - 45)
  await database
    .update(notes)
    .set({ updatedAt: staleDate })
    .where(sql`${notes.title} = 'Contexto de la reunión'`)

  console.log("Life OS demo database reset completed.")
}

main().catch((error) => {
  console.error("Life OS demo reset failed.")
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
