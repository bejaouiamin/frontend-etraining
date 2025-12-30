import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { QuizAttempt, QuizSubmission } from '../models/quiz.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private apiUrl = `${environment.apiUrl}/api/lessons`;

  constructor(private http: HttpClient) {}

  submitQuizAttempt(
    userId: number,
    resourceId: number,
    score: number
  ): Observable<QuizAttempt> {
    const params = new HttpParams()
      .set('userId', userId.toString())
      .set('score', score.toString());

    return this.http.post<QuizAttempt>(
      `${this.apiUrl}/quiz/${resourceId}/attempt`,
      null,
      { params }
    );
  }

  getUserQuizHistory(userId: number): Observable<QuizAttempt[]> {
    return this.http.get<QuizAttempt[]>(
      `${this.apiUrl}/quiz/history?userId=${userId}`
    );
  }
}
