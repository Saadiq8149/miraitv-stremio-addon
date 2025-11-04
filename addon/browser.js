import { chromium } from "playwright";

let browser;
let context;

export async function initBrowser() {
  if (!browser) {
    browser = await chromium.launch({ headless: true });
    context = await browser.newContext();
  }
  return { browser, context };
}

export async function closeBrowser() {
  if (context) await context.close();
  if (browser) await browser.close();
  browser = null;
  context = null;
}

export { browser, context };
