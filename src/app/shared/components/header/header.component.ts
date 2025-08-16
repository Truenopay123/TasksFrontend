import { Component, Input } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { AuthService } from '../../../core/auth/auth.service'; // Adjust path as needed
import { Router } from '@angular/router'; // Import Router

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  imports: [ButtonModule, RippleModule]
})
export class HeaderComponent {
  @Input() headerTitle: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  logout(): void {
    this.authService.logout();
    console.log('Se hizo clic en Cerrar sesión');
  }

  goToDashLogs(): void {
    this.router.navigate(['/logs/dash-logs']);
    console.log('Navegando a DashLogs');
  }

  goToTasks(): void {
    this.router.navigate(['/tasks/task-list']);
    console.log('Navegando a Tasks');
  }
}
