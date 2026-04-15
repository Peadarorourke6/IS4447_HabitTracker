import { db } from '@/db/client';
import { habitLogs } from '@/db/schema';
import { useContext, useEffect, useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { AppContext } from '../_layout';

type Log = {
  id: number;
  habitId: number;
  date: string;
  count: number;
  notes: string | null;
};

export default function InsightsScreen() {
  const context = useContext(AppContext);
  const [logs, setLogs] = useState<Log[]>([]);

  useEffect(() => {
    async function loadLogs() {
      const rows = await db.select().from(habitLogs);
      setLogs(rows);
    }
    loadLogs();
  }, []);

  if (!context) return null;
  const { habits, categories } = context;

  const totalLogs = logs.length;
  const totalCount = logs.reduce((sum, l) => sum + l.count, 0);

  const habitCounts = habits.map(habit => ({
    ...habit,
    total: logs
      .filter(l => l.habitId === habit.id)
      .reduce((sum, l) => sum + l.count, 0),
  }));

  const maxCount = Math.max(...habitCounts.map(h => h.total), 1);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Insights</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{habits.length}</Text>
            <Text style={styles.statLabel}>Total Habits</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalLogs}</Text>
            <Text style={styles.statLabel}>Total Logs</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalCount}</Text>
            <Text style={styles.statLabel}>Total Count</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Activity by Habit</Text>

        {habitCounts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyTitle}>No data yet!</Text>
            <Text style={styles.emptySubtext}>
              Start logging habits to see your insights here.
            </Text>
          </View>
        ) : (
          habitCounts.map(habit => (
            <View key={habit.id} style={styles.barRow}>
              <Text style={styles.barLabel}>{habit.name}</Text>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${(habit.total / maxCount) * 100}%`,
                      backgroundColor: habit.colour,
                    },
                  ]}
                />
              </View>
              <Text style={styles.barCount}>{habit.total}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: { fontSize: 28, fontWeight: '800', color: '#1a1a1a' },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: '#E63946',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  barRow: {
    marginBottom: 16,
  },
  barLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  barTrack: {
    height: 20,
    backgroundColor: '#eee',
    borderRadius: 10,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 10,
  },
  barCount: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: { fontSize: 60, marginBottom: 16 },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
});