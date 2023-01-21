import chalk from 'chalk';
import Table from 'cli-table3';
import { TotalCosts } from './cost';
import { hideSpinner } from './spinner';

export function printText(accountAlias: string, totals: TotalCosts) {
  hideSpinner();
  console.clear();

  const allServices = Object.keys(totals.totalsByService.lastMonth);
  const sortedServiceNames = allServices.sort((a, b) => b.length - a.length);

  const maxServiceLength =
    sortedServiceNames.reduce((max, service) => {
      return Math.max(max, service.length);
    }, 0) + 1;

  const totalLastMonth = chalk.green(`$${totals.totals.lastMonth.toFixed(2)}`);
  const totalThisMonth = chalk.green(`$${totals.totals.thisMonth.toFixed(2)}`);
  const totalLast7Days = chalk.green(`$${totals.totals.last7Days.toFixed(2)}`);
  const totalYesterday = chalk.green(`$${totals.totals.yesterday.toFixed(2)}`);

  console.log('');
  console.log(`${'AWS Cost Report:'.padStart(maxServiceLength)} ${chalk.bold.yellow(accountAlias)}`);
  console.log('');
  console.log(`${'Last Month'.padStart(maxServiceLength)}: ${totalLastMonth}`);
  console.log(`${'This Month'.padStart(maxServiceLength)}: ${totalThisMonth}`);
  console.log(`${'Last 7 days'.padStart(maxServiceLength)}: ${totalLast7Days}`);
  console.log(`${'Yesterday'.padStart(maxServiceLength)}: ${totalYesterday}`);
  console.log('');

  const headerPadLength = 11;

  const serviceHeader = chalk.white('Service'.padStart(maxServiceLength));
  const lastMonthHeader = chalk.white(`Last Month`.padEnd(headerPadLength));
  const thisMonthHeader = chalk.white(`This Month`.padEnd(headerPadLength));
  const last7DaysHeader = chalk.white(`Last 7d`.padEnd(headerPadLength));
  const yesterdayHeader = chalk.white('Yesterday'.padEnd(headerPadLength));

  console.log(
    `${serviceHeader} ${lastMonthHeader} ${thisMonthHeader} ${last7DaysHeader} ${yesterdayHeader}`
  );

  for (let service of sortedServiceNames) {
    const serviceLabel = chalk.cyan(service.padStart(maxServiceLength));
    const lastMonthTotal = chalk.green(
      `$${totals.totalsByService.lastMonth[service].toFixed(2)}`.padEnd(
        headerPadLength
      )
    );
    const thisMonthTotal = chalk.green(
      `$${totals.totalsByService.thisMonth[service].toFixed(2)}`.padEnd(
        headerPadLength
      )
    );
    const last7DaysTotal = chalk.green(
      `$${totals.totalsByService.last7Days[service].toFixed(2)}`.padEnd(
        headerPadLength
      )
    );
    const yesterdayTotal = chalk.green(
      `$${totals.totalsByService.yesterday[service].toFixed(2)}`.padEnd(
        headerPadLength
      )
    );

    console.log(
      `${serviceLabel} ${lastMonthTotal} ${thisMonthTotal} ${last7DaysTotal} ${yesterdayTotal}`
    );
  }
}

export function printJson(accountAlias: string, totals: TotalCosts) {
  hideSpinner();
  console.log(
    JSON.stringify(
      {
        account: accountAlias,
        totals,
      },
      null,
      2
    )
  );
}

export function printTable(accountAlias: string, totals: TotalCosts) {
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
