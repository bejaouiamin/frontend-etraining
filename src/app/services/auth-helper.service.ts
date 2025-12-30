import { Injectable } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';

export interface DecodedToken {
  sub: string;
  preferred_username: string;
  email?: string;
  name?: string;
  realm_access?: {
    roles: string[];
  };
  resource_access?: any;
  // Add other fields from your token as needed
}

@Injectable({
  providedIn: 'root'
})
export class AuthHelperService {

  constructor(private keycloakService: KeycloakService) {}

  /**
   * Get the current user ID from the token
   * This extracts the user ID from Keycloak token (sub field)
   */
  async getUserId(): Promise<number | null> {
    try {
      const isLoggedIn = await this.keycloakService.isLoggedIn();
      if (!isLoggedIn) return null;

      // Get the token and decode it to extract the 'sub' field
      const token = await this.keycloakService.getToken();
      if (!token) return null;

      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.sub) return null;

      // The 'sub' field in Keycloak is the unique user ID (UUID format)
      // For numeric backend, you might need to map it or use it as string
      // If your backend uses the UUID directly, return it as string or convert

      console.log('Keycloak User ID (sub):', decoded.sub);
      console.log('Full decoded token:', decoded);

      // Try to convert to number, or use a hash if it's UUID
      // For now, let's try to extract numeric part or use as-is
      const userId = decoded.sub;

      // If your backend expects numeric IDs, you need to ensure
      // the candidate table uses the Keycloak UUID or map it
      return userId ? this.convertToNumericId(userId) : null;
    } catch (error) {
      console.error('Error getting user ID:', error);
      return null;
    }
  }

  /**
   * Convert Keycloak UUID to numeric ID
   * You can customize this based on your backend implementation
   */
  private convertToNumericId(keycloakId: string): number {
    // Option 1: If your backend stores the UUID as string, use a hash
    // Option 2: If your backend has a mapping table, call an API
    // Option 3: Use the UUID directly if backend accepts strings

    // For now, let's try to extract numbers from the UUID
    // This is NOT ideal - better to use UUID directly in backend
    const numericPart = keycloakId.replace(/\D/g, '');
    if (numericPart) {
      return parseInt(numericPart.substring(0, 10), 10);
    }

    // Fallback: create a hash
    let hash = 0;
    for (let i = 0; i < keycloakId.length; i++) {
      const char = keycloakId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  /**
   * Get Keycloak User ID as string (UUID)
   * This is the recommended way to use with backend
   */
  async getKeycloakUserId(): Promise<string | null> {
    try {
      // First, try to get token from Keycloak service
      let token: string | null = await this.keycloakService.getToken();

      // If Keycloak doesn't have it, check sessionStorage (direct login flow)
      if (!token) {
        token = sessionStorage.getItem('access_token');
        console.log('[AuthHelper] Using token from sessionStorage');
      } else {
        console.log('[AuthHelper] Using token from Keycloak service');
      }

      if (!token) {
        console.log('[AuthHelper] No token found in either Keycloak or sessionStorage');
        return null;
      }

      const decoded = this.decodeToken(token);
      console.log('[AuthHelper] Decoded token sub:', decoded?.sub);
      return decoded?.sub || null;
    } catch (error) {
      console.error('[AuthHelper] Error getting Keycloak user ID:', error);

      // Fallback: try sessionStorage directly
      try {
        const token = sessionStorage.getItem('access_token');
        if (token) {
          const decoded = this.decodeToken(token);
          console.log('[AuthHelper] Fallback - decoded token sub:', decoded?.sub);
          return decoded?.sub || null;
        }
      } catch (fallbackError) {
        console.error('[AuthHelper] Fallback also failed:', fallbackError);
      }

      return null;
    }
  }

  /**
   * Get user info from Keycloak token
   */
  async getUserInfo(): Promise<any> {
    try {
      const isLoggedIn = await this.keycloakService.isLoggedIn();
      if (!isLoggedIn) return null;

      return await this.keycloakService.loadUserProfile();
    } catch (error) {
      console.error('Error getting user info:', error);
      return null;
    }
  }

  /**
   * Get the access token
   */
  async getAccessToken(): Promise<string | null> {
    try {
      return await this.keycloakService.getToken();
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  /**
   * Decode JWT token manually (alternative method)
   */
  decodeToken(token: string): DecodedToken | null {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  /**
   * Get user ID from session storage token (fallback method)
   */
  getUserIdFromToken(): number | null {
    try {
      const token = sessionStorage.getItem('access_token');
      if (!token) return null;

      const decoded = this.decodeToken(token);
      if (!decoded) return null;

      // Extract user ID - adjust based on your token structure
      // Common fields: sub, user_id, id, preferred_username
      const userId = (decoded as any).user_id || (decoded as any).sub;
      return userId ? parseInt(userId, 10) : null;
    } catch (error) {
      console.error('Error extracting user ID from token:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    return await this.keycloakService.isLoggedIn();
  }

  /**
   * Get user roles
   */
  getUserRoles(): string[] {
    return this.keycloakService.getUserRoles();
  }
}
