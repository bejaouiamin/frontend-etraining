export enum ResourceType {
  VIDEO = 'VIDEO',
  QUIZ = 'QUIZ',
  PDF = 'PDF'
}

export interface Resource {
  id: number;
  title: string;
  type: ResourceType;
  url?: string;
  content?: string;
  duration?: number;
  passingScore?: number;
  orderIndex: number;
  createdAt: string;
}
