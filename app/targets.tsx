import { db } from '@/db/client';
import { habitLogs, targets } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { useRouter } from 'expo-router';
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
import { AppContext } from './_layout';

type Target = {
  id: number;
  habitId: number;
  type: string;
  goal: number;
};

type Log = {
  id: number;
  habitId: number;
  date: string;
  count: number;
  notes: string | null;
};

export default function TargetsScreen() {
  const context = useContext(AppContext);
  const router = useRouter();
  const [targetList, setTargetList] = useState<Target[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [selectedHabit, setSelectedHabit] = useState<number | null>(null);
  const [goalAmount, setGoalAmount] = useState('');
  const [type, setType] = useState<'weekly' | 'monthly'>('weekly');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const t = await db.select().from(targets);
    const l = await db.select().from(habitLogs);
    setTargetList(t);
    setLogs(l);
  };

  if (!context) return null;
  const { habits } = context;

  const getProgress = (target: Target) => {
    const now = new Date();
    const logs_for_habit = logs.filter(l => l.habitId === target.habitId);
    
    let filtered = logs_for_habit;
    if (target.type === 'weekly') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = logs_for_habit.filter(l => new Date(l.date) >= weekAgo);
    } else {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = logs_for_habit.filter(l => new Date(l.date) >= monthAgo);
    }
    return filtered.reduce((sum, l) => sum + l.count, 0);
  };

  const addTarget = async () => {
    if (!selectedHabit || !goalAmount.trim()) return;
    await db.insert(targets).values({
      habitId: selectedHabit,
      type,
      goal: Number(goalAmount),
    });
    setGoalAmount('');
    setSelectedHabit(null);
    setIsAdding(false);
    loadData();
  };

  const deleteTarget = async (id: number) => {
    Alert.alert('Delete Target', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await db.delete(targets).where(eq(targets.id, id));
          loadData();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Targets</Text>
        <Pressable
          style={styles.addButton}
          onPress={() => setIsAdding(!isAdding)}
        >
          <Text style={styles.addButtonText}>
            {isAdding ? 'Cancel' : '+ Add'}
          </Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {isAdding && (
          <View style={styles.form}>
            <Text style={styles.formLabel}>Select Habit</Text>
            <View style={styles.habitRow}>
              {habits.map(habit => (
                <Pressable
                  key={habit.id}
                  style={[
                    styles.habitButton,
                    { borderColor: habit.colour },
                    selectedHabit === habit.id && {
                      backgroundColor: habit.colour,
                    },
                  ]}
                  onPress={() => setSelectedHabit(habit.id)}
                >
                  <Text
                    style={[
                      styles.habitButtonText,
                      selectedHabit === habit.id && { color: '#fff' },
                    ]}
                  >
                    {habit.name}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.formLabel}>Type</Text>
            <View style={styles.typeRow}>
              <Pressable
                style={[
                  styles.typeButton,
                  type === 'weekly' && styles.typeButtonSelected,
                ]}
                onPress={() => setType('weekly')}
              >
                <Text style={[
                  styles.typeButtonText,
                  type === 'weekly' && styles.typeButtonTextSelected,
                ]}>Weekly</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.typeButton,
                  type === 'monthly' && styles.typeButtonSelected,
                ]}
                onPress={() => setType('monthly')}
              >
                <Text style={[
                  styles.typeButtonText,
                  type === 'monthly' && styles.typeButtonTextSelected,
                ]}>Monthly</Text>
              </Pressable>
            </View>

            <Text style={styles.formLabel}>Goal Amount</Text>
            <TextInput
              placeholder="e.g. 5"
              value={goalAmount}
              onChangeText={setGoalAmount}
              style={styles.input}
              keyboardType="numeric"
              accessibilityLabel="Goal amount"
            />

            <Pressable
              style={[
                styles.saveButton,
                (!selectedHabit || !goalAmount.trim()) && styles.saveButtonDisabled,
              ]}
              onPress={addTarget}
              disabled={!selectedHabit || !goalAmount.trim()}
            >
              <Text style={styles.saveButtonText}>Save Target</Text>
            </Pressable>
          </View>
        )}

        {targetList.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎯</Text>
            <Text style={styles.emptyTitle}>No targets yet!</Text>
            <Text style={styles.emptySubtext}>
              Add a target to track your progress toward your goals.
            </Text>
          </View>
        ) : (
          targetList.map(target => {
            const habit = habits.find(h => h.id === target.habitId);
            const progress = getProgress(target);
            const percentage = Math.min((progress / target.goal) * 100, 100);
            const exceeded = progress >= target.goal;

            return (
              <View key={target.id} style={[
                styles.targetCard,
                { borderLeftColor: habit?.colour || '#E63946' },
              ]}>
                <View style={styles.targetHeader}>
                  <Text style={styles.targetHabit}>{habit?.name}</Text>
                  <Text style={[
                    styles.targetBadge,
                    { backgroundColor: exceeded ? '#2A9D8F' : '#E9C46A' },
                  ]}>
                    {exceeded ? '✓ Met' : 'In Progress'}
                  </Text>
                </View>
                <Text style={styles.targetType}>
                  {target.type === 'weekly' ? '📅 Weekly' : '📆 Monthly'} goal: {target.goal}
                </Text>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${percentage}%`,
                        backgroundColor: habit?.colour || '#E63946',
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {progress} / {target.goal} — {exceeded ? '🎉 Target exceeded!' : `${target.goal - progress} remaining`}
                </Text>
                <Pressable onPress={() => deleteTarget(target.id)}>
                  <Text style={styles.deleteText}>Delete</Text>
                </Pressable>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backText: { fontSize: 16, color: '#E63946', fontWeight: '600' },
  title: { fontSize: 22, fontWeight: '800', color: '#1a1a1a' },
  addButton: {
    backgroundColor: '#E63946',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: { color: '#fff', fontWeight: '700' },
  form: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
    marginTop: 12,
  },
  habitRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  habitButton: {
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  habitButtonText: { fontSize: 13, fontWeight: '600', color: '#1a1a1a' },
  typeRow: { flexDirection: 'row', gap: 10 },
  typeButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
  },
  typeButtonSelected: { backgroundColor: '#E63946', borderColor: '#E63946' },
  typeButtonText: { fontWeight: '600', color: '#1a1a1a' },
  typeButtonTextSelected: { color: '#fff' },
  input: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
  },
  saveButton: {
    backgroundColor: '#E63946',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonDisabled: { backgroundColor: '#ccc' },
  saveButtonText: { color: '#fff', fontWeight: '700' },
  targetCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 5,
    elevation: 2,
  },
  targetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  targetHabit: { fontSize: 17, fontWeight: '700', color: '#1a1a1a' },
  targetBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    overflow: 'hidden',
  },
  targetType: { fontSize: 13, color: '#666', marginBottom: 10 },
  progressTrack: {
    height: 12,
    backgroundColor: '#eee',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: { height: '100%', borderRadius: 6 },
  progressText: { fontSize: 13, color: '#666', marginBottom: 8 },
  deleteText: { color: '#E63946', fontWeight: '600', fontSize: 13 },
  emptyState: { alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 60, marginBottom: 16 },
  emptyTitle: { fontSize: 22, fontWeight: '800', color: '#1a1a1a', marginBottom: 8 },
  emptySubtext: { fontSize: 15, color: '#666', textAlign: 'center', lineHeight: 22 },
});