#!/usr/bin/env node

import fs from 'fs';
import yargs from 'yargs/yargs';
import { parseLinkedInHTML } from './parser';
import { Resume } from './types';

const argv = yargs(process.argv.slice(2))
  .options({
    input: { type: 'string', demandOption: true, alias: 'i' },
    output: { type: 'string', demandOption: true, alias: 'o' },
  })
  .parseSync();

export async function convertResumeToJSON(input: string, output: string): Promise<void> {
  const html: string = fs.readFileSync(input, 'utf8');
  const resume: Resume = await parseLinkedInHTML(html);
  fs.writeFileSync(output, JSON.stringify(resume, null, 2));
}

console.info(`Parsing LinkedIn resume from ${argv.input}`);
convertResumeToJSON(argv.input, argv.output).then(() => {
  console.info(`JSON resume saved at ${argv.output}`);
});
