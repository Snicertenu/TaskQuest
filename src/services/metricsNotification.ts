import { firestore } from '../config/firebase';
import { AnalyticsService } from './analytics';
import messaging from '@react-native-firebase/messaging';

interface MetricThreshold {
  metric: string;
  threshold: number;
  operator: '>' | '<' | '==' | '>=' | '<=';
  severity: 'low' | 'medium' | 'high';
  notificationTitle: string;
  notificationBody: string;
}

export class MetricsNotificationService {
  private static readonly THRESHOLDS: MetricThreshold[] = [
    {
      metric: 'errorRate',
      threshold: 5,
      operator: '>',
      severity: 'high',
      notificationTitle: 'High Error Rate Alert',
      notificationBody: 'Error rate has exceeded 5%. Please check the system logs.',
    },
    {
      metric: 'activeUsers',
      threshold: 1000,
      operator: '<',
      severity: 'medium',
      notificationTitle: 'Low User Activity Alert',
      notificationBody: 'Active users have dropped below 1000. Consider checking user engagement.',
    },
    {
      metric: 'performanceMetrics.memoryUsage',
      threshold: 500,
      operator: '>',
      severity: 'high',
      notificationTitle: 'High Memory Usage Alert',
      notificationBody: 'Memory usage has exceeded 500MB. System performance may be affected.',
    },
    {
      metric: 'performanceMetrics.cpuUsage',
      threshold: 80,
      operator: '>',
      severity: 'high',
      notificationTitle: 'High CPU Usage Alert',
      notificationBody: 'CPU usage has exceeded 80%. System performance may be affected.',
    },
    {
      metric: 'partyMetrics.partyRetention',
      threshold: 50,
      operator: '<',
      severity: 'medium',
      notificationTitle: 'Low Party Retention Alert',
      notificationBody: 'Party retention rate has dropped below 50%. Consider reviewing party features.',
    },
  ];

  public static async checkMetrics(report: any): Promise<void> {
    for (const threshold of this.THRESHOLDS) {
      const value = this.getMetricValue(report, threshold.metric);
      if (this.evaluateThreshold(value, threshold)) {
        await this.sendNotification(threshold);
        await this.logAlert(threshold, value);
      }
    }
  }

  private static getMetricValue(report: any, metricPath: string): number {
    return metricPath.split('.').reduce((obj, key) => obj?.[key], report.metrics) || 0;
  }

  private static evaluateThreshold(value: number, threshold: MetricThreshold): boolean {
    switch (threshold.operator) {
      case '>':
        return value > threshold.threshold;
      case '<':
        return value < threshold.threshold;
      case '==':
        return value === threshold.threshold;
      case '>=':
        return value >= threshold.threshold;
      case '<=':
        return value <= threshold.threshold;
      default:
        return false;
    }
  }

  private static async sendNotification(threshold: MetricThreshold): Promise<void> {
    const message = {
      notification: {
        title: threshold.notificationTitle,
        body: threshold.notificationBody,
      },
      data: {
        type: 'metric_alert',
        severity: threshold.severity,
        metric: threshold.metric,
        threshold: threshold.threshold.toString(),
      },
    };

    // Send to admin users
    const adminUsers = await firestore()
      .collection('users')
      .where('role', '==', 'admin')
      .get();

    const tokens = adminUsers.docs.map(doc => doc.data().fcmToken).filter(Boolean);

    if (tokens.length > 0) {
      await messaging().sendMulticast({
        tokens,
        ...message,
      });
    }
  }

  private static async logAlert(threshold: MetricThreshold, value: number): Promise<void> {
    await firestore()
      .collection('metric_alerts')
      .add({
        timestamp: new Date().toISOString(),
        metric: threshold.metric,
        threshold: threshold.threshold,
        value,
        severity: threshold.severity,
        notificationTitle: threshold.notificationTitle,
        notificationBody: threshold.notificationBody,
      });
  }

  public static async getRecentAlerts(limit: number = 10): Promise<any[]> {
    const snapshot = await firestore()
      .collection('metric_alerts')
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map(doc => doc.data());
  }

  public static async updateThresholds(newThresholds: MetricThreshold[]): Promise<void> {
    await firestore()
      .collection('settings')
      .doc('metric_thresholds')
      .set({ thresholds: newThresholds });
  }

  public static async getThresholds(): Promise<MetricThreshold[]> {
    const doc = await firestore()
      .collection('settings')
      .doc('metric_thresholds')
      .get();

    return doc.exists ? doc.data()?.thresholds || this.THRESHOLDS : this.THRESHOLDS;
  }
} 