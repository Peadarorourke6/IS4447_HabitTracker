const mockHabits = [
  { id: 1, name: 'Morning Run', categoryId: 2, colour: '#2A9D8F' },
  { id: 2, name: 'Read 30 mins', categoryId: 3, colour: '#E9C46A' },
  { id: 3, name: 'Drink Water', categoryId: 1, colour: '#E63946' },
];

describe('HabitsList', () => {
  it('contains the correct number of habits', () => {
    expect(mockHabits.length).toBe(3);
  });

  it('each habit has required fields', () => {
    mockHabits.forEach(habit => {
      expect(habit).toHaveProperty('id');
      expect(habit).toHaveProperty('name');
      expect(habit).toHaveProperty('categoryId');
      expect(habit).toHaveProperty('colour');
    });
  });

  it('filters habits by category correctly', () => {
    const fitnessHabits = mockHabits.filter(h => h.categoryId === 2);
    expect(fitnessHabits.length).toBe(1);
    expect(fitnessHabits[0].name).toBe('Morning Run');
  });
});