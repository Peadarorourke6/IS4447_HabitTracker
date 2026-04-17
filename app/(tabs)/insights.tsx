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

function calculateStreak(logs: Log[]): number {
  if (logs.length === 0) return 0;
  const dates = [...new Set(logs.map(l => l.date))].sort().reverse();
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  if (dates[0] !== today && dates[0] !== yesterday) return 0;
  let streak = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diff = (prev.getTime() - curr.getTime()) / 86400000;
    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export default function InsightsScreen() {
  const context = useContext(AppContext);
  const [logs, setLogs] = useState<Log[]>([]);
  const [view, setView] = useState<'weekly' | 'monthly' | 'all'>('weekly');

  useEffect(() => {
    async function loadLogs() {
      const rows = await db.select().from(habitLogs);
      setLogs(rows);
    }
    loadLogs();
  }, []);

  if (!context) return null;
  const { habits } = context;

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString().split('T')[0];
  const monthAgo = new Date(now.getTime() - 30 * 86400000).toISOString().split('T')[0];

  const filteredLogs = logs.filter(l => {
    if (view === 'weekly') return l.date >= weekAgo;
    if (view === 'monthly') return l.date >= monthAgo;
    return true;
  });

  const totalLogs = filteredLogs.length;
  const totalCount = filteredLogs.reduce((sum, l) => sum + l.count, 0);

  const habitCounts = habits.map(habit => ({
    ...habit,
    total: filteredLogs
      .filter(l => l.habitId === habit.id)
      .reduce((sum, l) => sum + l.count, 0),
    streak: calculateStreak(logs.filter(l => l.habitId === habit.id)),
  }));

  const maxCount = Math.max(...habitCounts.map(h => h.total), 1);
  const bestStreak = Math.max(...habitCounts.map(h => h.streak), 0);
  const topStreakHabit = habitCounts.find(h => h.streak === bestStreak);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Insights</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>

        <View style={styles.viewToggle}>
          {(['weekly', 'monthly', 'all'] as const).map(v => (
            <Pressable
              key={v}
              style={[styles.toggleBtn, view === v && styles.toggleBtnActive]}
              onPress={() => setView(v)}
              accessibilityLabel={`View ${v} insights`}
            >
              <Text style={[styles.toggleBtnText, view === v && styles.toggleBtnTextActive]}>
                {v === 'weekly' ? 'This Week' : v === 'monthly' ? 'This Month' : 'All Time'}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{habits.length}</Text>
            <Text style={styles.statLabel}>Habits</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalLogs}</Text>
            <Text style={styles.statLabel}>Logs</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalCount}</Text>
            <Text style={styles.statLabel}>Total Count</Text>
          </View>
        </View>

        {bestStreak > 0 && topStreakHabit && (
          <View style={[styles.streakBanner, { borderLeftColor: topStreakHabit.colour }]}>
            <Text style={styles.streakFire}>🔥</Text>
            <View style={styles.streakContent}>
              <Text style={styles.streakTitle}>Best Streak</Text>
              <Text style={styles.streakHabit}>{topStreakHabit.name}</Text>
              <Text style={styles.streakDays}>{bestStreak} day{bestStreak !== 1 ? 's' : ''} in a row!</Text>
            </View>
          </View>
        )}

        <Text style={styles.sectionTitle}>Streaks</Text>
        {habitCounts.map(habit => (
          <View key={habit.id} style={styles.streakRow}>
            <View style={[styles.streakDot, { backgroundColor: habit.colour }]} />
            <Text style={styles.streakName}>{habit.name}</Text>
            <View style={styles.streakBadge}>
              <Text style={styles.streakBadgeText}>
                🔥 {habit.streak} day{habit.streak !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Activity by Habit</Text>

        {habitCounts.every(h => h.total === 0) ? (
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

import { Pressable } from 'react-native';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: { fontSize: 28, fontWeight: '800', color: '#1a1a1a' },
  viewToggle: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  toggleBtnActive: { backgroundColor: '#E63946', borderColor: '#E63946' },
  toggleBtnText: { fontSize: 12, fontWeight: '600', color: '#666' },
  toggleBtnTextActive: { color: '#fff' },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 12,
    padding: 16, alignItems: 'center', elevation: 2,
  },
  statNumber: { fontSize: 28, fontWeight: '800', color: '#E63946' },
  statLabel: { fontSize: 12, color: '#666', marginTop: 4, textAlign: 'center' },
  streakBanner: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderLeftWidth: 5,
    elevation: 2,
  },
  streakFire: { fontSize: 36, marginRight: 12 },
  streakContent: { flex: 1 },
  streakTitle: { fontSize: 12, fontWeight: '600', color: '#666', marginBottom: 2 },
  streakHabit: { fontSize: 17, fontWeight: '800', color: '#1a1a1a' },
  streakDays: { fontSize: 13, color: '#E63946', fontWeight: '700', marginTop: 2 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a', marginBottom: 12, marginTop: 8 },
  streakRow: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 1,
  },
  streakDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  streakName: { flex: 1, fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
  streakBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  streakBadgeText: { fontSize: 12, fontWeight: '700', color: '#E65100' },
  barRow: { marginBottom: 16 },
  barLabel: { fontSize: 14, fontWeight: '600', color: '#1a1a1a', marginBottom: 6 },
  barTrack: { height: 20, backgroundColor: '#eee', borderRadius: 10, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 10 },
  barCount: { fontSize: 12, color: '#666', marginTop: 4 },
  emptyState: { alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 60, marginBottom: 16 },
  emptyTitle: { fontSize: 22, fontWeight: '800', color: '#1a1a1a', marginBottom: 8 },
  emptySubtext: { fontSize: 15, color: '#666', textAlign: 'center', lineHeight: 22 },
});