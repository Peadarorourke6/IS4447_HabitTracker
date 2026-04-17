import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import {
    Alert,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Switch,
    Text,
    View,
} from 'react-native';
import { AppContext, useTheme } from './_layout';

export default function ProfileScreen() {
  const router = useRouter();
  const context = useContext(AppContext);
  const [username, setUsername] = useState('');
  const { isDark, bg, card, text, subtext, border } = useTheme();
  const toggleTheme = context?.toggleTheme ?? (() => {});

  useEffect(() => {
    AsyncStorage.getItem('user').then(stored => {
      if (stored) setUsername(JSON.parse(stored).username);
    });
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.setItem('loggedIn', 'false');
    router.replace('/login');
  };

  const handleDeleteProfile = async () => {
    Alert.alert(
      'Delete Profile',
      'Are you sure? This will delete your account and log you out.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('user');
            await AsyncStorage.removeItem('loggedIn');
            router.replace('/login');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
      <View style={[styles.header, { backgroundColor: card, borderBottomColor: border }]}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={[styles.title, { color: text }]}>Profile</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>
            {username ? username[0].toUpperCase() : '?'}
          </Text>
        </View>
        <Text style={[styles.username, { color: text }]}>{username}</Text>
        <Text style={[styles.subtitle, { color: subtext }]}>HabitTracker Member</Text>

        <View style={[styles.settingRow, { backgroundColor: card, borderColor: border }]}>
          <Text style={[styles.settingLabel, { color: text }]}>🌙 Dark Mode</Text>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: '#ddd', true: '#E63946' }}
            thumbColor={'#fff'}
            accessibilityLabel="Toggle dark mode"
          />
        </View>

        <Pressable
          style={[styles.logoutButton, { backgroundColor: card, borderColor: '#E63946' }]}
          onPress={handleLogout}
          accessibilityLabel="Logout"
        >
          <Text style={styles.logoutText}>🚪 Logout</Text>
        </Pressable>

        <Pressable
          style={[styles.deleteButton, { backgroundColor: card, borderColor: border }]}
          onPress={handleDeleteProfile}
          accessibilityLabel="Delete profile"
        >
          <Text style={[styles.deleteText, { color: subtext }]}>🗑️ Delete Profile</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    gap: 16,
  },
  backText: { fontSize: 16, color: '#E63946', fontWeight: '600' },
  title: { fontSize: 22, fontWeight: '800' },
  content: { flex: 1, alignItems: 'center', padding: 40 },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#E63946',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 20,
  },
  avatarText: { fontSize: 36, fontWeight: '800', color: '#fff' },
  username: { fontSize: 24, fontWeight: '800', marginBottom: 4 },
  subtitle: { fontSize: 14, marginBottom: 40 },
  settingRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    marginBottom: 12,
  },
  settingLabel: { fontSize: 16, fontWeight: '600' },
  logoutButton: {
    width: '100%',
    borderWidth: 1.5,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  logoutText: { color: '#E63946', fontWeight: '700', fontSize: 16 },
  deleteButton: {
    width: '100%',
    borderWidth: 1.5,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  deleteText: { fontWeight: '700', fontSize: 16 },
});