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
})
