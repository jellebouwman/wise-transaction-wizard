import { getDateRanges, getMonthPickerString } from "./date";
import "dotenv/config";

export interface Configuration {
  datePickerStrings: {
    startDate: string;
    endDate: string;
    monthPicker: string;
  };
  email: string;
  month: number;
  fileFormat: "CSV";
  password: string;
  wiseAccount: string;
  wiseBalances: string[];
  year: number;
}

// TODO: Improve the error handling and hand holding
// When reading from the environment variables
// Alternatively, we could move to a CI wizard for missing variables:
// Set the things that are fixed, ask the things that are missing,
// something like a month / year might change more often.
export function processConfiguration(): Configuration {
  if (!process.env.WISE_EMAIL) {
    console.error("Please provide WISE_EMAIL in .env file");
    process.exit(1);
  }
  const email = process.env.WISE_EMAIL;

  if (!process.env.WISE_PASSWORD) {
    console.error("Please provide WISE_PASSWORD in .env file");
    process.exit(1);
  }
  const password = process.env.WISE_PASSWORD;

  if (!process.env.WISE_ACCOUNT) {
    console.error("Please provide WISE_ACCOUNT in .env file");
    process.exit(1);
  }
  const wiseAccount = process.env.WISE_ACCOUNT;

  if (!process.env.WISE_BALANCES) {
    console.error("Please provide WISE_BALANCES in .env file");
    process.exit(1);
  }
  const wiseBalances = process.env.WISE_BALANCES.split(",");

  if (!process.env.MONTH) {
    console.error("Please provide MONTH in .env file");
    process.exit(1);
  }
  const month = parseInt(process.env.MONTH);

  if (!process.env.YEAR) {
    console.error("Please provide YEAR in .env file");
    process.exit(1);
  }
  const year = parseInt(process.env.YEAR);

  const range = getDateRanges(month, year);

  return {
    datePickerStrings: {
      startDate: range.start,
      endDate: range.end,
      monthPicker: getMonthPickerString(month, year),
    },
    email,
    password,
    wiseAccount,
    wiseBalances,
    month,
    year,
    fileFormat: "CSV",
  };
}

export function fileFormatToExt(format: Configuration["fileFormat"]): string {
  if (format === "CSV") return ".csv";
  throw Error(`Unknown file format: ${format}`);
}
