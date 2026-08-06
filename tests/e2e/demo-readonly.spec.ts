import { expect, test } from "@playwright/test"

test.describe("demo pública", () => {
  test.skip(process.env.DEMO_READ_ONLY !== "true", "Requiere DEMO_READ_ONLY=true")

  test("expone navegación y bloquea mutaciones principales", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-chromium", "Solo escritorio")

    await page.goto("/")
    await expect(page.getByText("Demo pública · solo lectura")).toBeVisible()
    await expect(page.getByPlaceholder("Ej: pensar el flujo para procesar ideas del inbox...")).toBeDisabled()
    await expect(page.getByRole("button", { name: "Capturar" })).toBeDisabled()

    await page.getByRole("button", { name: "Abrir command surface" }).first().click()
    await expect(page.getByRole("dialog", { name: "Command surface de Life OS" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Nueva captura" })).toHaveCount(0)
    await expect(page.getByRole("button", { name: "Nueva nota en Biblioteca" })).toHaveCount(0)

    await page.goto("/inbox")
    const processButtons = page.getByRole("button", { name: "Procesar" })
    const processCount = await processButtons.count()
    for (let index = 0; index < processCount; index += 1) {
      await expect(processButtons.nth(index)).toBeDisabled()
    }
  })
})
