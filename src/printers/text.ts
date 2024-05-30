import { TotalCosts } from '../cost';
import { hideSpinner } from '../logger';

function printPlainSummary(accountAlias: string, costs: TotalCosts) {
  hideSpinner();
  console.clear();
  console.log('');
  console.log(`Account: ${accountAlias}`);
  console.log('');
  console.log('Totals:');
  console.log(`  Last Month: $${costs.totals.lastMonth.toFixed(2)}`);
  console.log(`  This Month: $${costs.totals.thisMonth.toFixed(2)}`);
  console.log(`  Last 7 Days: $${costs.totals.last7Days.toFixed(2)}`);
  console.log(`  Yesterday: $${costs.totals.yesterday.toFixed(2)}`);
}

export function printPlainText(accountAlias: string, totals: TotalCosts, isSummary: boolean = false) {
  printPlainSummary(accountAlias, totals);
  if (isSummary) {
    return;
  }

  const serviceTotals = totals.totalsByService;

  const allServices = Object.keys(serviceTotals.yesterday).sort((a, b) => b.length - a.length);

  console.log('');
  console.log('Totals by Service:');

  console.log('  Last Month:');
  allServices.forEach((service) => {
    console.log(`    ${service}: $${serviceTotals.lastMonth[service].toFixed(2)}`);
  });

  console.log('');
  console.log('  This Month:');
  allServices.forEach((service) => {
    console.log(`    ${service}: $${serviceTotals.thisMonth[service].toFixed(2)}`);
  });

  console.log('');
  console.log('  Last 7 Days:');
  allServices.forEach((service) => {
    console.log(`    ${service}: $${serviceTotals.last7Days[service].toFixed(2)}`);
  });

  console.log('');
  console.log('  Yesterday:');
  allServices.forEach((service) => {
    console.log(`    ${service}: $${serviceTotals.yesterday[service].toFixed(2)}`);
  });
}

if (process.env.NODE_ENV === 'test') {
  module.exports = { printPlainSummary };
}
