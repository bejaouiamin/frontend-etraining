import { CommonModule } from "@angular/common"
import { Component } from "@angular/core"
import { RouterLink, RouterLinkActive } from "@angular/router"
import { MatButtonModule } from "@angular/material/button"
import { MatToolbarModule } from "@angular/material/toolbar"
import { MatIconModule } from "@angular/material/icon"
import { MatSidenavModule } from "@angular/material/sidenav"

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
  ],
  templateUrl: "./header.component.html",
  styleUrl: "./header.component.scss",
})
export class HeaderComponent {
  isMobileMenuOpen = false

  navLinks = [
    { label: "Home", path: "/home" },
    { label: "Courses", path: "/courses" },
    { label: "Careers", path: "/careers" },
    { label: "Blog", path: "/blog" },
    { label: "About Us", path: "/about" },
  ]

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false
  }
}
