import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import { Pressable } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Sign Out',
          tabBarIcon: ({ color }) => <TabBarIcon name="circle" color={color} />,
          headerRight: () => (
            <Link href="/modal" asChild>
              <Pressable>
                {({ pressed }) => (
                  <FontAwesome
                    name="info-circle"
                    size={25}
                    color={Colors[colorScheme ?? 'light'].text}
                    style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="swipeTab"
        options={{
          title: 'Swipe',
          tabBarIcon: ({ color }) => <TabBarIcon name="filter" color={color} />,
        }}
      />
      <Tabs.Screen
        name="matchesTab"
        options={{
          title: 'Matches',
          tabBarIcon: ({ color }) => <TabBarIcon name="key" color={color} />,
        }}
      />
      {/* New Tab for Messages (five) */}
      <Tabs.Screen
        name="messagingTab"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color }) => <TabBarIcon name="envelope" color={color} />,
        }}
      />
      {/* Moved Profile (four) after Messages (five) */}
      <Tabs.Screen
        name="profileTab"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <TabBarIcon name="image" color={color} />,
        }}
      />
    </Tabs>
  );
}