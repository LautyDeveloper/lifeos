import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"

import * as schema from "@/db/schema"
import { DomainError } from "@/lib/domain-errors"

const databaseUrl = process.env.DATABASE_URL

export const db = databaseUrl
  ? drizzle(neon(databaseUrl), { schema })
  : null

export function getDbOrThrow() {
  if (!db) {
    throw new DomainError("database_unavailable", "DATABASE_URL is not configured.")
  }

  return db
}

export { schema }
