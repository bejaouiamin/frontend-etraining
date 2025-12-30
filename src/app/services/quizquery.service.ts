import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { QuizResponse } from '../models/quiz.model';

@Injectable({
  providedIn: 'root'
})
export class QuizqueryService {
  private apiUrl = `${environment.apiUrl}/api/v1/quizzes`;

  constructor(private http: HttpClient) { }

  getQuizzesByAuthor(keycloakId: string): Observable<QuizResponse[]> {
    return this.http.get<QuizResponse[]>(`${this.apiUrl}/author/${keycloakId}`);
  }
}
