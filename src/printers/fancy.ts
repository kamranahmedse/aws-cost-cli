import chalk from 'chalk';
import { TotalCosts } from '../cost';
import { hideSpinner } from '../logger';

export function printFancy(accountAlias: string, totals: TotalCosts, isSummary: boolean = false) {
  hideSpinner();
  console.clear();

  const totalCosts = totals.totals;
  const serviceCosts = totals.totalsByService;

  const allServices = Object.keys(serviceCosts.yesterday);
  const sortedServiceNames = allServices.sort((a, b) => b.length - a.length);

  const maxServiceLength =
    sortedServiceNames.reduce((max, service) => {
      return Math.max(max, service.length);
    }, 0) + 1;

  const totalLastMonth = chalk.green(`$${totalCosts.lastMonth.toFixed(2)}`);
  const totalThisMonth = chalk.green(`$${totalCosts.thisMonth.toFixed(2)}`);
  const totalLast7Days = chalk.green(`$${totalCosts.last7Days.toFixed(2)}`);
  const totalYesterday = chalk.bold.yellowBright(`$${totalCosts.yesterday.toFixed(2)}`);

  console.log('');
  console.log(`${'AWS Cost Report:'.padStart(maxServiceLength + 1)} ${chalk.bold.yellow(accountAlias)}`);
  console.log('');
  console.log(`${'Last Month'.padStart(maxServiceLength)}: ${totalLastMonth}`);
  console.log(`${'This Month'.padStart(maxServiceLength)}: ${totalThisMonth}`);
  console.log(`${'Last 7 days'.padStart(maxServiceLength)}: ${totalLast7Days}`);
  console.log(`${chalk.bold('Yesterday'.padStart(maxServiceLength))}: ${totalYesterday}`);
  console.log('');

  if (isSummary) {
    return;
  }

  const headerPadLength = 11;

  const serviceHeader = chalk.white('Service'.padStart(maxServiceLength));
  const lastMonthHeader = chalk.white(`Last Month`.padEnd(headerPadLength));
  const thisMonthHeader = chalk.white(`This Month`.padEnd(headerPadLength));
  const last7DaysHeader = chalk.white(`Last 7 Days`.padEnd(headerPadLength));
  const yesterdayHeader = chalk.bold.white('Yesterday'.padEnd(headerPadLength));

  console.log(`${serviceHeader} ${lastMonthHeader} ${thisMonthHeader} ${last7DaysHeader} ${yesterdayHeader}`);

  for (let service of sortedServiceNames) {
    const serviceLabel = chalk.cyan(service.padStart(maxServiceLength));
    const lastMonthTotal = chalk.green(`$${serviceCosts.lastMonth[service].toFixed(2)}`.padEnd(headerPadLength));
    const thisMonthTotal = chalk.green(`$${serviceCosts.thisMonth[service].toFixed(2)}`.padEnd(headerPadLength));
    const last7DaysTotal = chalk.green(`$${serviceCosts.last7Days[service].toFixed(2)}`.padEnd(headerPadLength));
    const yesterdayTotal = chalk.bold.yellowBright(
      `$${serviceCosts.yesterday[service].toFixed(2)}`.padEnd(headerPadLength)
    );

    console.log(`${serviceLabel} ${lastMonthTotal} ${thisMonthTotal} ${last7DaysTotal} ${yesterdayTotal}`);
  }
}
