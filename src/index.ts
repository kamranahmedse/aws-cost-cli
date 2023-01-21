import { Command } from 'commander';
import dotenv from 'dotenv';
import { getAccountAlias } from './account';
import { getAwsCredentials } from './config';
import { getTotalCosts } from './cost';
import { printJson, printTable, printText } from './reporter';

type OptionsType = {
  text: boolean;
  json: boolean;
  fancy: boolean;
  help: boolean;
};

dotenv.config();

const packageJson = require('../package.json');
const awsConfig = getAwsCredentials();

const program = new Command();

program
  .version(packageJson.version)
  .name(packageJson.name)
  .description(packageJson.description)
  .option('-f, --fancy', 'Get the output as a fancy table', true)
  .option('-t, --text', 'Get the output as text')
  .option('-j, --json', 'Get the output as JSON')
  .option('-v, --version', 'Get the version of the CLI')
  .option('-h, --help', 'Get the help of the CLI')
  .parse(process.argv);

const options = program.opts<OptionsType>();

if (options.help) {
  program.help();
  process.exit(0);
}

const alias = await getAccountAlias(awsConfig);
const costs = await getTotalCosts(awsConfig);

if (options.json) {
  printJson(alias, costs);
} else if (options.text) {
  printText(alias, costs);
} else {
  printTable(alias, costs);
}
