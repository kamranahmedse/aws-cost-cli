import fs from 'node:fs';
import { loadSharedConfigFiles } from '@aws-sdk/shared-ini-file-loader';
import chalk from 'chalk';
import { printFatalError } from './logger';

export type EnvConfig = {
  awsAccessKey: string;
  awsSecretKey: string;
  awsRegion: string;
};

export type AWSConfig = {
  credentials: {
    accessKeyId: string;
    secretAccessKey: string;
  };
  region: string;
};

export async function getAwsConfigFromOptionsOrFile(options: {
  profile: string;
  accessKey: string;
  secretKey;
  region: string;
}): Promise<AWSConfig> {
  const { profile, accessKey, secretKey, region } = options;

  if (accessKey || secretKey || region) {
    if (!accessKey || !secretKey || !region) {
      printFatalError(`
      You need to provide all of the following options: 
        ${chalk.bold('--access-key')}
        ${chalk.bold('--secret-key')}
        ${chalk.bold('--region')}
      `);
    }

    return {
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      },
      region: region,
    };
  }

  const awsConfig = await loadAwsConfig(profile);

  return awsConfig;
}

/**
 * Loads the environment variables from the .env file
 * @param path Path to the .env file
 */
export async function loadAwsConfig(profile: string = 'default'): Promise<AWSConfig | undefined> {
  const configFiles = await loadSharedConfigFiles();

  const credentialsFile = configFiles.credentialsFile;
  const configFile = configFiles.configFile;

  const accessKey: string = credentialsFile?.[profile]?.aws_access_key_id;
  const secretKey: string = credentialsFile?.[profile]?.aws_secret_access_key;
  const region: string = configFile?.[profile]?.region;

  if (!accessKey || !secretKey || !region) {
    const sharedCredentialsFile = process.env.AWS_SHARED_CREDENTIALS_FILE || '~/.aws/credentials';
    const sharedConfigFile = process.env.AWS_CONFIG_FILE || '~/.aws/config';

    printFatalError(`
    Could not find the AWS credentials in the following files for the profile "${profile}":
      ${chalk.bold(sharedCredentialsFile)}
      ${chalk.bold(sharedConfigFile)}

    If the config files exist at different locations, set the following environment variables:
      ${chalk.bold(`AWS_SHARED_CREDENTIALS_FILE`)}
      ${chalk.bold(`AWS_CONFIG_FILE`)}

    You can also configure the credentials via the following command:
      ${chalk.bold(`aws configure --profile ${profile}`)}

    You can also provide the credentials via the following options:
      ${chalk.bold(`--access-key`)}
      ${chalk.bold(`--secret-key`)}
      ${chalk.bold(`--region`)}
    `);
  }

  return {
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
    },
    region: region,
  };
}
