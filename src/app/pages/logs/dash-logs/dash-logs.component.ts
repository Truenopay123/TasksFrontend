import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import { LogService } from '../../../core/logs/log.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-dash-logs',
  standalone: true,
  imports: [CommonModule, NgxEchartsModule, HeaderComponent, DecimalPipe, FormsModule, ButtonModule],
  templateUrl: './dash-logs.component.html',
  styleUrls: ['./dash-logs.component.css']
})
export class DashLogsComponent implements OnInit, AfterViewInit, OnDestroy {
  logData: any[] = [];
  statusCounts: { [key: string]: number } = {};
  totalLogs: number = 0;
  avgResponseTime: number = 0;
  minResponseTime: number = 0;
  maxResponseTime: number = 0;
  apiUsage: { [key: string]: number } = {};
  logsByService: { [key: string]: number } = {};
  rateLimitExceeded: boolean = false;
  rateLimitMessage: string = '';
  uniqueUsers: number = 0;
  uniqueRoutes: number = 0;
  isLoading: boolean = true; // Nueva bandera para indicar carga

  // Propiedades para el formulario
  filterUser: string = '';
  filterRoute: string = '';
  filterStatus: string = '';
  filterStartDate: string = '';
  filterEndDate: string = '';

  private refreshInterval: any;

  logHistory: { timestamp: string, total: number }[] = [];

  statusData: any = {};
  apiData: any = {};
  responseTimeData: any = {};
  totalLogsData: any = {};

  constructor(
    private logService: LogService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchLogs();
    this.refreshInterval = setInterval(() => {
      this.fetchLogs();
    }, 60000);
  }

  ngAfterViewInit(): void {
    this.processLogs();
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  private fetchLogs(user?: string, route?: string, status?: string, startDate?: Date, endDate?: Date): void {
    this.isLoading = true; // Activar carga
    this.logService.getLogs(user, route, status, startDate, endDate).subscribe({
      next: (response: any) => {
        if (response.statusCode === 200) {
          this.logData = response.intData.data || [];
          this.rateLimitExceeded = false;
          this.rateLimitMessage = '';
        } else {
          this.rateLimitExceeded = true;
          this.rateLimitMessage = response.intData.message || 'Error al cargar los registros.';
          this.logData = [];
        }
        this.processLogs();
        this.isLoading = false; // Desactivar carga
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error fetching logs:', err); // Depuración
        if (err.status === 429) {
          this.rateLimitExceeded = true;
          this.rateLimitMessage = err.error?.intData?.message || 'Límite de peticiones excedido. Por favor, intenta de nuevo más tarde.';
        } else {
          this.rateLimitExceeded = true;
          this.rateLimitMessage = 'Ocurrió un error al cargar los registros. Por favor, intenta de nuevo.';
        }
        this.logData = [];
        this.processLogs();
        this.isLoading = false; // Desactivar carga
      }
    });
  }

  processLogs(): void {
    if (!this.logData || this.logData.length === 0) {
      this.totalLogs = 0;
      this.avgResponseTime = 0;
      this.minResponseTime = 0;
      this.maxResponseTime = 0;
      this.statusCounts = {};
      this.apiUsage = {};
      this.logsByService = {};
      this.uniqueUsers = 0;
      this.uniqueRoutes = 0;
      this.logHistory = [];
      this.updateCharts();
      return;
    }

    this.totalLogs = this.logData.length;
    let totalResponseTime = 0;
    let responseTimes: number[] = [];
    this.statusCounts = {};
    this.apiUsage = {};
    this.logsByService = {};
    this.minResponseTime = Infinity;
    this.maxResponseTime = -Infinity;
    const users = new Set<string>();
    const routes = new Set<string>();

    this.logData.forEach((log: any) => {
      const status = log.status != null ? log.status.toString() : 'unknown';
      const responseTime = typeof log.response_time === 'number' ? log.response_time : 0;
      const route = log.route || 'unknown';
      const service = log.service || 'unknown';
      const user = log.user || 'anonymous';

      this.statusCounts[status] = (this.statusCounts[status] || 0) + 1;
      totalResponseTime += responseTime;
      responseTimes.push(responseTime);
      this.minResponseTime = Math.min(this.minResponseTime, responseTime);
      this.maxResponseTime = Math.max(this.maxResponseTime, responseTime);
      const apiKey = `${service}:${route}`;
      this.apiUsage[apiKey] = (this.apiUsage[apiKey] || 0) + 1;
      this.logsByService[service] = (this.logsByService[service] || 0) + 1;
      users.add(user);
      routes.add(route);
    });

    this.uniqueUsers = users.size;
    this.uniqueRoutes = routes.size;
    const now = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    this.logHistory.push({ timestamp: now, total: this.totalLogs });
    if (this.logHistory.length > 50) {
      this.logHistory.shift();
    }

    this.avgResponseTime = responseTimes.length ? totalResponseTime / responseTimes.length : 0;
    if (responseTimes.length === 0) {
      this.minResponseTime = 0;
      this.maxResponseTime = 0;
    }

    this.updateCharts();
  }

  private updateCharts(): void {
    this.statusData = {
      tooltip: { trigger: 'item' },
      legend: { top: '5%', left: 'center' },
      series: [{
        name: 'Distribución de Códigos de Estado',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        label: { show: false, position: 'center' },
        emphasis: { label: { show: true, fontSize: 20, fontWeight: 'bold' } },
        labelLine: { show: false },
        data: Object.entries(this.statusCounts).map(([key, value]) => ({ value, name: key }))
      }]
    };

    const apiEntries = Object.entries(this.apiUsage).sort((a, b) => b[1] - a[1]).slice(0, 10);
    this.apiData = {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: { top: '5%' },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: apiEntries.map(e => e[0]),
        axisLabel: { rotate: 45, interval: 0 }
      },
      yAxis: { type: 'value' },
      series: [{
        name: 'Llamadas a la API',
        type: 'bar',
        data: apiEntries.map(e => e[1]),
        itemStyle: { color: '#FF6384' }
      }]
    };

    this.responseTimeData = {
      tooltip: { trigger: 'axis' },
      legend: { top: '5%' },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', data: ['Promedio', 'Mínimo', 'Máximo'] },
      yAxis: { type: 'value' },
      series: [{
        name: 'Tiempo de Respuesta (segundos)',
        type: 'bar',
        data: [this.avgResponseTime, this.minResponseTime, this.maxResponseTime],
        itemStyle: { color: (params: any) => ['#4BC0C0', '#FFCE56', '#FF6384'][params.dataIndex] }
      }]
    };

    this.totalLogsData = {
      tooltip: { trigger: 'axis' },
      legend: { top: '5%' },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', data: this.logHistory.map(entry => entry.timestamp) },
      yAxis: { type: 'value', max: Math.max(...this.logHistory.map(e => e.total)) * 1.2 || 100 },
      series: [{
        name: 'Total de Logs',
        type: 'line',
        data: this.logHistory.map(entry => entry.total),
        itemStyle: { color: '#36A2EB' },
        areaStyle: { color: 'rgba(54, 162, 235, 0.2)' }
      }]
    };
  }

  goBack(): void {
    this.router.navigate(['/tasks/task-list']);
  }

  applyFilters(): void {
    const filters = {
      user: this.filterUser || undefined,
      route: this.filterRoute || undefined,
      status: this.filterStatus || undefined,
      startDate: this.filterStartDate ? new Date(this.filterStartDate) : undefined,
      endDate: this.filterEndDate ? new Date(this.filterEndDate) : undefined
    };
    this.fetchLogs(filters.user, filters.route, filters.status, filters.startDate, filters.endDate);
  }
}
