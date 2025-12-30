import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { FormateurService } from '../../services/formateur.service';
import { ThemeService } from '../../services/theme.service';
import { AuthHelperService } from '../../services/auth-helper.service';
import { LessonRequest } from '../../models/lesson-request.model';
import { Theme } from '../../models/theme';

@Component({
  selector: 'app-lesson-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule
  ],
  templateUrl: './lesson-form.component.html',
  styleUrl: './lesson-form.component.scss'
})
export class LessonFormComponent implements OnInit {
  lessonForm!: FormGroup;
  themes: Theme[] = [];
  isLoading = false;
  selectedFiles: File[] = [];
  @Output() lessonCreated = new EventEmitter<void>();

  resourceTypes = ['VIDEO', 'DOCUMENT', 'QUIZ'];

  constructor(
    private fb: FormBuilder,
    private formateurService: FormateurService,
    private themeService: ThemeService,
    private authHelper: AuthHelperService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadThemes();
  }

  initForm(): void {
    this.lessonForm = this.fb.group({
      title: ['', [Validators.required]],
      description: ['', [Validators.required]],
      themeId: ['', [Validators.required]],
      sequenceOrder: [1, [Validators.required, Validators.min(1)]],
      resources: this.fb.array([])
    });
  }

  get resources(): FormArray {
    return this.lessonForm.get('resources') as FormArray;
  }

  async loadThemes(): Promise<void> {
    try {
      const keycloakId = await this.authHelper.getKeycloakUserId();
      if (keycloakId) {
        this.themeService.getThemesByFormateur(keycloakId).subscribe({
          next: (themes) => {
            this.themes = themes;
          },
          error: (error) => {
            console.error('Error loading themes:', error);
          }
        });
      }
    } catch (error) {
      console.error('Error getting keycloak ID:', error);
    }
  }

  addResource(): void {
    const resourceGroup = this.fb.group({
      title: ['', Validators.required],
      type: ['', Validators.required],
      file: [null]
    });
    this.resources.push(resourceGroup);
  }

  removeResource(index: number): void {
    this.resources.removeAt(index);
    this.selectedFiles.splice(index, 1);
  }

  onFileSelected(event: any, index: number): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFiles[index] = file;
    }
  }

  async onSubmit(): Promise<void> {
    if (this.lessonForm.valid) {
      this.isLoading = true;
      try {
        const keycloakId = await this.authHelper.getKeycloakUserId();
        if (!keycloakId) {
          console.error('No keycloak ID found');
          this.isLoading = false;
          return;
        }

        const resourceTitles = this.resources.controls.map(r => r.get('title')?.value);
        const resourceTypes = this.resources.controls.map(r => r.get('type')?.value);

        const request: LessonRequest = {
          keycloakId,
          themeId: this.lessonForm.value.themeId,
          title: this.lessonForm.value.title,
          description: this.lessonForm.value.description,
          sequenceOrder: this.lessonForm.value.sequenceOrder,
          resourceTitles,
          resourceTypes,
          files: this.selectedFiles
        };

        this.formateurService.createLesson(request).subscribe({
          next: (response) => {
            console.log('Lesson created:', response);
            this.lessonForm.reset();
            this.resources.clear();
            this.selectedFiles = [];
            this.lessonCreated.emit();
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error creating lesson:', error);
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
