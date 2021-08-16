import fs from 'fs';
import { parseLinkedInHTML } from './parser';
import { Resume } from './types';

export async function convertResumeToJSON(input: string, output: string): Promise<void> {
  const html: string = fs.readFileSync(input, 'utf8');
  const resume: Resume = await parseLinkedInHTML(html);
  fs.writeFileSync(output, JSON.stringify(resume, null, 2));
}
