import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { FormateurService } from '../../services/formateur.service';
import { CategoryService } from '../../services/category.service';
import { AuthHelperService } from '../../services/auth-helper.service';
import { ThemeRequest } from '../../models/theme-request.model';
import { Category } from '../../models/category';

@Component({
  selector: 'app-theme-form',
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
  templateUrl: './theme-form.component.html',
  styleUrl: './theme-form.component.scss'
})
export class ThemeFormComponent implements OnInit {
  themeForm!: FormGroup;
  categories: Category[] = [];
  isLoading = false;
  @Output() themeCreated = new EventEmitter<void>();

  constructor(
    private fb: FormBuilder,
    private formateurService: FormateurService,
    private categoryService: CategoryService,
    private authHelper: AuthHelperService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadCategories();
  }

  initForm(): void {
    this.themeForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required]],
      categoryId: ['', [Validators.required]],
      dureeHeures: ['', [Validators.required, Validators.min(1)]]
    });
  }

  loadCategories(): void {
    this.categoryService.getAllCategory().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  async onSubmit(): Promise<void> {
    if (this.themeForm.valid) {
      this.isLoading = true;
      try {
        const keycloakId = await this.authHelper.getKeycloakUserId();
        if (!keycloakId) {
          console.error('No keycloak ID found');
          this.isLoading = false;
          return;
        }

        const request: ThemeRequest = {
          keycloakId,
          ...this.themeForm.value
        };

        this.formateurService.createTheme(request).subscribe({
          next: (response) => {
            console.log('Theme created:', response);
            this.themeForm.reset();
            this.themeCreated.emit();
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error creating theme:', error);
            this.isLoading = false;
          }
        });
      } catch (error) {
        console.error('Error getting keycloak ID:', error);
        this.isLoading = false;
      }
    }
  }
}
