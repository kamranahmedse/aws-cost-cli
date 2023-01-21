import ora, { Ora } from 'ora';
import chalk from 'chalk';
import dayjs from 'dayjs';
import Table from 'cli-table3';
import { CostByService } from './cost';

let spinner: Ora | undefined;

/**
 * Shows the spinner with the given text
 * @param text Text to show in the spinner
 */
export function showSpinner(text: string) {
  if (!spinner) {
    spinner = ora({ text: '' }).start();
  }

  spinner.text = text;
}

/**
 * Hides the spinner and removes the loading text
 * @returns undefined
 */
export function hideSpinner() {
  if (!spinner) {
    return;
  }

  spinner.stop();
}
export function printData(accountAlias: string, costByService: CostByService) {
  showSpinner('Calculating totals');

  const allServices = Object.keys(costByService).sort(
    (a, b) => b.length - a.length
  );

  // Get the max length of the service names
  // This is used to align the columns
  const maxServiceLength =
    allServices.reduce((max, service) => {
      return Math.max(max, service.length);
    }, 0) + 1; // Add 1 for padding

  const serviceHeader = chalk.cyan('Service'.padStart(maxServiceLength));
  const lastMonthHeader = chalk.cyan(`Prev Month`);
  const thisMonthHeader = chalk.cyan(`This Month`);
  const last7DaysHeader = chalk.cyan(`Last 7d`);
  const yesterdayHeader = chalk.cyan('Yesterday');

  const table = new Table({
    chars: { mid: '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' },
    head: [
      serviceHeader,
      lastMonthHeader,
      thisMonthHeader,
      last7DaysHeader,
      yesterdayHeader,
    ],
  });

  let totalLastMonth = 0;
  let totalThisMonth = 0;
  let totalLast7Days = 0;
  let totalYesterday = 0;

  for (const service of allServices) {
    const servicePrices = costByService[service];

    let lastMonthServiceTotal = 0;
    let thisMonthServiceTotal = 0;
    let last7DaysServiceTotal = 0;
    let yesterdayServiceTotal = 0;

    const startOfLastMonth = dayjs().subtract(1, 'month').startOf('month');
    const startOfThisMonth = dayjs().startOf('month');
    const startOfLast7Days = dayjs().subtract(7, 'day');
    const startOfYesterday = dayjs().subtract(1, 'day');

    for (const date of Object.keys(servicePrices)) {
      const price = servicePrices[date];
      const dateObj = dayjs(date);

      if (dateObj.isSame(startOfLastMonth, 'month')) {
        lastMonthServiceTotal += price;
      }

      if (dateObj.isSame(startOfThisMonth, 'month')) {
        thisMonthServiceTotal += price;
      }

      if (
        dateObj.isSame(startOfLast7Days, 'week') &&
        !dateObj.isSame(startOfYesterday, 'day')
      ) {
        last7DaysServiceTotal += price;
      }

      if (dateObj.isSame(startOfYesterday, 'day')) {
        yesterdayServiceTotal += price;
      }
    }

    const serviceValue = service.padStart(maxServiceLength);
    const lastMonthValue = lastMonthServiceTotal.toFixed(2);
    const thisMonthValue = thisMonthServiceTotal.toFixed(2);
    const last7DaysValue = last7DaysServiceTotal.toFixed(2);
    const yesterdayValue = yesterdayServiceTotal.toFixed(2);

    table.push([
      serviceValue,
      lastMonthValue,
      thisMonthValue,
      last7DaysValue,
      yesterdayValue,
    ]);

    totalLastMonth += lastMonthServiceTotal;
    totalThisMonth += thisMonthServiceTotal;
    totalLast7Days += last7DaysServiceTotal;
    totalYesterday += yesterdayServiceTotal;
  }

  table.push([
    chalk.yellowBright('Total'.padStart(maxServiceLength)),
    chalk.yellowBright(totalLastMonth.toFixed(2)),
    chalk.yellowBright(totalThisMonth.toFixed(2)),
    chalk.yellowBright(totalLast7Days.toFixed(2)),
    chalk.yellowBright(totalYesterday.toFixed(2)),
  ]);

  hideSpinner();

  console.clear();
  console.log('');
  console.log(`AWS Cost Report: ${chalk.bold.yellow(accountAlias)}`);
  console.log(table.toString());
}