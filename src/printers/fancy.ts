import chalk from 'chalk';
import Table from 'cli-table3';
import { TotalCosts } from '../cost';
import { hideSpinner } from '../spinner';

export function printFancy(accountAlias: string, totals: TotalCosts) {
  const allServices = Object.keys(totals.totalsByService.lastMonth).sort(
    (a, b) => b.length - a.length
  );

  // Get the max length of the service names
  // This is used to align the columns
  const maxServiceLength = allServices.reduce((max, service) => {
    return Math.max(max, service.length);
  }, 0);

  const serviceHeader = chalk.cyan('Service'.padStart(maxServiceLength));
  const lastMonthHeader = chalk.cyan(`Last Month`);
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

  for (const service of allServices) {
    table.push([
      chalk.cyan(service.padStart(maxServiceLength)),
      `$${totals.totalsByService.lastMonth[service].toFixed(2)}`,
      `$${totals.totalsByService.thisMonth[service].toFixed(2)}`,
      `$${totals.totalsByService.last7Days[service].toFixed(2)}`,
      `$${totals.totalsByService.yesterday[service].toFixed(2)}`,
    ]);
  }

  table.push([
    chalk.cyan('Total'.padStart(maxServiceLength)),
    chalk.green(`$${totals.totals.lastMonth.toFixed(2)}`),
    chalk.green(`$${totals.totals.thisMonth.toFixed(2)}`),
    chalk.green(`$${totals.totals.last7Days.toFixed(2)}`),
    chalk.green(`$${totals.totals.yesterday.toFixed(2)}`),
  ]);

  hideSpinner();
  console.clear();
  console.log('');
  console.log(`AWS Cost Report: ${chalk.bold.yellow(accountAlias)}`);
  console.log(table.toString());
}
