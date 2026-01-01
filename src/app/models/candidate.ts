export interface Candidate {
  id: number;
  fullName: string;
  keycloakId: string;
  email: string;
  phone: string;
  dateInscription: string;
  statut: string;
  passedQuizCount?: number;
  address?: {
    rue: string;
    ville: string;
    codePostal: string;
    pays: string;
  };
}
