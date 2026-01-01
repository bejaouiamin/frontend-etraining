import { ResourceType } from './resource.model';

export interface ResourceProgressDTO {
  resourceId: number;
  title: string;
  type: ResourceType;
  completed: boolean;
  completedAt: string | null;
}

export interface LessonProgressDTO {
  lessonId: number;
  lessonTitle: string;
  sequenceOrder: number;
  themeId: number;
  totalResources: number;
  completedResources: number;
  progressPercentage: number;
  fullyCompleted: boolean;
  lastActivityAt: string | null;
  resources: ResourceProgressDTO[];
}
