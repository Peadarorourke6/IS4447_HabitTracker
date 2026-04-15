import { db } from '@/db/client';
import { categories } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { useContext, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { AppContext } from '../_layout';

const COLOURS = [
  '#E63946', '#2A9D8F', '#E9C46A', '#A8DADC',
  '#264653', '#F4A261', '#6A0572', '#4CAF50',
];

export default function CategoriesScreen() {
  const context = useContext(AppContext);
  const [name, setName] = useState('');
  const [selectedColour, setSelectedColour] = useState('#E63946');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editColour, setEditColour] = useState('#E63946');

  if (!context) return null;
  const { categories: categoryList, setCategories } = context;

  const addCategory = async () => {
    if (!name.trim()) return;
    await db.insert(categories).values({ name, colour: selectedColour });
    const updated = await db.select().from(categories);
    setCategories(updated);
    setName('');
    setIsAdding(false);
  };

  const startEditing = (item: { id: number; name: string; colour: string }) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditColour(item.colour);
  };

  const saveEdit = async () => {
    if (!editName.trim() || editingId === null) return;
    await db.update(categories)
      .set({ name: editName, colour: editColour })
      .where(eq(categories.id, editingId));
    const updated = await db.select().from(categories);
    setCategories(updated);
    setEditingId(null);
  };

  const deleteCategory = async (id: number) => {
    Alert.alert('Delete Category', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await db.delete(categories).where(eq(categories.id, id));
          const updated = await db.select().from(categories);
          setCategories(updated);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Categories</Text>
        <Pressable
          style={styles.addButton}
          onPress={() => { setIsAdding(!isAdding); setEditingId(null); }}
        >
          <Text style={styles.addButtonText}>
            {isAdding ? 'Cancel' : '+ Add'}
          </Text>
        </Pressable>
      </View>

      {isAdding && (
        <View style={styles.form}>
          <TextInput
            placeholder="Category name"
            value={name}
            onChangeText={setName}
            style={styles.input}
            accessibilityLabel="Category name"
          />
          <Text style={styles.colourLabel}>Pick a colour:</Text>
          <View style={styles.colourRow}>
            {COLOURS.map((colour) => (
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
            style={[styles.saveButton, !name.trim() && styles.saveButtonDisabled]}
            onPress={addCategory}
            disabled={!name.trim()}
          >
            <Text style={styles.saveButtonText}>Save Category</Text>
          </Pressable>
        </View>
      )}

      {categoryList.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🏷️</Text>
          <Text style={styles.emptyTitle}>No categories yet!</Text>
          <Text style={styles.emptySubtext}>
            Add a category to organise your habits.
          </Text>
        </View>
      ) : (
        <FlatList
          data={categoryList}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View>
              <View style={styles.card}>
                <View style={[styles.dot, { backgroundColor: item.colour }]} />
                <Text style={styles.categoryName}>{item.name}</Text>
                <Pressable
                  onPress={() => startEditing(item)}
                  accessibilityLabel={`Edit ${item.name} category`}
                  style={styles.editBtn}
                >
                  <Text style={styles.editText}>Edit</Text>
                </Pressable>
                <Pressable
                  onPress={() => deleteCategory(item.id)}
                  accessibilityLabel={`Delete ${item.name} category`}
                >
                  <Text style={styles.deleteText}>Delete</Text>
                </Pressable>
              </View>

              {editingId === item.id && (
                <View style={styles.editForm}>
                  <TextInput
                    value={editName}
                    onChangeText={setEditName}
                    style={styles.input}
                    accessibilityLabel="Edit category name"
                  />
                  <Text style={styles.colourLabel}>Pick a colour:</Text>
                  <View style={styles.colourRow}>
                    {COLOURS.map((colour) => (
                      <Pressable
                        key={colour}
                        style={[
                          styles.colourDot,
                          { backgroundColor: colour },
                          editColour === colour && styles.colourDotSelected,
                        ]}
                        onPress={() => setEditColour(colour)}
                        accessibilityLabel={`Select colour ${colour}`}
                      />
                    ))}
                  </View>
                  <View style={styles.editButtons}>
                    <Pressable
                      style={[styles.saveButton, !editName.trim() && styles.saveButtonDisabled]}
                      onPress={saveEdit}
                      disabled={!editName.trim()}
                    >
                      <Text style={styles.saveButtonText}>Save</Text>
                    </Pressable>
                    <Pressable
                      style={styles.cancelButton}
                      onPress={() => setEditingId(null)}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </Pressable>
                  </View>
                </View>
              )}
            </View>
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
  addButton: {
    backgroundColor: '#E63946',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  form: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  editForm: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
    borderRadius: 10,
    elevation: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    marginBottom: 12,
  },
  colourLabel: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
  colourRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
  colourDot: { width: 36, height: 36, borderRadius: 18 },
  colourDotSelected: { borderWidth: 3, borderColor: '#1a1a1a' },
  saveButton: {
    flex: 1,
    backgroundColor: '#E63946',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonDisabled: { backgroundColor: '#ccc' },
  saveButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButtonText: { color: '#666', fontWeight: '600' },
  editButtons: { flexDirection: 'row', gap: 10 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },
  dot: { width: 16, height: 16, borderRadius: 8, marginRight: 12 },
  categoryName: { flex: 1, fontSize: 16, fontWeight: '600', color: '#1a1a1a' },
  editBtn: { marginRight: 12 },
  editText: { color: '#2A9D8F', fontWeight: '600' },
  deleteText: { color: '#E63946', fontWeight: '600' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 60, marginBottom: 16 },
  emptyTitle: { fontSize: 22, fontWeight: '800', color: '#1a1a1a', marginBottom: 8 },
  emptySubtext: { fontSize: 15, color: '#666', textAlign: 'center', lineHeight: 22 },
});