import { getDateRanges, getMonthPickerString } from "./date";
import "dotenv/config";

const fileFormats = ["PDF", "XLSX", "CSV", "XML", "MT940"] as const;

export interface Configuration {
  datePickerStrings: {
    startDate: string;
    endDate: string;
    monthPicker: string;
  };
  email: string;
  month: number;
  fileFormat: (typeof fileFormats)[number];
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

  let fileFormat: Configuration["fileFormat"];
  if (!process.env.OUTPUT_FORMAT) {
    console.log("No OUTPUT_FORMAT provided in .env file, defaulting to CSV");
    fileFormat = "CSV";
  } else if (!fileFormats.includes(process.env.OUTPUT_FORMAT as any)) {
    console.error("Invalid OUTPUT_FORMAT provided in .env file");
    process.exit(1);
  } else {
    fileFormat = process.env.OUTPUT_FORMAT as any;
  }

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
    fileFormat,
  };
}

export function fileFormatToExt(format: Configuration["fileFormat"]): string {
  return "." + format.toLowerCase();
}
