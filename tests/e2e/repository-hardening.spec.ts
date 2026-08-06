import { expect, test } from "@playwright/test"
import { eq } from "drizzle-orm"

import { db } from "@/db"
import { containers, inboxItems, notes, projects, tasks } from "@/db/schema"
import { planTaskForToday, updateTaskDetails } from "@/features/areas/repository"
import { processInboxItemToNote } from "@/features/inbox/repository"

test.describe("hardening de repositorios", () => {
  test.skip(!db, "Requiere DATABASE_URL")

  test("una captura concurrente crea un solo destino", async () => {
    const uniqueId = crypto.randomUUID()
    const title = `Concurrency e2e ${uniqueId}`
    const [item] = await db!.insert(inboxItems).values({ content: title }).returning({ id: inboxItems.id })

    try {
      const results = await Promise.allSettled([
        processInboxItemToNote({ inboxItemId: item.id, title, content: title }),
        processInboxItemToNote({ inboxItemId: item.id, title, content: title }),
      ])

      expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1)
      expect(results.filter((result) => result.status === "rejected")).toHaveLength(1)

      const createdNotes = await db!.select({ id: notes.id }).from(notes).where(eq(notes.title, title))
      expect(createdNotes).toHaveLength(1)
    } finally {
      await db!.delete(notes).where(eq(notes.title, title))
      await db!.delete(inboxItems).where(eq(inboxItems.id, item.id))
    }
  })

  test("una tarea completada no se puede editar ni planificar", async () => {
    const uniqueId = crypto.randomUUID()
    const [container] = await db!.select({ id: containers.id }).from(containers).where(eq(containers.archived, false)).limit(1)
    test.skip(!container, "Requiere al menos un container activo")

    const [project] = await db!.insert(projects).values({
      containerId: container.id,
      title: `Hardening e2e ${uniqueId}`,
      status: "active",
    }).returning({ id: projects.id })

    const [taskRow] = await db!.insert(tasks).values({
      projectId: project.id,
      title: `Completed e2e ${uniqueId}`,
      completed: true,
    }).returning({ id: tasks.id })

    try {
      await expect(updateTaskDetails({ taskId: taskRow.id, title: "No debería cambiar" })).rejects.toMatchObject({ code: "invalid_state" })
      await expect(planTaskForToday({ taskId: taskRow.id })).rejects.toMatchObject({ code: "invalid_state" })
    } finally {
      await db!.delete(projects).where(eq(projects.id, project.id))
    }
  })
})
