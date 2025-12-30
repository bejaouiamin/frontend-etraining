import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LessonService } from '../../services/lesson.service';
import { AuthHelperService } from '../../services/auth-helper.service';
import { Lesson, LessonProgress } from '../../models/lesson.model';
import { Resource, ResourceType } from '../../models/resource.model';

@Component({
  selector: 'app-lesson-progress',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressBarModule,
    MatIconModule,
    MatButtonModule,
    MatExpansionModule,
    MatChipsModule,
    MatTooltipModule
  ],
  templateUrl: './lesson-progress.component.html',
  styleUrls: ['./lesson-progress.component.scss']
})
export class LessonProgressComponent implements OnInit {
  @Input() lessonId?: number;
  @Input() userId?: number;
  @Input() themeId?: number;

  lesson?: Lesson;
  progress?: LessonProgress;
  lessons: Lesson[] = [];
  isLoading = false;
  ResourceType = ResourceType;

  constructor(
    private lessonService: LessonService,
    private authHelper: AuthHelperService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    // Get userId from authentication if not provided as Input
    if (!this.userId) {
      const authUserId = await this.authHelper.getUserId();
      if (authUserId) {
        this.userId = authUserId;
      } else {
        const tokenUserId = this.authHelper.getUserIdFromToken();
        this.userId = tokenUserId || undefined;
      }
    }

    // Get lessonId or themeId from route parameters if not provided as Input
    this.route.paramMap.subscribe(params => {
      const lessonIdParam = params.get('lessonId');
      const themeIdParam = params.get('themeId');

      if (lessonIdParam && !this.lessonId) {
        this.lessonId = parseInt(lessonIdParam, 10);
      }

      if (themeIdParam && !this.themeId) {
        this.themeId = parseInt(themeIdParam, 10);
      }

      // Load data based on available parameters
      if (this.lessonId && this.userId) {
        this.loadLessonDetails();
        this.loadProgress();
      } else if (this.themeId) {
        this.loadLessonsByTheme();
      }
    });

    if (!this.userId) {
      this.router.navigate(['/auth/login']);
    }
  }

  loadLessonDetails(): void {
    if (!this.lessonId) return;

    this.isLoading = true;
    this.lessonService.getLessonById(this.lessonId).subscribe({
      next: (lesson) => {
        this.lesson = lesson;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement leçon:', err);
        this.isLoading = false;
      }
    });
  }

  loadProgress(): void {
    if (!this.userId || !this.lessonId) return;

    this.lessonService.getUserProgress(this.userId, this.lessonId).subscribe({
      next: (progress) => {
        this.progress = progress;
      },
      error: (err) => {
        console.error('Erreur chargement progression:', err);
      }
    });
  }

  loadLessonsByTheme(): void {
    if (!this.themeId) return;

    this.isLoading = true;
    this.lessonService.getLessonsByTheme(this.themeId).subscribe({
      next: (lessons) => {
        this.lessons = lessons;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement leçons:', err);
        this.isLoading = false;
      }
    });
  }

  markResourceCompleted(resourceId: number): void {
    if (!this.userId) return;

    this.lessonService.markResourceCompleted(this.userId, resourceId).subscribe({
      next: () => {
        console.log('Ressource marquée comme complétée');
        this.loadProgress();
      },
      error: (err) => {
        console.error('Erreur marquage ressource:', err);
      }
    });
  }

  getResourceIcon(type: ResourceType): string {
    switch (type) {
      case ResourceType.VIDEO:
        return 'play_circle';
      case ResourceType.QUIZ:
        return 'quiz';
      case ResourceType.DOCUMENT:
        return 'description';
      default:
        return 'article';
    }
  }

  getResourceColor(type: ResourceType): string {
    switch (type) {
      case ResourceType.VIDEO:
        return 'video';
      case ResourceType.QUIZ:
        return 'quiz';
      case ResourceType.DOCUMENT:
        return 'document';
      default:
        return 'default';
    }
  }

  formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins > 0 ? mins + 'min' : ''}`;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
