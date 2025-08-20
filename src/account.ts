import { IAMClient, ListAccountAliasesCommand } from '@aws-sdk/client-iam';
import { STSClient, GetCallerIdentityCommand } from '@aws-sdk/client-sts';
import { AWSConfig } from './config';
import { showSpinner } from './logger';

export async function getAccountAlias(awsConfig: AWSConfig): Promise<string> {
  showSpinner('Getting account alias');

  const iam = new IAMClient(awsConfig);

  const listAccountAliasesCommand = new ListAccountAliasesCommand({});
  const accountAliases = await iam.send(listAccountAliasesCommand);
  const foundAlias = accountAliases?.AccountAliases?.[0];

  if (foundAlias) {
    return foundAlias;
  }

  const sts = new STSClient(awsConfig);

  const getCallerIdentityCommand = new GetCallerIdentityCommand({});
  const accountInfo = await sts.send(getCallerIdentityCommand);

  return accountInfo?.Account || '';
}
