import { Resource } from './resource.model';

export interface Lesson {
  id: number;
  title: string;
  description: string;
  duration: number;
  resources: Resource[];
  themeId: number;
  createdAt: string;
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
