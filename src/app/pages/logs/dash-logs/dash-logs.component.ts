import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import { LogService } from '../../../core/logs/log.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import * as echarts from 'echarts';

@Component({
  selector: 'app-dash-logs',
  standalone: true,
  imports: [CommonModule, NgxEchartsModule, HeaderComponent, DecimalPipe],
  templateUrl: './dash-logs.component.html',
  styleUrl: './dash-logs.component.css'
})
export class DashLogsComponent implements OnInit, OnDestroy {
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

  private refreshInterval: any;

  logHistory: { timestamp: string, total: number }[] = [];

  statusData: any;
  apiData: any;
  responseTimeData: any;
  totalLogsData: any;

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

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
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
      const status = log.status ? log.status.toString() : 'unknown';
      const responseTime = parseFloat(log.response_time) || 0;
      const route = log.route || 'unknown';
      const service = log.service || 'unknown';

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
    if (this.logHistory.length > 50) { // Limit to 50 points for performance
      this.logHistory.shift();
    }

    this.avgResponseTime = responseTimes.length ? totalResponseTime / responseTimes.length : 0;
    if (responseTimes.length === 0) {
      this.minResponseTime = 0;
      this.maxResponseTime = 0;
    }

    // Set chart data for ECharts
    this.statusData = {
      tooltip: {
        trigger: 'item'
      },
      legend: {
        top: '5%',
        left: 'center'
      },
      series: [{
        name: 'Distribución de Códigos de Estado',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: Object.entries(this.statusCounts).map(([key, value]) => ({ value, name: key }))
      }]
    };

    // Top 10 API usages
    const apiEntries = Object.entries(this.apiUsage).sort((a, b) => b[1] - a[1]).slice(0, 10);
    this.apiData = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      legend: {
        top: '5%'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: apiEntries.map(e => e[0]),
        axisLabel: {
          rotate: 45,
          interval: 0 // Show all labels
        }
      },
      yAxis: {
        type: 'value'
      },
      series: [{
        name: 'Llamadas a la API',
        type: 'bar',
        data: apiEntries.map(e => e[1]),
        itemStyle: {
          color: '#FF6384'
        }
      }]
    };

    this.responseTimeData = {
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        top: '5%'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: ['Promedio', 'Mínimo', 'Máximo']
      },
      yAxis: {
        type: 'value'
      },
      series: [{
        name: 'Tiempo de Respuesta (segundos)',
        type: 'bar',
        data: [this.avgResponseTime, this.minResponseTime, this.maxResponseTime],
        itemStyle: {
          color: (params: any) => ['#4BC0C0', '#FFCE56', '#FF6384'][params.dataIndex]
        }
      }]
    };

    this.totalLogsData = {
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        top: '5%'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: this.logHistory.map(entry => entry.timestamp)
      },
      yAxis: {
        type: 'value',
        max: Math.max(...this.logHistory.map(e => e.total)) * 1.2 || 100
      },
      series: [{
        name: 'Total de Logs',
        type: 'line',
        data: this.logHistory.map(entry => entry.total),
        itemStyle: {
          color: '#36A2EB'
        },
        areaStyle: {
          color: 'rgba(54, 162, 235, 0.2)'
        }
      }]
    };
  }

  goBack(): void {
    this.router.navigate(['/tasks/task-list']);
  }
}
