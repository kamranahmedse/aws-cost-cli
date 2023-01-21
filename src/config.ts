import dotenv from 'dotenv';
import fs from 'node:fs';
import { env } from 'node:process';

/**
 * Loads the environment variables from the .env file
 * @param path Path to the .env file
 */
export function loadEnv(path: string = undefined) {
  if (typeof path === 'boolean') {
    console.error('Invalid path to the config file');
    process.exit(1);
  }

  if (!path) {
    dotenv.config();
    return;
  }

  if (!fs.existsSync(path)) {
    console.error(`Config file not found: ${path}`);
    process.exit(1);
  }

  dotenv.config({ path: path });

  const envConfig = readEnvConfig();
  console.log(process.env);
  process.exit(0);
}

export type EnvConfig = {
  awsAccessKey: string;
  awsSecretKey: string;
  awsRegion: string;
};

/**
 * Reads the environment variables relevant to us
 *
 * @returns EnvConfig
 */
export function readEnvConfig(): EnvConfig {
  return {
    awsAccessKey: process.env.AWS_ACCESS_KEY,
    awsSecretKey: process.env.AWS_SECRET_KEY,
    awsRegion: process.env.AWS_REGION || 'us-east-1',
  };
}

export type AWSConfig = {
  credentials: {
    accessKeyId: string;
    secretAccessKey: string;
  };
  region: string;
};

/**
 * Gets the AWS credentials from the environment variables
 * @returns AWSConfig
 */
export function getAwsCredentials(): AWSConfig {
  const envConfig = readEnvConfig();

  if (!envConfig.awsAccessKey || !envConfig.awsSecretKey || !envConfig.awsRegion) {
    throw new Error('Missing AWS credentials: AWS_ACCESS_KEY, AWS_SECRET_KEY, AWS_REGION');
  }

  return {
    credentials: {
      accessKeyId: envConfig.awsAccessKey,
      secretAccessKey: envConfig.awsSecretKey,
    },
    region: envConfig.awsRegion,
  };
}
