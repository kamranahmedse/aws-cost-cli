import AWS from 'aws-sdk';

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

  if (
    !envConfig.awsAccessKey ||
    !envConfig.awsSecretKey ||
    !envConfig.awsRegion
  ) {
    throw new Error(
      'Missing AWS credentials: AWS_ACCESS_KEY, AWS_SECRET_KEY, AWS_REGION'
    );
  }

  return {
    credentials: {
      accessKeyId: envConfig.awsAccessKey,
      secretAccessKey: envConfig.awsSecretKey,
    },
    region: envConfig.awsRegion,
  };
}
