import "dotenv/config"

import { migrate } from "drizzle-orm/neon-http/migrator"

import { getDbOrThrow } from "@/db"

async function main() {
  const db = getDbOrThrow()

  await migrate(db, {
    migrationsFolder: "./db/migrations",
  })

  console.log("Life OS migrations completed.")
}

main().catch((error) => {
  console.error("Life OS migrations failed.")
  console.error(error)
  process.exit(1)
})
