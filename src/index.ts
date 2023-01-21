import { Command } from 'commander';
import dotenv from 'dotenv';
import { getAccountAlias } from './account';
import { getAwsCredentials } from './config';
import { getRawCostByService, getTotalCosts } from './cost';
import { printBreakdown, printData } from './reporter';

dotenv.config();

const packageJson = require('../package.json');
const awsConfig = getAwsCredentials();

const program = new Command();

program
  .version(packageJson.version)
  .name(packageJson.name)
  .description(packageJson.description)
  .parse(process.argv);

const options = program.opts();

const alias = await getAccountAlias(awsConfig);
const costs = await getTotalCosts(awsConfig);

printBreakdown(alias, costs);
