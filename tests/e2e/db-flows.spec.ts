import { expect, test } from "@playwright/test"

const hasDatabase = Boolean(process.env.DATABASE_URL)

test.describe("flujos con base de datos", () => {
  test.skip(!hasDatabase, "Requiere DATABASE_URL")

  test("captura en inbox y crea una nota desde la command surface", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-chromium", "Solo escritorio")

    const uniqueId = Date.now().toString()
    const captureText = `Captura e2e ${uniqueId}`
    const noteTitle = `Nota e2e ${uniqueId}`
    const noteContent = `Contenido e2e ${uniqueId}`

    await page.goto("/inbox")

    await page
      .getByPlaceholder("Ej: pensar el flujo para procesar ideas del inbox...")
      .fill(captureText)
    await page.getByRole("button", { name: "Capturar" }).click()
    await expect(page.getByText(captureText)).toBeVisible()

    await page.goto("/")
    await page.keyboard.press("Control+K")
    await expect(page.getByRole("dialog", { name: "Command surface de Life OS" })).toBeVisible()
    await page.getByRole("button", { name: "Nueva nota en Biblioteca" }).click()

    await page.getByPlaceholder("Título de la nota...").fill(noteTitle)
    await page
      .getByPlaceholder("Escribí la idea, definición o referencia que querés guardar.")
      .fill(noteContent)
    await page.getByRole("button", { name: "Guardar nota" }).click()

    await expect(page).toHaveURL(/\/library\?note=/)
    await expect(page.getByLabel("Título de la nota")).toHaveValue(noteTitle)
    await expect(page.getByLabel("Contenido de la nota")).toHaveValue(noteContent)
  })

  test("crea, archiva y restaura una nota de biblioteca", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-chromium", "Solo escritorio")

    const uniqueId = Date.now().toString()
    const title = `Biblioteca lifecycle ${uniqueId}`
    const content = `Lifecycle content ${uniqueId}`

    await page.goto("/library")
    await page.getByText("Nueva nota").click()
    await page.getByPlaceholder("Nueva nota de referencia...").fill(title)
    await page
      .getByPlaceholder(
        "Guardá una idea, una definición, una referencia o una nota que quieras volver a consultar."
      )
      .fill(content)
    await page.getByRole("button", { name: "Guardar nota" }).click()

    await expect(page.getByText("Nota creada en Biblioteca.")).toBeVisible()
    await page.getByRole("link", { name: title }).click()
    await page.getByRole("button", { name: "Archivar" }).click()
    await expect(page.getByText("Nota archivada.")).toBeVisible()

    const archivedLink = page
      .locator("section")
      .filter({ hasText: "Archivadas" })
      .getByRole("link", { name: title })
    await expect(archivedLink).toBeVisible()
    await archivedLink.click()

    await page.getByRole("button", { name: "Restaurar" }).click()
    await expect(page.getByText("Nota restaurada.")).toBeVisible()
    await expect(page.getByRole("link", { name: title })).toBeVisible()
  })

  test("crea, archiva, restaura y elimina un proyecto con su tarea", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-chromium", "Solo escritorio")

    const uniqueId = Date.now().toString()
    const projectTitle = `Proyecto lifecycle ${uniqueId}`
    const taskTitle = `Tarea lifecycle ${uniqueId}`

    await page.goto("/dev")

    const containerSection = page.locator("section").filter({
      has: page.getByRole("heading", { name: "Life OS" }),
    }).first()

    await containerSection.getByRole("button", { name: "Nuevo proyecto" }).click()
    await containerSection.getByPlaceholder("Nombre del nuevo proyecto...").fill(projectTitle)
    await containerSection.getByRole("button", { name: "Crear proyecto" }).click()

    await expect(containerSection.getByText("Proyecto creado en Backlog.")).toBeVisible()

    const projectDetails = page.locator("details").filter({ hasText: projectTitle }).first()
    await expect(projectDetails).toBeVisible()

    await projectDetails.getByRole("button", { name: "Agregar tarea" }).click()
    await projectDetails
      .getByPlaceholder("Nueva tarea dentro de este proyecto...")
      .fill(taskTitle)
    await projectDetails.getByRole("button", { name: "Agregar tarea" }).click()

    await expect(projectDetails.getByText(taskTitle)).toBeVisible()

    await projectDetails.getByRole("button", { name: "Archivar" }).click()
    await expect(containerSection.getByText("Proyecto archivado.")).toBeVisible()
    await expect(page.locator("details").filter({ hasText: projectTitle })).toHaveCount(0)

    const archivedSection = containerSection.locator("section").filter({
      hasText: "Archivados",
    })
    await expect(archivedSection.getByText(projectTitle)).toBeVisible()
    await expect(archivedSection.getByText(/Archivado el/i)).toBeVisible()

    await archivedSection.getByRole("button", { name: "Restaurar" }).click()
    await expect(containerSection.getByText("Proyecto restaurado.")).toBeVisible()
    await expect(page.locator("details").filter({ hasText: projectTitle })).toBeVisible()

    const restoredProjectDetails = page.locator("details").filter({ hasText: projectTitle }).first()
    await restoredProjectDetails.getByRole("button", { name: "Archivar" }).click()
    await expect(containerSection.getByText("Proyecto archivado.")).toBeVisible()

    await expect(archivedSection.getByText(projectTitle)).toBeVisible()
    await archivedSection.getByRole("button", { name: "Eliminar" }).click()
    await expect(archivedSection.getByText("Eliminar proyecto")).toBeVisible()
    await expect(
      archivedSection.getByText(
        "Se borra de forma definitiva junto con sus tareas y notas operativas."
      )
    ).toBeVisible()
    await archivedSection.getByRole("button", { name: "Sí, eliminar" }).click()

    await expect(page.getByText("Proyecto eliminado con todo su contexto operativo.")).toBeVisible()
    await expect(page.getByText(projectTitle)).toHaveCount(0)
    await expect(page.getByText(taskTitle)).toHaveCount(0)
  })

  test("review permite activar backlog y planificar una tarea sin fecha", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-chromium", "Solo escritorio")

    const uniqueId = Date.now().toString()
    const projectTitle = `Review backlog ${uniqueId}`
    const taskTitle = `Review task ${uniqueId}`

    await page.goto("/dev")

    const containerSection = page.locator("section").filter({
      has: page.getByRole("heading", { name: "Life OS" }),
    }).first()

    await containerSection.getByRole("button", { name: "Nuevo proyecto" }).click()
    await containerSection.getByPlaceholder("Nombre del nuevo proyecto...").fill(projectTitle)
    await containerSection.getByRole("button", { name: "Crear proyecto" }).click()

    const projectDetails = page.locator("details").filter({ hasText: projectTitle }).first()
    await projectDetails.getByRole("button", { name: "Agregar tarea" }).click()
    await projectDetails
      .getByPlaceholder("Nueva tarea dentro de este proyecto...")
      .fill(taskTitle)
    await projectDetails.getByRole("button", { name: "Agregar tarea" }).click()

    await page.goto("/review")

    const backlogArticle = page.locator("article").filter({ hasText: projectTitle }).first()
    await backlogArticle.getByRole("button", { name: "Activar" }).click()
    await expect(page.getByText("Proyecto devuelto al foco activo.")).toBeVisible()

    const taskArticle = page.locator("article").filter({ hasText: taskTitle }).first()
    await taskArticle.getByRole("button", { name: "Hoy" }).click()
    await expect(page.getByText("Tarea sumada a Hoy.")).toBeVisible()

    await page.goto("/today")
    await expect(page.getByText(taskTitle)).toBeVisible()
  })

  test("la command surface puede mandar un proyecto visible a parking", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-chromium", "Solo escritorio")

    const uniqueId = Date.now().toString()
    const projectTitle = `Command parking ${uniqueId}`

    await page.goto("/dev")

    const containerSection = page.locator("section").filter({
      has: page.getByRole("heading", { name: "Life OS" }),
    }).first()

    await containerSection.getByRole("button", { name: "Nuevo proyecto" }).click()
    await containerSection.getByPlaceholder("Nombre del nuevo proyecto...").fill(projectTitle)
    await containerSection.getByRole("button", { name: "Crear proyecto" }).click()

    await page.keyboard.press("Control+K")
    await expect(page.getByRole("dialog", { name: "Command surface de Life OS" })).toBeVisible()

    const commandInput = page.getByLabel("Buscar en Life OS")
    await commandInput.fill(projectTitle)

    const resultArticle = page.locator("article").filter({ hasText: projectTitle }).first()
    await expect(resultArticle).toBeVisible()
    await resultArticle.getByRole("button", { name: "Parking" }).click()

    await page.goto("/parking")
    await expect(page.getByText(projectTitle)).toBeVisible()
  })
})
