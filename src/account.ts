import AWS from 'aws-sdk';
import { AWSConfig } from './config';
import { showSpinner } from './logger';

export async function getAccountAlias(awsConfig: AWSConfig): Promise<string> {
  showSpinner('Getting account alias');

  const iam = new AWS.IAM(awsConfig);

  const accountAliases = await iam.listAccountAliases().promise();
  const foundAlias = accountAliases?.['AccountAliases']?.[0];

  if (foundAlias) {
    return foundAlias;
  }

  const sts = new AWS.STS(awsConfig);

  const accountInfo = await sts.getCallerIdentity().promise();

  return accountInfo?.Account || '';
}
