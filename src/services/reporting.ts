import { firestore } from '../config/firebase';
import { AnalyticsService } from './analytics';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

interface ReportData {
  timestamp: string;
  metrics: {
    activeUsers: number;
    newUsers: number;
    totalSessions: number;
    averageSessionDuration: number;
    errorRate: number;
    featureUsage: { [key: string]: number };
    performanceMetrics: {
      appStartup: number;
      networkLatency: number;
      memoryUsage: number;
      cpuUsage: number;
      frameRate: number;
    };
    partyMetrics: {
      householdParties: number;
      raidingParties: number;
      averagePartySize: number;
      partyRetention: number;
    };
  };
}

export class ReportingService {
  private static readonly REPORT_COLLECTION = 'analytics_reports';
  private static readonly DAILY_REPORT_DOC = 'daily_reports';
  private static readonly WEEKLY_REPORT_DOC = 'weekly_reports';
  private static readonly MONTHLY_REPORT_DOC = 'monthly_reports';

  public static async generateDailyReport(): Promise<void> {
    const report = await this.collectReportData('daily');
    await this.saveReport(this.DAILY_REPORT_DOC, report);
  }

  public static async generateWeeklyReport(): Promise<void> {
    const report = await this.collectReportData('weekly');
    await this.saveReport(this.WEEKLY_REPORT_DOC, report);
  }

  public static async generateMonthlyReport(): Promise<void> {
    const report = await this.collectReportData('monthly');
    await this.saveReport(this.MONTHLY_REPORT_DOC, report);
  }

  private static async collectReportData(period: 'daily' | 'weekly' | 'monthly'): Promise<ReportData> {
    const now = new Date();
    const startDate = this.getStartDate(period);

    const analyticsRef = firestore().collection('analytics');
    const events = await analyticsRef
      .where('timestamp', '>=', startDate)
      .where('timestamp', '<=', now)
      .get();

    const metrics = this.aggregateMetrics(events.docs);

    return {
      timestamp: now.toISOString(),
      metrics,
    };
  }

  private static getStartDate(period: 'daily' | 'weekly' | 'monthly'): Date {
    const now = new Date();
    switch (period) {
      case 'daily':
        return new Date(now.setHours(0, 0, 0, 0));
      case 'weekly':
        return new Date(now.setDate(now.getDate() - 7));
      case 'monthly':
        return new Date(now.setMonth(now.getMonth() - 1));
    }
  }

  private static aggregateMetrics(docs: any[]): ReportData['metrics'] {
    const metrics: ReportData['metrics'] = {
      activeUsers: 0,
      newUsers: 0,
      totalSessions: 0,
      averageSessionDuration: 0,
      errorRate: 0,
      featureUsage: {},
      performanceMetrics: {
        appStartup: 0,
        networkLatency: 0,
        memoryUsage: 0,
        cpuUsage: 0,
        frameRate: 0,
      },
      partyMetrics: {
        householdParties: 0,
        raidingParties: 0,
        averagePartySize: 0,
        partyRetention: 0,
      },
    };

    // Aggregate metrics from events
    docs.forEach(doc => {
      const data = doc.data();
      // Aggregate based on event type
      switch (data.eventType) {
        case 'user_action':
          metrics.activeUsers++;
          break;
        case 'session_start':
          metrics.totalSessions++;
          metrics.averageSessionDuration += data.duration || 0;
          break;
        case 'error':
          metrics.errorRate++;
          break;
        case 'feature_used':
          metrics.featureUsage[data.feature] = (metrics.featureUsage[data.feature] || 0) + 1;
          break;
        case 'performance_metrics':
          Object.assign(metrics.performanceMetrics, data.metrics);
          break;
        case 'party_metrics':
          Object.assign(metrics.partyMetrics, data.metrics);
          break;
      }
    });

    // Calculate averages
    if (metrics.totalSessions > 0) {
      metrics.averageSessionDuration /= metrics.totalSessions;
    }

    return metrics;
  }

  private static async saveReport(docId: string, report: ReportData): Promise<void> {
    await firestore()
      .collection(this.REPORT_COLLECTION)
      .doc(docId)
      .collection('reports')
      .add(report);
  }

