import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, FontFamily } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

const TAB_BAR_STYLE = {
  backgroundColor: Colors.surfaceContainerLowest,
  borderTopWidth: 0,
  elevation: 8,
  shadowColor: Colors.onSurface,
  shadowOffset: { width: 0, height: -4 },
  shadowOpacity: 0.06,
  shadowRadius: 16,
  height: 60,
} as const;

const TAB_LABEL_STYLE = {
  fontFamily: FontFamily.bodySemiBold,
  fontSize: 10,
  letterSpacing: 0.4,
} as const;

export default function TabLayout() {
  const { user } = useAuth();
  const isClient = user?.role === 'cliente';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.onSurfaceVariant,
        headerShown: false,
        tabBarStyle: TAB_BAR_STYLE,
        tabBarLabelStyle: TAB_LABEL_STYLE,
        tabBarItemStyle: { paddingVertical: 6 },
      }}
    >
      {/* Início — visível para todos */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} />
          ),
        }}
      />

      {/* Agenda (prestador) / Reservas (cliente) — visível para todos, título muda */}
      <Tabs.Screen
        name="schedule"
        options={{
          title: isClient ? 'Reservas' : 'Agenda',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="calendar-today" size={size} color={color} />
          ),
        }}
      />

      {/* Serviços — apenas prestador */}
      <Tabs.Screen
        name="services"
        options={{
          title: 'Serviços',
          href: isClient ? null : undefined,
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="handyman" size={size} color={color} />
          ),
        }}
      />

      {/* Mensagens — apenas cliente */}
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Mensagens',
          href: isClient ? undefined : null,
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="chat-bubble-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Conta — visível para todos */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Conta',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Explore — sempre oculto */}
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
  );
}
