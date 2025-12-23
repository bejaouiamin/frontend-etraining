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
    this.isAuthenticatedSubject.next(this.keycloakService.isLoggedIn());
  }

  private async initAuthState() {
    const isLoggedIn = await this.keycloakService.isLoggedIn();
    this.isAuthenticatedSubject.next(isLoggedIn);
  }

  async logout(): Promise<void> {
    // This TERMINATES the Keycloak SSO session
    await this.keycloakService.logout('http://localhost:4200/auth/login');

    // Optional local cleanup
    sessionStorage.clear();
    localStorage.clear();
    this.isAuthenticatedSubject.next(false);
  }

  onLoginSuccess(): void {
    this.isAuthenticatedSubject.next(true);
  }
}
