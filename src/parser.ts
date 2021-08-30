import cheerio, { Cheerio, CheerioAPI, Element } from 'cheerio';
import { Education, Experience, HonorOrAward, LicenseOrCertification, Profile, Resume } from './types';

const CREDENTIAL_ID_PREFIX = 'Credential ID';

type LinkedInSectionName =
  | 'resume-contact-information'
  | 'resume-summary'
  | 'experience'
  | 'education'
  | 'license-or-certification'
  | 'skills'
  | 'honor-or-award';

type LinkedInSections = {
  [K in LinkedInSectionName]: Cheerio<Element>;
};

export async function parseLinkedInHTML(html: string): Promise<Resume> {
  const $ = cheerio.load(html);
  const sections = parseSections($);

  return {
    profile: parseProfile(sections['resume-contact-information']),
    summary: parseText(sections['resume-summary'].find('p')),
    experiences: parseExperiences($, sections.experience),
    education: parseEducation($, sections.education),
    licensesAndCertifications: parseLicensesAndCertifications($, sections['license-or-certification']),
    skills: parseSkills($, sections.skills),
    honorsAndAwards: parseHonorsAndAwards($, sections['honor-or-award']),
  };
}

export function parseExperiences($: CheerioAPI, section: Cheerio<Element>): Experience[] {
  const containers = Array.from(section.find('li.resume-builder__subsection-container'));
  return containers
    .map((container) => $(container))
    .map((container, index) => ({
      id: String(containers.length - 1 - index),
      position: parseText(container.find('h4')),
      company: parseText(container.find('p:nth-of-type(1)')),
      date: parseTextSafe(container.find('p:nth-of-type(2)')),
      description: parseTextSafe(container.find('p:nth-of-type(3)'), false),
    }));
}

export function parseEducation($: CheerioAPI, section: Cheerio<Element>): Education[] {
  const containers = Array.from(section.find('li.resume-builder__subsection-container'));
  return containers
    .map((container) => $(container))
    .map((container, index) => ({
      id: String(containers.length - 1 - index),
      school: parseText(container.find('h4')),
      degree: parseTextSafe(container.find('p:nth-of-type(1)')),
      date: parseTextSafe(container.find('p:nth-of-type(2)')),
      description: parseTextSafe(container.find('p:nth-of-type(3)'), false),
    }));
}

export function parseLicensesAndCertifications($: CheerioAPI, section: Cheerio<Element>): LicenseOrCertification[] {
  const containers = Array.from(section.find('li.resume-builder__subsection-container'));
  return containers
    .map((container) => $(container))
    .map((container, index) => ({
      id: String(containers.length - 1 - index),
      name: parseText(container.find('h4').clone().children().remove().end() as Cheerio<Element>).slice(0, -2),
      issuingOrganization: parseText(container.find('h4 > span')),
      issuedAt: parseTextSafe(container.find('p:nth-of-type(1)')), // TODO: this might fail if there is no issuedAt defined in linkedin
      credentialID: parseTextSafe(container.find('p:nth-of-type(2)'))?.substr(CREDENTIAL_ID_PREFIX.length).trim(),
    }));
}

export function parseSkills($: CheerioAPI, section: Cheerio<Element>): string[] {
  return Array.from(section.find('span'))
    .map((span) => {
      return parseText($(span));
    })
    .filter((skill) => !!skill);
}

export function parseHonorsAndAwards($: CheerioAPI, section: Cheerio<Element>): HonorOrAward[] {
  const containers = Array.from(section.find('li.resume-builder__subsection-container'));
  return containers
    .map((container) => $(container))
    .map((container, index) => {
      let title = parseText(container.find('h4').clone().children().remove().end() as Cheerio<Element>);
      // remove " -" that linkedin adds to the end of the title in case there is an issuer
      if (title.substr(-2) === ' -') title = title.slice(0, -2);

      return {
        id: String(containers.length - 1 - index),
        title,
        issuer: parseTextSafe(container.find('h4 > span')),
        date: parseTextSafe(container.find('p:nth-of-type(1)')), // TODO: this might fail if there is no date defined in linkedin,
        description: parseTextSafe(container.find('p:nth-of-type(2)'), false),
      };
    });
}

export function parseProfile(section: Cheerio<Element>): Profile {
  return {
    name: parseText(section.find('h2')),
    location: parseText(section.find('h2 + p')),
    email: parseText(section.find('li-icon[type="envelope-open-icon"] + p')),
    linkedin: parseText(section.find('li-icon[type="linkedin-inbug-color-icon"] + a')),
  };
}

export function parseSections($: CheerioAPI): LinkedInSections {
  return Array.from($('#main > section > div')).reduce((acc, section) => {
    const button = $(section).find('button');
    if (button) {
      const label = button.attr('aria-label');
      if (label) {
        acc[parseButtonLabel(label)] = $(section);
      }
    }

    return acc;
  }, {} as LinkedInSections);
}

/**
 * Convert section main buttons to valid keys
 * Examples:
 * Add license or certification => license-or-certification
 * Edit resume summary => resume-summary
 *
 * @param label button aria-label
 * @returns parsed label
 */
function parseButtonLabel(label: string): LinkedInSectionName {
  return label.slice(label.indexOf(' ')).trim().replace(/\s/g, '-') as LinkedInSectionName;
}

function parseText(elm: Cheerio<Element>, removeBreaklines = true): string {
  let result = elm.text();

  // remove breaklines if needed
  if (removeBreaklines) {
    result = result.replace(/\n/g, '');
  }

  // replace multiple spaces by single ones
  result = result.replace(/\s\s+/g, ' ');

  // trim text
  result = result.trim();

  return result;
}

function parseTextSafe(elm: Cheerio<Element>, removeBreaklines = true): string | undefined {
  if (!elm.length) return;

  const text = parseText(elm, removeBreaklines);
  return text.length ? text : undefined;
}
