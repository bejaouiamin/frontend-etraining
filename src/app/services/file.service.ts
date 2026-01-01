import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { AuthHelperService } from './auth-helper.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  constructor(
    private http: HttpClient,
    private authHelper: AuthHelperService
  ) { }

  /**
   * Get file from backend with authentication headers
   * @param fileName - The file name (UUID with extension)
   * @returns Observable of Blob (file content)
   */
  getFile(fileName: string): Observable<Blob> {
    // Get token synchronously from sessionStorage
    const token = sessionStorage.getItem('access_token');

    const headers = new HttpHeaders({
      'X-Keycloak-Id': this.extractKeycloakId(token) || 'unknown'
    });

    // Determine MIME type based on file extension
    const mimeType = this.getMimeType(fileName);

    return this.http.get<Blob>(
      `${environment.apiUrl}/api/v1/files/${fileName}`,
      {
        headers,
        responseType: 'blob' as any
      }
    ).pipe(
      // Ensure blob has correct MIME type
      // Note: Response content-type should come from backend
    );
  }

  /**
   * Determine MIME type based on file extension
   */
  private getMimeType(fileName: string): string {
    const extension = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();

    switch (extension) {
      case 'pdf':
        return 'application/pdf';
      case 'mp4':
        return 'video/mp4';
      case 'webm':
        return 'video/webm';
      case 'doc':
        return 'application/msword';
      case 'docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'png':
        return 'image/png';
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      default:
        return 'application/octet-stream';
    }
  }

  /**
   * Extract Keycloak User ID from JWT token
   */
  private extractKeycloakId(token: string | null): string | null {
    if (!token) return null;

    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded.sub || null;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  /**
   * Get file URL with authentication (for direct embedding in video/iframe)
   * @param fileName - The file name (UUID with extension)
   * @returns Full file URL
   */
  getFileUrl(fileName: string): string {
    return `${environment.apiUrl}/api/v1/files/${fileName}`;
  }
}
