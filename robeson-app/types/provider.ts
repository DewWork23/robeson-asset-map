export interface Provider {
  id: string;
  name: string;
  title: string; // e.g., "MD", "PhD", "LCSW", "NP"
  specialties: string[]; // e.g., ["Family Medicine", "Internal Medicine", "Pediatrics"]
  insuranceAccepted: string[]; // e.g., ["Medicare", "Medicaid", "Blue Cross Blue Shield", "Private Pay"]
  servicesProvided: string[]; // e.g., ["Primary Care", "Mental Health Counseling", "Substance Abuse Treatment"]
  organization: string; // The organization they work for
  address: string;
  phone: string;
  email: string;
  website?: string;
  acceptingNewPatients: boolean;
  languages: string[]; // e.g., ["English", "Spanish", "Lumbee"]
  hours: string;
  bio?: string;
  telehealth: boolean;
  slidingScale: boolean; // Whether they offer sliding scale fees
  medicareProvider: boolean;
  medicaidProvider: boolean;
  latitude?: number;
  longitude?: number;
}

export type Specialty = 
  | 'Family Medicine'
  | 'Internal Medicine'
  | 'Pediatrics'
  | 'OB/GYN'
  | 'Mental Health'
  | 'Psychiatry'
  | 'Psychology'
  | 'Social Work'
  | 'Substance Abuse Counseling'
  | 'Behavioral Health'
  | 'Emergency Medicine'
  | 'Cardiology'
  | 'Dentistry'
  | 'Physical Therapy'
  | 'Occupational Therapy'
  | 'Speech Therapy'
  | 'Nutrition/Dietetics'
  | 'Other';

export type InsuranceType =
  | 'Medicare'
  | 'Medicaid'
  | 'Blue Cross Blue Shield'
  | 'Aetna'
  | 'UnitedHealthcare'
  | 'Cigna'
  | 'Humana'
  | 'Private Pay/Self-Pay'
  | 'Sliding Scale Available'
  | 'Free/Pro Bono'
  | 'TRICARE'
  | 'NC Health Choice'
  | 'Other';

export const SPECIALTY_ICONS: Record<string, string> = {
  'Family Medicine': '👨‍⚕️',
  'Internal Medicine': '🩺',
  'Pediatrics': '👶',
  'OB/GYN': '🤰',
  'Mental Health': '🧠',
  'Psychiatry': '💊',
  'Psychology': '🧩',
  'Social Work': '🤝',
  'Substance Abuse Counseling': '🚭',
  'Behavioral Health': '💭',
  'Emergency Medicine': '🚑',
  'Cardiology': '❤️',
  'Dentistry': '🦷',
  'Physical Therapy': '🏃',
  'Occupational Therapy': '✋',
  'Speech Therapy': '💬',
  'Nutrition/Dietetics': '🥗',
  'Other': '⚕️'
};