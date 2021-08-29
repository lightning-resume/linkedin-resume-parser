#!/usr/bin/env node

import yargs from 'yargs/yargs';
import { convertResumeToJSON } from './index';

const argv = yargs(process.argv.slice(2))
  .options({
    input: { type: 'string', demandOption: true, alias: 'i' },
    output: { type: 'string', demandOption: true, alias: 'o' },
  })
  .parseSync();

console.info(`Parsing LinkedIn resume from ${argv.input}`);
convertResumeToJSON(argv.input, argv.output).then(() => {
  console.info(`JSON resume saved at ${argv.output}`);
});
