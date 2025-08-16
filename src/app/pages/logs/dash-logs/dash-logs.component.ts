import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common'; // Importar CommonModule
import { ChartModule } from 'primeng/chart';
import { LogService } from '../../../core/logs/log.service';
import Chart from 'chart.js/auto';
import { isPlatformBrowser } from '@angular/common';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-dash-logs',
  standalone: true,
  imports: [CommonModule, ChartModule, HeaderComponent, DecimalPipe], // Agregar CommonModule aquí
  templateUrl: './dash-logs.component.html',
  styleUrl: './dash-logs.component.css'
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

  @ViewChild('statusChart') statusChartRef!: ElementRef;
  @ViewChild('apiChart') apiChartRef!: ElementRef;
  @ViewChild('responseTimeChart') responseTimeChartRef!: ElementRef;
  @ViewChild('totalLogsChart') totalLogsChartRef!: ElementRef;
  private statusChart!: Chart;
  private apiChart!: Chart;
  private responseTimeChart!: Chart;
  private totalLogsChart!: Chart;
  private refreshInterval: any;

  logHistory: { timestamp: string, total: number }[] = [];

  constructor(
    private logService: LogService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchLogs();
    this.refreshInterval = setInterval(() => {
      this.fetchLogs();
    }, 60000);
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeCharts();
    }
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    if (this.statusChart) this.statusChart.destroy();
    if (this.apiChart) this.apiChart.destroy();
    if (this.responseTimeChart) this.responseTimeChart.destroy();
    if (this.totalLogsChart) this.totalLogsChart.destroy();
  }

  private fetchLogs(): void {
    this.logService.getLogs().subscribe({
      next: (data: any) => {
        this.logData = Array.isArray(data) ? data : data.logs || [];
        this.processLogs();
        this.rateLimitExceeded = false;
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 429) {
          this.rateLimitExceeded = true;
          this.rateLimitMessage = err.error.message || 'Límite de peticiones excedido. Por favor, intenta de nuevo más tarde.';
        } else {
          console.error('Error fetching logs:', err);
        }
        this.logData = [];
        this.processLogs();
      }
    });
  }

  processLogs(): void {
    this.totalLogs = this.logData.length;
    let totalResponseTime = 0;
    let responseTimes: number[] = [];
    this.statusCounts = {};
    this.apiUsage = {};
    this.logsByService = {};
    this.minResponseTime = Infinity;
    this.maxResponseTime = -Infinity;
    this.avgResponseTime = 0;

    this.logData.forEach((log: any) => {
      const status = log.status.toString();
      const responseTime = parseFloat(log.response_time) || 0;
      const route = log.route;
      const service = log.service;

      this.statusCounts[status] = (this.statusCounts[status] || 0) + 1;
      totalResponseTime += responseTime;
      responseTimes.push(responseTime);
      this.minResponseTime = Math.min(this.minResponseTime, responseTime);
      this.maxResponseTime = Math.max(this.maxResponseTime, responseTime);
      const apiKey = `${service}:${route}`;
      this.apiUsage[apiKey] = (this.apiUsage[apiKey] || 0) + 1;
      this.logsByService[service] = (this.logsByService[service] || 0) + 1;
    });

    const now = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    this.logHistory.push({ timestamp: now, total: this.totalLogs });
    if (this.logHistory.length > 10) {
      this.logHistory.shift();
    }

    this.avgResponseTime = responseTimes.length ? totalResponseTime / responseTimes.length : 0;
    if (responseTimes.length === 0) {
      this.minResponseTime = 0;
      this.maxResponseTime = 0;
    }

    if (isPlatformBrowser(this.platformId)) {
      if (this.statusChart) {
        this.statusChart.data.labels = Object.keys(this.statusCounts);
        this.statusChart.data.datasets[0].data = Object.values(this.statusCounts);
        this.statusChart.update();
      }
      if (this.apiChart) {
        this.apiChart.data.labels = Object.keys(this.apiUsage);
        this.apiChart.data.datasets[0].data = Object.values(this.apiUsage);
        this.apiChart.update();
      }
      if (this.responseTimeChart) {
        this.responseTimeChart.data.datasets[0].data = [this.avgResponseTime, this.minResponseTime, this.maxResponseTime];
        this.responseTimeChart.update();
      }
      if (this.totalLogsChart) {
        this.totalLogsChart.data.labels = this.logHistory.map(entry => entry.timestamp);
        this.totalLogsChart.data.datasets[0].data = this.logHistory.map(entry => entry.total);
        this.totalLogsChart.update();
      }
    }
  }

  initializeCharts(): void {
    const statusCtx = this.statusChartRef.nativeElement.getContext('2d');
    this.statusChart = new Chart(statusCtx, {
      type: 'pie',
      data: {
        labels: Object.keys(this.statusCounts),
        datasets: [{
          data: Object.values(this.statusCounts),
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          title: { display: true, text: 'Distribución de Códigos de Estado' }
        }
      }
    });

    const apiCtx = this.apiChartRef.nativeElement.getContext('2d');
    this.apiChart = new Chart(apiCtx, {
      type: 'bar',
      data: {
        labels: Object.keys(this.apiUsage),
        datasets: [{
          label: 'Llamadas a la API',
          data: Object.values(this.apiUsage),
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
          borderColor: ['#E5556C', '#1E88E5', '#E6B800', '#3AA8A8', '#7B1FA2'],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          title: { display: true, text: 'Uso de la API' }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Número de Llamadas' }
          },
          x: {
            title: { display: true, text: 'Rutas de la API' },
            ticks: {
              autoSkip: true,
              maxRotation: 45,
              minRotation: 45,
              maxTicksLimit: 10
            }
          }
        }
      }
    });

    const responseTimeCtx = this.responseTimeChartRef.nativeElement.getContext('2d');
    this.responseTimeChart = new Chart(responseTimeCtx, {
      type: 'bar',
      data: {
        labels: ['Promedio', 'Mínimo', 'Máximo'],
        datasets: [{
          label: 'Tiempo de Respuesta (segundos)',
          data: [this.avgResponseTime, this.minResponseTime, this.maxResponseTime],
          backgroundColor: ['#4BC0C0', '#FFCE56', '#FF6384'],
          borderColor: ['#3AA8A8', '#E6B800', '#E5556C'],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          title: { display: true, text: 'Estadísticas de Tiempo de Respuesta' }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Tiempo (segundos)' },
            suggestedMax: this.maxResponseTime > 0 ? this.maxResponseTime * 1.2 : 1
          },
          x: {
            title: { display: true, text: 'Métricas' }
          }
        }
      }
    });

    const totalLogsCtx = this.totalLogsChartRef.nativeElement.getContext('2d');
    this.totalLogsChart = new Chart(totalLogsCtx, {
      type: 'line',
      data: {
        labels: this.logHistory.map(entry => entry.timestamp),
        datasets: [{
          label: 'Total de Logs',
          data: this.logHistory.map(entry => entry.total),
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: '#36A2EB',
          borderWidth: 2,
          fill: true,
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          title: { display: true, text: 'Evolución del Total de Logs' }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Número de Logs' },
            suggestedMax: 100
          },
          x: {
            title: { display: true, text: 'Hora' }
          }
        }
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/tasks/task-list']);
  }
}
