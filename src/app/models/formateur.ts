export enum StatutFormateur {
  ACTIF = 'ACTIF',
  INACTIF = 'INACTIF',
  EN_CONGE = 'EN_CONGE',
  SUSPENDU = 'SUSPENDU'
}

export interface DisponibiliteJour {
  heureDebut: Date; // Format: "HH:mm"
  heureFin: Date;   // Format: "HH:mm"
  disponible: boolean;
}

export interface ActiviteFormateur {
  typeActivite: string;
  description: string;
  dateActivite: Date; // ISO date string
  utilisateurAction?: string;
}

export interface Formateur {
  id?: string;
  keycloakId: string;
  nom: string;
  prenom: string;
  email: string;
  password?: string;
  telephone?: string;
  specialites?: string[];
  certifications?: string[];
  experienceAnnees?: number;
  statut: StatutFormateur;

  // Disponibilités par jour de la semaine (lundi=1, dimanche=7)
  disponibilites?: Record<number, DisponibiliteJour>;

  dateCreation?: Date; // ISO date string
  dateModification?: Date; // ISO date string

  // Historique d'activité
  historique?: ActiviteFormateur[];
}
