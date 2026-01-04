import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Salle, SalleStatus } from '../models/salle.model';
import { Reservation } from '../models/reservation.model';

@Injectable({
  providedIn: 'root'
})
export class SalleService {
  private apiUrl = `${environment.apiUrl}/api/salles`;

  constructor(private http: HttpClient) {
    console.log('[SalleService] API URL:', this.apiUrl);
  }

  /**
   * Create a new salle
   */
  createSalle(salle: Salle): Observable<Salle> {
    console.log('[SalleService] Creating salle:', salle);
    return this.http.post<Salle>(`${this.apiUrl}/add`, salle).pipe(
      tap(result => console.log('[SalleService] Salle created:', result)),
      catchError(error => {
        console.error('[SalleService] Error creating salle:', error);
        throw error;
      })
    );
  }

  /**
   * Update an existing salle
   */
  updateSalle(id: number, salle: Salle): Observable<Salle> {
    console.log('[SalleService] Updating salle:', id, salle);
    return this.http.put<Salle>(`${this.apiUrl}/${id}`, salle).pipe(
      tap(result => console.log('[SalleService] Salle updated:', result)),
      catchError(error => {
        console.error('[SalleService] Error updating salle:', error);
        throw error;
      })
    );
  }

  /**
   * Delete a salle by ID
   */
  deleteSalle(id: number): Observable<void> {
    console.log('[SalleService] Deleting salle:', id);
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => console.log('[SalleService] Salle deleted:', id)),
      catchError(error => {
        console.error('[SalleService] Error deleting salle:', error);
        throw error;
      })
    );
  }

  /**
   * Get all salles
   */
  getAllSalles(): Observable<Salle[]> {
    console.log('[SalleService] Getting all salles');
    return this.http.get<Salle[]>(`${this.apiUrl}/all`).pipe(
      tap(result => console.log('[SalleService] Salles retrieved:', result.length)),
      catchError(error => {
        console.error('[SalleService] Error getting salles:', error);
        throw error;
      })
    );
  }

  /**
   * Get available salles only
   */
  getSallesDisponibles(): Observable<Salle[]> {
    console.log('[SalleService] Getting available salles');
    return this.http.get<Salle[]>(`${this.apiUrl}/disponibles`).pipe(
      tap(result => console.log('[SalleService] Available salles:', result.length)),
      catchError(error => {
        console.error('[SalleService] Error getting available salles:', error);
        throw error;
      })
    );
  }

  /**
   * Reserve a salle for a formateur
   */
  reserverSallePourFormateur(
    salleId: number,
    formateurKeycloakId: string,
    reservation: Reservation,
    adminKeycloakId: string
  ): Observable<Reservation> {
    const headers = new HttpHeaders({
      'X-Keycloak-Id': adminKeycloakId
    });

    console.log('[SalleService] Reserving salle:', { salleId, formateurKeycloakId, adminKeycloakId });
    return this.http.post<Reservation>(
      `${this.apiUrl}/${salleId}/reserver/formateur/${formateurKeycloakId}`,
      reservation,
      { headers }
    ).pipe(
      tap(result => console.log('[SalleService] Reservation created:', result)),
      catchError(error => {
        console.error('[SalleService] Error creating reservation:', error);
        throw error;
      })
    );
  }

  /**
   * Cancel a reservation
   */
  annulerReservation(reservationId: number, reason?: string): Observable<void> {
    let params = new HttpParams();
    if (reason) {
      params = params.set('reason', reason);
    }

    console.log('[SalleService] Cancelling reservation:', reservationId, reason);
    return this.http.delete<void>(
      `${this.apiUrl}/reservations/${reservationId}`,
      { params }
    ).pipe(
      tap(() => console.log('[SalleService] Reservation cancelled:', reservationId)),
      catchError(error => {
        console.error('[SalleService] Error cancelling reservation:', error);
        throw error;
      })
    );
  }

  /**
   * Get all reservations for a specific salle
   */
  getReservationsBySalle(salleId: number): Observable<Reservation[]> {
    console.log('[SalleService] Getting reservations for salle:', salleId);
    return this.http.get<Reservation[]>(`${this.apiUrl}/${salleId}/reservations`).pipe(
      tap(result => console.log('[SalleService] Reservations retrieved:', result.length)),
      catchError(error => {
        console.error('[SalleService] Error getting reservations:', error);
        throw error;
      })
    );
  }

  /**
   * Get all reservations for a formateur
   */
  getFormateurReservations(formateurKeycloakId: string): Observable<Reservation[]> {
    const headers = new HttpHeaders({
      'X-Keycloak-Id': formateurKeycloakId
    });

    console.log('[SalleService] Getting reservations for formateur:', formateurKeycloakId);
    return this.http.get<Reservation[]>(
      `${this.apiUrl}/formateur/reservations`,
      { headers }
    ).pipe(
      tap(result => console.log('[SalleService] Formateur reservations:', result.length)),
      catchError(error => {
        console.error('[SalleService] Error getting formateur reservations:', error);
        throw error;
      })
    );
  }

  /**
   * Update the status of a salle
   */
  updateSalleStatus(salleId: number, status: SalleStatus): Observable<void> {
    const params = new HttpParams().set('status', status);

    console.log('[SalleService] Updating salle status:', salleId, status);
    return this.http.patch<void>(
      `${this.apiUrl}/${salleId}/status`,
      null,
      { params }
    ).pipe(
      tap(() => console.log('[SalleService] Salle status updated:', salleId, status)),
      catchError(error => {
        console.error('[SalleService] Error updating salle status:', error);
        throw error;
      })
    );
  }
}
