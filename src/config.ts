export type Config = {
  awsAccessKey: string;
  awsSecretKey: string;
  awsRegion: string;
};

export function getConfig(): Config {
  const awsAccessKey = process.env.AWS_ACCESS_KEY;
  const awsSecretKey = process.env.AWS_SECRET_KEY;
  const awsRegion = process.env.AWS_REGION || 'us-east-1';

  if (!awsAccessKey || !awsSecretKey) {
    throw new Error('Missing AWS credentials');
  }

  return {
    awsAccessKey,
    awsSecretKey,
    awsRegion,
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
 * Gets the AWS configuration passed to the AWS SDK
 *
 * @returns AWS configuration
 */
export function getAwsConiguration(): AWSConfig {
  const config = getConfig();

  return {
    credentials: {
      accessKeyId: config.awsAccessKey,
      secretAccessKey: config.awsSecretKey,
    },
    region: config.awsRegion,
  };
}
