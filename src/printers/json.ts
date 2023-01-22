import { TotalCosts } from '../cost';
import { hideSpinner } from '../logger';

export function printJson(
  accountAlias: string,
  totalCosts: TotalCosts,
  isSummary = false
) {
  hideSpinner();

  if (isSummary) {
    console.log(
      JSON.stringify(
        {
          account: accountAlias,
          totals: totalCosts.totals,
        },
        null,
        2
      )
    );

    return;
  }

  console.log(
    JSON.stringify(
      {
        account: accountAlias,
        ...totalCosts,
      },
      null,
      2
    )
  );
}
