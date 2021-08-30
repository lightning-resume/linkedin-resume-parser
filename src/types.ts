export interface Profile {
  name: string;
  location: string;
  email?: string;
  linkedin?: string;
}

export interface Experience {
  id: string;
  position: string;
  company: string;
  date?: string;
  description?: string;
}

export interface Education {
  id: string;
  school: string;
  degree?: string;
  date?: string;
  description?: string;
}

export interface LicenseOrCertification {
  id: string;
  name: string;
  issuingOrganization: string;
  credentialID?: string;
  issuedAt?: string;
}

export interface HonorOrAward {
  id: string;
  title: string;
  issuer?: string;
  date?: string;
  description?: string;
}

export interface Resume {
  profile: Profile;
  summary: string;
  experiences: Experience[];
  education: Education[];
  licensesAndCertifications: LicenseOrCertification[];
  skills: string[];
  honorsAndAwards: HonorOrAward[];
}
