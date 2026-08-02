import { asc, inArray } from "drizzle-orm"

import { db } from "@/db"
import { areas } from "@/db/schema"
import { defaultAreaMetadataBySlug, type AreaSlug } from "@/features/settings/config"
import type { NavigationItemData } from "@/types/navigation"

const areaHrefBySlug: Record<AreaSlug, string> = {
  work: "/work",
  dev: "/dev",
  study: "/study",
  health: "/health",
}

export async function getAreaNavigationItems(): Promise<NavigationItemData[]> {
  const slugs = Object.keys(defaultAreaMetadataBySlug) as AreaSlug[]

  if (!db) {
    return slugs.map((slug) => ({
      href: areaHrefBySlug[slug],
      label: defaultAreaMetadataBySlug[slug].name,
      iconKey: defaultAreaMetadataBySlug[slug].icon,
    }))
  }

  const rows = await db
    .select({
      slug: areas.slug,
      name: areas.name,
      icon: areas.icon,
    })
    .from(areas)
    .where(inArray(areas.slug, slugs))
    .orderBy(asc(areas.sortOrder), asc(areas.name))

  const bySlug = new Map(rows.map((row) => [row.slug as AreaSlug, row]))

  const mappedRows = rows.map((row) => ({
    href: areaHrefBySlug[row.slug as AreaSlug],
    label: row.name,
    iconKey: row.icon,
  }))

  const missingFallbacks = slugs
    .filter((slug) => !bySlug.has(slug))
    .map((slug) => ({
      href: areaHrefBySlug[slug],
      label: defaultAreaMetadataBySlug[slug].name,
      iconKey: defaultAreaMetadataBySlug[slug].icon,
    }))

  return [...mappedRows, ...missingFallbacks].map((row) => ({
    href: row.href,
    label: row.label,
    iconKey: row.iconKey,
  }))
}
