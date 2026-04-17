import { db } from '@/db/client';
import { categories, habits } from '@/db/schema';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack } from 'expo-router';
import { createContext, useContext, useEffect, useState } from 'react';

export type Habit = {
  id: number;
  name: string;
  categoryId: number;
  colour: string;
};

export type Category = {
  id: number;
  name: string;
  colour: string;
};

type AppContextType = {
  habits: Habit[];
  setHabits: (habits: Habit[]) => void;
  categories: Category[];
  setCategories: (categories: Category[]) => void;
  isDark: boolean;
  toggleTheme: () => void;
};

export const AppContext = createContext<AppContextType | null>(null);

export function useTheme() {
  const context = useContext(AppContext);
  const isDark = context?.isDark ?? false;
  return {
    isDark,
    bg: isDark ? '#1a1a2e' : '#F8F9FA',
    card: isDark ? '#16213e' : '#fff',
    text: isDark ? '#fff' : '#1a1a1a',
    subtext: isDark ? '#aaa' : '#666',
    border: isDark ? '#333' : '#eee',
    input: isDark ? '#0f3460' : '#F8F9FA',
  };
}

async function seedIfEmpty(db: any) {
  const { categories: cats, habits: habs, habitLogs, targets } = await import('@/db/schema');
  const existing = await db.select().from(habs);
  if (existing.length > 0) return;

  await db.insert(cats).values([
    { name: 'Health', colour: '#E63946' },
    { name: 'Fitness', colour: '#2A9D8F' },
    { name: 'Learning', colour: '#E9C46A' },
    { name: 'Mindfulness', colour: '#A8DADC' },
  ]);

  await db.insert(habs).values([
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
    { habitId: 2, type: 'weekly', goal: 3 },
    { habitId: 3, type: 'weekly', goal: 7 },
    { habitId: 4, type: 'weekly', goal: 7 },
    { habitId: 5, type: 'weekly', goal: 3 },
  ]);
}

export default function RootLayout() {
  const [habitList, setHabitList] = useState<Habit[]>([]);
  const [categoryList, setCategoryList] = useState<Category[]>([]);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        await seedIfEmpty(db);
        const h = await db.select().from(habits);
        const c = await db.select().from(categories);
        setHabitList(h);
        setCategoryList(c);
        const savedTheme = await AsyncStorage.getItem('theme');
        if (savedTheme === 'dark') setIsDark(true);
      } catch (e) {
        console.log('Init error:', e);
      }
    }
    init();
  }, []);

  const toggleTheme = async () => {
    const newVal = !isDark;
    setIsDark(newVal);
    await AsyncStorage.setItem('theme', newVal ? 'dark' : 'light');
  };

  return (
    <AppContext.Provider value={{
      habits: habitList,
      setHabits: setHabitList,
      categories: categoryList,
      setCategories: setCategoryList,
      isDark,
      toggleTheme,
    }}>
      <Stack screenOptions={{ headerShown: false }} />
    </AppContext.Provider>
  );
}