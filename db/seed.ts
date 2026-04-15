import { db } from './client';
import { categories, habitLogs, habits, targets } from './schema';

export async function seedIfEmpty() {
  const existing = await db.select().from(habits);
  if (existing.length > 0) return;

  await db.insert(categories).values([
    { name: 'Health', colour: '#E63946' },
    { name: 'Fitness', colour: '#2A9D8F' },
    { name: 'Learning', colour: '#E9C46A' },
    { name: 'Mindfulness', colour: '#A8DADC' },
  ]);

  await db.insert(habits).values([
    { name: 'Morning Run', categoryId: 2, colour: '#2A9D8F' },
    { name: 'Read 30 mins', categoryId: 3, colour: '#E9C46A' },
    { name: 'Drink Water', categoryId: 1, colour: '#E63946' },
    { name: 'Meditate', categoryId: 4, colour: '#A8DADC' },
    { name: 'Exercise', categoryId: 2, colour: '#264653' },
  ]);

  await db.insert(habitLogs).values([
    { habitId: 1, date: '2026-04-07', count: 1, notes: 'Felt great!' },
    { habitId: 1, date: '2026-04-08', count: 1, notes: null },
    { habitId: 1, date: '2026-04-09', count: 1, notes: null },
    { habitId: 2, date: '2026-04-07', count: 1, notes: 'Read React Native docs' },
    { habitId: 2, date: '2026-04-08', count: 1, notes: null },
    { habitId: 3, date: '2026-04-07', count: 8, notes: '8 glasses' },
    { habitId: 3, date: '2026-04-08', count: 6, notes: null },
    { habitId: 4, date: '2026-04-07', count: 1, notes: '10 mins' },
    { habitId: 5, date: '2026-04-09', count: 1, notes: null },
  ]);

  await db.insert(targets).values([
    { habitId: 1, type: 'weekly', goal: 5 },
    { habitId: 2, type: 'daily', goal: 1 },
    { habitId: 3, type: 'daily', goal: 8 },
    { habitId: 4, type: 'weekly', goal: 7 },
    { habitId: 5, type: 'weekly', goal: 3 },
  ]);
}