import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';
import { environment } from '../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class LogService {
  private apiUrls = {
    gateway: `${environment.apiUrl}/logs`,
    task: `${environment.apiUrlTask}/logs`,
    auth: `${environment.apiUrlAuth}/logs`
  };

  constructor(private http: HttpClient) {}

  getLogs(user?: string, route?: string, status?: string, startDate?: Date, endDate?: Date): Observable<any> {
    let params: { [key: string]: string } = {};
    if (user) params['user'] = user;
    if (route) params['route'] = route;
    if (status) params['status'] = status;
    if (startDate) params['start_date'] = startDate.toISOString().split('T')[0];
    if (endDate) params['end_date'] = endDate.toISOString().split('T')[0];

    // Fetch logs from all three services in parallel
    const requests = Object.keys(this.apiUrls).map(service =>
      this.http.get<any>(this.apiUrls[service as keyof typeof this.apiUrls], { params }).pipe(
        map(response => ({
          ...response,
          intData: {
            ...response.intData,
            data: response.intData.data.map((log: any) => ({ ...log, service })) // Add service field to each log
          }
        }))
      )
    );

    // Combine responses, assuming each response follows the { statusCode, intData: { data: Log[] } } format
    return forkJoin(requests).pipe(
      map(responses => ({
        statusCode: 200,
        intData: {
          data: responses.reduce((acc, response) => {
            if (response.statusCode === 200) {
              return [...acc, ...response.intData.data];
            }
            return acc;
          }, [] as any[])
        }
      }))
    );
  }
}
