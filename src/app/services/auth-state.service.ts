import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

@Injectable({ providedIn: 'root' })
export class AuthStateService {

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private keycloakService: KeycloakService,
    private router: Router
  ) {
    this.initAuthState();
  }

  private async initAuthState() {
    try {
      // Check if we have tokens in sessionStorage (from direct login)
      const sessionToken = sessionStorage.getItem('access_token');

      // Check Keycloak's internal state
      const isLoggedIn = await this.keycloakService.isLoggedIn();

      // User is authenticated if either Keycloak knows about it OR we have session tokens
      const isAuthenticated = isLoggedIn || !!sessionToken;

      console.log('[AuthState] Initial auth check:', {
        keycloakLoggedIn: isLoggedIn,
        hasSessionToken: !!sessionToken,
        finalState: isAuthenticated
      });

      this.isAuthenticatedSubject.next(isAuthenticated);
    } catch (error) {
      console.error('[AuthState] Error checking initial auth state:', error);
      // Check sessionStorage as fallback
      const sessionToken = sessionStorage.getItem('access_token');
      this.isAuthenticatedSubject.next(!!sessionToken);
    }
  }

  async logout(): Promise<void> {
    // This TERMINATES the Keycloak SSO session
    await this.keycloakService.logout('http://localhost:4200/');

    // Optional local cleanup
    sessionStorage.clear();
    localStorage.clear();
    this.isAuthenticatedSubject.next(false);
  }

  onLoginSuccess(): void {
    this.isAuthenticatedSubject.next(true);
  }
}
