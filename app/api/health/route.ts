import { sql } from "drizzle-orm"
import { NextResponse } from "next/server"

import { db } from "@/db"
import { isDemoReadOnly } from "@/lib/demo-mode"

export async function GET() {
  let database = "unavailable"

  if (db) {
    try {
      await db.execute(sql`select 1`)
      database = "available"
    } catch {
      database = "unavailable"
    }
  }

  const healthy = database === "available"

  return NextResponse.json(
    {
      status: healthy ? "ok" : "degraded",
      database,
      readOnly: isDemoReadOnly(),
      aiConfigured: !isDemoReadOnly() && Boolean(process.env.OPENAI_API_KEY?.trim()),
    },
    { status: healthy ? 200 : 503 }
  )
}
