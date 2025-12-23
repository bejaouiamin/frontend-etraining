import { CommonModule } from "@angular/common"
import { Component } from "@angular/core"
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms"
import { MatButtonModule } from "@angular/material/button"
import { MatFormFieldModule } from "@angular/material/form-field"
import { MatIconModule } from "@angular/material/icon"
import { MatInputModule } from "@angular/material/input"
import { MatSnackBarModule } from "@angular/material/snack-bar"
import { MatSnackBar } from "@angular/material/snack-bar"
import { Router } from "@angular/router"
import { AuthApiService } from '../../services/auth-api.service'

type UserRole = "candidat" | "formateur"

@Component({
  selector: "app-register",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  templateUrl: "./register.component.html",
  styleUrl: "./register.component.scss",
})
export class RegisterComponent {
  registerForm: FormGroup
  hidePassword = true
  selectedRole: UserRole = "candidat"
  isLoading = false

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private auth: AuthApiService,
    private snack: MatSnackBar
  ) {
    this.registerForm = this.createCandidatForm()
  }

  selectRole(role: UserRole): void {
    this.selectedRole = role
    if (role === "candidat") {
      this.registerForm = this.createCandidatForm()
    } else {
      this.registerForm = this.createFormateurForm()
    }
  }

  private createCandidatForm(): FormGroup {
    return this.fb.group({
      fullName: ["", [Validators.required]],
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(6)]],
      phone: [""],
      street: [""],
      city: [""],
      postalCode: [""],
      country: [""],
    })
  }

  private createFormateurForm(): FormGroup {
    return this.fb.group({
      nom: ["", [Validators.required]],
      prenom: ["", [Validators.required]],
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(6)]],
      telephone: [""],
      specialites: [""],
      certifications: [""],
      experienceAnnees: ["", [Validators.min(0)]],
    })
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true
      if (this.selectedRole === "candidat") {

        const candidatData: any = {
          fullName: this.registerForm.value.fullName,
          email: this.registerForm.value.email,
          password: this.registerForm.value.password,
          phone: this.registerForm.value.phone
        }

        // log payload for debugging server 400 errors
        console.log('Register payload (candidat):', JSON.stringify(candidatData))

        this.auth.registerCandidat(candidatData).subscribe({
          next: () => {
            this.isLoading = false
            this.snack.open('Registration successful. Please login.', 'Close', { duration: 4000, verticalPosition: 'top' })
            this.router.navigate(['/home'])
          },
          error: (err) => {
            this.isLoading = false
            console.error('Registration error:', err)
            this.snack.open('Registration failed', 'Close', { duration: 5000, verticalPosition: 'top' })
          }
        })
      } else {
        const formateurData = {
          nom: this.registerForm.value.nom,
          prenom: this.registerForm.value.prenom,
          email: this.registerForm.value.email,
          password: this.registerForm.value.password
        }
        this.auth.registerFormateur(formateurData).subscribe({
          next: () => {
            this.isLoading = false
            this.snack.open('Registration successful. Please login.', 'Close', { duration: 4000,verticalPosition: 'top' })
            this.router.navigate(['/home'])
          },
          error: (err) => {
            this.isLoading = false
            console.error('Registration error:', err)
            this.snack.open('Registration failed', 'Close', { duration: 5000, verticalPosition: 'top' })
          }
        })
      }
    }
  }

  navigateToLogin(): void {
    this.router.navigate(["/auth/login"])
  }
}
