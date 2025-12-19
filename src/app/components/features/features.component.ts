import { Component } from '@angular/core';
import { CommonModule } from "@angular/common"
import { MatCardModule } from "@angular/material/card"
import { MatIconModule } from "@angular/material/icon"

@Component({
  selector: 'app-features',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './features.component.html',
  styleUrl: './features.component.scss'
})
export class FeaturesComponent {
statistics = [
    { value: "15K+", label: "Students" },
    { value: "75%", label: "Total success" },
    { value: "35", label: "Main questions" },
    { value: "26", label: "Chief experts" },
    { value: "16", label: "Years of experience" },
  ]

  features = [
    {
      icon: "description",
      color: "#5B72EE",
      title: "Online Billing, Invoicing, & Contracts",
      description:
        "Simple and secure control of your organization's financial and legal transactions. Send customized invoices and contracts",
    },
    {
      icon: "event",
      color: "#00CBB8",
      title: "Easy Scheduling & Attendance Tracking",
      description:
        "Schedule and reserve classrooms at one campus or multiple campuses. Keep detailed records of student attendance",
    },
    {
      icon: "group",
      color: "#29B9E7",
      title: "Customer Tracking",
      description:
        "Automate and track emails to individuals or groups. Skilline's built-in system helps organize your organization",
    },
  ]
}
