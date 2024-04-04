import { Configuration } from "./main";
import { intervalToDuration } from "date-fns";

function formatDate(date: Date): string {
  const day = date.getDate().toString();
  const month = (date.getMonth() + 1).toString();
  const year = date.getFullYear();

  return `${month}/${day}/${year}`;
}

export function getDateRanges(
  /** month is 1-indexed */
  month: number,
  /** year is 4-digit */
  year: number,
): {
  start: string;
  end: string;
} {
  const startOfTheMonth = new Date(year, month - 1);
  const endOfTheMonth = new Date(year, month, 0);

  return { start: formatDate(startOfTheMonth), end: formatDate(endOfTheMonth) };
}

export function getMonthPickerString(month: number, year: number) {
  const dateObject = new Date(year, month - 1);
  const monthString = new Intl.DateTimeFormat("en-US", {
    month: "long",
  }).format(dateObject);

  return `${monthString} ${year}`;
}

export function calculateNumberOfClicks(
  monthPickerString: string,
  config: Configuration,
): number {
  const [month, year] = monthPickerString.split(" ");

  if (!month || !year) {
    throw new Error("Invalid monthPickerString:" + monthPickerString);
  }

  // This is a bit of a hack, you can insantiate a new date
  // by passing the written out string 'January 1, 2024'
  const monthPickerDate = new Date(`${month} 1, ${year}`);

  // Create a date out of the config info
  const configDate = new Date(`${config.month} 1, ${config.year}`);

  const { months } = intervalToDuration({
    end: monthPickerDate,
    start: configDate,
  });

  if (months === undefined) {
    throw new Error("Could not calculate months between dates");
  }

  return months;
}
