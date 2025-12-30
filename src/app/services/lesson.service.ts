import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Lesson, LessonProgress } from '../models/lesson.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LessonService {
  private apiUrl = `${environment.apiUrl}/api/lessons`;

  constructor(private http: HttpClient) {}

  getLessonById(lessonId: number): Observable<Lesson> {
    return this.http.get<Lesson>(`${this.apiUrl}/${lessonId}`);
  }

  getLessonsByTheme(themeId: number): Observable<Lesson[]> {
    return this.http.get<Lesson[]>(`${this.apiUrl}/theme/${themeId}`);
  }

  getUserProgress(userId: number, lessonId: number): Observable<LessonProgress> {
    return this.http.get<LessonProgress>(
      `${this.apiUrl}/${lessonId}/progress?userId=${userId}`
    );
  }

  markResourceCompleted(userId: number, resourceId: number): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/resource/${resourceId}/complete?userId=${userId}`,
      {}
    );
  }
}
