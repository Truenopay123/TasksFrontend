import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { Usuario, RespuestaAutenticacion } from '../models/user.model';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { environment } from '../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
class LoggerService {
  private log(level: string, message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${level}] ${timestamp} - ${message}${data ? `: ${JSON.stringify(data)}` : ''}`;
    console.log(logMessage);
  }

  debug(message: string, data?: any) {
    this.log('DEBUG', message, data);
  }

  info(message: string, data?: any) {
    this.log('INFO', message, data);
  }

  warn(message: string, data?: any) {
    this.log('WARN', message, data);
  }

  error(message: string, data?: any) {
    this.log('ERROR', message, data);
  }
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(
    private http: HttpClient,
    private router: Router,
    private logger: LoggerService
  ) {
    this.logger.info('AuthService inicializado');
  }

  register(userData: Usuario): Observable<RespuestaAutenticacion> {
    this.logger.info('Iniciando registro de usuario', { username: userData.username });
    return this.http.post<RespuestaAutenticacion>(`${this.apiUrl}/register`, userData).pipe(
      tap(response => {
        if (response.intData?.token) {
          this.setToken(response.intData.token);
          this.logger.debug('Registro exitoso', {
            username: userData.username,
            token: response.intData.token.substring(0, 10) + '...',
            two_factor_enabled: response.intData.two_factor_enabled,
            message: response.intData.message
          });
        } else {
          this.logger.warn('Registro completado sin token', {
            username: userData.username,
            message: response.intData?.message
          });
        }
      }),
      catchError(error => {
        this.logger.error('Error durante el registro', {
          username: userData.username,
          error: error.message,
          statusCode: error.status
        });
        return throwError(() => error);
      })
    );
  }

  login(credentials: Usuario): Observable<RespuestaAutenticacion> {
    this.logger.info('Iniciando login de usuario', { username: credentials.username });
    return this.http.post<RespuestaAutenticacion>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response.intData?.token) {
          this.setToken(response.intData.token);
          localStorage.setItem('username', credentials.username);
          this.logger.debug('Login exitoso', {
            username: credentials.username,
            token: response.intData.token.substring(0, 10) + '...',
            two_factor_enabled: response.intData.two_factor_enabled,
            qr_code: response.intData.data?.qr_code ? 'QR presente' : 'Sin QR',
            message: response.intData.message
          });
        } else {
          this.logger.warn('Login completado sin token', {
            username: credentials.username,
            message: response.intData?.message
          });
        }
      }),
      catchError(error => {
        this.logger.error('Error durante el login', {
          username: credentials.username,
          error: error.message,
          statusCode: error.status
        });
        return throwError(() => error);
      })
    );
  }

  setToken(token: string) {
    localStorage.setItem('token', token);
    this.logger.debug('Token almacenado en localStorage', { token: token.substring(0, 10) + '...' });
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      this.logger.debug('Token obtenido de localStorage', { hasToken: !!token });
      return token;
    } else {
      this.logger.warn('No se puede acceder a localStorage (entorno no-browser)');
      return null;
    }
  }

  logout() {
    this.logger.info('Iniciando logout de usuario', { username: localStorage.getItem('username') });
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    this.router.navigate(['/auth/login']);
    this.logger.info('Sesión cerrada correctamente');
  }

  isLoggedIn(): boolean {
    const isAuthenticated = !!this.getToken();
    this.logger.debug('Verificando estado de autenticación', { isAuthenticated });
    return isAuthenticated;
  }
}