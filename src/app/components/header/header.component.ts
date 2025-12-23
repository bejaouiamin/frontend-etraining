import { CommonModule } from "@angular/common"
import { Component, OnInit, OnDestroy } from "@angular/core"
import { Router, RouterLink, RouterLinkActive } from "@angular/router"
import { MatButtonModule } from "@angular/material/button"
import { MatToolbarModule } from "@angular/material/toolbar"
import { MatIconModule } from "@angular/material/icon"
import { MatSidenavModule } from "@angular/material/sidenav"
import { MatMenuModule } from "@angular/material/menu"
import { AuthStateService } from "../../services/auth-state.service"
import { AuthApiService } from "../../services/auth-api.service"
import { Subscription } from "rxjs"

@Component({
  selector: "app-header",
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatSidenavModule,
    MatMenuModule,
  ],
  templateUrl: "./header.component.html",
  styleUrl: "./header.component.scss",
})
export class HeaderComponent implements OnInit, OnDestroy {
  isMobileMenuOpen = false
  isAuthenticated = false
  private authSubscription?: Subscription

  navLinks = [
    { label: "Home", path: "/home" },
    { label: "Courses", path: "/courses" },
    { label: "Careers", path: "/careers" },
    { label: "Blog", path: "/blog" },
    { label: "About Us", path: "/about" },
  ]

  constructor(
    private authState: AuthStateService,
    private authApi: AuthApiService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.authSubscription = this.authState.isAuthenticated$.subscribe((isAuth) => {
      this.isAuthenticated = isAuth
      console.log("[v0] Auth state changed:", isAuth)
    })
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe()
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false
  }

  onLogout(): void {
    this.authApi.logout()
  }

  navigateToProfile(): void {
    this.router.navigate(["/profile"])
  }
}
