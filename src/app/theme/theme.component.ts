import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../components/header/header.component';
import { FooterComponent } from '../components/footer/footer.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { ThemeService } from '../services/theme.service';
import { AuthHelperService } from '../services/auth-helper.service';
import { AuthStateService } from '../services/auth-state.service';
import { Theme } from '../models/theme';
import { Lesson } from '../models/lesson.model';
import { Subscription } from 'rxjs';
import { LessonService } from '../services/lesson.service';
import { QuizqueryService } from '../services/quizquery.service';
import { QuizResponse } from '../models/quiz.model';
import { ThemeFormComponent } from '../components/theme-form/theme-form.component';
import { LessonFormComponent } from '../components/lesson-form/lesson-form.component';
import { QuizFormComponent } from '../components/quiz-form/quiz-form.component';

@Component({
  selector: 'app-theme',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    FooterComponent,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    ThemeFormComponent,
    LessonFormComponent,
    QuizFormComponent
  ],
  templateUrl: './theme.component.html',
  styleUrl: './theme.component.scss'
})
export class ThemeComponent implements OnInit, OnDestroy {
  idFormateur: string | null = null; // Dynamic formateur ID
  isSidebarCollapsed = false;
  formateurKeycloakId: string | null = null;
  isFormateurLoggedIn = false;
  themes: Theme[] = [];
  lessons: Lesson[] = [];
  quizzes: QuizResponse[] = [];
  private authSubscription?: Subscription;

  constructor(
    private themeService: ThemeService,
    private lessonService: LessonService,
    private quizqueryService: QuizqueryService,
    private authHelper: AuthHelperService,
    private authState: AuthStateService
  ) {}

  ngOnInit(): void {
    // Subscribe to auth state changes
    this.authSubscription = this.authState.isAuthenticated$.subscribe((isAuth) => {
      console.log('[Theme] Auth state changed:', isAuth);
      if (isAuth) {
        // User is authenticated, load themes and lessons
        this.loadThemes();
        this.loadLessons();
        this.loadQuizzes();
      } else {
        // User is not authenticated, clear data
        this.themes = [];
        this.lessons = [];
        this.quizzes = [];
        this.isFormateurLoggedIn = false;
        this.formateurKeycloakId = null;
        this.idFormateur = null;
      }
    });
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  async loadThemes() {
    try {
      // Get the logged-in formateur's keycloakId
      this.formateurKeycloakId = await this.authHelper.getKeycloakUserId();

      console.log('[Theme] Keycloak User ID retrieved:', this.formateurKeycloakId);

      if (this.formateurKeycloakId) {
        this.isFormateurLoggedIn = true;
        this.idFormateur = this.formateurKeycloakId; // Set dynamic formateur ID

        // Fetch themes by formateur's keycloakId
        this.themeService.getThemesByFormateur(this.formateurKeycloakId).subscribe({
          next: (themes) => {
            this.themes = themes;
            console.log('[Theme] Themes loaded for formateur:', themes);
          },
          error: (error) => {
            console.error('[Theme] Error loading themes:', error);
            this.isFormateurLoggedIn = false;
          }
        });
      } else {
        console.log('[Theme] No keycloakId found - user may not be a formateur');
        this.isFormateurLoggedIn = false;
      }
    } catch (error) {
      console.error('[Theme] Error checking formateur login:', error);
      this.isFormateurLoggedIn = false;
    }
  }

  async loadLessons() {
    try {
      const keycloakId = await this.authHelper.getKeycloakUserId();

      if (keycloakId) {
        this.lessonService.getLessonsByFormateur(keycloakId).subscribe({
          next: (lessons) => {
            this.lessons = lessons;
            console.log('[Theme] Lessons loaded for formateur:', lessons);
          },
          error: (error) => {
            console.error('[Theme] Error loading lessons:', error);
          }
        });
      }
    } catch (error) {
      console.error('[Theme] Error loading lessons:', error);
    }
  }

  async loadQuizzes() {
    try {
      const keycloakId = await this.authHelper.getKeycloakUserId();

      if (keycloakId) {
        this.quizqueryService.getQuizzesByAuthor(keycloakId).subscribe({
          next: (quizzes) => {
            this.quizzes = quizzes;
            console.log('[Theme] Quizzes loaded for formateur:', quizzes);
          },
          error: (error) => {
            console.error('[Theme] Error loading quizzes:', error);
          }
        });
      }
    } catch (error) {
      console.error('[Theme] Error loading quizzes:', error);
    }
  }

  onThemeCreated(): void {
    console.log('[Theme] Theme created, reloading themes...');
    this.loadThemes();
  }

  onLessonCreated(): void {
    console.log('[Theme] Lesson created, reloading lessons...');
    this.loadLessons();
  }

  onQuizCreated(): void {
    console.log('[Theme] Quiz created, reloading quizzes...');
    this.loadQuizzes();
  }
}
