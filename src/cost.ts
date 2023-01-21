import AWS from 'aws-sdk';
import dayjs from 'dayjs';
import { AWSConfig } from './config';
import { showSpinner } from './reporter';

export type CostByService = {
  [key: string]: Record<string, number>;
};

export async function getCosts(awsConfig: AWSConfig): Promise<CostByService> {
  showSpinner('Getting pricing data');

  const costExplorer = new AWS.CostExplorer(awsConfig);
  const endDate = dayjs().subtract(1, 'day');
  const startDate = endDate.subtract(65, 'day');

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
