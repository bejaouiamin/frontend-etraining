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
import { MatTooltipModule } from '@angular/material/tooltip';
import { CandidateService } from '../../services/candidate.service';
import { AuthHelperService } from '../../services/auth-helper.service';
import { QuizAttempt } from '../../models/quiz.model';
import { Candidate } from '../../models/candidate';
import { LessonService } from '../../services/lesson.service';
import { HeaderComponent } from '../header/header.component';

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
    MatChipsModule,
    MatTooltipModule,
    HeaderComponent
  ],
  templateUrl: './quiz-attempt.component.html',
  styleUrls: ['./quiz-attempt.component.scss']
})
export class QuizAttemptComponent implements OnInit {
  candidateKeycloakId: string | null = null;
  candidate?: Candidate;
  isLoading = false;

  // Quiz history
  quizHistory: QuizAttempt[] = [];
  displayedColumns: string[] = ['quiz', 'date', 'score', 'status'];

  // Statistics
  totalAttempts = 0;
  passedQuizzes = 0;
  averageScore = 0;
  bestScore = 0;

  constructor(
    private candidateService: CandidateService,
    private lessonService: LessonService,
    private authHelper: AuthHelperService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  async ngOnInit(): Promise<void> {
    this.candidateKeycloakId = await this.authHelper.getKeycloakUserId();
    console.log('Keycloak User ID:', this.candidateKeycloakId);

    if (this.candidateKeycloakId) {
      this.loadCandidateInfo();
      this.loadQuizHistory();
    } else {
      this.snackBar.open('Utilisateur non authentifié', 'Fermer', {
        duration: 3000,
        verticalPosition: 'top'
      });
      this.router.navigate(['/auth/login']);
    }
  }

  loadCandidateInfo(): void {
    if (!this.candidateKeycloakId) return;

    this.isLoading = true;
    this.candidateService.getCandidateByKeycloakId(this.candidateKeycloakId)
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

  loadQuizHistory(): void {
    if (!this.candidateKeycloakId) return;

    this.lessonService.getCandidateQuizHistory(this.candidateKeycloakId)
      .subscribe({
        next: (history) => {
          console.log('Quiz history loaded:', history);
          this.quizHistory = history;
          this.calculateStatistics();
        },
        error: (err) => {
          console.error('Erreur chargement historique:', err);
        }
      });
  }

  calculateStatistics(): void {
    this.totalAttempts = this.quizHistory.length;
    this.passedQuizzes = this.quizHistory.filter(q => q.passed).length;

    if (this.totalAttempts > 0) {
      const totalScore = this.quizHistory.reduce((sum, q) => sum + q.score, 0);
      this.averageScore = Math.round(totalScore / this.totalAttempts);
      this.bestScore = Math.max(...this.quizHistory.map(q => q.score));
    }
  }

  private showErrorMessage(err: any): void {
    let errorMsg = 'Erreur lors du chargement des informations';
    if (err?.status === 0) {
      errorMsg = 'Erreur de connexion au serveur';
    } else if (err?.status === 404) {
      errorMsg = 'Candidat non trouvé';
    }

    this.snackBar.open(errorMsg, 'Fermer', {
      duration: 5000,
      verticalPosition: 'top'
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

  getScoreClass(score: number): string {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'average';
    return 'low';
  }

  refreshHistory(): void {
    this.loadQuizHistory();
    this.snackBar.open('Historique actualisé', 'Fermer', {
      duration: 2000,
      verticalPosition: 'top'
    });
  }
}
