import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Lesson, LessonProgress } from '../models/lesson.model';
import { environment } from '../../environments/environment';
import { QuizAttempt, QuizQuestion, QuizSubmission } from '../models/quiz.model';
import { LessonProgressDTO } from '../models/lesson-progress.dto';
import { LessonWithResourcesDTO, ResourceDTO } from '../models/lesson-with-resources.dto';
import { CandidateThemeEnrollment } from '../models/candidate-theme-enrollment.model';
import { Theme } from '../models/theme';

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
    const headers = new HttpHeaders().set('X-Keycloak-Id', candidateKeycloakId);
    return this.http.get<{ canOpen: boolean }>(
      `${this.apiUrl}/quiz/can-open/${lessonId}`,
      { headers }
    );
  }

  // Vérifier l'accès à la leçon suivante
  canAccessNextLesson(candidateKeycloakId: string, themeId: number, nextSequenceOrder: number): Observable<{ canAccess: boolean }> {
    const headers = new HttpHeaders().set('X-Keycloak-Id', candidateKeycloakId);
    return this.http.get<{ canAccess: boolean }>(
      `${this.apiUrl}/next-lesson/can-access/${themeId}/${nextSequenceOrder}`,
      { headers }
    );
  }

  // Récupérer l'historique des quiz du candidat
  getCandidateQuizHistory(candidateKeycloakId: string): Observable<QuizAttempt[]> {
    const headers = new HttpHeaders().set('X-Keycloak-Id', candidateKeycloakId);
    return this.http.get<QuizAttempt[]>(
      `${this.apiUrl}/quiz/history`,
      { headers }
    );
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

  // Soumettre les réponses du quiz pour validation par le backend
  submitQuizAnswers(candidateKeycloakId: string, resourceId: number, answerIds: number[]): Observable<QuizAttempt> {
    const headers = new HttpHeaders().set('X-Keycloak-Id', candidateKeycloakId);
    // Backend attend directement List<Long> answerIds dans le body
    return this.http.post<QuizAttempt>(
      `${this.apiUrl}/quiz/${resourceId}/attempt`,
      answerIds,
      { headers }
    );
  }

  // Inscrire un candidat à un thème
  enrollCandidateToTheme(candidateKeycloakId: string, themeId: number): Observable<CandidateThemeEnrollment> {
    const headers = new HttpHeaders().set('X-Keycloak-Id', candidateKeycloakId);
    return this.http.post<CandidateThemeEnrollment>(
      `${this.apiUrl}/theme/${themeId}/enroll`,
      {},
      { headers }
    );
  }

  // Récupérer tous les thèmes auxquels le candidat est inscrit
  getCandidateEnrolledThemes(candidateKeycloakId: string): Observable<Theme[]> {
    const headers = new HttpHeaders().set('X-Keycloak-Id', candidateKeycloakId);
    return this.http.get<Theme[]>(
      `${this.apiUrl}/themes/enrolled`,
      { headers }
    );
  }

}
