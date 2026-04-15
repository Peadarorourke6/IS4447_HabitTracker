import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#E63946',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#eee',
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Habits',
          tabBarIcon: ({ color }) => <TabIcon color={color} icon="🏃" />,
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: 'Categories',
          tabBarIcon: ({ color }) => <TabIcon color={color} icon="🏷️" />,
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: 'Insights',
          tabBarIcon: ({ color }) => <TabIcon color={color} icon="📊" />,
        }}
      />
      <Tabs.Screen
  name="explore"
  options={{
    href: null,
  }}
/>
    </Tabs>
  );
}

function TabIcon({ color, icon }: { color: string; icon: string }) {
  return <Text style={{ fontSize: 20 }}>{icon}</Text>;
}
