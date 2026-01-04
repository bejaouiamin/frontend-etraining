import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ThemeRecommendation {
  theme_id: number;
  theme_name: string;
  category: string;
  recommendation_score: number;
  algorithm: string;
  score?: number;
}

export interface RecommendationResponse {
  keycloak_id: string;
  candidate_id?: number;
  recommendations: ThemeRecommendation[];
  algorithm_used: string;
  timestamp: string;
}

export interface ThemeStats {
  total_candidates: number;
  total_themes: number;
  total_interactions: number;
  most_popular_theme: string;
}

@Injectable({
  providedIn: 'root'
})
export class RecommendationService {
  // URL de votre API Python de recommandation
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) { }

  /**
   * Obtenir les recommandations pour un candidat
   */
  getRecommendations(
    keycloakId: string,
    algorithm: 'collaborative' | 'content_based' | 'popularity' | 'hybrid' = 'hybrid',
    topN: number = 4
  ): Observable<RecommendationResponse> {
    const params = new HttpParams()
      .set('algorithm', algorithm)
      .set('top_n', topN.toString());

    return this.http.get<RecommendationResponse>(
      `${this.apiUrl}/recommendations/${keycloakId}`,
      { params }
    );
  }

  /**
   * Obtenir l'historique d'un candidat
   */
  getCandidateHistory(keycloakId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/candidates/${keycloakId}/history`);
  }

  /**
   * Obtenir les statistiques du système
   */
  getStatistics(): Observable<ThemeStats> {
    return this.http.get<ThemeStats>(`${this.apiUrl}/stats`);
  }

  /**
   * Obtenir tous les thèmes disponibles
   */
  getAllThemes(): Observable<any> {
    return this.http.get(`${this.apiUrl}/themes`);
  }

  /**
   * Obtenir tous les candidats
   */
  getAllCandidates(): Observable<any> {
    return this.http.get(`${this.apiUrl}/candidates`);
  }
}
