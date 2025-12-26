// category.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Category } from '../../models/category';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatProgressBarModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss']
})
export class CategoryComponent implements OnInit {
  categories: Category[] = [];

  // Array of color theme classes that will cycle through
  private colorThemes = ['design', 'development', 'data', 'business', 'marketing', 'photography', 'acting', 'business-alt'];

  constructor(private categoryService: CategoryService) { }

  ngOnInit(): void {
    this.getallcategories();
  }

  getallcategories() {
    this.categoryService.getAllCategory().subscribe({
      next: (data: Category[]) => {
        this.categories = data;
      },
      error: (error) => {
        console.error('Error fetching categories', error);
      }
    });
  }

  // Retourne le chemin du svg dans assets ou une icône par défaut
  iconPath(cat: Category): string {
    return this.categoryService.getIconUrl(cat.icon);
  }

  onIconError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'icons/default.png'; // Fallback to local default icon
  }

  // Get color theme class based on index
  getColorClass(index: number): string {
    return this.colorThemes[index % this.colorThemes.length];
  }

}


