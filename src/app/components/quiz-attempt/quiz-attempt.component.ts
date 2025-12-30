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
import { QuizService } from '../../services/quiz.service';
import { CandidateService } from '../../services/candidate.service';
import { AuthHelperService } from '../../services/auth-helper.service';
import { QuizAttempt } from '../../models/quiz.model';
import { Candidate } from '../../models/candidate';

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
  userId: number | null = null;
  keycloakUserId: string | null = null;
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
    private quizService: QuizService,
    private candidateService: CandidateService,
    private authHelper: AuthHelperService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  async ngOnInit(): Promise<void> {
    // Get Keycloak user ID (UUID)
    this.keycloakUserId = await this.authHelper.getKeycloakUserId();
    console.log('Keycloak User ID:', this.keycloakUserId);

    // Get numeric userId from authentication (fallback)
    this.userId = await this.authHelper.getUserId();
    if (!this.userId) {
      this.userId = this.authHelper.getUserIdFromToken();
    }
    console.log('Numeric User ID:', this.userId);

    // Get resourceId from route parameters
    this.route.paramMap.subscribe(params => {
      const resourceIdParam = params.get('resourceId');
      if (resourceIdParam) {
        this.resourceId = parseInt(resourceIdParam, 10);
      }
    });

    if (this.keycloakUserId || this.userId) {
      this.loadCandidateInfo();
      this.loadQuizHistory();
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
    if (!this.keycloakUserId && !this.userId) return;

    this.isLoading = true;

    // Try with Keycloak ID first (recommended)
    if (this.keycloakUserId) {
      console.log('Loading candidate with Keycloak ID:', this.keycloakUserId);

      this.candidateService.getCandidateByKeycloakId(this.keycloakUserId)
        .subscribe({
          next: (candidate) => {
            console.log('Candidate loaded:', candidate);
            this.candidate = candidate;
            this.userId = candidate.id; // Set numeric ID from database
            this.isLoading = false;
          },
          error: (err) => {
            console.error('Erreur chargement candidat par Keycloak ID:', err);
            // Fallback to numeric ID if available
            this.tryLoadByNumericId(err);
          }
        });
    } else if (this.userId) {
      this.tryLoadByNumericId(null);
    }
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

  loadQuizHistory(): void {
    if (!this.userId) return;

    this.quizService.getUserQuizHistory(this.userId)
      .subscribe({
        next: (history) => {
          this.quizHistory = history;
        },
        error: (err) => {
          console.error('Erreur chargement historique:', err);
        }
      });
  }

  submitQuiz(): void {
    if (!this.userId) {
      this.snackBar.open('Utilisateur non authentifié', 'Fermer', { duration: 3000 });
      return;
    }

    if (!this.resourceId) {
      this.snackBar.open('ID de ressource invalide', 'Fermer', { duration: 3000 });
      return;
    }

    this.isLoading = true;
    this.quizService.submitQuizAttempt(this.userId, this.resourceId, this.score)
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
            this.loadQuizHistory();
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
