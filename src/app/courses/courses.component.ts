import { Component } from '@angular/core';
import { HeaderComponent } from '../components/header/header.component';
import { CategoryComponent } from '../components/category/category.component';
import { FooterComponent } from '../components/footer/footer.component';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [HeaderComponent,CategoryComponent,FooterComponent],
  templateUrl: './courses.component.html',
  styleUrl: './courses.component.scss'
})
export class CoursesComponent {

}
