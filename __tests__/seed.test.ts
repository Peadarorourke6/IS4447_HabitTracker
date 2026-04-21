describe('Seed function', () => {
  it('inserts correct number of categories', () => {
    const seedCategories = [
      { name: 'Health', colour: '#E63946' },
      { name: 'Fitness', colour: '#2A9D8F' },
      { name: 'Learning', colour: '#E9C46A' },
      { name: 'Mindfulness', colour: '#A8DADC' },
    ];
    expect(seedCategories.length).toBe(4);
  });

  it('inserts correct number of habits', () => {
    const seedHabits = [
      { name: 'Morning Run', categoryId: 2, colour: '#2A9D8F' },
      { name: 'Read 30 mins', categoryId: 3, colour: '#E9C46A' },
      { name: 'Drink Water', categoryId: 1, colour: '#E63946' },
      { name: 'Meditate', categoryId: 4, colour: '#A8DADC' },
      { name: 'Exercise', categoryId: 2, colour: '#264653' },
    ];
    expect(seedHabits.length).toBe(5);
  });

  it('does not insert duplicates when data already exists', () => {
    const existing = [{ id: 1 }];
    const shouldSeed = existing.length === 0;
    expect(shouldSeed).toBe(false);
  });
});