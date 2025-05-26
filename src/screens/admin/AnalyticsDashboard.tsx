import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { firestore } from '../../config/firebase';
import { AnalyticsService } from '../../services/analytics';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

interface AnalyticsData {
  activeUsers: number;
  totalParties: number;
  activeRaids: number;
  completedTasks: number;
  averageTaskCompletion: number;
  errorRate: number;
  performanceMetrics: {
    appStartup: number;
    networkLatency: number;
    memoryUsage: number;
    cpuUsage: number;
    frameRate: number;
  };
  userEngagement: {
    dailyActiveUsers: number[];
    sessionDuration: number;
    screensVisited: { [key: string]: number };
  };
  featureAdoption: {
    [key: string]: {
      usageCount: number;
      successRate: number;
    };
  };
  partyMetrics: {
    householdParties: number;
    raidingParties: number;
    averagePartySize: number;
    partyRetention: number;
  };
}

export const AnalyticsDashboard: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const screenWidth = Dimensions.get('window').width;

  const fetchAnalyticsData = async () => {
    try {
      const analyticsRef = firestore().collection('analytics').doc('dashboard');
      const snapshot = await analyticsRef.get();
      const data = snapshot.data();
      if (data) {
        setData(data as AnalyticsData);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      AnalyticsService.logError(error as Error);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAnalyticsData();
    setRefreshing(false);
  };

  const renderMetricCard = (title: string, value: number | string, unit?: string) => (
    <View style={styles.metricCard}>
      <Text style={styles.metricTitle}>{title}</Text>
      <Text style={styles.metricValue}>
        {value}
        {unit && <Text style={styles.metricUnit}> {unit}</Text>}
      </Text>
    </View>
  );

  const renderLineChart = (data: number[], title: string) => (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>{title}</Text>
      <LineChart
        data={{
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{ data }],
        }}
        width={screenWidth - 32}
        height={220}
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(81, 150, 244, ${opacity})`,
          style: {
            borderRadius: 16,
          },
        }}
        style={styles.chart}
      />
    </View>
  );

  const renderBarChart = (data: { [key: string]: number }, title: string) => (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>{title}</Text>
      <BarChart
        data={{
          labels: Object.keys(data),
          datasets: [{ data: Object.values(data) }],
        }}
        width={screenWidth - 32}
        height={220}
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(81, 150, 244, ${opacity})`,
          style: {
            borderRadius: 16,
          },
        }}
        style={styles.chart}
      />
    </View>
  );

  const renderPieChart = (data: { [key: string]: number }, title: string) => (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>{title}</Text>
      <PieChart
        data={Object.entries(data).map(([name, value], index) => ({
          name,
          value,
          color: `rgba(81, 150, 244, ${1 - index * 0.2})`,
          legendFontColor: '#7F7F7F',
          legendFontSize: 12,
        }))}
        width={screenWidth - 32}
        height={220}
        chartConfig={{
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        accessor="value"
        backgroundColor="transparent"
        paddingLeft="15"
        style={styles.chart}
      />
    </View>
  );

  if (!data) {
    return (
      <View style={styles.container}>
        <Text>Loading analytics data...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.title}>Analytics Dashboard</Text>

      {renderLineChart(data.userEngagement.dailyActiveUsers, 'Daily Active Users')}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Party Distribution</Text>
        {renderPieChart({
          'Household Parties': data.partyMetrics.householdParties,
          'Raiding Parties': data.partyMetrics.raidingParties,
        }, 'Party Types')}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Feature Adoption</Text>
        {renderBarChart(
          Object.entries(data.featureAdoption).reduce(
            (acc, [key, value]) => ({ ...acc, [key]: value.usageCount }),
            {}
          ),
          'Feature Usage'
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Performance Metrics</Text>
        <View style={styles.metricsGrid}>
          {renderMetricCard('Memory Usage', `${data.performanceMetrics.memoryUsage}MB`)}
          {renderMetricCard('CPU Usage', `${data.performanceMetrics.cpuUsage}%`)}
          {renderMetricCard('Frame Rate', `${data.performanceMetrics.frameRate}fps`)}
          {renderMetricCard('Network Latency', `${data.performanceMetrics.networkLatency}ms`)}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>User Engagement</Text>
        <View style={styles.metricsGrid}>
          {renderMetricCard('Avg. Session', `${Math.round(data.userEngagement.sessionDuration / 60)}min`)}
          {renderMetricCard('Party Retention', `${data.partyMetrics.partyRetention}%`)}
          {renderMetricCard('Avg. Party Size', data.partyMetrics.averagePartySize.toFixed(1))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 16,
    color: '#333',
  },
  section: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#444',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  metricTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  metricUnit: {
    fontSize: 16,
    color: '#666',
  },
  chartContainer: {
    marginVertical: 8,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#444',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
}); 