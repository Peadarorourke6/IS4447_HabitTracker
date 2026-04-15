import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import {
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { AppContext } from '../_layout';

export default function HabitsScreen() {
  const context = useContext(AppContext);
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  if (!context) return null;
  const { habits, categories } = context;

  const getCategoryName = (categoryId: number) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat ? cat.name : 'Uncategorised';
  };

  const filtered = habits.filter(h => {
    const matchesSearch = h.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === null || h.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Habits</Text>
        <View style={styles.headerButtons}>
          <Pressable
            style={styles.profileButton}
            onPress={() => router.push('/profile')}
            accessibilityLabel="View profile"
          >
            <Text style={styles.profileButtonText}>👤</Text>
          </Pressable>
          <Pressable
            style={styles.targetsButton}
            onPress={() => router.push('/targets')}
            accessibilityLabel="View targets"
          >
            <Text style={styles.targetsButtonText}>🎯 Targets</Text>
          </Pressable>
          <Pressable
            style={styles.addButton}
            onPress={() => router.push('/add-habit')}
            accessibilityLabel="Add new habit"
          >
            <Text style={styles.addButtonText}>+ Add</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.searchBar}>
        <TextInput
          placeholder="🔍  Search habits..."
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
          accessibilityLabel="Search habits"
        />
      </View>

      <View style={styles.filterRow}>
        <Pressable
          style={[styles.filterChip, selectedCategory === null && styles.filterChipActive]}
          onPress={() => setSelectedCategory(null)}
        >
          <Text style={[styles.filterChipText, selectedCategory === null && styles.filterChipTextActive]}>
            All
          </Text>
        </Pressable>
        {categories.map(cat => (
          <Pressable
            key={cat.id}
            style={[
              styles.filterChip,
              selectedCategory === cat.id && { backgroundColor: cat.colour, borderColor: cat.colour },
            ]}
            onPress={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
            accessibilityLabel={`Filter by ${cat.name}`}
          >
            <Text style={[
              styles.filterChipText,
              selectedCategory === cat.id && styles.filterChipTextActive,
            ]}>
              {cat.name}
            </Text>
          </Pressable>
        ))}
      </View>

      {filtered.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>{habits.length === 0 ? '🌱' : '🔍'}</Text>
          <Text style={styles.emptyTitle}>
            {habits.length === 0 ? 'No habits yet!' : 'No results found'}
          </Text>
          <Text style={styles.emptySubtext}>
            {habits.length === 0
              ? 'Tap "+ Add" to create your first habit and start tracking.'
              : 'Try a different search or category filter.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [
                styles.card,
                { borderLeftColor: item.colour },
                pressed && styles.cardPressed,
              ]}
              onPress={() => router.push(`/habit/${item.id}`)}
              accessibilityLabel={`${item.name}, ${getCategoryName(item.categoryId)}, tap to view details`}
              accessibilityRole="button"
            >
              <View style={[styles.colourDot, { backgroundColor: item.colour }]} />
              <View style={styles.cardContent}>
                <Text style={styles.habitName}>{item.name}</Text>
                <Text style={styles.categoryName}>
                  {getCategoryName(item.categoryId)}
                </Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: { fontSize: 28, fontWeight: '800', color: '#1a1a1a' },
  headerButtons: { flexDirection: 'row', gap: 8 },
  profileButton: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#E63946',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  profileButtonText: { fontSize: 16 },
  targetsButton: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#E63946',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  targetsButtonText: { color: '#E63946', fontWeight: '700', fontSize: 13 },
  addButton: {
    backgroundColor: '#E63946',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  searchBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#fff',
  },
  searchInput: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 10,
    fontSize: 15,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  filterChipActive: { backgroundColor: '#E63946', borderColor: '#E63946' },
  filterChipText: { fontSize: 13, fontWeight: '600', color: '#666' },
  filterChipTextActive: { color: '#fff' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 5,
    elevation: 2,
  },
  cardPressed: { opacity: 0.85 },
  colourDot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  cardContent: { flex: 1 },
  habitName: { fontSize: 17, fontWeight: '700', color: '#1a1a1a' },
  categoryName: { fontSize: 13, color: '#666', marginTop: 3 },
  arrow: { fontSize: 22, color: '#ccc' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 60, marginBottom: 16 },
  emptyTitle: { fontSize: 22, fontWeight: '800', color: '#1a1a1a', marginBottom: 8 },
  emptySubtext: { fontSize: 15, color: '#666', textAlign: 'center', lineHeight: 22 },
});