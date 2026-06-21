import { Tabs } from 'expo-router';
import { COLORS } from '@/constants/theme';
import { useLocaleStore } from '@/store/locale.store';
import { Text } from 'react-native';

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>;
}

export default function TabLayout() {
  const { lang } = useLocaleStore();
  const fa = lang === 'fa';

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: COLORS.bgCard,
          borderTopColor:  COLORS.border,
          height: 60,
        },
        tabBarActiveTintColor:   COLORS.primary,
        tabBarInactiveTintColor: COLORS.textFaint,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginBottom: 4 },
        headerStyle:      { backgroundColor: COLORS.bgCard },
        headerTintColor:  COLORS.text,
        headerShadowVisible: false,
      }}>

      <Tabs.Screen
        name="dashboard"
        options={{
          title: fa ? 'داشبورد' : 'Dashboard',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📊" focused={focused} />,
          headerTitle: 'Everbrilliant',
        }}
      />
      <Tabs.Screen
        name="trading"
        options={{
          title: fa ? 'بازرگانی' : 'Trading',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🛒" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="finance"
        options={{
          title: fa ? 'مالی' : 'Finance',
          tabBarIcon: ({ focused }) => <TabIcon emoji="💰" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="manufacturing"
        options={{
          title: fa ? 'تولید' : 'Mfg',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏭" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: fa ? 'بیشتر' : 'More',
          tabBarIcon: ({ focused }) => <TabIcon emoji="⋯" focused={focused} />,
        }}
      />

      {/* Hidden tabs — navigable via More screen */}
      <Tabs.Screen
        name="logistics"
        options={{
          title: fa ? 'لجستیک' : 'Logistics',
          headerTitle: fa ? '🚢 لجستیک' : '🚢 Logistics',
          tabBarButton: () => null,
        }}
      />
      <Tabs.Screen
        name="crm"
        options={{
          title: fa ? 'مشتریان' : 'CRM',
          headerTitle: fa ? '🏢 مدیریت مشتریان' : '🏢 CRM',
          tabBarButton: () => null,
        }}
      />
      <Tabs.Screen
        name="automation"
        options={{
          title: fa ? 'اتوماسیون' : 'Automation',
          headerTitle: fa ? '🤖 اتوماسیون اداری' : '🤖 Automation',
          tabBarButton: () => null,
        }}
      />
    </Tabs>
  );
}
