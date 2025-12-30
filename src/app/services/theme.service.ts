import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Theme } from '../models/theme';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  private apiUrl = `${environment.apiUrl}/api/themes`;

  constructor(private http: HttpClient) { }

  getThemesByFormateur(keycloakId: string): Observable<Theme[]> {
    return this.http.get<Theme[]>(`${this.apiUrl}/formateur/${keycloakId}`);
  }
}
