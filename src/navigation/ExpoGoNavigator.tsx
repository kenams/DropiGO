import React, { useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BuyerHomeStandalone } from '../screens/buyer/BuyerHomeScreen';
import { ListingDetailStandalone } from '../screens/buyer/ListingDetailScreen';
import { BuyerReservationsStandalone } from '../screens/buyer/BuyerReservationsScreen';
import { CartStandalone } from '../screens/buyer/CartScreen';
import { OrderTrackingScreen } from '../screens/buyer/OrderTrackingScreen';
import { ProfileStandalone } from '../screens/ProfileScreen';
import { AuthScreen } from '../screens/auth/AuthScreen';
import { CreateListingStandalone } from '../screens/fisher/CreateListingScreen';
import { FisherHomeScreen } from '../screens/fisher/FisherHomeScreen';
import { FisherReservationsStandalone } from '../screens/fisher/FisherReservationsScreen';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { AdminDashboardScreen } from '../screens/admin/AdminDashboardScreen';
import { BackButton } from '../components/BackButton';
import { useAppState } from '../state/AppState';
import { colors, spacing, textStyles } from '../theme';

type BuyerTabKey = 'Feed' | 'Cart' | 'Reservations' | 'Profile';

type FisherTabKey = 'Home' | 'Add' | 'Reservations' | 'Profile';

type TabConfig<Key extends string> = {
  key: Key;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const buyerTabs: TabConfig<BuyerTabKey>[] = [
  { key: 'Feed', label: 'Pêches', icon: 'home' },
  { key: 'Cart', label: 'Panier', icon: 'cart' },
  { key: 'Reservations', label: 'Réserv.', icon: 'calendar' },
  { key: 'Profile', label: 'Profil', icon: 'person' },
];

const fisherTabs: TabConfig<FisherTabKey>[] = [
  { key: 'Home', label: 'Pêches', icon: 'home' },
  { key: 'Add', label: 'Publier', icon: 'add-circle' },
  { key: 'Reservations', label: 'Réserv.', icon: 'calendar' },
  { key: 'Profile', label: 'Profil', icon: 'person' },
];

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
      {mode === 'buyer' ? <BuyerTabs /> : <FisherTabs />}
      <BackButton
        label="Admin"
        onPress={() => setMode('admin')}
        style={styles.adminBack}
      />
    </View>
  );
};

export const ExpoGoNavigator: React.FC = () => {
  const { currentUser, role, signOut } = useAppState();
  const effectiveRole = currentUser?.role ?? role;
  const [showWelcome, setShowWelcome] = useState(true);

  if (showWelcome) {
    return <WelcomeScreen onContinue={() => setShowWelcome(false)} />;
  }

  if (!currentUser) {
    return <AuthScreen />;
  }

  if (effectiveRole === 'buyer') {
    return <BuyerTabs />;
  }

  if (effectiveRole === 'admin') {
    return <AdminPortal onSignOut={signOut} />;
  }

  return <FisherTabs />;
};

const TAB_BAR_HEIGHT = 68;

const BuyerTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<BuyerTabKey>('Feed');
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const insets = useSafeAreaInsets();
  const content = useMemo(() => {
    if (selectedListingId) {
      return (
        <ListingDetailStandalone
          listingId={selectedListingId}
          onBack={() => setSelectedListingId(null)}
        />
      );
    }
    if (selectedOrderId) {
      return (
        <OrderTrackingScreen
          reservationId={selectedOrderId}
          onBack={() => setSelectedOrderId(null)}
        />
      );
    }

    if (activeTab === 'Feed') {
      return <BuyerHomeStandalone onOpenListing={setSelectedListingId} />;
    }
    if (activeTab === 'Cart') {
      return <CartStandalone onBack={() => setActiveTab('Feed')} />;
    }
    if (activeTab === 'Reservations') {
      return (
        <BuyerReservationsStandalone
          onBack={() => setActiveTab('Feed')}
          onOpenTracking={setSelectedOrderId}
        />
      );
    }
    return <ProfileStandalone onBack={() => setActiveTab('Feed')} />;
  }, [activeTab, selectedListingId, selectedOrderId]);

  return (
    <View style={styles.root}>
      <View
        style={[
          styles.content,
          !(selectedListingId || selectedOrderId) && styles.contentWithTabs,
          !(selectedListingId || selectedOrderId) && {
            paddingBottom: TAB_BAR_HEIGHT + insets.bottom,
          },
        ]}
      >
        {content}
      </View>
      {!(selectedListingId || selectedOrderId) && (
        <TabBar
          tabs={buyerTabs}
          activeTab={activeTab}
          onSelect={setActiveTab}
          bottomInset={insets.bottom}
        />
      )}
    </View>
  );
};

const FisherTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<FisherTabKey>('Home');
  const insets = useSafeAreaInsets();
  const content = useMemo(() => {
    if (activeTab === 'Home') {
      return <FisherHomeScreen />;
    }
    if (activeTab === 'Add') {
      return <CreateListingStandalone onBack={() => setActiveTab('Home')} />;
    }
    if (activeTab === 'Reservations') {
      return <FisherReservationsStandalone onBack={() => setActiveTab('Home')} />;
    }
    return <ProfileStandalone onBack={() => setActiveTab('Home')} />;
  }, [activeTab]);

  return (
    <View style={styles.root}>
      <View
        style={[
          styles.content,
          styles.contentWithTabs,
          { paddingBottom: TAB_BAR_HEIGHT + insets.bottom },
        ]}
      >
        {content}
      </View>
      <TabBar
        tabs={fisherTabs}
        activeTab={activeTab}
        onSelect={setActiveTab}
        bottomInset={insets.bottom}
      />
    </View>
  );
};

const TabBar = <Key extends string>({
  tabs,
  activeTab,
  onSelect,
  bottomInset,
}: {
  tabs: TabConfig<Key>[];
  activeTab: Key;
  onSelect: (tab: Key) => void;
  bottomInset: number;
}) => {
  return (
    <View
      style={[
        styles.tabBar,
        { paddingBottom: spacing.sm + bottomInset, height: TAB_BAR_HEIGHT + bottomInset },
      ]}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onSelect(tab.key)}
            style={styles.tabItem}
          >
            <Ionicons
              name={tab.icon}
              size={18}
              color={isActive ? colors.primary : colors.muted}
            />
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentWithTabs: {
    paddingBottom: TAB_BAR_HEIGHT,
  },
  tabBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    shadowColor: colors.primaryDark,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -6 },
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  tabLabel: {
    ...textStyles.caption,
    color: colors.muted,
  },
  tabLabelActive: {
    color: colors.primaryDark,
    fontFamily: textStyles.bodyBold.fontFamily,
  },
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
