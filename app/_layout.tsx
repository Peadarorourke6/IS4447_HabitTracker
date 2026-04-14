import { db } from '@/db/client';
import { categories, habits } from '@/db/schema';
import { seedIfEmpty } from '@/db/seed';
import { Stack } from 'expo-router';
import { createContext, useEffect, useState } from 'react';

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
};

export const AppContext = createContext<AppContextType | null>(null);

export default function RootLayout() {
  const [habitList, setHabitList] = useState<Habit[]>([]);
  const [categoryList, setCategoryList] = useState<Category[]>([]);

  useEffect(() => {
    async function init() {
      await seedIfEmpty();
      const h = await db.select().from(habits);
      const c = await db.select().from(categories);
      setHabitList(h);
      setCategoryList(c);
    }
    init();
  }, []);

  return (
    <AppContext.Provider value={{
      habits: habitList,
      setHabits: setHabitList,
      categories: categoryList,
      setCategories: setCategoryList,
    }}>
      <Stack />
    </AppContext.Provider>
  );
}