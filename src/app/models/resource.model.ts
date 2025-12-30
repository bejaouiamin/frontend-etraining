export enum ResourceType {
  VIDEO = 'VIDEO',
  QUIZ = 'QUIZ',
  DOCUMENT = 'DOCUMENT'
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
