import { chromium } from "playwright";
import type { Page } from "playwright";
import { fileFormatToExt, type Configuration } from "./config";
import { calculateNumberOfClicks } from "./date";

export async function initializePlaywright() {
  // Init playwright, chrome is fine
  // If you run this for the first time, Playwright
  // will probably error out and prompt you to install
  // the browser. Just follow the instructions and retry again.
  const browser = await chromium.launch({
    // Set headless to false to see what's going on
    // in the browser. I sometimes have to solve a captcha.
    // If I solve this to run without headless, I probably
    // don't need to work another day in my life
    headless: false,
  });

  const context = await browser.newContext();
  return await context.newPage();
}

export async function logInToWise(page: Page, config: Configuration) {
  console.log("Logging in to Wise...");

  await page.getByRole("link", { name: "Log in" }).click();

  await page
    .getByRole("textbox", { name: "Your email address" })
    .fill(config.email);
  await page
    .getByRole("textbox", { name: "Your password" })
    .fill(config.password);

  // This is the point we sometimes hit friendly captcha challenges.
  // I usually stick around in Playwright to help the runner out.
  await page.getByRole("button", { name: "Log in" }).click();
}

export async function chooseAccount(page: Page, account: string) {
  console.log("Choosing account...");
  // I have multiple accounts, so I need to choose one.
  // Have not tested this with an account that only has one account.
  // Might be an action only required for a Wise account with multiple accounts.
  await page.getByRole("button", { name: account }).click();
}

export async function openStatementsAndReportsPage(page: Page) {
  console.log("Opening statements and reports page...");

  // Opens the menu in the top right.
  await page
    .getByRole("button", { name: "Open or close account menu" })
    .click();
  await page.getByRole("menuitem", { name: "Statements and reports" }).click();

  // This prompts a dialog choosing between Statement Transactions and
  // Statement of fees.
  await page.getByRole("button", { name: "Statement Transactions" }).click();
}

export async function setFixedFormFields(page: Page, config: Configuration) {
  console.log("Setting fixed form fields...");
  // Choose the file format
  await page.getByRole("button", { name: "File format" }).click();
  await page.getByRole("option", { name: config.fileFormat }).click();

  // TODO Choose between statements with fees included or separated
}

export async function setDateFormFields(page: Page, config: Configuration) {
  console.log("Setting from date...");

  await page.getByLabel("Start date").click();
  // Find the correct month page.
  const startMonthPickerButton = page.getByRole("button", {
    name: "Go to 20 year view",
  });

  const startMonthInnerText = await startMonthPickerButton.innerText();
  const numberOfClicks = calculateNumberOfClicks(startMonthInnerText, config);

  for (let i = 0; i < numberOfClicks; i++) {
    await page.getByRole("button", { name: "previous month" }).click();
  }

  await page
    .getByRole("button", { name: config.datePickerStrings.startDate })
    .click();

  console.log("Setting end date...");
  await page.getByLabel("End date").click();
  // Find the correct month page.
  const endMonthPickerButton = page.getByRole("button", {
    name: "Go to 20 year view",
  });
  const endMonthInnerText = await endMonthPickerButton.innerText();
  const numberOfClicksToEndMonth = calculateNumberOfClicks(
    endMonthInnerText,
    config,
  );

  for (let i = 0; i < numberOfClicksToEndMonth; i++) {
    await page.getByRole("button", { name: "previous month" }).click();
  }
  await page
    .getByRole("button", { name: config.datePickerStrings.endDate })
    .click();
}

export async function chooseBalance(page: Page, balance: string) {
  console.log("Choosing balance '" + balance + "'...");
  // Choose the balance or jar
  await page.getByRole("button", { name: "Your balance or jar" }).click();
  await page.getByRole("option", { name: balance }).click();
}

export async function downloadStatement(
  page: Page,
  config: Configuration,
  balance: string,
) {
  console.log("Downloading statement...");
  // Get ready to download the files
  await page.getByRole("button", { name: "Download" }).click();
  await page
    .getByRole("textbox", { name: "Your password" })
    .fill(config.password);

  // Start waiting for download before clicking. Note no await.
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Done" }).click();
  const download = await downloadPromise;
  // Wait for the download process to complete and save the downloaded file somewhere.

  // TODO: make this line more readable.
  await download.saveAs(
    `./downloads/${String(config.wiseAccount).toLowerCase()}-${config.year}-${String(config.month).padStart(2, "0")}${balance.split(" ")[0]}${fileFormatToExt(config.fileFormat)}`,
  );
}
