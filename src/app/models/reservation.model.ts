import { Salle } from './salle.model';

export enum ReservationStatus {
  CONFIRMEE = 'CONFIRMEE',
  EN_ATTENTE = 'EN_ATTENTE',
  ANNULEE = 'ANNULEE',
  TERMINEE = 'TERMINEE'
}

export interface Reservation {
  id?: number;
  salle?: Salle;
  sessionFormationId?: number;
  formateurKeycloakId: string;
  reserveParKeycloakId?: string;
  dateDebut: string;
  dateFin: string;
  status: ReservationStatus;
  motif?: string;
  createdAt?: string;
}

export interface ChecklistItem {
  libelle: string;
  checked: boolean;
  commentaire?: string;
}

export interface ChecklistPreparation {
  id?: number;
  reservation?: Reservation;
  gestionnaireKeycloakId: string;
  items: ChecklistItem[];
  preparationComplete: boolean;
  completedAt?: string;
}

export interface ReservationCreatedEvent {
  reservationId: number;
  salleId: number;
  salleName: string;
  formateurKeycloakId: string;
  sessionFormationId?: number;
  startDateTime: string;
  endDateTime: string;
  createdAt: string;
}

export interface ReservationCancelledEvent {
  reservationId: number;
  salleId: number;
  formateurKeycloakId: string;
  reason?: string;
  cancelledAt: string;
}
