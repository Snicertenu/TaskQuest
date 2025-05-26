import analytics from '@react-native-firebase/analytics';
import crashlytics from '@react-native-firebase/crashlytics';
import perf from '@react-native-firebase/perf';
import { Party, Task, Adventure, PartyMember } from '../types';
import firestore from '@react-native-firebase/firestore';

export class AnalyticsService {
  private static async logEvent(eventName: string, params?: { [key: string]: any }): Promise<void> {
    try {
      await analytics().logEvent(eventName, params);
    } catch (error) {
      console.error('Analytics error:', error);
    }
  }

  // User Behavior Tracking
  public static async trackUserAction(action: string, details: { [key: string]: any }): Promise<void> {
    await this.logEvent('user_action', {
      action,
      ...details,
      timestamp: new Date().toISOString(),
    });
  }

  public static async trackScreenView(screenName: string): Promise<void> {
    await analytics().logScreenView({
      screen_name: screenName,
      screen_class: screenName,
    });
  }

  // Party Analytics
  public static async trackPartyCreation(party: Party): Promise<void> {
    await this.logEvent('party_created', {
      party_type: party.type,
      member_count: party.members.length,
      settings: party.settings,
    });
  }

  public static async trackPartyJoin(party: Party, member: PartyMember): Promise<void> {
    await this.logEvent('party_joined', {
      party_id: party.id,
      party_type: party.type,
      member_level: member.level,
      member_class: member.class,
    });
  }

  public static async trackRaidPartyRenewal(party: Party, cost: number): Promise<void> {
    await this.logEvent('raid_party_renewed', {
      party_id: party.id,
      renewal_cost: cost,
      member_count: party.members.length,
    });
  }

  // Task Analytics
  public static async trackTaskCompletion(task: Task, member: PartyMember): Promise<void> {
    await this.logEvent('task_completed', {
      task_id: task.id,
      difficulty: task.difficulty,
      frequency: task.frequency,
      member_level: member.level,
      rewards_earned: task.rewards,
    });
  }

  // Adventure Analytics
  public static async trackAdventureProgress(adventure: Adventure, progress: number): Promise<void> {
    await this.logEvent('adventure_progress', {
      adventure_id: adventure.id,
      difficulty: adventure.difficulty,
      progress_percentage: progress,
      theme: adventure.theme.setting,
    });
  }

  // Performance Monitoring
  public static async startTrace(traceName: string): Promise<any> {
    const trace = await perf().startTrace(traceName);
    return trace;
  }

  public static async stopTrace(trace: any): Promise<void> {
    await trace.stop();
  }

  // Crash Reporting
  public static async logError(error: Error, context?: Record<string, string>): Promise<void> {
    await crashlytics().recordError(error, {
      ...context,
      timestamp: new Date().toISOString(),
    });
  }

  public static async setUserIdentifier(userId: string): Promise<void> {
    await Promise.all([
      analytics().setUserId(userId),
      crashlytics().setUserId(userId),
    ]);
  }

  public static async setUserProperties(properties: { [key: string]: any }): Promise<void> {
    await analytics().setUserProperties(properties);
  }

  // Feature Usage Analytics
  public static async trackFeatureUsage(feature: string, details?: { [key: string]: any }): Promise<void> {
    await this.logEvent('feature_used', {
      feature,
      ...details,
    });
  }

  // Performance Metrics
  public static async trackNetworkRequest(url: string, method: string, duration: number): Promise<void> {
    await this.logEvent('network_request', {
      url,
      method,
      duration_ms: duration,
    });
  }

  public static async trackAppStartup(duration: number): Promise<void> {
    await this.logEvent('app_startup', {
      duration_ms: duration,
    });
  }

