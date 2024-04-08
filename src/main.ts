import { processConfiguration } from "./config";
import {
  chooseAccount,
  chooseBalance,
  downloadStatement,
  initializePlaywright,
  logInToWise,
  openStatementsAndReportsPage,
  setDateFormFields,
  setFixedFormFields,
} from "./playwright";

async function main() {
  // Reads out the .env file and sets the environment variables
  // to the config. Errors out if there's anything missing.
  const config = processConfiguration();

  const page = await initializePlaywright();

  // Go to Wise.
  await page.goto("https://wise.com");
  await page.getByRole("button", { name: "Accept" }).click();

  await logInToWise(page, config);

  await chooseAccount(page, config.wiseAccount);

  await openStatementsAndReportsPage(page);

  await setFixedFormFields(page, config);

  await setDateFormFields(page, config);

  // Choose a balance, download, save and repeat for all balances

  for (const balance of config.wiseBalances) {
    await chooseBalance(page, balance);

    await downloadStatement(page, config, balance);
  }

  page.close();
}

main().then(() => {
  console.log("Done!");
  process.exit(0);
});
