import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ThemeRequest } from '../models/theme-request.model';
import { LessonRequest } from '../models/lesson-request.model';
import { QuizRequest } from '../models/quiz-request.model';

@Injectable({
  providedIn: 'root'
})
export class FormateurService {
  private apiUrl = `${environment.apiUrl}/api/v1/formateurs`;

  constructor(private http: HttpClient) { }

  createTheme(request: ThemeRequest): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/themes`, request, {
      responseType: 'text' as 'json'
    });
  }

  createLesson(request: LessonRequest): Observable<string> {
    const formData = new FormData();

    formData.append('keycloakId', request.keycloakId);
    formData.append('themeId', request.themeId.toString());
    formData.append('title', request.title);
    formData.append('description', request.description);
    formData.append('sequenceOrder', request.sequenceOrder.toString());

    // Add resource titles and types as arrays
    request.resourceTitles.forEach((title, index) => {
      formData.append(`resourceTitles[${index}]`, title);
    });

    request.resourceTypes.forEach((type, index) => {
      formData.append(`resourceTypes[${index}]`, type);
    });

    // Add files
    request.files.forEach((file, index) => {
      formData.append('files', file, file.name);
    });

    return this.http.post<string>(`${this.apiUrl}/lessons`, formData, {
      responseType: 'text' as 'json'
    });
  }

  createQuiz(request: QuizRequest): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/quizzes`, request, {
      responseType: 'text' as 'json'
    });
  }
}
