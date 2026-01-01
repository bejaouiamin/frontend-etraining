import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { CandidateService } from '../../services/candidate.service';
import { AuthHelperService } from '../../services/auth-helper.service';
import { QuizAttempt } from '../../models/quiz.model';
import { Candidate } from '../../models/candidate';
import { LessonService } from '../../services/lesson.service';

@Component({
  selector: 'app-quiz-attempt',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatSnackBarModule,
    MatTableModule,
    MatChipsModule
  ],
  templateUrl: './quiz-attempt.component.html',
  styleUrls: ['./quiz-attempt.component.scss']
})
export class QuizAttemptComponent implements OnInit {
  candidateKeycloakId: string | null = null;
  userId: number | null = null;
  resourceId: number = 0;
  score = 0; // Will be calculated from quiz answers
  isLoading = false;
  candidate?: Candidate;
  quizHistory: QuizAttempt[] = [];
  displayedColumns: string[] = ['date', 'score', 'status'];

  // Quiz answer tracking
  totalQuestions = 10; // This should come from the quiz resource
  correctAnswers = 0; // Track correct answers

  constructor(
    private candidateService: CandidateService,
    private lessonService: LessonService,
    private authHelper: AuthHelperService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  async ngOnInit(): Promise<void> {
    // Get Keycloak user ID (UUID)
    this.candidateKeycloakId = await this.authHelper.getKeycloakUserId();
    console.log('Keycloak User ID:', this.candidateKeycloakId);

    // Get resourceId from route parameters
    this.route.paramMap.subscribe(params => {
      const resourceIdParam = params.get('resourceId');
      if (resourceIdParam) {
        this.resourceId = parseInt(resourceIdParam, 10);
      }
    });

    if (this.candidateKeycloakId) {
      this.loadCandidateInfo();
      // this.loadQuizHistory(); // TODO: Implement quiz history later
    } else {
      this.snackBar.open('Utilisateur non authentifié', 'Fermer', { duration: 3000 ,verticalPosition: 'top'});
      this.router.navigate(['/auth/login']);
    }
  }

  /**
   * Calculate score based on correct answers
   * This method should be called after quiz completion
   */
  calculateScore(): void {
    if (this.totalQuestions > 0) {
      this.score = Math.round((this.correctAnswers / this.totalQuestions) * 100);
    }
  }

  /**
   * Update score when user answers questions
   * @param isCorrect - whether the answer is correct
   */
  onAnswerSelected(isCorrect: boolean): void {
    if (isCorrect) {
      this.correctAnswers++;
    }
    this.calculateScore();
  }

  loadCandidateInfo(): void {
    if (!this.candidateKeycloakId) return;

    this.isLoading = true;
    this.candidateService.getCandidateByKeycloakId(this.candidateKeycloakId)
      .subscribe({
        next: (candidate) => {
          console.log('Candidate loaded:', candidate);
          this.candidate = candidate;
          this.userId = candidate.id; // Set numeric ID from database
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Erreur chargement candidat par Keycloak ID:', err);
          this.isLoading = false;
          this.showErrorMessage(err);
        }
      });
  }

  private tryLoadByNumericId(previousError: any): void {
    if (!this.userId) {
      this.isLoading = false;
      this.showErrorMessage(previousError);
      return;
    }

    console.log('Loading candidate with numeric ID:', this.userId);

    this.candidateService.getCandidateById(this.userId)
      .subscribe({
        next: (candidate) => {
          console.log('Candidate loaded:', candidate);
          this.candidate = candidate;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Erreur chargement candidat:', err);
          this.isLoading = false;
          this.showErrorMessage(err);
        }
      });
  }

  private showErrorMessage(err: any): void {
    let errorMsg = 'Erreur lors du chargement des informations';
    if (err?.status === 0) {
      errorMsg = 'Erreur de connexion au serveur (CORS ou serveur inaccessible)';
    } else if (err?.status === 404) {
      errorMsg = 'Candidat non trouvé. Veuillez vous inscrire à nouveau.';
    }

    this.snackBar.open(errorMsg, 'Fermer', {
      duration: 5000,
      verticalPosition: 'top'
    });
  }

  // TODO: Implement quiz history loading when backend endpoint is available
  // loadQuizHistory(): void {
  //   if (!this.candidateKeycloakId) return;
  //
  //   this.lessonService.getUserQuizHistoryByKeycloakId(this.candidateKeycloakId)
  //     .subscribe({
  //       next: (history) => {
  //         this.quizHistory = history;
  //       },
  //       error: (err) => {
  //         console.error('Erreur chargement historique:', err);
  //       }
  //     });
  // }

  submitQuiz(): void {
    if (!this.candidateKeycloakId) {
      this.snackBar.open('Utilisateur non authentifié', 'Fermer', { duration: 3000 });
      return;
    }

    if (!this.resourceId) {
      this.snackBar.open('ID de ressource invalide', 'Fermer', { duration: 3000 });
      return;
    }

    this.isLoading = true;
    this.lessonService.submitQuizAttempt(this.candidateKeycloakId, this.resourceId, this.score)
      .subscribe({
        next: (attempt) => {
          console.log('Quiz soumis:', attempt);
          this.isLoading = false;

          if (attempt.passed) {
            this.snackBar.open('🎉 Félicitations ! Quiz réussi !', 'Fermer', {
              duration: 5000,
              panelClass: ['success-snackbar']
            });
            this.loadCandidateInfo();
            // this.loadQuizHistory(); // TODO: Uncomment when quiz history is implemented
          } else {
            this.snackBar.open('Quiz échoué. Réessayez !', 'Fermer', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
          }
        },
        error: (err) => {
          console.error('Erreur soumission quiz:', err);
          this.isLoading = false;
          this.snackBar.open('Erreur lors de la soumission', 'Fermer', {
            duration: 3000
          });
        }
      });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
