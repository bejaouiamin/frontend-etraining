import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';
import { KeycloakService } from 'keycloak-angular';
import { from } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private keycloak: KeycloakService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    return from(this.getToken()).pipe(
      switchMap((token: string | null) => {
        if (token && typeof token === 'string') {
          console.log('[AuthInterceptor] Adding Bearer token to request:', req.url);
          const cloned = req.clone({
            setHeaders: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          return next.handle(cloned);
        }
        console.warn('[AuthInterceptor] No token available for request:', req.url);
        return next.handle(req);
      })
    );
  }

  private async getToken(): Promise<string | null> {
    try {
      // Try Keycloak service first
      let token: string | null = await this.keycloak.getToken();

      // Fallback to sessionStorage
      if (!token) {
        token = sessionStorage.getItem('access_token');
        if (token) {
          console.log('[AuthInterceptor] Using token from sessionStorage');
        }
      }

      return token || null;
    } catch (error) {
      console.error('[AuthInterceptor] Error getting token:', error);
      // Try sessionStorage as last resort
      return sessionStorage.getItem('access_token');
    }
  }
}
