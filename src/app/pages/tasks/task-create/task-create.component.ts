import { Component, OnInit } from '@angular/core';
import { TaskService } from '../../../core/tasks/tasks.service';
import { Task } from '../../../core/models/task.model';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Router } from '@angular/router';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';

@Component({
  selector: 'app-task-create',
  standalone: true,
  templateUrl: './task-create.component.html',
  styleUrls: ['./task-create.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    CalendarModule,
    DropdownModule,
    ButtonModule,
    ToastModule,
    HeaderComponent,
    InputGroupModule,
    InputGroupAddonModule
  ],
  providers: [MessageService]
})
export class TaskCreateComponent implements OnInit {
  task: Task = {
    name: '',
    description: '',
    created_at: '',
    dead_line: '',
    status: 'Incomplete',
    is_alive: true,
    created_by: ''
  };

  statusOptions = [
    { label: 'Pendiente', value: 'Incomplete' },
    { label: 'En progreso', value: 'InProgress' },
    { label: 'Pausada', value: 'Paused' },
    { label: 'Revisión', value: 'Revision' },
    { label: 'Hecho', value: 'Completed' }
  ];

  constructor(
    private taskService: TaskService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      const username = localStorage.getItem('username');
      if (username) {
        this.task.created_by = username;
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se encontró el usuario. Por favor, inicia sesión.'
        });
        this.router.navigate(['/auth/login']);
      }
    }
  }

  onSubmit(form: NgForm): void {
    if (form.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Por favor, complete todos los campos obligatorios'
      });
      return;
    }

    const formatDate = (date: Date | string): string => {
      if (typeof date === 'string') {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
          throw new Error('Formato de fecha inválido');
        }
        return date;
      }
      return date.toISOString().split('T')[0];
    };

    try {
      const taskToSubmit: Task = {
        ...this.task,
        created_at: formatDate(this.task.created_at),
        dead_line: formatDate(this.task.dead_line)
      };

      this.taskService.createTask(taskToSubmit).subscribe({
        next: (res) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Tarea creada exitosamente'
          });
          setTimeout(() => this.router.navigate(['/tasks/task-list']), 1000);
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err.error?.intData?.message || 'Error al crear la tarea'
          });
        }
      });
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Formato de fecha inválido (YYYY-MM-DD)'
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/tasks/task-list']);
  }
}