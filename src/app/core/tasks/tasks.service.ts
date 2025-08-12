import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Task, RespuestaTareasLista, RespuestaTareasDetalle } from '../../core/models/task.model';
import { environment } from '../environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private apiUrl = `${environment.apiUrl}/task`;

  constructor(private http: HttpClient) {}

  getTasksByUser(createdBy: string): Observable<RespuestaTareasLista> {
    return this.http.get<RespuestaTareasLista>(`${this.apiUrl}/Usertasks/${createdBy}`);
  }

  getTaskIds(createdBy: string): Promise<string[]> {
    return this.getTasksByUser(createdBy)
      .pipe(
        map((response: RespuestaTareasLista) => {
          if (response.statusCode === 200 && response.intData?.data) {
            return response.intData.data.map((task: Task) => task.id);
          }
          return [];
        })
      )
      .toPromise()
      .catch(() => []); // Maneja errores devolviendo un arreglo vacío
  }

  getTaskById(taskId: string): Observable<RespuestaTareasDetalle> {
    return this.http.get<RespuestaTareasDetalle>(`${this.apiUrl}/id_tasks/${taskId}`);
  }

  updateTask(taskId: string, task: Task): Observable<any> {
    return this.http.put(`${this.apiUrl}/update_task/${taskId}`, task);
  }

  updateTaskStatus(taskId: string, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/update_task_status/${taskId}`, { status });
  }

  createTask(task: Task): Observable<any> {
    return this.http.post(`${this.apiUrl}/register_task`, task);
  }

  deleteTask(taskId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete_task/${taskId}`);
  }
}
