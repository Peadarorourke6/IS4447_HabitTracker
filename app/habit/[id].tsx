import { db } from '@/db/client';
import { habitLogs, habits } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import {
    Alert,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
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

export default function HabitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const context = useContext(AppContext);
  const [logs, setLogs] = useState<Log[]>([]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    const rows = await db
      .select()
      .from(habitLogs)
      .where(eq(habitLogs.habitId, Number(id)));
    setLogs(rows);
  };

  if (!context) return null;
  const { habits: habitList, categories, setHabits } = context;
  const habit = habitList.find(h => h.id === Number(id));
  if (!habit) return null;

  const category = categories.find(c => c.id === habit.categoryId);

  const logToday = async () => {
    const today = new Date().toISOString().split('T')[0];
    await db.insert(habitLogs).values({
      habitId: Number(id),
      date: today,
      count: 1,
      notes: notes || null,
    });
    setNotes('');
    loadLogs();
  };

  const deleteHabit = async () => {
    Alert.alert('Delete Habit', 'Are you sure? This will delete all logs too.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await db.delete(habitLogs).where(eq(habitLogs.habitId, Number(id)));
          await db.delete(habits).where(eq(habits.id, Number(id)));
          const updated = await db.select().from(habits);
          setHabits(updated);
          router.back();
        },
      },
    ]);
  };

  const totalCount = logs.reduce((sum, l) => sum + l.count, 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { borderBottomColor: habit.colour }]}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <View style={styles.headerRight}>
          <View style={[styles.colourDot, { backgroundColor: habit.colour }]} />
          <Text style={styles.title}>{habit.name}</Text>
        </View>
        <Text style={styles.categoryText}>{category?.name}</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{logs.length}</Text>
            <Text style={styles.statLabel}>Total Logs</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalCount}</Text>
            <Text style={styles.statLabel}>Total Count</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Log Today</Text>
        <TextInput
          placeholder="Notes (optional)"
          value={notes}
          onChangeText={setNotes}
          style={styles.input}
          accessibilityLabel="Log notes"
        />
        <Pressable
          style={[styles.logButton, { backgroundColor: habit.colour }]}
          onPress={logToday}
          accessibilityLabel="Log habit for today"
        >
          <Text style={styles.logButtonText}>✓ Log Today</Text>
        </Pressable>

        <Text style={styles.sectionTitle}>History</Text>
        {logs.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={styles.emptyTitle}>No logs yet!</Text>
            <Text style={styles.emptySubtext}>
              Tap "Log Today" to record your first entry.
            </Text>
          </View>
        ) : (
          logs.map(log => (
            <View key={log.id} style={styles.logCard}>
              <View style={[styles.logDot, { backgroundColor: habit.colour }]} />
              <View style={styles.logContent}>
                <Text style={styles.logDate}>{log.date}</Text>
                {log.notes && (
                  <Text style={styles.logNotes}>{log.notes}</Text>
                )}
              </View>
              <Text style={styles.logCount}>×{log.count}</Text>
            </View>
          ))
        )}

        <Pressable style={styles.deleteButton} onPress={deleteHabit}>
          <Text style={styles.deleteButtonText}>Delete Habit</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 3,
  },
  backText: { fontSize: 16, color: '#E63946', fontWeight: '600', marginBottom: 8 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  colourDot: { width: 16, height: 16, borderRadius: 8 },
  title: { fontSize: 24, fontWeight: '800', color: '#1a1a1a' },
  categoryText: { fontSize: 14, color: '#666', marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
  },
  statNumber: { fontSize: 28, fontWeight: '800', color: '#E63946' },
  statLabel: { fontSize: 12, color: '#666', marginTop: 4 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    marginBottom: 10,
  },
  logButton: {
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 24,
  },
  logButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  logCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 1,
  },
  logDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  logContent: { flex: 1 },
  logDate: { fontSize: 15, fontWeight: '600', color: '#1a1a1a' },
  logNotes: { fontSize: 13, color: '#666', marginTop: 2 },
  logCount: { fontSize: 16, fontWeight: '700', color: '#666' },
  emptyState: { alignItems: 'center', padding: 30 },
  emptyIcon: { fontSize: 50, marginBottom: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#1a1a1a', marginBottom: 6 },
  emptySubtext: { fontSize: 14, color: '#666', textAlign: 'center' },
  deleteButton: {
    marginTop: 24,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E63946',
  },
  deleteButtonText: { color: '#E63946', fontWeight: '700', fontSize: 16 },
});