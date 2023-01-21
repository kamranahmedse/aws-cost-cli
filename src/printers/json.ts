import { TotalCosts } from '../cost';
import { hideSpinner } from '../spinner';

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