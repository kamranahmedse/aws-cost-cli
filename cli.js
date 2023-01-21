import AWS from 'aws-sdk';
import dayjs from 'dayjs';
import chalk from 'chalk';
import dotenv from 'dotenv';
import Table from 'cli-table3';
import ora from 'ora';

dotenv.config();

const spinner = ora({ text: '' }).start();

const endDate = dayjs().subtract(1, 'day');
const startDate = endDate.subtract(65, 'day');

async function getAccountAlias() {
  spinner.text = 'Getting account alias';

  const iam = new AWS.IAM({
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY,
    },
    region: process.env.AWS_REGION || 'us-east-1',
  });

  const accountAliases = await iam.listAccountAliases().promise();
  const foundAlias = accountAliases?.['AccountAliases']?.[0];

  if (foundAlias) {
    return foundAlias;
  }

  const sts = new AWS.STS({
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY,
    },
    region: process.env.AWS_REGION || 'us-east-1',
  });

  const accountInfo = await sts.getCallerIdentity().promise();

  return accountInfo?.Account || '';
}

async function getPricingData() {
  spinner.text = 'Getting pricing data';

  const costExplorer = new AWS.CostExplorer({
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY,
    },
    region: process.env.AWS_REGION || 'us-east-1',
  });

  // Define the parameters for the getCostAndUsage function
  const params = {
    TimePeriod: {
      Start: startDate.format('YYYY-MM-DD'),
      End: endDate.format('YYYY-MM-DD'),
    },
    Granularity: 'DAILY',
    Filter: {
      Not: {
        Dimensions: {
          Key: 'RECORD_TYPE',
          Values: ['Credit', 'Refund', 'Upfront', 'Support'],
        },
      },
    },
    Metrics: ['UnblendedCost'],
    GroupBy: [
      {
        Type: 'DIMENSION',
        Key: 'SERVICE',
      },
    ],
  };

  // Get the cost and usage data for the specified account
  const pricingData = await costExplorer.getCostAndUsage(params).promise();

  const costByService = {};

  for (const day of pricingData.ResultsByTime) {
    for (const group of day.Groups) {
      const serviceName = group.Keys[0];
      const cost = group.Metrics.UnblendedCost.Amount;
      const costDate = day.TimePeriod.End;

      costByService[serviceName] = costByService[serviceName] || {};
      costByService[serviceName][costDate] = parseFloat(cost);
    }
  }

  return costByService;
}

function printData(accountAlias, pricingData) {
  spinner.text = 'Calculating totals';

  const allServices = Object.keys(pricingData).sort((a, b) => b.length - a.length);

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
    head: [serviceHeader, lastMonthHeader, thisMonthHeader, last7DaysHeader, yesterdayHeader],
  });

  let totalLastMonth = 0;
  let totalThisMonth = 0;
  let totalLast7Days = 0;
  let totalYesterday = 0;

  for (const service of allServices) {
    const servicePrices = pricingData[service];

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

      if (dateObj.isSame(startOfLast7Days, 'week') && !dateObj.isSame(startOfYesterday, 'day')) {
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

    table.push([serviceValue, lastMonthValue, thisMonthValue, last7DaysValue, yesterdayValue]);

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

  spinner.stop();

  console.log('');
  console.log(`AWS Cost Report: ${chalk.bold.yellow(accountAlias)}`);
  console.log(table.toString());
}

async function runner() {
  const pricingData = await getPricingData();
  const accountAlias = await getAccountAlias();

  printData(accountAlias, pricingData);
}

runner()
  .then((data) => {})
  .catch((err) => {
    console.log(err);
  });
