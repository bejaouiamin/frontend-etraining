import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { ThemeService } from '../../services/theme.service';
import { CategoryService } from '../../services/category.service';
import { LessonService } from '../../services/lesson.service';
import { AuthHelperService } from '../../services/auth-helper.service';
import { Theme } from '../../models/theme';
import { Category } from '../../models/category';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatSnackBarModule
  ],
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.scss']
})
export class CoursesComponent implements OnInit {
  categoryId!: number;
  category?: Category;
  themes: Theme[] = [];
  isLoading = false;
  enrolledThemeIds: Set<number> = new Set();
  candidateKeycloakId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private themeService: ThemeService,
    private categoryService: CategoryService,
    private lessonService: LessonService,
    private authHelper: AuthHelperService,
    private snackBar: MatSnackBar
  ) {}

  async ngOnInit(): Promise<void> {
    this.candidateKeycloakId = await this.authHelper.getKeycloakUserId();

    this.route.paramMap.subscribe(params => {
      const id = params.get('categoryId');
      if (id) {
        this.categoryId = parseInt(id, 10);
        this.loadCategory();
        this.loadThemes();
        this.loadEnrolledThemes();
      }
    });
  }

  loadCategory(): void {
    this.categoryService.getById(this.categoryId).subscribe({
      next: (category) => {
        this.category = category;
      },
      error: (err) => {
        console.error('Error loading category:', err);
      }
    });
  }

  loadThemes(): void {
    this.isLoading = true;
    this.themeService.getThemesByCategory(this.categoryId).subscribe({
      next: (themes) => {
        this.themes = themes;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading themes:', err);
        this.isLoading = false;
      }
    });
  }

  loadEnrolledThemes(): void {
    if (!this.candidateKeycloakId) return;

    this.lessonService.getCandidateEnrolledThemes(this.candidateKeycloakId).subscribe({
      next: (enrolledThemes) => {
        this.enrolledThemeIds = new Set(enrolledThemes.map(t => t.id).filter((id): id is number => id !== undefined));
      },
      error: (err) => {
        console.error('Error loading enrolled themes:', err);
      }
    });
  }

  isEnrolled(themeId: number | undefined): boolean {
    return themeId !== undefined && this.enrolledThemeIds.has(themeId);
  }

  enrollToTheme(event: Event, themeId: number | undefined): void {
    event.stopPropagation();

    if (!themeId || !this.candidateKeycloakId) {
      this.snackBar.open('Erreur: Informations manquantes', 'Fermer', { duration: 3000 });
      return;
    }

    if (this.isEnrolled(themeId)) {
      this.snackBar.open('Vous êtes déjà inscrit à ce thème', 'Fermer', { duration: 3000 });
      return;
    }

    this.lessonService.enrollCandidateToTheme(this.candidateKeycloakId, themeId).subscribe({
      next: (enrollment) => {
        this.enrolledThemeIds.add(themeId);
        this.snackBar.open('✓ Inscription réussie!', 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error: (err) => {
        const message = err.status === 409
          ? 'Vous êtes déjà inscrit à ce thème'
          : 'Erreur lors de l\'inscription';
        this.snackBar.open(message, 'Fermer', { duration: 3000 });
      }
    });
  }

  goToTheme(themeId: number | undefined): void {
    if (themeId) {
      this.router.navigate(['/theme', themeId]);
    }
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
