import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Please fill in all fields');
      return;
    }
    const stored = await AsyncStorage.getItem('user');
    if (!stored) {
      Alert.alert('No account found', 'Please register first');
      return;
    }
    const user = JSON.parse(stored);
    if (user.username === username && user.password === password) {
      await AsyncStorage.setItem('loggedIn', 'true');
      router.replace('/(tabs)');
    } else {
      Alert.alert('Incorrect username or password');
    }
  };

  const handleRegister = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Please fill in all fields');
      return;
    }
    const existing = await AsyncStorage.getItem('user');
    if (existing) {
      Alert.alert('Account already exists', 'Please login instead');
      setIsRegistering(false);
      return;
    }
    await AsyncStorage.setItem('user', JSON.stringify({ username, password }));
    await AsyncStorage.setItem('loggedIn', 'true');
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>🏃</Text>
        <Text style={styles.appName}>HabitTracker</Text>
        <Text style={styles.tagline}>Build better habits, one day at a time</Text>

        <Text style={styles.label}>Username</Text>
        <TextInput
          placeholder="Enter username"
          value={username}
          onChangeText={setUsername}
          style={styles.input}
          accessibilityLabel="Username"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          placeholder="Enter password"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          accessibilityLabel="Password"
          secureTextEntry
        />

        <Pressable
          style={[
            styles.button,
            (!username.trim() || !password.trim()) && styles.buttonDisabled,
          ]}
          onPress={isRegistering ? handleRegister : handleLogin}
          disabled={!username.trim() || !password.trim()}
        >
          <Text style={styles.buttonText}>
            {isRegistering ? 'Create Account' : 'Login'}
          </Text>
        </Pressable>

        <Pressable
          style={styles.switchButton}
          onPress={() => setIsRegistering(!isRegistering)}
        >
          <Text style={styles.switchText}>
            {isRegistering
              ? 'Already have an account? Login'
              : "Don't have an account? Register"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  content: { flex: 1, padding: 24, justifyContent: 'center' },
  logo: { fontSize: 60, textAlign: 'center', marginBottom: 8 },
  appName: { fontSize: 32, fontWeight: '800', color: '#1a1a1a', textAlign: 'center', marginBottom: 8 },
  tagline: { fontSize: 15, color: '#666', textAlign: 'center', marginBottom: 40 },
  label: { fontSize: 15, fontWeight: '700', color: '#1a1a1a', marginBottom: 8, marginTop: 16 },
  input: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#CBD5E1',
    borderRadius: 10, padding: 14, fontSize: 15,
  },
  button: { backgroundColor: '#E63946', padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 24 },
  buttonDisabled: { backgroundColor: '#ccc' },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  switchButton: { marginTop: 16, alignItems: 'center' },
  switchText: { color: '#E63946', fontSize: 14, fontWeight: '600' },
});
