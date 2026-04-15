import { db } from '@/db/client';
import { habits } from '@/db/schema';
import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
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

const COLOURS = [
  '#E63946', '#2A9D8F', '#E9C46A', '#A8DADC',
  '#264653', '#F4A261', '#6A0572', '#4CAF50',
];

export default function AddHabitScreen() {
  const context = useContext(AppContext);
  const router = useRouter();
  const [name, setName] = useState('');
  const [selectedColour, setSelectedColour] = useState('#E63946');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  if (!context) return null;
  const { categories, setHabits } = context;

  const saveHabit = async () => {
    if (!name.trim()) return;
    if (!selectedCategory) {
      Alert.alert('Please select a category');
      return;
    }
    await db.insert(habits).values({
      name,
      categoryId: selectedCategory,
      colour: selectedColour,
    });
    const updated = await db.select().from(habits);
    setHabits(updated);
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Add Habit</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.label}>Habit Name</Text>
        <TextInput
          placeholder="e.g. Morning Run"
          value={name}
          onChangeText={setName}
          style={styles.input}
          accessibilityLabel="Habit name"
        />

        <Text style={styles.label}>Category</Text>
        {categories.length === 0 ? (
          <Text style={styles.noCategoryText}>
            No categories yet — add one in the Categories tab first!
          </Text>
        ) : (
          <View style={styles.categoryRow}>
            {categories.map(cat => (
              <Pressable
                key={cat.id}
                style={[
                  styles.categoryButton,
                  { borderColor: cat.colour },
                  selectedCategory === cat.id && {
                    backgroundColor: cat.colour,
                  },
                ]}
                onPress={() => setSelectedCategory(cat.id)}
                accessibilityLabel={`Select category ${cat.name}`}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    selectedCategory === cat.id && { color: '#fff' },
                  ]}
                >
                  {cat.name}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        <Text style={styles.label}>Colour</Text>
        <View style={styles.colourRow}>
          {COLOURS.map(colour => (
            <Pressable
              key={colour}
              style={[
                styles.colourDot,
                { backgroundColor: colour },
                selectedColour === colour && styles.colourDotSelected,
              ]}
              onPress={() => setSelectedColour(colour)}
              accessibilityLabel={`Select colour ${colour}`}
            />
          ))}
        </View>

        <Pressable
          style={[
            styles.saveButton,
            (!name.trim() || !selectedCategory) && styles.saveButtonDisabled,
          ]}
          onPress={saveHabit}
          disabled={!name.trim() || !selectedCategory}
        >
          <Text style={styles.saveButtonText}>Save Habit</Text>
        </Pressable>

        <Pressable style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    gap: 16,
  },
  backText: { fontSize: 16, color: '#E63946', fontWeight: '600' },
  title: { fontSize: 22, fontWeight: '800', color: '#1a1a1a' },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
  },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  categoryButton: {
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  categoryButtonText: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
  noCategoryText: { color: '#E63946', fontSize: 14 },
  colourRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  colourDot: { width: 36, height: 36, borderRadius: 18 },
  colourDotSelected: { borderWidth: 3, borderColor: '#1a1a1a' },
  saveButton: {
    backgroundColor: '#E63946',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonDisabled: { backgroundColor: '#ccc' },
  saveButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  cancelButton: {
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelButtonText: { color: '#666', fontSize: 16 },
});