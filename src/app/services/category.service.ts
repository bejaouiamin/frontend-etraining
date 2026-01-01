import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Category } from '../models/category';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private baseCategory = environment.apiUrl + "/api/categories"

  constructor(private http: HttpClient) { }

  getAllCategory(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseCategory}/all`);
  }

  getById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.baseCategory}/${id}`);
  }

  getIconUrl(iconFilename: string | null | undefined): string {
    if (iconFilename) {
      return `${this.baseCategory}/icons/${iconFilename}`;
    }
    return 'icons/default.png'; // Fallback to local default icon
  }
}
