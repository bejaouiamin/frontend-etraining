// category.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { Category } from '../../models/category';
import { CategoryService } from '../../services/category.service';
import { ThemeService } from '../../services/theme.service';
import { LessonService } from '../../services/lesson.service';
import { AuthHelperService } from '../../services/auth-helper.service';
import { LessonProgressDTO } from '../../models/lesson-progress.dto';
import { Theme } from '../../models/theme';

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
    MatInputModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatChipsModule
  ],
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss']
})
export class CategoryComponent implements OnInit {
  categories: Category[] = [];
  themes: Theme[] = [];
  lessonHistory: LessonProgressDTO[] = [];
  candidateKeycloakId: string | null = null;
  isLoadingHistory = false;

  // Array of color theme classes that will cycle through
  private colorThemes = ['design', 'development', 'data', 'business', 'marketing', 'photography', 'acting', 'business-alt'];

  constructor(
    private categoryService: CategoryService,
    private themeService: ThemeService,
    private lessonService: LessonService,
    private authHelper: AuthHelperService,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  async ngOnInit(): Promise<void> {
    this.getallcategories();
    // Get Keycloak user ID for loading lesson history
    this.candidateKeycloakId = await this.authHelper.getKeycloakUserId();
    // Load lesson history automatically
    this.loadLessonHistory();
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

  // Load all themes and their lesson history
  loadLessonHistory(): void {
    if (!this.candidateKeycloakId) {
      this.snackBar.open('Utilisateur non authentifié', 'Fermer', { duration: 3000 });
      return;
    }

    this.isLoadingHistory = true;
    this.lessonHistory = [];

    // First, get all themes
    this.themeService.getAllThemes().subscribe({
      next: (themes) => {
        this.themes = themes;
        // Then load progress for each theme
        this.loadProgressForAllThemes();
      },
      error: (err) => {
        console.error('Erreur chargement thèmes:', err);
        this.isLoadingHistory = false;
        this.snackBar.open('Erreur lors du chargement des thèmes', 'Fermer', { duration: 3000 });
      }
    });
  }

  private loadProgressForAllThemes(): void {
    if (this.themes.length === 0) {
      this.isLoadingHistory = false;
      return;
    }

    let completedRequests = 0;

    this.themes.forEach(theme => {
      if (this.candidateKeycloakId && typeof theme.id === 'number') {
        this.lessonService.getCandidateLessonsWithProgress(this.candidateKeycloakId, theme.id).subscribe({
          next: (progress) => {
            this.lessonHistory = [...this.lessonHistory, ...progress];
            completedRequests++;
            if (completedRequests === this.themes.length) {
              this.isLoadingHistory = false;
              if (this.lessonHistory.length === 0) {
                this.snackBar.open('Aucune leçon trouvée', 'Fermer', { duration: 3000 });
              }
            }
          },
          error: (err) => {
            console.error(`Erreur chargement progression thème ${theme.id}:`, err);
            completedRequests++;
            if (completedRequests === this.themes.length) {
              this.isLoadingHistory = false;
            }
          }
        });
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

  // Format date
  formatDate(dateString: string | null): string {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Navigate to lesson detail page
  goToLesson(lessonId: number): void {
    this.router.navigate(['/lessons', lessonId]);
  }

  // Navigate to category themes page
  goToCategory(categoryId: number | undefined): void {
    if (categoryId) {
      this.router.navigate(['/courses', categoryId]);
    }
  }

  // Navigate to quiz attempt history
  viewHistory(): void {
    this.router.navigate(['/quiz-attempt']);
  }

}


