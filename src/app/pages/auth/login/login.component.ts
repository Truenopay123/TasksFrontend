import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { InputTextModule } from 'primeng/inputtext';
import { DividerModule } from 'primeng/divider';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputGroupModule } from 'primeng/inputgroup';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Usuario, RespuestaAutenticacion } from '../../../core/models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    PasswordModule,
    InputTextModule,
    DividerModule,
    InputGroupAddonModule,
    InputGroupModule,
    RouterModule,
    ToastModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [MessageService]
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  otp: string = '';

  cardStyles = {
    width: '25rem',
    overflow: 'hidden',
    borderRadius: '1rem',
    boxShadow: '0 4px 12px rgb(101, 169, 225)',
    background: 'rgba(50, 81, 81, 0.8)',
    textAlign: 'center',
    padding: '1.5rem'
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {}

  login() {
    if (!this.username || !this.password || !this.otp) {
      this.messageService.add({ severity: 'warn', summary: 'Warn', detail: 'Usuario, contraseña y código OTP son requeridos' });
      return;
    }

    const credentials: Usuario & { otp?: string } = {
      username: this.username,
      password: this.password,
      otp: this.otp
    };

    this.authService.login(credentials).subscribe({
      next: (response: RespuestaAutenticacion) => {
        console.log('Respuesta de login:', response);
        if (response.intData?.token) {
          this.authService.setToken(response.intData.token);
          localStorage.setItem('username', this.username);
          this.router.navigate(['/tasks/task-list']);
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Login exitoso' });
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: response.intData?.message || 'Credenciales incorrectas' });
        }
      },
      error: (err) => {
        console.error('Error en el login:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error.intData?.message || 'Error al iniciar sesión' });
      }
    });
  }
}
