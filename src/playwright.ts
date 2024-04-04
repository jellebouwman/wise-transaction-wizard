import * as playwright from "playwright";

export async function initializePlaywright() {
  // Init playwright, chrome is fine
  // If you run this for the first time, Playwright
  // will probably error out and prompt you to install
  // the browser. Just follow the instructions and retry again.
  const browser = await playwright.chromium.launch({
    // Set headless to false to see what's going on
    // in the browser. I sometimes have to solve a captcha.
    // If I solve this to run without headless, I probably
    // don't need to work another day in my life
    headless: false,
  });

  const context = await browser.newContext();
  return await context.newPage();
}
