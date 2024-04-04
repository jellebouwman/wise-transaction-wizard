import { calculateNumberOfClicks } from "./date";
import { fileFormatToExt, processConfiguration } from "./config";
import { initializePlaywright } from "./playwright";
import dedent from "dedent";

async function main() {
  // Reads out the .env file and sets the environment variables
  // to the config. Errors out if there's anything missing.
  const config = processConfiguration();

  const page = await initializePlaywright();

  // Go to Wise and go to sign in page.
  await page.goto("https://wise.com");
  await page.getByRole("button", { name: "Accept" }).click();
  await page.getByRole("link", { name: "Log in" }).click();

  // Sign in
  await page
    .getByRole("textbox", { name: "Your email address" })
    .fill(config.email);
  await page
    .getByRole("textbox", { name: "Your password" })
    .fill(config.password);
  await page.getByRole("button", { name: "Log in" }).click();

  // Choose an account
  // I have multiple accounts, so I need to choose one.
  // Have not tested this with an account that only has one account.
  await page.getByRole("button", { name: config.wiseAccount }).click();

  // Go to statements and reports
  await page
    .getByRole("button", { name: "Open or close account menu" })
    .click();
  await page.getByRole("menuitem", { name: "Statements and reports" }).click();
  await page.getByRole("button", { name: "Statement Transactions" }).click();

  // Choose the balance or jar
  await page.getByRole("button", { name: "Your balance or jar" }).click();
  await page.getByRole("option", { name: config.wiseBalances[0] }).click();

  // Choose the date range
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

  // Choose the file format
  await page.getByRole("button", { name: "File format" }).click();
  await page.getByRole("option", { name: config.fileFormat }).click();

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
  await download.saveAs(
    `./downloads/${String(config.wiseAccount).toLowerCase()}-${config.year}-${String(config.month).padStart(2, "0")}${fileFormatToExt(config.fileFormat)}`,
  );

  page.close();
}

main().then(() => {
  console.log("Done!");
  process.exit(0);
});
