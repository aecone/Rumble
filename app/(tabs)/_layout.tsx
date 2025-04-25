import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import { Pressable, View } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
  style?: any;
}) {
  return <FontAwesome size={30} style={[{ marginBottom: -3 }, props.style]} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const activeColor = '#B1DEDD';


  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeColor,
        tabBarShowLabel: false,
        headerShown: false,
      }}>
      <Tabs.Screen
        name="swipeTab"
        options={{
          tabBarIcon: ({ color }) => (
            <View style={{ flexDirection: 'row' }}>
              <TabBarIcon name="chevron-right" color={color} style={{ marginRight: -7 }} />
              <TabBarIcon name="chevron-right" color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="matchesTab"
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="star" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profileTab"
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="user-circle" color={color} />,
        }}
      />
    </Tabs>
  );
}