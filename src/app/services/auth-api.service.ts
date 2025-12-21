import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CandidatRequest } from '../models/candidat-request.model';
import { FormateurRequest } from '../models/formateur-request.model';


@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private base = environment.apiUrl + '/api/auth';

  constructor(private http: HttpClient) {}

  registerCandidat(payload: CandidatRequest): Observable<any> {
    return this.http.post<any>(`${this.base}/candidat/register`, payload);
  }

  registerFormateur(payload: FormateurRequest): Observable<any> {
    return this.http.post<any>(`${this.base}/formateur/register`, payload);
  }
}
