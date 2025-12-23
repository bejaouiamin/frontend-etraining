import { CommonModule } from "@angular/common"
import { Component } from "@angular/core"
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms"
import { Router } from "@angular/router"
import { AuthApiService } from "../../services/auth-api.service"
import { MatSnackBar } from "@angular/material/snack-bar"
import { MatFormFieldModule } from "@angular/material/form-field"
import { MatInputModule } from "@angular/material/input"
import { MatButtonModule } from "@angular/material/button"
import { MatCheckboxModule } from "@angular/material/checkbox"
import { MatIconModule } from "@angular/material/icon"

@Component({
  selector: "app-login",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
  ],
  templateUrl: "./login.component.html",
  styleUrl: "./login.component.scss",
})
export class LoginComponent {
  loginForm: FormGroup
  hidePassword = true
  isLoading = false

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private auth: AuthApiService,
    private snack: MatSnackBar,
  ) {
    this.loginForm = this.fb.group({
      username: ["", [Validators.required]],
      password: ["", [Validators.required, Validators.minLength(6)]],
      rememberMe: [false],
    })
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { username, password, rememberMe } = this.loginForm.value
      this.isLoading = true
      this.auth.login(username, password).subscribe({
        next: () => {
          this.isLoading = false
          if (rememberMe) {
            const access = sessionStorage.getItem("access_token")
            const refresh = sessionStorage.getItem("refresh_token")
            if (access) localStorage.setItem("access_token", access)
            if (refresh) localStorage.setItem("refresh_token", refresh)
          }
          this.snack.open("Login successful!", "Close", {
            duration: 3000,
            verticalPosition: "top",
            panelClass: ["success-snackbar"],
          })
          this.router.navigate(["/home"])
        },
        error: (err) => {
          this.isLoading = false
          const message = err?.error?.error_description || err?.error || "Login failed"
          this.snack.open(String(message), "Close", {
            duration: 5000,
            verticalPosition: "top",
          })
        },
      })
    }
  }

  navigateToRegister(): void {
    this.router.navigate(["/auth/register"])
  }
}
