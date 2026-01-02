import { Theme } from './theme';

export interface CandidateThemeEnrollment {
  id?: number;
  candidateKeycloakId: string;
  theme: Theme;
  enrolledAt: string;
}
