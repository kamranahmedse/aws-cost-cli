import { TotalCosts } from '../cost';
import { hideSpinner } from '../spinner';

function printPlainSummary(accountAlias: string, totals: TotalCosts) {
  hideSpinner();
  console.clear();
  console.log('');
  console.log(`AWS Cost Report: ${accountAlias}`);
  console.log('');
  console.log(`Last Month: $${totals.totals.lastMonth.toFixed(2)}`);
  console.log(`This Month: $${totals.totals.thisMonth.toFixed(2)}`);
  console.log(`Last 7 Days: $${totals.totals.last7Days.toFixed(2)}`);
  console.log(`Yesterday: $${totals.totals.yesterday.toFixed(2)}`);
}

export function printPlainText(accountAlias: string, totals: TotalCosts, isSummary: boolean = false) {
  printPlainSummary(accountAlias, totals);
  if (isSummary) {
    return;
  }

  const allServices = Object.keys(totals.totalsByService.lastMonth).sort((a, b) => b.length - a.length);

  console.log('');
  console.log('Breakdown by Service:');
  console.log('');

  for (const service of allServices) {
    const lastMonth = totals.totalsByService.lastMonth[service];
    const thisMonth = totals.totalsByService.thisMonth[service];
    const last7Days = totals.totalsByService.last7Days[service];
    const yesterday = totals.totalsByService.yesterday[service];

    console.log(`${service}:`);
    console.log(
      `Last Month: $${lastMonth.toFixed(2)}, This month: $${thisMonth.toFixed(2)}, Last 7 Days: $${last7Days.toFixed(
        2
      )}, Yeseterday: $${yesterday.toFixed(2)}`
    );
  }
}