  public static async getLatestReport(type: 'daily' | 'weekly' | 'monthly'): Promise<ReportData | null> {
    const docId = type === 'daily' ? this.DAILY_REPORT_DOC :
                 type === 'weekly' ? this.WEEKLY_REPORT_DOC :
                 this.MONTHLY_REPORT_DOC;

    const snapshot = await firestore()
      .collection(this.REPORT_COLLECTION)
      .doc(docId)
      .collection('reports')
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    return snapshot.docs[0].data() as ReportData;
  }

  public static async exportReport(type: 'daily' | 'weekly' | 'monthly', format: 'csv' | 'json'): Promise<void> {
    const report = await this.getLatestReport(type);
    if (!report) {
      throw new Error(`No ${type} report available`);
    }

    const fileName = `house_party_${type}_report_${new Date().toISOString().split('T')[0]}`;
    let fileContent: string;
    let fileExtension: string;

    if (format === 'csv') {
      fileContent = this.convertToCSV(report);
      fileExtension = 'csv';
    } else {
      fileContent = JSON.stringify(report, null, 2);
      fileExtension = 'json';
    }

    const filePath = `${FileSystem.documentDirectory}${fileName}.${fileExtension}`;
    await FileSystem.writeAsStringAsync(filePath, fileContent);

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(filePath);
    } else {
      throw new Error('Sharing is not available on this device');
    }
  }

  private static convertToCSV(report: ReportData): string {
    const headers = [
      'Timestamp',
      'Active Users',
      'New Users',
      'Total Sessions',
      'Average Session Duration',
      'Error Rate',
      'Feature Usage',
      'Performance Metrics',
      'Party Metrics'
    ];

    const rows = [
      headers,
      [
        report.timestamp,
        report.metrics.activeUsers,
        report.metrics.newUsers,
        report.metrics.totalSessions,
        report.metrics.averageSessionDuration,
        report.metrics.errorRate,
        JSON.stringify(report.metrics.featureUsage),
        JSON.stringify(report.metrics.performanceMetrics),
        JSON.stringify(report.metrics.partyMetrics)
      ]
    ];

    return rows.map(row => row.join(',')).join('\n');
  }

  public static async exportAllReports(format: 'csv' | 'json'): Promise<void> {
    const reports = await Promise.all([
      this.getLatestReport('daily'),
      this.getLatestReport('weekly'),
      this.getLatestReport('monthly')
    ]);

    const fileName = `house_party_all_reports_${new Date().toISOString().split('T')[0]}`;
    let fileContent: string;
    let fileExtension: string;

    if (format === 'csv') {
      fileContent = this.convertMultipleReportsToCSV(reports);
      fileExtension = 'csv';
    } else {
      fileContent = JSON.stringify(reports, null, 2);
      fileExtension = 'json';
    }

    const filePath = `${FileSystem.documentDirectory}${fileName}.${fileExtension}`;
    await FileSystem.writeAsStringAsync(filePath, fileContent);

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(filePath);
    } else {
      throw new Error('Sharing is not available on this device');
    }
  }

  private static convertMultipleReportsToCSV(reports: (ReportData | null)[]): string {
    const headers = [
      'Report Type',
      'Timestamp',
      'Active Users',
      'New Users',
      'Total Sessions',
      'Average Session Duration',
      'Error Rate',
      'Feature Usage',
      'Performance Metrics',
      'Party Metrics'
    ];

    const rows = [headers];

    const types = ['daily', 'weekly', 'monthly'];
    reports.forEach((report, index) => {
      if (report) {
        rows.push([
          types[index],
          report.timestamp,
          report.metrics.activeUsers,
          report.metrics.newUsers,
          report.metrics.totalSessions,
          report.metrics.averageSessionDuration,
          report.metrics.errorRate,
          JSON.stringify(report.metrics.featureUsage),
          JSON.stringify(report.metrics.performanceMetrics),
          JSON.stringify(report.metrics.partyMetrics)
        ]);
      }
    });

    return rows.map(row => row.join(',')).join('\n');
  }
} 