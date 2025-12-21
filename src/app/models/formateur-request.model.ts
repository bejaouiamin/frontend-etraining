export interface FormateurRequest {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  telephone?: string;
  specialites?: string[];
  certifications?: string[];
  experienceAnnees?: number;
}
