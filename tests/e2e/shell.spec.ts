import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"

test.describe("shell sin base de datos", () => {
  test("navega y conserva el estado del sidebar en escritorio", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-chromium", "Solo escritorio")
    const consoleErrors: string[] = []
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text())
    })
    await page.goto("/")

    await expect(page.getByRole("heading", { name: /buen/i })).toBeVisible()
    await expect(page.getByText("Conectá tu base para ver el pulso del sistema.")).toBeVisible()
    await page.getByRole("link", { name: "Hoy", exact: true }).click()
    await expect(page).toHaveURL(/\/today$/)
    await expect(page.getByRole("link", { name: "Hoy", exact: true })).toHaveAttribute("aria-current", "page")

    await page.getByRole("button", { name: "Contraer navegación" }).click()
    await expect(page.getByRole("button", { name: "Expandir navegación" })).toBeVisible()
    await page.reload()
    await expect(page.getByRole("button", { name: "Expandir navegación" })).toBeVisible()
    expect(consoleErrors.filter((message) => message.includes("Hydration failed"))).toEqual([])
  })

  test("el sheet Más es accesible y restaura el foco", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile-chromium", "Solo móvil")
    await page.goto("/")
    const trigger = page.getByRole("button", { name: "Más" })

    await trigger.click()
    const dialog = page.getByRole("dialog", { name: "Más espacios" })
    await expect(dialog).toBeVisible()
    await expect(page.getByRole("button", { name: "Cerrar", exact: true })).toBeFocused()

    await page.keyboard.press("Escape")
    await expect(dialog).toBeHidden()
    await expect(trigger).toBeFocused()

    await trigger.click()
    await dialog.getByRole("link", { name: "Biblioteca" }).click()
    await expect(page).toHaveURL(/\/library$/)
    await expect(dialog).toBeHidden()
    await expect(trigger).toHaveAttribute("aria-expanded", "false")
  })

  test("la command surface restaura el foco al cerrarse", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-chromium", "Solo escritorio")
    await page.goto("/")

    const trigger = page.getByRole("button", { name: "Abrir command surface" }).first()
    await trigger.click()

    const dialog = page.getByRole("dialog", { name: "Command surface de Life OS" })
    await expect(dialog).toBeVisible()
    await expect(page.getByLabel("Buscar en Life OS")).toBeFocused()

    await page.keyboard.press("Escape")
    await expect(dialog).toBeHidden()
    await expect(trigger).toBeFocused()
  })

  test("no presenta violaciones críticas o serias", async ({ page }) => {
    await page.goto("/")
    const results = await new AxeBuilder({ page }).analyze()
    const blocking = results.violations.filter((violation) => violation.impact === "critical" || violation.impact === "serious")
    expect(blocking).toEqual([])
  })
})
