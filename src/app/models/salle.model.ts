export enum SalleStatus {
  DISPONIBLE = 'DISPONIBLE',
  RESERVEE = 'RESERVEE',
  EN_COURS_UTILISATION = 'EN_COURS_UTILISATION',
  MAINTENANCE = 'MAINTENANCE'
}

export interface Salle {
  id?: number;
  nom: string;
  description: string;
  capacite: number;
  localisation: string;
  equipements: string[];
  photosUrls: string[];
  status: SalleStatus;
  createdAt?: string;
  updatedAt?: string;
}