  // Enhanced Party Analytics
  public static async trackPartyMetrics(party: Party): Promise<void> {
    await this.logEvent('party_metrics', {
      party_id: party.id,
      party_type: party.type,
      member_count: party.members.length,
      active_tasks: party.members.reduce((acc, member) => acc + (member.stats?.activeTasks || 0), 0),
      average_level: party.members.reduce((acc, member) => acc + member.level, 0) / party.members.length,
      total_xp: party.members.reduce((acc, member) => acc + member.xp, 0),
      total_gold: party.members.reduce((acc, member) => acc + member.gold, 0),
    });
  }

  // Enhanced Task Analytics
  public static async trackTaskMetrics(task: Task, member: PartyMember): Promise<void> {
    const completionTime = task.completedAt ? 
      new Date(task.completedAt).getTime() - new Date(task.createdAt).getTime() : 0;

    await this.logEvent('task_metrics', {
      task_id: task.id,
      difficulty: task.difficulty,
      frequency: task.frequency,
      completion_time_ms: completionTime,
      member_level: member.level,
      member_class: member.class,
      rewards_earned: task.rewards,
      is_custom: task.isCustom,
    });
  }

  // Enhanced Performance Metrics
  public static async trackDetailedPerformance(metrics: {
    memoryUsage: number;
    cpuUsage: number;
    frameRate: number;
    renderTime: number;
  }): Promise<void> {
    await this.logEvent('detailed_performance', {
      memory_usage_mb: metrics.memoryUsage,
      cpu_usage_percent: metrics.cpuUsage,
      frame_rate: metrics.frameRate,
      render_time_ms: metrics.renderTime,
    });
  }

  // Enhanced Error Tracking
  public static async logDetailedError(
    error: Error,
    context: {
      component?: string;
      action?: string;
      userState?: Record<string, any>;
      deviceInfo?: Record<string, any>;
    }
  ): Promise<void> {
    const errorContext = {
      component: context.component || 'unknown',
      action: context.action || 'unknown',
      userState: JSON.stringify(context.userState || {}),
      deviceInfo: JSON.stringify(context.deviceInfo || {}),
      timestamp: new Date().toISOString(),
    };

    await crashlytics().recordError(error, errorContext);
  }

  // User Engagement Metrics
  public static async trackUserEngagement(sessionData: {
    sessionDuration: number;
    screensVisited: string[];
    actionsPerformed: { [key: string]: number };
    timeOfDay: string;
  }): Promise<void> {
    await this.logEvent('user_engagement', {
      session_duration_ms: sessionData.sessionDuration,
      screens_visited: sessionData.screensVisited,
      actions_performed: sessionData.actionsPerformed,
      time_of_day: sessionData.timeOfDay,
    });
  }

  // Feature Adoption Metrics
  public static async trackFeatureAdoption(feature: string, data: {
    firstUse: boolean;
    usageCount: number;
    successRate: number;
    timeToAdopt: number;
  }): Promise<void> {
    await this.logEvent('feature_adoption', {
      feature,
      first_use: data.firstUse,
      usage_count: data.usageCount,
      success_rate: data.successRate,
      time_to_adopt_ms: data.timeToAdopt,
    });
  }

  // Network Performance Metrics
  public static async trackNetworkMetrics(data: {
    endpoint: string;
    method: string;
    statusCode: number;
    responseTime: number;
    payloadSize: number;
    errorRate: number;
  }): Promise<void> {
    await this.logEvent('network_metrics', {
      endpoint: data.endpoint,
      method: data.method,
      status_code: data.statusCode,
      response_time_ms: data.responseTime,
      payload_size_bytes: data.payloadSize,
      error_rate: data.errorRate,
    });
  }

  // Automated Reporting
  public static async generateDailyReport(): Promise<void> {
    const report = {
      timestamp: new Date().toISOString(),
      metrics: {
        activeUsers: 0,
        newUsers: 0,
        totalSessions: 0,
        averageSessionDuration: 0,
        errorRate: 0,
        featureUsage: {},
        performanceMetrics: {},
      },
    };

    await firestore()
      .collection('analytics')
      .doc('daily_reports')
      .collection('reports')
      .add(report);
  }
} 