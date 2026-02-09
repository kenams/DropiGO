import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RoleSelectScreen } from '../screens/RoleSelectScreen';
import { OnboardingScreen } from '../screens/fisher/OnboardingScreen';
import { FisherHomeScreen } from '../screens/fisher/FisherHomeScreen';
import { CreateListingScreen } from '../screens/fisher/CreateListingScreen';
import { FisherReservationsScreen } from '../screens/fisher/FisherReservationsScreen';
import { FisherFavoritesScreen } from '../screens/fisher/FisherFavoritesScreen';
import { BuyerHomeScreen } from '../screens/buyer/BuyerHomeScreen';
import { FavoritesScreen } from '../screens/buyer/FavoritesScreen';
import { ListingDetailScreen } from '../screens/buyer/ListingDetailScreen';
import { BuyerReservationsScreen } from '../screens/buyer/BuyerReservationsScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { LoadingScreen } from '../screens/LoadingScreen';
import { useAppState } from '../state/AppState';
import { colors } from '../theme';
import {
  BuyerStackParamList,
  BuyerTabsParamList,
  FisherTabsParamList,
} from './types';

const RootStack = createNativeStackNavigator();
const BuyerStack = createNativeStackNavigator<BuyerStackParamList>();
const BuyerTabs = createBottomTabNavigator<BuyerTabsParamList>();
const FisherTabs = createBottomTabNavigator<FisherTabsParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    primary: colors.primary,
  },
};

const BuyerStackNavigator = () => (
  <BuyerStack.Navigator>
    <BuyerStack.Screen
      name="BuyerHome"
      component={BuyerHomeScreen}
      options={{ title: 'Pêches' }}
    />
    <BuyerStack.Screen
      name="ListingDetail"
      component={ListingDetailScreen}
      options={{ title: 'Détail' }}
    />
  </BuyerStack.Navigator>
);

const BuyerTabsNavigator = () => {
  const { unreadCount } = useAppState();

  return (
    <BuyerTabs.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          const icon =
            route.name === 'Feed'
              ? 'home'
              : route.name === 'Favorites'
              ? 'heart'
              : route.name === 'Reservations'
              ? 'calendar'
              : route.name === 'Notifications'
              ? 'notifications'
              : 'person';
          return <Ionicons name={icon} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { borderTopColor: colors.border },
        headerShown: false,
      })}
    >
      <BuyerTabs.Screen name="Feed" component={BuyerStackNavigator} options={{ title: 'Pêches' }} />
      <BuyerTabs.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{ title: 'Favoris' }}
      />
      <BuyerTabs.Screen
        name="Reservations"
        component={BuyerReservationsScreen}
        options={{ title: 'Réservations' }}
      />
      <BuyerTabs.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          title: 'Alertes',
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
        }}
      />
      <BuyerTabs.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profil' }}
      />
    </BuyerTabs.Navigator>
  );
};

const FisherTabsNavigator = () => {
  const { unreadCount } = useAppState();

  return (
    <FisherTabs.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          const icon =
            route.name === 'Home'
              ? 'home'
              : route.name === 'Add'
              ? 'add-circle'
              : route.name === 'Reservations'
              ? 'calendar'
              : route.name === 'Favorites'
              ? 'heart'
              : route.name === 'Notifications'
              ? 'notifications'
              : 'person';
          return <Ionicons name={icon} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { borderTopColor: colors.border },
        headerShown: false,
      })}
    >
      <FisherTabs.Screen
        name="Home"
        component={FisherHomeScreen}
        options={{ title: 'Mes pêches' }}
      />
      <FisherTabs.Screen
        name="Add"
        component={CreateListingScreen}
        options={{ title: 'Publier' }}
      />
    <FisherTabs.Screen
      name="Reservations"
      component={FisherReservationsScreen}
      options={{ title: 'Réservations' }}
    />
    <FisherTabs.Screen
      name="Favorites"
      component={FisherFavoritesScreen}
      options={{ title: 'Suivis' }}
    />
      <FisherTabs.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          title: 'Alertes',
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
        }}
      />
      <FisherTabs.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profil' }}
      />
    </FisherTabs.Navigator>
  );
};

export const RootNavigator: React.FC = () => {
  const { role, fisherStatus, hydrated } = useAppState();

  if (!hydrated) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer theme={navTheme}>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {!role ? (
          <RootStack.Screen name="RoleSelect" component={RoleSelectScreen} />
        ) : role === 'fisher' && fisherStatus !== 'approved' ? (
          <RootStack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : role === 'fisher' ? (
          <RootStack.Screen name="Fisher" component={FisherTabsNavigator} />
        ) : (
          <RootStack.Screen name="Buyer" component={BuyerTabsNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};
