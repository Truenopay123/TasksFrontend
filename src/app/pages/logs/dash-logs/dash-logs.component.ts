import { Component, OnInit } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, ChartData, ChartType, registerables } from 'chart.js';
import { LogService } from '../../../core/logs/log.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card'; // Importar CardModule
import { IconFieldModule } from 'primeng/iconfield'; // Importar IconFieldModule para íconos

Chart.register(...registerables);

interface Log {
  route: string;
  service: string;
  method: string;
  status: number;
  response_time: number;
  timestamp: string;
  user: string;
  _id: string;
}

@Component({
  selector: 'app-dash-logs',
  standalone: true,
  imports: [
    BaseChartDirective,
    CommonModule,
    HeaderComponent,
    CardModule, // Agregar CardModule
    IconFieldModule // Agregar IconFieldModule
  ],
  templateUrl: './dash-logs.component.html',
  styleUrls: ['./dash-logs.component.css']
})
export class DashLogsComponent implements OnInit {
  logs: Log[] = [];
  totalLogs = 0;
  uniqueRoutes = 0;
  uniqueUsers = 0;
  avgResponseTime = '0.00';
  minResponseTime = '0.00';
  mostConsumedAPI = { route: '', count: 0 };
  leastConsumedAPI = { route: '', count: Infinity };
  statusCounts: { [key: string]: number } = {};
  routeCounts: { [key: string]: number } = {};
  methodCounts: { [key: string]: number } = {};
  rateLimitMessage: string | null = null;

  public sessionsChartType: ChartType = 'bar';
  public sessionsChartData: ChartData<'bar'> = { datasets: [] };
  public sessionsChartLabels: string[] = [];
  public sessionsChartOptions: ChartConfiguration['options'] = {
    scales: { y: { beginAtZero: true } }
  };

  public methodChartType: ChartType = 'bar';
  public methodChartData: ChartData<'bar'> = { datasets: [] };
  public methodChartLabels: string[] = [];
  public methodChartOptions: ChartConfiguration['options'] = {
    indexAxis: 'y',
    scales: { x: { beginAtZero: true } }
  };

  public statusChartType: ChartType = 'bar';
  public statusChartData: ChartData<'bar'> = { datasets: [] };
  public statusChartLabels: string[] = ['200', '401', '404', '500'];
  public statusChartOptions: ChartConfiguration['options'] = {
    scales: { y: { beginAtZero: true } }
  };

  public rtChartType: ChartType = 'line';
  public rtChartData: ChartData<'line'> = { datasets: [] };
  public rtChartLabels: string[] = [];
  public rtChartOptions: ChartConfiguration['options'] = {
    elements: { line: { fill: true } },
    scales: { y: { beginAtZero: true } }
  };

  constructor(private logService: LogService) {}

  ngOnInit(): void {
    this.logService.getLogs().subscribe({
      next: (response) => {
        if (response.statusCode === 200) {
          this.logs = response.intData.data;
          this.computeStats();
          this.prepareCharts();
          this.rateLimitMessage = null;
        }
      },
      error: (error) => {
        if (error.status === 429) {
          this.rateLimitMessage = error.error.message || 'Has alcanzado el límite de peticiones. Por favor, intenta de nuevo más tarde.';
        } else {
          this.rateLimitMessage = 'Ocurrió un error al cargar los registros. Por favor, intenta de nuevo.';
        }
      }
    });
  }

  private computeStats() {
    this.totalLogs = this.logs.length;
    const routes = new Set<string>();
    const users = new Set<string>();
    let sumRT = 0;
    let minRT = Infinity;
    this.statusCounts = { '200': 0, '401': 0, '404': 0, '500': 0 };
    this.routeCounts = {};
    this.methodCounts = {};

    for (const log of this.logs) {
      if (log.route === '/favicon.ico') continue;
      routes.add(log.route);
      users.add(log.user);
      sumRT += log.response_time;
      if (log.response_time < minRT) minRT = log.response_time;
      const statusStr = log.status.toString();
      if (['200', '401', '404', '500'].includes(statusStr)) {
        this.statusCounts[statusStr] = (this.statusCounts[statusStr] || 0) + 1;
      }
      this.routeCounts[log.route] = (this.routeCounts[log.route] || 0) + 1;
      this.methodCounts[log.method] = (this.methodCounts[log.method] || 0) + 1;
    }

    this.uniqueRoutes = routes.size;
    this.uniqueUsers = users.size;
    this.avgResponseTime = this.totalLogs > 0 ? (sumRT / this.totalLogs).toFixed(4) : '0.0000';
    this.minResponseTime = isFinite(minRT) ? minRT.toFixed(4) : '0.0000';

    let maxCount = 0;
    let minCount = Infinity;
    for (const [route, count] of Object.entries(this.routeCounts)) {
      if (count > maxCount) {
        this.mostConsumedAPI = { route, count };
        maxCount = count;
      }
      if (count < minCount && count > 0) {
        this.leastConsumedAPI = { route, count };
        minCount = count;
      }
    }
  }

  private prepareCharts() {
    const dayCounts: { [day: string]: number } = {};
    for (const log of this.logs) {
      const day = log.timestamp.split(' ')[0];
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    }
    this.sessionsChartLabels = Object.keys(dayCounts).sort();
    this.sessionsChartData = {
      datasets: [{
        data: this.sessionsChartLabels.map(d => dayCounts[d]),
        label: 'Registros por Día',
        backgroundColor: 'yellow'
      }]
    };

    this.methodChartLabels = Object.keys(this.methodCounts);
    this.methodChartData = {
      datasets: [{
        data: Object.values(this.methodCounts),
        label: 'Métodos',
        backgroundColor: 'cyan'
      }]
    };

    this.statusChartData = {
      datasets: [{
        data: this.statusChartLabels.map(status => this.statusCounts[status] || 0),
        label: 'Códigos de Estado',
        backgroundColor: 'blue'
      }]
    };

    const dayRT: { [day: string]: { sum: number, count: number } } = {};
    for (const log of this.logs) {
      const day = log.timestamp.split(' ')[0];
      if (!dayRT[day]) dayRT[day] = { sum: 0, count: 0 };
      dayRT[day].sum += log.response_time;
      dayRT[day].count++;
    }
    const sortedDays = Object.keys(dayRT).sort();
    this.rtChartLabels = sortedDays;
    this.rtChartData = {
      datasets: [{
        data: sortedDays.map(d => dayRT[d].sum / dayRT[d].count),
        label: 'Tiempo de Respuesta Promedio por Día',
        borderColor: 'yellow',
        backgroundColor: 'rgba(255, 255, 0, 0.3)',
        fill: true
      }]
    };
  }

  clearRateLimitMessage() {
    this.rateLimitMessage = null;
  }
}
