import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormateurService } from '../../services/formateur.service';
import { LessonService } from '../../services/lesson.service';
import { AuthHelperService } from '../../services/auth-helper.service';
import { QuizRequest } from '../../models/quiz-request.model';
import { Lesson } from '../../models/lesson.model';

@Component({
  selector: 'app-quiz-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatCheckboxModule
  ],
  templateUrl: './quiz-form.component.html',
  styleUrl: './quiz-form.component.scss'
})
export class QuizFormComponent implements OnInit {
  quizForm!: FormGroup;
  lessons: Lesson[] = [];
  isLoading = false;
  @Output() quizCreated = new EventEmitter<void>();

  constructor(
    private fb: FormBuilder,
    private formateurService: FormateurService,
    private lessonService: LessonService,
    private authHelper: AuthHelperService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadLessons();
  }

  initForm(): void {
    this.quizForm = this.fb.group({
      title: ['', [Validators.required]],
      lessonId: ['', [Validators.required]],
      passingScore: [70, [Validators.required, Validators.min(0), Validators.max(100)]],
      questions: this.fb.array([])
    });
  }

  get questions(): FormArray {
    return this.quizForm.get('questions') as FormArray;
  }

  getAnswers(questionIndex: number): FormArray {
    return this.questions.at(questionIndex).get('answers') as FormArray;
  }

  async loadLessons(): Promise<void> {
    try {
      const keycloakId = await this.authHelper.getKeycloakUserId();
      if (keycloakId) {
        this.lessonService.getLessonsByFormateur(keycloakId).subscribe({
          next: (lessons) => {
            this.lessons = lessons;
          },
          error: (error) => {
            console.error('Error loading lessons:', error);
          }
        });
      }
    } catch (error) {
      console.error('Error getting keycloak ID:', error);
    }
  }

  addQuestion(): void {
    const questionGroup = this.fb.group({
      questionText: ['', Validators.required],
      answers: this.fb.array([])
    });
    this.questions.push(questionGroup);
  }

  removeQuestion(index: number): void {
    this.questions.removeAt(index);
  }

  addAnswer(questionIndex: number): void {
    const answerGroup = this.fb.group({
      answerText: ['', Validators.required],
      isCorrect: [false]
    });
    this.getAnswers(questionIndex).push(answerGroup);
  }

  removeAnswer(questionIndex: number, answerIndex: number): void {
    this.getAnswers(questionIndex).removeAt(answerIndex);
  }

  async onSubmit(): Promise<void> {
    if (this.quizForm.valid) {
      this.isLoading = true;
      try {
        const keycloakId = await this.authHelper.getKeycloakUserId();
        if (!keycloakId) {
          console.error('No keycloak ID found');
          this.isLoading = false;
          return;
        }

        const request: QuizRequest = {
          keycloakId,
          ...this.quizForm.value
        };

        this.formateurService.createQuiz(request).subscribe({
          next: (response) => {
            console.log('Quiz created:', response);
            this.quizForm.reset();
            this.questions.clear();
            this.quizCreated.emit();
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error creating quiz:', error);
            this.isLoading = false;
          }
        });
      } catch (error) {
        console.error('Error:', error);
        this.isLoading = false;
      }
    }
  }
}
