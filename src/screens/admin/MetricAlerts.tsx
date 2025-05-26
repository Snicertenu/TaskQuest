import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MetricsNotificationService } from '../../services/metricsNotification';
import { colors } from '../../theme';

interface MetricAlert {
  timestamp: string;
  metric: string;
  threshold: number;
  value: number;
  severity: 'low' | 'medium' | 'high';
  notificationTitle: string;
  notificationBody: string;
}

export const MetricAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<MetricAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [thresholds, setThresholds] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [recentAlerts, currentThresholds] = await Promise.all([
        MetricsNotificationService.getRecentAlerts(),
        MetricsNotificationService.getThresholds(),
      ]);
      setAlerts(recentAlerts);
      setThresholds(currentThresholds);
    } catch (error) {
      Alert.alert('Error', 'Failed to load metric alerts');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return colors.error;
      case 'medium':
        return colors.warning;
      case 'low':
        return colors.info;
      default:
        return colors.text;
    }
  };

  const renderAlert = ({ item }: { item: MetricAlert }) => (
    <View style={[styles.alertCard, { borderLeftColor: getSeverityColor(item.severity) }]}>
      <Text style={styles.alertTitle}>{item.notificationTitle}</Text>
      <Text style={styles.alertBody}>{item.notificationBody}</Text>
      <View style={styles.alertDetails}>
        <Text style={styles.alertMetric}>
          {item.metric}: {item.value} (Threshold: {item.threshold})
        </Text>
        <Text style={styles.alertTimestamp}>
          {new Date(item.timestamp).toLocaleString()}
        </Text>
      </View>
    </View>
  );

  const renderThreshold = ({ item }: { item: any }) => (
    <View style={styles.thresholdCard}>
      <Text style={styles.thresholdTitle}>{item.metric}</Text>
      <View style={styles.thresholdDetails}>
        <Text style={styles.thresholdValue}>
          {item.operator} {item.threshold}
        </Text>
        <Text style={[styles.thresholdSeverity, { color: getSeverityColor(item.severity) }]}>
          {item.severity.toUpperCase()}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Active Thresholds</Text>
      <FlatList
        data={thresholds}
        renderItem={renderThreshold}
        keyExtractor={(item) => item.metric}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.thresholdList}
      />

      <Text style={styles.sectionTitle}>Recent Alerts</Text>
      <FlatList
        data={alerts}
        renderItem={renderAlert}
        keyExtractor={(item) => item.timestamp}
        style={styles.alertList}
        refreshing={loading}
        onRefresh={loadData}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  thresholdList: {
    marginBottom: 24,
  },
  thresholdCard: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 8,
    marginRight: 12,
    minWidth: 200,
  },
  thresholdTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  thresholdDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  thresholdValue: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  thresholdSeverity: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  alertList: {
    flex: 1,
  },
  alertCard: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  alertBody: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  alertDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertMetric: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  alertTimestamp: {
    fontSize: 12,
    color: colors.textSecondary,
  },
}); 