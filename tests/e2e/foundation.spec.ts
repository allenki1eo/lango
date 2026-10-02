import { expect, test } from "@playwright/test";

test.describe("foundation", () => {
  test("redirects the root to Swahili and renders the hero", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/sw$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "sw");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Unataka kufanya nini leo?");
    await expect(page.getByRole("searchbox", { name: "Andika huduma unayotafuta" })).toBeVisible();
  });

  test("switches language and back", async ({ page }) => {
    await page.goto("/sw");
    await page.getByRole("link", { name: "English" }).click();
    await expect(page).toHaveURL(/\/en$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("What do you need to do today?");
    await expect(page.getByRole("link", { name: "English" })).toHaveAttribute("aria-current", "true");

    await page.getByRole("link", { name: "Kiswahili" }).click();
    await expect(page).toHaveURL(/\/sw$/);
  });

  test("stays Swahili-first even when the browser asks for English", async ({ browser }) => {
    const context = await browser.newContext({ locale: "en-US" });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page).toHaveURL(/\/sw$/);
    await context.close();
  });

  test("remembers the chosen language on the next visit", async ({ page }) => {
    await page.goto("/sw");
    await page.getByRole("link", { name: "English" }).click();
    await expect(page).toHaveURL(/\/en$/);
    await page.goto("/");
    await expect(page).toHaveURL(/\/en$/);
  });

  test("keeps the search query when switching language", async ({ page }) => {
    await page.goto("/sw/tafuta?q=leseni");
    await page.getByRole("link", { name: "English" }).click();
    await expect(page).toHaveURL(/\/en\/tafuta\?q=leseni$/);
    await expect(page.getByRole("searchbox")).toHaveValue("leseni");
  });

  test("submits search as a plain form, without JavaScript", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/sw");
    await page.getByRole("searchbox").fill("leseni ya udereva");
    await page.getByRole("button", { name: "Tafuta" }).click();
    await expect(page).toHaveURL(/\/sw\/tafuta\?q=leseni\+ya\+udereva$/);
    await expect(page.getByText("Ulitafuta: leseni ya udereva")).toBeVisible();
    await context.close();
  });

  test("example queries lead to search", async ({ page }) => {
    await page.goto("/en");
    await page.getByRole("link", { name: "Driving licence" }).click();
    await expect(page).toHaveURL(/\/en\/tafuta\?q=Driving\+licence$/);
  });

  test("fits a 360 px screen without horizontal scrolling", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    for (const path of ["/sw", "/en", "/sw/tafuta?q=tin"]) {
      await page.goto(path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, path).toBeLessThanOrEqual(0);
    }
  });

  test("uses dark tokens when the system prefers dark", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/sw");
    await expect(page.locator("body")).toHaveCSS("background-color", "rgb(9, 19, 15)");
  });

  test("offers a skip link as the first focus stop", async ({ page }) => {
    await page.goto("/sw");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Ruka hadi maudhui" });
    await expect(skip).toBeFocused();
    await expect(skip).toBeVisible();
  });

  test("keeps touch targets at least 44 px tall on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto("/sw");
    const targets = page.locator("header a, header button, header input");
    for (const target of await targets.all()) {
      const box = await target.boundingBox();
      expect(box?.height ?? 0, await target.evaluate((el) => el.outerHTML.slice(0, 80))).toBeGreaterThanOrEqual(44);
    }
  });

  test("shows a localised not-found page", async ({ page }) => {
    const response = await page.goto("/en/does-not-exist");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Page not found");
  });
});
