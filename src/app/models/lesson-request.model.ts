export interface LessonRequest {
  keycloakId: string;
  themeId: number;
  title: string;
  description: string;
  sequenceOrder: number;
  resourceTitles: string[];
  resourceTypes: string[];
  files: File[];
}
