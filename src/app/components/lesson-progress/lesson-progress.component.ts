import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { LessonService } from '../../services/lesson.service';
import { FileService } from '../../services/file.service';
import { AuthHelperService } from '../../services/auth-helper.service';
import { Lesson, LessonProgress } from '../../models/lesson.model';
import { Resource, ResourceType } from '../../models/resource.model';
import { QuizQuestion } from '../../models/quiz.model';
import { LessonWithResourcesDTO, ResourceDTO } from '../../models/lesson-with-resources.dto';
import { HeaderComponent } from '../header/header.component';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';


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
    MatTooltipModule,
    NgxExtendedPdfViewerModule,
    HeaderComponent
  ],
  templateUrl: './lesson-progress.component.html',
  styleUrls: ['./lesson-progress.component.scss']
})
export class LessonProgressComponent implements OnInit, OnDestroy {
  @Input() lessonId?: number;
  @Input() candidateKeycloakId: string | null = null;
  @Input() themeId?: number;

  lesson?: Lesson;
  lessonWithResources?: LessonWithResourcesDTO;
  progress?: LessonProgress;
  quizQuestions?: QuizQuestion[];
  lessons: Lesson[] = [];
  isLoading = false;
  isLoadingResource = false; // Track resource loading state
  ResourceType = ResourceType;
  selectedResource?: ResourceDTO;
  isResourceViewOpen = false;
  selectedResourceUrl?: string | SafeResourceUrl; // For video and PDF display
  pdfSrc?: string | Blob | Uint8Array; // For ngx-extended-pdf-viewer
  private blobUrls: string[] = []; // Track blob URLs for cleanup
  private currentBlob?: Blob; // Store current blob for download
  selectedAnswers: Map<number, number> = new Map(); // Map<questionId, answerId>

  constructor(
    private lessonService: LessonService,
    private fileService: FileService,
    private authHelper: AuthHelperService,
    private route: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {}

  async ngOnInit(): Promise<void> {
    // Get candidateKeycloakId from authentication if not provided as Input
    if (!this.candidateKeycloakId) {
      this.candidateKeycloakId = await this.authHelper.getKeycloakUserId();
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
      if (this.lessonId && this.candidateKeycloakId) {
        this.loadLessonDetails();
        this.loadProgress();
      } else if (this.themeId) {
        this.loadLessonsByTheme();
      }
    });

    if (!this.candidateKeycloakId) {
      this.router.navigate(['/auth/login']);
    }
  }

  loadLessonDetails(): void {
    if (!this.lessonId || !this.candidateKeycloakId) return;

    this.isLoading = true;
    this.lessonService.getLessonWithResources(this.candidateKeycloakId, this.lessonId).subscribe({
      next: (lessonData) => {
        this.lessonWithResources = lessonData;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement leçon avec ressources:', err);
        this.isLoading = false;
        // Fallback to old method if new endpoint is not available
        this.lessonService.getLessonById(this.lessonId!).subscribe({
          next: (lesson) => {
            this.lesson = lesson;
          },
          error: (fallbackErr) => {
            console.error('Erreur fallback:', fallbackErr);
          }
        });
      }
    });
  }

