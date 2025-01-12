import fetch from 'node-fetch';
import { TotalCosts } from '../cost';

/**
 * Formats the costs by service into a string
 *
 * @param costs Cost breakdown for account
 * @returns formatted message
 */
function formatServiceBreakdown(costs: TotalCosts): string {
  const serviceCosts = costs.totalsByService;

  const sortedServices = Object.keys(serviceCosts.yesterday)
    .filter((service) => serviceCosts.yesterday[service] > 0)
    .sort((a, b) => serviceCosts.yesterday[b] - serviceCosts.yesterday[a]);

  const serviceCostsYesterday = sortedServices.map((service) => {
    return `> ${service}: \`$${serviceCosts.yesterday[service].toFixed(2)}\``;
  });

  return serviceCostsYesterday.join('\n');
}

export async function notifySlack(
  accountAlias: string,
  costs: TotalCosts,
  isSummary: boolean,
  slackToken: string,
  slackChannel: string
) {
  const channel = slackChannel;

  const totals = costs.totals;
  const serviceCosts = costs.totalsByService;

  let serviceCostsYesterday = [];
  Object.keys(serviceCosts.yesterday).forEach((service) => {
    serviceCosts.yesterday[service].toFixed(2);
    serviceCostsYesterday.push(`${service}: $${serviceCosts.yesterday[service].toFixed(2)}`);
  });

  const summary = `> *Account: ${accountAlias}*

> *Summary *
> Total Yesterday: \`$${totals.yesterday.toFixed(2)}\`
> Total This Month: \`$${totals.thisMonth.toFixed(2)}\`
> Total Last Month: \`$${totals.lastMonth.toFixed(2)}\`
`;

  const breakdown = `
> *Breakdown by Service:*
${formatServiceBreakdown(costs)}
`;

  let message = `${summary}`;
  if (!isSummary) {
    message += `${breakdown}`;
  }

  const response = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'post',
    body: JSON.stringify({
      channel,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: message,
          },
        },
      ],
    }),
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: `Bearer ${slackToken}`,
    },
  });

  const data = (await response.json()) as { ok: boolean; error?: string };
  if (!data.ok) {
    const message = data.error || 'Unknown error';
    console.error(`\nFailed to send message to Slack: ${message}`);
    process.exit(1);
  }

  console.log('\nSuccessfully sent message to Slack');
}
