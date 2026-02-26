import React, { useState } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { FisherHomeScreen } from '../screens/fisher/FisherHomeScreen';
import { CreateListingScreen } from '../screens/fisher/CreateListingScreen';
import { FisherReservationsScreen } from '../screens/fisher/FisherReservationsScreen';
import { BuyerHomeScreen } from '../screens/buyer/BuyerHomeScreen';
import { ListingDetailScreen } from '../screens/buyer/ListingDetailScreen';
import { CartScreen } from '../screens/buyer/CartScreen';
import { OrderTrackingScreen } from '../screens/buyer/OrderTrackingScreen';
import { BuyerReservationsScreen } from '../screens/buyer/BuyerReservationsScreen';
import { AuthScreen } from '../screens/auth/AuthScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { LoadingScreen } from '../screens/LoadingScreen';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { AdminDashboardScreen } from '../screens/admin/AdminDashboardScreen';
import { ChatDetailScreen } from '../screens/chat/ChatDetailScreen';
import { BackButton } from '../components/BackButton';
import { useAppState } from '../state/AppState';
import { colors } from '../theme';
import {
  BuyerStackParamList,
  BuyerTabsParamList,
  FisherTabsParamList,
} from './types';

const RootStack = createStackNavigator();
const BuyerStack = createStackNavigator<BuyerStackParamList>();
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
    <BuyerStack.Screen
      name="OrderTracking"
      component={OrderTrackingWrapper}
      options={{ title: 'Suivi' }}
    />
  </BuyerStack.Navigator>
);

const OrderTrackingWrapper: React.FC<{
  route: RouteProp<BuyerStackParamList, 'OrderTracking'>;
}> = ({ route }) => {
  return <OrderTrackingScreen reservationId={route.params.reservationId} />;
};

const BuyerTabsNavigator = () => {
  return (
    <BuyerTabs.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          const icon =
            route.name === 'Feed'
              ? 'home'
              : route.name === 'Cart'
              ? 'cart'
              : route.name === 'Reservations'
              ? 'calendar'
              : 'person';
          return <Ionicons name={icon} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { borderTopColor: colors.border },
        headerShown: false,
      })}
    >
      <BuyerTabs.Screen
        name="Feed"
        component={BuyerStackNavigator}
        options={{ title: 'Pêches' }}
      />
      <BuyerTabs.Screen
        name="Cart"
        component={CartScreen}
        options={{ title: 'Panier' }}
      />
      <BuyerTabs.Screen
        name="Reservations"
        component={BuyerReservationsScreen}
        options={{ title: 'Réservations' }}
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
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profil' }}
      />
    </FisherTabs.Navigator>
  );
};

const AdminPortal: React.FC<{ onSignOut: () => void }> = ({ onSignOut }) => {
  const [mode, setMode] = useState<'admin' | 'buyer' | 'fisher'>('admin');

  if (mode === 'admin') {
    return (
      <AdminDashboardScreen
        onBack={onSignOut}
        onOpenBuyer={() => setMode('buyer')}
        onOpenFisher={() => setMode('fisher')}
      />
    );
  }

  return (
    <View style={styles.adminRoot}>
      {mode === 'buyer' ? <BuyerTabsNavigator /> : <FisherTabsNavigator />}
      <BackButton
        label="Admin"
        onPress={() => setMode('admin')}
        style={styles.adminBack}
      />
    </View>
  );
};

export const RootNavigator: React.FC = () => {
  const { currentUser, role, hydrated, signOut } = useAppState();
  const effectiveRole = currentUser?.role ?? role;
  const [showWelcome, setShowWelcome] = useState(true);

  if (!hydrated) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer theme={navTheme}>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {showWelcome ? (
          <RootStack.Screen name="Welcome">
            {() => <WelcomeScreen onContinue={() => setShowWelcome(false)} />}
          </RootStack.Screen>
        ) : !currentUser ? (
          <RootStack.Screen name="Auth" component={AuthScreen} />
        ) : effectiveRole === 'admin' ? (
          <RootStack.Screen name="Admin">
            {() => <AdminPortal onSignOut={signOut} />}
          </RootStack.Screen>
        ) : effectiveRole === 'fisher' ? (
          <RootStack.Screen name="Fisher" component={FisherTabsNavigator} />
        ) : (
          <RootStack.Screen name="Buyer" component={BuyerTabsNavigator} />
        )}
        <RootStack.Screen name="ChatDetail">
          {({ route, navigation }) => (
            <ChatDetailScreen
              threadId={(route.params as any)?.threadId}
              onBack={() => navigation.goBack()}
            />
          )}
        </RootStack.Screen>
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  adminRoot: {
    flex: 1,
  },
  adminBack: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 20,
  },
});
