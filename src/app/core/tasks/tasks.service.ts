import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task, RespuestaTareasLista, RespuestaTareasDetalle } from '../../core/models/task.model';
import { environment } from '../environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private apiUrl = `${environment.apiUrlTask}`;

  constructor(private http: HttpClient) {}

  getTasksByUser(createdBy: string): Observable<RespuestaTareasLista> {
    return this.http.get<RespuestaTareasLista>(`${this.apiUrl}/Usertasks/${createdBy}`);
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
