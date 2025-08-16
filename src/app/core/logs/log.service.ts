import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class LogService {
  private apiUrl = `${environment.apiUrl}/logs`; // Endpoint correcto

  constructor(private http: HttpClient) {}

  getLogs(user?: string, route?: string, status?: string, startDate?: Date, endDate?: Date): Observable<any> {
    let params = new HttpParams();
    if (user) params = params.set('user', user);
    if (route) params = params.set('route', route);
    if (status) params = params.set('status', status);
    if (startDate) params = params.set('start_date', startDate.toISOString().split('T')[0]);
    if (endDate) params = params.set('end_date', endDate.toISOString().split('T')[0]);

    return this.http.get<any>(this.apiUrl, { params });
  }
}
