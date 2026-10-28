import { expect, test } from "@playwright/test";

test.describe("foundation", () => {
  test("redirects the root to Swahili and renders the hero", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/sw$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "sw");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Habari, Tanzania");
    await expect(page.getByRole("searchbox", { name: "Uliza swali au andika huduma" })).toBeVisible();
  });

  test("switches language and back", async ({ page }) => {
    await page.goto("/sw");
    await page.getByRole("link", { name: "English" }).click();
    await expect(page).toHaveURL(/\/en$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Hello, Tanzania");
    // Small screens hide the current language and show only the other one, so look past visibility.
    await expect(page.getByRole("link", { name: "English", includeHidden: true })).toHaveAttribute(
      "aria-current",
      "true",
    );

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
    await page.getByRole("button", { name: "Uliza" }).click();
    await expect(page).toHaveURL(/\/sw\/tafuta\?q=leseni\+ya\+udereva$/);
    await expect(page.getByText("Ulitafuta: leseni ya udereva")).toBeVisible();
    await context.close();
  });

  test("example question shows a guide card", async ({ page }) => {
    await page.goto("/en");
    await page.getByRole("link", { name: "Register a business", exact: true }).click();
    await expect(page.getByRole("heading", { name: /BRELA/ }).first()).toBeVisible();
  });

  test("service pages are server-rendered with official sources", async ({ page }) => {
    await page.goto("/sw/huduma/pasipoti");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Pasipoti (Uhamiaji)");
    await expect(page.getByText("TZS 150,000")).toBeVisible();
    await expect(page.getByText(/Imekaguliwa mwisho/)).toBeVisible();
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
    await expect(page.locator("body")).toHaveCSS("background-color", "rgb(15, 14, 36)");
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
    // Only what is visible at this width: the desktop navigation bar is hidden behind the menu button.
    const targets = page
      .locator("header :is(a, button, input, summary), [data-surface=hero] :is(a, button, input)")
      .filter({ visible: true });
    expect(await targets.count()).toBeGreaterThan(5);
    for (const target of await targets.all()) {
      const box = await target.boundingBox();
      expect(box?.height ?? 0, await target.evaluate((el) => el.outerHTML.slice(0, 80))).toBeGreaterThanOrEqual(44);
    }
  });

  test("opens the mobile menu and the trust banner without JavaScript", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 360, height: 740 } });
    const page = await context.newPage();
    await page.goto("/sw");
    await page.locator("details").first().locator("summary").click();
    await expect(page.getByText("Hatuombi taarifa zako binafsi")).toBeVisible();
    await page.locator("header summary").click();
    await page.getByRole("navigation", { name: "Menyu kuu" }).getByRole("link", { name: "Huduma zote" }).click();
    await expect(page).toHaveURL(/\/sw\/huduma$/);
    await context.close();
  });

  test("shows a localised not-found page", async ({ page }) => {
    const response = await page.goto("/en/does-not-exist");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Page not found");
  });
});
