import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../components/header/header.component';
import { FooterComponent } from '../components/footer/footer.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-theme',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    FooterComponent,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './theme.component.html',
  styleUrl: './theme.component.scss'
})
export class ThemeComponent {
  idFormateur = 1; // Replace with actual formateur ID
  isSidebarCollapsed = false;

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  lessons = [
    { id: 1, name: 'Lesson 01 : Introduction about XD', duration: '30 mins', color: 'teal' },
    { id: 2, name: 'Lesson 01 : Introduction about XD', duration: '30 mins', color: 'orange' },
    { id: 3, name: 'Lesson 01 : Introduction about XD', duration: '30 mins', color: 'blue' },
    { id: 4, name: 'Lesson 01 : Introduction about XD', duration: '30 mins', color: 'pink' }
  ];

  quizzes = [
    { id: 1, name: 'Lesson 01 : Introduction about XD', duration: '30 mins', color: 'blue' },
    { id: 2, name: 'Lesson 01 : Introduction about XD', duration: '30 mins', color: 'orange' },
    { id: 3, name: 'Lesson 01 : Introduction about XD', duration: '30 mins', color: 'blue' },
    { id: 4, name: 'Lesson 01 : Introduction about XD', duration: '30 mins', color: 'pink' },
    { id: 5, name: 'Lesson 01 : Introduction about XD', duration: '30 mins', color: 'orange' },
    { id: 6, name: 'Lesson 01 : Introduction about XD', duration: '30 mins', color: 'orange' },
    { id: 7, name: 'Lesson 01 : Introduction about XD', duration: '30 mins', color: 'blue' },
    { id: 8, name: 'Lesson 01 : Introduction about XD', duration: '30 mins', color: 'pink' },
    { id: 9, name: 'Lesson 01 : Introduction about XD', duration: '30 mins', color: 'blue' },
    { id: 10, name: 'Lesson 01 : Introduction about XD', duration: '30 mins', color: 'orange' },
    { id: 11, name: 'Lesson 01 : Introduction about XD', duration: '30 mins', color: 'pink' }
  ];

  themes = [
    { id: 1, name: 'Design Fundamentals', count: '8 lessons', icon: 'palette', color: 'teal' },
    { id: 2, name: 'UI/UX Principles', count: '12 lessons', icon: 'layers', color: 'orange' },
    { id: 3, name: 'Web Development', count: '15 lessons', icon: 'code', color: 'blue' },
    { id: 4, name: 'Mobile Design', count: '6 lessons', icon: 'phone_android', color: 'pink' },
    { id: 5, name: 'Prototyping', count: '10 lessons', icon: 'view_quilt', color: 'teal' }
  ];
}
