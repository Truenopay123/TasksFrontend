import { Component, OnInit } from '@angular/core';
import { TaskService } from '../../../core/tasks/tasks.service';
import { Task, RespuestaTareasLista } from '../../../core/models/task.model';
import { PanelModule } from 'primeng/panel';
import { CardModule } from 'primeng/card';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

// Interfaz para tipar las columnas del Kanban
interface KanbanColumn {
  header: string;
  status: string;
  tasks: Task[];
}

@Component({
  selector: 'app-task-list',
  standalone: true,
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css'],
  imports: [CommonModule, PanelModule, CardModule, HeaderComponent, DragDropModule, ButtonModule, ConfirmDialogModule],
  providers: [ConfirmationService]
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];
  kanbanColumns: KanbanColumn[] = [];
  columnIds: string[] = [];
  rateLimitMessage: string | null = null;

  constructor(private taskService: TaskService, private router: Router, private confirmationService: ConfirmationService) {}

  ngOnInit(): void {
    let username: string | null = null;
    if (typeof window !== 'undefined') {
      username = localStorage.getItem('username');
    }
    if (username) {
      this.taskService.getTasksByUser(username).subscribe({
        next: (res: RespuestaTareasLista) => {
          this.tasks = res.intData?.data ?? [];
          this.setKanbanColumns();
          this.rateLimitMessage = null;
        },
        error: (err) => {
          this.tasks = [];
          if (err.status === 429) {
            this.rateLimitMessage = err.error.intData?.message || 'Has alcanzado el límite de peticiones. Por favor, intenta de nuevo más tarde.';
          } else {
            this.rateLimitMessage = 'Ocurrió un error al cargar las tareas. Por favor, intenta de nuevo.';
          }
          console.error('Error fetching tasks:', err);
        },
      });
    } else {
      console.error('No username found in localStorage');
      this.rateLimitMessage = 'No se encontró el nombre de usuario. Por favor, inicia sesión nuevamente.';
    }
  }

  navigateToCreate(): void {
    this.router.navigate(['/tasks/task-create']);
  }

  navigateToEdit(taskId: string): void {
    this.router.navigate([`/tasks/task-edit/${taskId}`]);
  }

  setKanbanColumns() {
    this.kanbanColumns = [
      { header: 'Pendiente', status: 'Incomplete', tasks: this.tasks.filter((t) => t.status === 'Incomplete') },
      { header: 'En progreso', status: 'InProgress', tasks: this.tasks.filter((t) => t.status === 'InProgress') },
      { header: 'Pausada', status: 'Paused', tasks: this.tasks.filter((t) => t.status === 'Paused') },
      { header: 'Revisión', status: 'Revision', tasks: this.tasks.filter((t) => t.status === 'Revision') },
      { header: 'Hecho', status: 'Completed', tasks: this.tasks.filter((t) => t.status === 'Completed') },
    ];
    this.columnIds = this.kanbanColumns.map((column) => column.status);
  }

  drop(event: CdkDragDrop<Task[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const task = event.previousContainer.data[event.previousIndex];
      const newStatus = event.container.id;
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      this.taskService.updateTaskStatus(task.id!, newStatus).subscribe({
        next: (res) => {
          console.log('Estado de la tarea actualizado:', res);
          const taskIndex = this.tasks.findIndex((t) => t.id === task.id);
          if (taskIndex !== -1) {
            this.tasks[taskIndex].status = newStatus;
          }
          this.rateLimitMessage = null;
        },
        error: (err) => {
          console.error('Error al actualizar el estado de la tarea:', err);
          transferArrayItem(
            event.container.data,
            event.previousContainer.data,
            event.currentIndex,
            event.previousIndex
          );
          if (err.status === 429) {
            this.rateLimitMessage = err.error.intData?.message || 'Has alcanzado el límite de peticiones. Por favor, intenta de nuevo más tarde.';
          } else {
            this.rateLimitMessage = 'Ocurrió un error al actualizar el estado de la tarea. Por favor, intenta de nuevo.';
          }
        },
      });
    }
  }

  getCardColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed':
        return '#A5D6A7';
      case 'paused':
        return '#FFF59D';
      case 'inprogress':
        return '#FFCC80';
      case 'revision':
        return '#90CAF9';
      case 'incomplete':
      default:
        return '#ECEFF1';
    }
  }

  getColumnColor(status: string): { 'background-color': string } {
    switch (status.toLowerCase()) {
      case 'incomplete':
        return { 'background-color': '#546E7A' };
      case 'inprogress':
        return { 'background-color': '#FB8C00' };
      case 'paused':
        return { 'background-color': '#FBC02D' };
      case 'revision':
        return { 'background-color': '#1E88E5' };
      case 'completed':
        return { 'background-color': '#66BB6A' };
      default:
        return { 'background-color': '#757575' };
    }
  }

  confirmDelete(taskId?: string) {
    if (!taskId) return;

    this.confirmationService.confirm({
      message: '¿Estás seguro que deseas eliminar esta tarea?',
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
        this.taskService.deleteTask(taskId).subscribe({
          next: () => {
            this.tasks = this.tasks.filter(t => t.id !== taskId);
            this.setKanbanColumns();
            this.rateLimitMessage = null;
          },
          error: (err) => {
            console.error('Error al eliminar la tarea:', err);
            if (err.status === 429) {
              this.rateLimitMessage = err.error.intData?.message || 'Has alcanzado el límite de peticiones. Por favor, intenta de nuevo más tarde.';
            } else {
              this.rateLimitMessage = 'Ocurrió un error al eliminar la tarea. Por favor, intenta de nuevo.';
            }
          }
        });
      }
    });
  }

  clearRateLimitMessage() {
    this.rateLimitMessage = null;
  }
}
