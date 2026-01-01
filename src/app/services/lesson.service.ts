import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Lesson, LessonProgress } from '../models/lesson.model';
import { environment } from '../../environments/environment';
import { QuizAttempt, QuizQuestion } from '../models/quiz.model';
import { LessonProgressDTO } from '../models/lesson-progress.dto';
import { LessonWithResourcesDTO, ResourceDTO } from '../models/lesson-with-resources.dto';

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

  getLessonsByFormateur(keycloakId: string): Observable<Lesson[]> {
    return this.http.get<Lesson[]>(`${this.apiUrl}/formateur/${keycloakId}`);
  }

  // getUserProgress(userId: number, lessonId: number): Observable<LessonProgress> {
  //   return this.http.get<LessonProgress>(
  //     `${this.apiUrl}/${lessonId}/progress?userId=${userId}`
  //   );
  // }

  // Marquer une ressource comme complétée
  markResourceCompleted(candidateKeycloakId: string, resourceId: number): Observable<{ ok: boolean }> {
    const params = new HttpParams().set('candidateKeycloakId', candidateKeycloakId);
    return this.http.post<{ ok: boolean }>(
      `${this.apiUrl}/resource/${resourceId}/complete`,
      {},
      { params }
    );
  }
  // Soumettre une tentative de quiz
  submitQuizAttempt(candidateKeycloakId: string, resourceId: number, score: number): Observable<QuizAttempt> {
    const params = new HttpParams()
      .set('candidateKeycloakId', candidateKeycloakId)
      .set('score', score.toString());
    return this.http.post<QuizAttempt>(
      `${this.apiUrl}/quiz/${resourceId}/attempt`,
      {},
      { params }
    );
  }

  // Vérifier si le quiz peut être ouvert
  canOpenQuiz(candidateKeycloakId: string, lessonId: number): Observable<{ canOpen: boolean }> {
    const params = new HttpParams()
      .set('candidateKeycloakId', candidateKeycloakId)
      .set('lessonId', lessonId.toString());
    return this.http.get<{ canOpen: boolean }>(`${this.apiUrl}/quiz/can-open`, { params });
  }

  // Vérifier l'accès à la leçon suivante
  canAccessNextLesson(candidateKeycloakId: string, themeId: number, nextSequenceOrder: number): Observable<{ canAccess: boolean }> {
    const params = new HttpParams()
      .set('candidateKeycloakId', candidateKeycloakId)
      .set('themeId', themeId.toString())
      .set('nextSequenceOrder', nextSequenceOrder.toString());
    return this.http.get<{ canAccess: boolean }>(`${this.apiUrl}/next-lesson/can-access`, { params });
  }

  // Récupérer le quiz si la leçon est consommée
  getQuizIfLessonConsumed(candidateKeycloakId: string, lessonId: number): Observable<QuizQuestion[]> {
    const headers = new HttpHeaders().set('X-Keycloak-Id', candidateKeycloakId);
    return this.http.get<QuizQuestion[]>(`${this.apiUrl}/${lessonId}/quiz`, { headers });
  }

  // Récupérer les leçons et la progression du candidat pour un thème
  getCandidateLessonsWithProgress(candidateKeycloakId: string, themeId: number): Observable<LessonProgressDTO[]> {
    const headers = new HttpHeaders().set('X-Keycloak-Id', candidateKeycloakId);
    return this.http.get<LessonProgressDTO[]>(
      `${this.apiUrl}/progress/theme/${themeId}`,
      { headers }
    );
  }

  // Récupérer une leçon avec toutes ses ressources et la progression du candidat
  getLessonWithResources(candidateKeycloakId: string, lessonId: number): Observable<LessonWithResourcesDTO> {
    const headers = new HttpHeaders().set('X-Keycloak-Id', candidateKeycloakId);
    return this.http.get<LessonWithResourcesDTO>(
      `${this.apiUrl}/${lessonId}/resources`,
      { headers }
    );
  }

  // Récupérer une ressource spécifique
  getResourceById(candidateKeycloakId: string, resourceId: number): Observable<ResourceDTO> {
    const headers = new HttpHeaders().set('X-Keycloak-Id', candidateKeycloakId);
    return this.http.get<ResourceDTO>(
      `${this.apiUrl}/resource/${resourceId}`,
      { headers }
    );
  }

}
