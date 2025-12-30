import { Category } from './category';
import { Lesson } from './lesson.model';

export interface Theme {
  id?: number;
  authorKeycloakId: string;
  title: string;
  description?: string;
  dureeHeures?: number; // duration in hours
  category: Category;
  lessons?: Lesson[];
}
