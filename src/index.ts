import figlet from 'figlet';
import { Command } from 'commander';
import dotenv from 'dotenv';
import { AWSConfig, getAwsConiguration } from './config';
import { getAccountAlias } from './account';
import { hideSpinner, printData } from './reporter';
import { getCosts } from './cost';

dotenv.config();

const packageJson = require('../package.json');
const awsConfig: AWSConfig = getAwsConiguration();

const program = new Command();

program
  .version(packageJson.version)
  .name(packageJson.name)
  .description(packageJson.description)
  .parse(process.argv);

const options = program.opts();

const alias = await getAccountAlias(awsConfig);
const costs = await getCosts(awsConfig);

printData(alias, costs);
