import { Resource } from './resource.model';

export interface Lesson {
  id?: number;
  authorKeycloakId: string;
  title: string;
  description: string;
  sequenceOrder?: number;
  themeId: number;
  resources?: Resource[];
}

export interface LessonProgress {
  id: number;
  userId: number;
  lessonId: number;
  completed: boolean;
  startedAt: string;
  completedAt?: string;
  completionPercentage: number;
}
