import { expect } from 'chai';
import fs from 'fs';
import { Education, Experience, HonorOrAward, LicenseOrCertification, Resume } from 'src/types';
import { convertResumeToJSON } from '../../src';

describe('Resume Parser', () => {
  const inputPath = 'test/resources/johndoe.html';
  const outputPath = 'tmp/johndoe.json';
  let output: Resume;

  beforeEach(async () => {
    await convertResumeToJSON(inputPath, outputPath);
    output = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
  });

  it('should contains all the expected keys', async () => {
    expect(Object.keys(output)).to.deep.equal([
      'profile',
      'summary',
      'experiences',
      'education',
      'licensesAndCertifications',
      'skills',
      'honorsAndAwards',
    ]);
  });

  it('should parse profile correctly', async () => {
    expect(output.profile).to.deep.equal({
      name: 'John Doe',
      location: 'Paradise',
      email: 'johndoe@duck.com',
      linkedin: 'linkedin.com/in/johndoe',
    });
  });

  it('should parse summary correctly', async () => {
    expect(output.summary).to.equal(`I'm a profile created for testing purposes of lightning resume`);
  });

  it('should parse experiences correctly', async () => {
    expect(output.experiences).to.deep.equal([
      {
        id: '1',
        position: 'Chief Happiness Officer',
        company: 'Lightning Resume',
        date: 'May 2021 – Present (4 mos)',
        description: 'This is the description of the Lightning Resume experience',
      },
      { id: '0', position: 'Empty Job', company: 'Google' },
    ] as Experience[]);
  });

  it('should parse education correctly', async () => {
    expect(output.education).to.deep.equal([
      { id: '1', school: 'Empty School' },
      {
        id: '0',
        school: 'Sky High',
        degree: 'Superhero, Saving the earth',
        date: '1962 – 2031',
        description: 'Crazy studies',
      },
    ] as Education[]);
  });

  it('should parse licenses and certifications correctly', async () => {
    expect(output.licensesAndCertifications).to.deep.equal([
      {
        id: '1',
        name: 'How to protect the earth',
        issuingOrganization: 'Udemy',
        issuedAt: 'Issued Aug 2017',
        credentialID: 'UC-A12345',
      },
      {
        id: '0',
        name: 'Empty license',
        issuingOrganization: 'Udemy',
        issuedAt: 'Issued Jan 2017 – Expires Feb 2017',
      },
    ] as LicenseOrCertification[]);
  });

  it('should parse skills correctly', async () => {
    expect(output.skills).to.equal(['Smile', 'Build resumes', 'Build tools for building resumes', 'Build linkedin profiles']);
  });

  it('should parse honors and awards correctly', async () => {
    expect(output.honorsAndAwards).to.equal([
      {
        id: '1',
        title: 'Fastest resume creator',
        issuer: 'GitHub',
        date: 'Aug 2021',
        description: 'Open source award to the fastest resume creator tool',
      },
      { id: '0', title: 'Empty honor' },
    ] as HonorOrAward[]);
  });
});
