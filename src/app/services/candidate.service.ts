import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Candidate } from '../models/candidate';


@Injectable({
  providedIn: 'root'
})
export class CandidateService {
  private apiUrl = `${environment.apiUrl}/api/candidats`;

  constructor(private http: HttpClient) {}

  getCandidateById(id: number | string): Observable<Candidate> {
    return this.http.get<Candidate>(`${this.apiUrl}/${id}`);
  }

  getCandidateStats(id: number | string): Observable<{ passedQuizCount: number }> {
    return this.http.get<{ passedQuizCount: number }>(
      `${this.apiUrl}/${id}/stats`
    );
  }

  /**
   * Get candidate by Keycloak UUID
   */
  getCandidateByKeycloakId(keycloakId: string): Observable<Candidate> {
    return this.http.get<Candidate>(`${this.apiUrl}/keycloak/${keycloakId}`);
  }
}
