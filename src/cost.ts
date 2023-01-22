import AWS from 'aws-sdk';
import dayjs from 'dayjs';
import { AWSConfig } from './config';
import { showSpinner } from './logger';

export type RawCostByService = {
  [key: string]: {
    [date: string]: number;
  };
};

export async function getRawCostByService(awsConfig: AWSConfig): Promise<RawCostByService> {
  showSpinner('Getting pricing data');

  const costExplorer = new AWS.CostExplorer(awsConfig);
  const endDate = dayjs().subtract(1, 'day');
  const startDate = endDate.subtract(65, 'day');

  // Get the cost and usage data for the specified account
  const pricingData = await costExplorer
    .getCostAndUsage({
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
    })
    .promise();

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

export type TotalCosts = {
  totals: {
    lastMonth: number;
    thisMonth: number;
    last7Days: number;
    yesterday: number;
  };
  totalsByService: {
    lastMonth: { [key: string]: number };
    thisMonth: { [key: string]: number };
    last7Days: { [key: string]: number };
    yesterday: { [key: string]: number };
  };
};

function calculateServiceTotals(rawCostByService: RawCostByService): TotalCosts {
  const totals = {
    lastMonth: 0,
    thisMonth: 0,
    last7Days: 0,
    yesterday: 0,
  };

  const totalsByService = {
    lastMonth: {},
    thisMonth: {},
    last7Days: {},
    yesterday: {},
  };

  const startOfLastMonth = dayjs().subtract(1, 'month').startOf('month');
  const startOfThisMonth = dayjs().startOf('month');
  const startOfLast7Days = dayjs().subtract(7, 'day');
  const startOfYesterday = dayjs().subtract(1, 'day');

  for (const service of Object.keys(rawCostByService)) {
    const servicePrices = rawCostByService[service];

    let lastMonthServiceTotal = 0;
    let thisMonthServiceTotal = 0;
    let last7DaysServiceTotal = 0;
    let yesterdayServiceTotal = 0;

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

    totalsByService.lastMonth[service] = lastMonthServiceTotal;
    totalsByService.thisMonth[service] = thisMonthServiceTotal;
    totalsByService.last7Days[service] = last7DaysServiceTotal;
    totalsByService.yesterday[service] = yesterdayServiceTotal;

    totals.lastMonth += lastMonthServiceTotal;
    totals.thisMonth += thisMonthServiceTotal;
    totals.last7Days += last7DaysServiceTotal;
    totals.yesterday += yesterdayServiceTotal;
  }

  return {
    totals,
    totalsByService,
  };
}

export async function getTotalCosts(awsConfig: AWSConfig): Promise<TotalCosts> {
  const rawCosts = await getRawCostByService(awsConfig);
  const totals = calculateServiceTotals(rawCosts);

  return totals;
}
