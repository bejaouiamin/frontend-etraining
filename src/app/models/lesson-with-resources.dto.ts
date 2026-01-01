import { ResourceType } from './resource.model';

export interface ResourceDTO {
  id: number;
  title: string;
  url: string;
  type: ResourceType;
  passingScore?: number;
  completed: boolean;
  completedAt?: string;
}

export interface LessonWithResourcesDTO {
  lessonId: number;
  title: string;
  description: string;
  sequenceOrder: number;
  themeId: number;
  resources: ResourceDTO[];
}