  loadProgress(): void {
    if (!this.candidateKeycloakId || !this.lessonId) return;

    this.lessonService.getQuizIfLessonConsumed(this.candidateKeycloakId, this.lessonId).subscribe({
      next: (quizQuestions) => {
        this.quizQuestions = quizQuestions;
      },
      error: (err) => {
        console.error('Erreur chargement quizQuestions:', err);
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
    if (!this.candidateKeycloakId) return;

    this.lessonService.markResourceCompleted(this.candidateKeycloakId, resourceId).subscribe({
      next: () => {
        console.log('Ressource marquée comme complétée');
        if (this.lessonWithResources) {
          const resource = this.lessonWithResources.resources.find(r => r.id === resourceId);
          if (resource) {
            resource.completed = true;
            resource.completedAt = new Date().toISOString();
          }
        }
      },
      error: (err) => {
        console.error('Erreur marquage ressource:', err);
      }
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  openResource(resource: ResourceDTO): void {
    this.selectedResource = resource;
    this.isResourceViewOpen = true;
    this.isLoadingResource = true; // Start loading

    // For QUIZ, load questions instead of file
    if (resource.type === ResourceType.QUIZ) {
      if (!this.lessonId || !this.candidateKeycloakId) return;

      this.lessonService.getQuizIfLessonConsumed(this.candidateKeycloakId, this.lessonId).subscribe({
        next: (questions) => {
          this.quizQuestions = questions;
          this.isLoadingResource = false;
          console.log('Quiz questions loaded:', questions);
        },
        error: (err) => {
          console.error('Error loading quiz questions:', err);
          this.isLoadingResource = false;
          alert('Erreur lors du chargement du quiz. Veuillez réessayer.');
        }
      });
      return;
    }

    // Pre-load the file when opening the resource (VIDEO or PDF)
    if (resource.url) {
      const fileName = resource.url.includes('/')
        ? resource.url.substring(resource.url.lastIndexOf('/') + 1)
        : resource.url;

      this.fileService.getFile(fileName).subscribe({
        next: (blob) => {
          // Create blob URL with correct MIME type
          const mimeType = this.getMimeType(fileName);
          const typedBlob = new Blob([blob], { type: mimeType });

          // Store blob for potential download
          this.currentBlob = typedBlob;

          // Create blob URL
          const blobUrl = URL.createObjectURL(typedBlob);
          this.blobUrls.push(blobUrl);

          // For PDFs, use the blob URL (not the blob object itself)
          if (this.selectedResource?.type === ResourceType.PDF) {
            this.pdfSrc = blobUrl;
          }

          // Sanitize blob URL for use in video/iframe/embed
          this.selectedResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);
          this.isLoadingResource = false; // Stop loading

          console.log('Resource loaded successfully:', fileName, 'MIME Type:', mimeType, 'Blob URL:', blobUrl);
          console.log('Blob size:', typedBlob.size, 'bytes');
          console.log('PDF Source:', this.pdfSrc);
          console.log('Resource type:', this.selectedResource?.type);
        },
        error: (err) => {
          console.error('Error loading resource:', err);
          this.isLoadingResource = false; // Stop loading even on error
          alert('Erreur lors du chargement de la ressource. Veuillez réessayer.');
        }
      });
    }
  }

  /**
   * Download the current resource file
   */
  downloadResource(): void {
    if (!this.currentBlob || !this.selectedResource) return;

    const fileName = this.selectedResource.url?.includes('/')
      ? this.selectedResource.url.substring(this.selectedResource.url.lastIndexOf('/') + 1)
      : this.selectedResource.url || 'document.pdf';

    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = URL.createObjectURL(this.currentBlob);
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(link.href);
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

  closeResource(): void {
    this.isResourceViewOpen = false;
    this.selectedResource = undefined;
    this.selectedResourceUrl = undefined;
    this.pdfSrc = undefined;
    this.currentBlob = undefined;
    this.selectedAnswers.clear();
  }

  /**
   * Select an answer for a quiz question
   */
  selectAnswer(questionId: number, answerId: number): void {
    this.selectedAnswers.set(questionId, answerId);
  }

  /**
   * Check if an answer is selected for a question
   */
  isAnswerSelected(questionId: number, answerId: number): boolean {
    return this.selectedAnswers.get(questionId) === answerId;
  }

  /**
   * Submit quiz answers
   */
  submitQuiz(): void {
    if (!this.quizQuestions || this.quizQuestions.length === 0) return;
    if (!this.selectedResource || !this.candidateKeycloakId) return;

    // Check if all questions are answered
    if (this.selectedAnswers.size < this.quizQuestions.length) {
      alert('Veuillez répondre à toutes les questions avant de soumettre le quiz.');
      return;
    }

    // Collect selected answer IDs in order
    const answerIds: number[] = [];
    this.quizQuestions.forEach(question => {
      const selectedAnswerId = this.selectedAnswers.get(question.id);
      if (selectedAnswerId !== undefined) {
        answerIds.push(selectedAnswerId);
      }
    });

    console.log('Submitting quiz answers to backend:', answerIds);

    // Submit to backend for validation
    this.lessonService.submitQuizAnswers(
      this.candidateKeycloakId,
      this.selectedResource.id,
      answerIds
    ).subscribe({
      next: (attempt) => {
        console.log('Quiz attempt result:', attempt);

        if (attempt.passed) {
          // Update local state
          if (this.lessonWithResources) {
            const resource = this.lessonWithResources.resources.find(r => r.id === this.selectedResource?.id);
            if (resource) {
              resource.completed = true;
              resource.completedAt = new Date().toISOString();
            }
          }
          alert(`Félicitations! Vous avez réussi le quiz avec ${attempt.score.toFixed(0)}%`);
        } else {
          alert(`Score: ${attempt.score.toFixed(0)}%. Score minimum requis: ${this.selectedResource?.passingScore}%. Veuillez réessayer.`);
        }
      },
      error: (err) => {
        console.error('Error submitting quiz:', err);
        alert('Erreur lors de la soumission du quiz. Veuillez réessayer.');
      }
    });
  }

  ngOnDestroy(): void {
    // Clean up blob URLs to prevent memory leaks
    this.blobUrls.forEach(url => URL.revokeObjectURL(url));
  }

  getFullUrl(url: string): string {
    // Extract file ID from various URL formats
    let fileName = url;

    // If it's a full URL, extract the filename
    if (url.includes('/')) {
      fileName = url.substring(url.lastIndexOf('/') + 1);
    }

    return fileName;
  }

  getResourceIcon(type: ResourceType): string {
    switch (type) {
      case ResourceType.VIDEO:
        return 'play_circle';
      case ResourceType.QUIZ:
        return 'quiz';
      case ResourceType.PDF:
        return 'description';
      default:
        return 'article';
    }
  }

  getResourceBadgeClass(type: ResourceType): string {
    switch (type) {
      case ResourceType.VIDEO:
        return 'video-badge';
      case ResourceType.QUIZ:
        return 'quiz-badge';
      case ResourceType.PDF:
        return 'document-badge';
      default:
        return 'default-badge';
    }
  }

  getSafeUrl(url: string): SafeResourceUrl {
    // Not used anymore, but kept for backward compatibility
    return this.sanitizer.bypassSecurityTrustResourceUrl('about:blank');
  }

  /**
   * Get the URL for video/PDF display
   * Returns the blob URL if available, empty string if loading
   */
  getResourceUrl(): string | SafeResourceUrl {
    return '';
  }
}
