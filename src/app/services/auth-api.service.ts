import { Injectable } from "@angular/core"
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http"
import { Observable, tap } from "rxjs"
import { environment } from "../../environments/environment"
import { CandidatRequest } from "../models/candidat-request.model"
import { FormateurRequest } from "../models/formateur-request.model"
import { AuthStateService } from "./auth-state.service"

@Injectable({ providedIn: "root" })
export class AuthApiService {
  private base = environment.apiUrl + "/api/auth"
  private tokenUrl = environment.tokenUrl
  private clientId = "micro-service-api"
  private clientSecret = "E3lXvxbU8Ebxoy71tvxdw1l7V778EYwW"

  constructor(
    private http: HttpClient,
    private authState: AuthStateService,
  ) { }

  registerCandidat(payload: CandidatRequest): Observable<any> {
    return this.http.post<any>(`${this.base}/candidat/register`, payload)
  }

  registerFormateur(payload: FormateurRequest): Observable<any> {
    return this.http.post<any>(`${this.base}/formateur/register`, payload)
  }

  login(username: string, password: string): Observable<any> {
    const body = new HttpParams()
      .set("grant_type", "password")
      .set("client_id", this.clientId)
      .set("client_secret", this.clientSecret)
      .set("username", username)
      .set("password", password)
      .set("scope", "openid")

    const headers = new HttpHeaders({ "Content-Type": "application/x-www-form-urlencoded" })

    return this.http.post(this.tokenUrl, body.toString(), { headers }).pipe(
      tap((tokens: any) => {
        sessionStorage.setItem("access_token", tokens.access_token)
        sessionStorage.setItem("refresh_token", tokens.refresh_token)
        this.authState.onLoginSuccess()
      }),
    )
  }

  logout(): void {
    this.authState.logout();
  }


  refresh(): Observable<any> {
    const refreshToken = sessionStorage.getItem("refresh_token")
    if (!refreshToken) throw new Error("No refresh token")
    const body = new HttpParams()
      .set("grant_type", "refresh_token")
      .set("client_id", this.clientId)
      .set("client_secret", this.clientSecret)
      .set("refresh_token", refreshToken)
    const headers = new HttpHeaders({ "Content-Type": "application/x-www-form-urlencoded" })
    return this.http.post(this.tokenUrl, body.toString(), { headers }).pipe(
      tap((tokens: any) => {
        sessionStorage.setItem("access_token", tokens.access_token)
        sessionStorage.setItem("refresh_token", tokens.refresh_token)
      }),
    )
  }
}
