// src/app/app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', loadComponent: () => import('./home/home.component').then(m => m.HomeComponent) },
  { path: 'courses', loadComponent: () => import('./courses/courses.component').then(m => m.CoursesComponent) },
  { path: 'careers', loadComponent: () => import('./theme/theme.component').then(m => m.ThemeComponent) },
  { path: 'auth/login', loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'auth/register', loadComponent: () => import('./auth/register/register.component').then(m => m.RegisterComponent) },

  // Lesson and Quiz routes
  { path: 'lessons/:lessonId', loadComponent: () => import('./components/lesson-progress/lesson-progress.component').then(m => m.LessonProgressComponent) },
  { path: 'themes/:themeId/lessons', loadComponent: () => import('./components/lesson-progress/lesson-progress.component').then(m => m.LessonProgressComponent) },
  { path: 'quiz-attempt', loadComponent: () => import('./components/quiz-attempt/quiz-attempt.component').then(m => m.QuizAttemptComponent) },
  { path: 'quiz-attempt/:resourceId', loadComponent: () => import('./components/quiz-attempt/quiz-attempt.component').then(m => m.QuizAttemptComponent) },
];
