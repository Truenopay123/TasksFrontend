import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, map, catchError, throwError } from 'rxjs';
import { environment } from '../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class LogService {
  constructor(private http: HttpClient) {}

  getLogs(user?: string, route?: string, status?: string, startDate?: Date, endDate?: Date): Observable<any> {
    let params = new HttpParams();
    if (user) params = params.set('user', user);
    if (route) params = params.set('route', route);
    if (status) params = params.set('status', status);
    if (startDate) params = params.set('start_date', startDate.toISOString().split('T')[0]);
    if (endDate) params = params.set('end_date', endDate.toISOString().split('T')[0]);

    const authLogs = this.http.get<any>(`${environment.apiUrlAuth}/logs`, { params }).pipe(
      catchError((error) => {
        console.error('Error fetching auth logs:', error);
        return throwError(() => error);
      })
    );
    const taskLogs = this.http.get<any>(`${environment.apiUrlTask}/logs`, { params }).pipe(
      catchError((error) => {
        console.error('Error fetching task logs:', error);
        return throwError(() => error);
      })
    );
    const gatewayLogs = this.http.get<any>(`${environment.apiUrl}/logs`, { params }).pipe(
      catchError((error) => {
        console.error('Error fetching gateway logs:', error);
        return throwError(() => error);
      })
    );

    return forkJoin([authLogs, taskLogs, gatewayLogs]).pipe(
      map(([authRes, taskRes, gatewayRes]) => {
        const combinedData = [
          ...authRes.intData.data,
          ...taskRes.intData.data,
          ...gatewayRes.intData.data
        ];
        return { statusCode: 200, intData: { message: 'Logs recuperados con éxito', data: combinedData } };
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }
}
