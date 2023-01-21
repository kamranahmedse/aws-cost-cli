import { Command } from 'commander';
import dotenv from 'dotenv';
import { getAccountAlias } from './account';
import { getAwsCredentials } from './config';
import { getTotalCosts } from './cost';
import { printText } from './printers/text';
import { printJson } from './printers/json';
import { printFancy } from './printers/fancy';
import { printPlainText } from './printers/plain';

type OptionsType = {
  text: boolean;
  json: boolean;
  fancy: boolean;
  plain: boolean;
  help: boolean;
  summary: boolean;
};

dotenv.config();

const packageJson = require('../package.json');
const awsConfig = getAwsCredentials();

const program = new Command();

program
  .version(packageJson.version)
  .name(packageJson.name)
  .description(packageJson.description)
  .option('-t, --text', 'Get the output as text', true)
  .option('-f, --fancy', 'Get the output as a fancy table')
  .option('-j, --json', 'Get the output as JSON')
  .option('-s, --summary', 'Get only the summary without service breakdown')
  .option('-p, --plain', 'Get the output as plain text (no colors / tables)')
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
  printJson(alias, costs, options.summary);
} else if (options.fancy) {
  printFancy(alias, costs, options.summary);
} else if (options.plain) {
  printPlainText(alias, costs, options.summary);
} else {
  printText(alias, costs, options.summary);
}
