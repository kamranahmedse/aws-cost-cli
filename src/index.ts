import { Command } from 'commander';
import packageJson from '../package.json' assert { type: 'json' };
import { getAccountAlias } from './account';
import { getAwsCredentials, loadConfig } from './config';
import { getTotalCosts } from './cost';
import { printFancy } from './printers/fancy';
import { printJson } from './printers/json';
import { printPlainText } from './printers/text';

const program = new Command();

program
  .version(packageJson.version)
  .name(packageJson.name)
  .description(packageJson.description)
  .option('-c, --config [path]', 'Path to the config file')
  .option('-j, --json', 'Get the output as JSON')
  .option('-s, --summary', 'Get only the summary without service breakdown')
  .option('-t, --text', 'Get the output as plain text (no colors / tables)')
  .option('-v, --version', 'Get the version of the CLI')
  .option('-h, --help', 'Get the help of the CLI')
  .parse(process.argv);

type OptionsType = {
  config: string;
  text: boolean;
  json: boolean;
  help: boolean;
  summary: boolean;
};
const options = program.opts<OptionsType>();

if (options.help) {
  program.help();
  process.exit(0);
}

loadConfig(options.config);

const awsConfig = getAwsCredentials();

const alias = await getAccountAlias(awsConfig);
const costs = await getTotalCosts(awsConfig);

if (options.json) {
  printJson(alias, costs, options.summary);
} else if (options.text) {
  printPlainText(alias, costs, options.summary);
} else {
  printFancy(alias, costs, options.summary);
}
