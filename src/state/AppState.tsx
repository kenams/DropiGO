import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import {
  initialListings,
  initialNotifications,
  initialReservations,
} from '../data/mock';
import {
  configureNotifications,
  sendLocalNotification,
} from '../services/notifications';
import {
  AppNotification,
  FisherProfile,
  FisherStatus,
  Listing,
  QueueItem,
  Reservation,
  ReservationStatus,
  Role,
  SyncHistoryItem,
} from '../types';

const buyerName = 'Restaurant La Vague';
const fisherName = 'Loïc Martin';
const STORAGE_KEY = 'dropigo-state-v1';

type AppState = {
  role: Role | null;
  setRole: (role: Role | null) => void;
  fisherStatus: FisherStatus;
  setFisherStatus: (status: FisherStatus) => void;
  fisherProfile: FisherProfile;
  setFisherProfile: (profile: FisherProfile) => void;
  listings: Listing[];
  reservations: Reservation[];
  notifications: AppNotification[];
  unreadCount: number;
  favorites: string[];
  toggleFavorite: (listingId: string) => void;
  isOnline: boolean;
  queue: QueueItem[];
  syncHistory: SyncHistoryItem[];
  syncQueue: () => void;
  addListing: (listing: Omit<Listing, 'id' | 'status' | 'fisherName' | 'createdAt'>) => void;
  createReservation: (listingId: string, qtyKg: number, pickupTime: string) => void;
  updateReservationStatus: (id: string, status: ReservationStatus) => void;
  markAllNotificationsRead: () => void;
  resetApp: () => void;
  hydrated: boolean;
};

const AppStateContext = createContext<AppState | undefined>(undefined);

const createNotification = (title: string, body: string): AppNotification => ({
  id: `n-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  title,
  body,
  createdAt: new Date().toISOString(),
  read: false,
});

const createQueueItem = (
  type: QueueItem['type'],
  summary: string
): QueueItem => ({
  id: `q-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  type,
  summary,
  createdAt: new Date().toISOString(),
  status: 'pending',
});

const createHistoryItem = (summary: string): SyncHistoryItem => ({
  id: `h-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  summary,
  syncedAt: new Date().toISOString(),
});

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [role, setRole] = useState<Role | null>(null);
  const [fisherStatus, setFisherStatus] = useState<FisherStatus>('draft');
  const [fisherProfile, setFisherProfile] = useState<FisherProfile>({
    name: '',
    permit: '',
    boat: '',
    registration: '',
    port: '',
  });
  const [listings, setListings] = useState<Listing[]>(initialListings);
  const [reservations, setReservations] = useState<Reservation[]>(
    initialReservations
  );
  const [notifications, setNotifications] = useState<AppNotification[]>(
    initialNotifications
  );
  const [favorites, setFavorites] = useState<string[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [syncHistory, setSyncHistory] = useState<SyncHistoryItem[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  const pushNotification = (title: string, body: string) => {
    const notification = createNotification(title, body);
    setNotifications((prev) => [notification, ...prev]);
    sendLocalNotification(title, body).catch(() => undefined);
  };

  const enqueueAction = (type: QueueItem['type'], summary: string) => {
    setQueue((prev) => [createQueueItem(type, summary), ...prev]);
  };

  const syncQueue = () => {
    if (!isOnline || queue.length === 0) {
      return;
    }
    const historyItems = queue.map((item) => createHistoryItem(item.summary));
    setSyncHistory((prev) => [...historyItems, ...prev]);
    setQueue([]);
    pushNotification(
      'Synchronisation terminée',
      'Toutes les actions en attente ont été synchronisées.'
    );
  };

  const addListing: AppState['addListing'] = (listing) => {
    const effectiveFisherName =
      fisherProfile.name.trim().length > 0 ? fisherProfile.name : fisherName;
    const createdAt = new Date().toISOString();
    setListings((prev) => [
      {
        id: `l-${prev.length + 1}`,
        status: 'active',
        fisherName: effectiveFisherName,
        createdAt,
        ...listing,
      },
      ...prev,
    ]);
    pushNotification(
      'Nouvelle pêche disponible',
      `${effectiveFisherName} propose ${listing.variety} à ${listing.pricePerKg} € / kg.`
    );
    if (!isOnline) {
      enqueueAction('add_listing', `Annonce : ${listing.title}`);
    }
  };

  const createReservation: AppState['createReservation'] = (
    listingId,
    qtyKg,
    pickupTime
  ) => {
    const listing = listings.find((item) => item.id === listingId);
    if (!listing) {
      return;
    }
    setReservations((prev) => [
      {
        id: `r-${prev.length + 1}`,
        listingId,
        listingTitle: listing.title,
        buyerName,
        qtyKg,
        pickupTime,
        status: 'pending',
      },
      ...prev,
    ]);
    pushNotification(
      'Nouvelle réservation',
      `${buyerName} a réservé ${qtyKg} kg sur ${listing.title}.`
    );
    if (!isOnline) {
      enqueueAction('create_reservation', `Réservation : ${listing.title}`);
    }
  };

  const updateReservationStatus: AppState['updateReservationStatus'] = (
    id,
    status
  ) => {
    setReservations((prev) =>
      prev.map((reservation) =>
        reservation.id === id ? { ...reservation, status } : reservation
      )
    );
    if (status === 'confirmed') {
      pushNotification(
        'Réservation confirmée',
        'Le pêcheur a confirmé la réservation.'
      );
    }
    if (status === 'rejected') {
      pushNotification(
        'Réservation refusée',
        'Le pêcheur a refusé la réservation.'
      );
    }
    if (status === 'picked_up') {
      pushNotification(
        'Réception confirmée',
        'La remise a été confirmée. Merci.'
      );
    }
    if (!isOnline) {
      enqueueAction('update_reservation', `Statut réservation : ${status}`);
    }
  };

  const toggleFavorite = (listingId: string) => {
    setFavorites((prev) =>
      prev.includes(listingId)
        ? prev.filter((id) => id !== listingId)
        : [listingId, ...prev]
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  const resetApp = () => {
    setRole(null);
    setFisherStatus('draft');
    setFisherProfile({
      name: '',
      permit: '',
      boat: '',
      registration: '',
      port: '',
    });
    setListings(initialListings);
    setReservations(initialReservations);
    setNotifications(initialNotifications);
    setFavorites([]);
    setQueue([]);
    setSyncHistory([]);
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => undefined);
  };

  useEffect(() => {
    const loadState = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!raw) {
          return;
        }
        const data = JSON.parse(raw) as Partial<{
          role: Role | null;
          fisherStatus: FisherStatus;
          fisherProfile: FisherProfile;
          listings: Listing[];
          reservations: Reservation[];
          notifications: AppNotification[];
          favorites: string[];
          queue: QueueItem[];
          syncHistory: SyncHistoryItem[];
        }>;
        if (data.role !== undefined) {
          setRole(data.role);
        }
        if (data.fisherStatus) {
          setFisherStatus(data.fisherStatus);
        }
        if (data.fisherProfile) {
          setFisherProfile(data.fisherProfile);
        }
        if (data.listings) {
          const safeListings = data.listings.map((item) => ({
            ...item,
            createdAt: item.createdAt ?? new Date().toISOString(),
          }));
          setListings(safeListings);
        }
        if (data.reservations) {
          setReservations(data.reservations);
        }
        if (data.notifications) {
          setNotifications(data.notifications);
        }
        if (data.favorites) {
          setFavorites(data.favorites);
        }
        if (data.queue) {
          setQueue(data.queue);
        }
        if (data.syncHistory) {
          setSyncHistory(data.syncHistory);
        }
      } catch {
        // ignore corrupted cache
      } finally {
        setHydrated(true);
      }
    };

    loadState();
  }, []);

  useEffect(() => {
    configureNotifications().catch(() => undefined);
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online =
        Boolean(state.isConnected) && state.isInternetReachable !== false;
      setIsOnline(online);
    });
    NetInfo.fetch().then((state) => {
      const online =
        Boolean(state.isConnected) && state.isInternetReachable !== false;
      setIsOnline(online);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    const payload = JSON.stringify({
      role,
      fisherStatus,
      fisherProfile,
      listings,
      reservations,
      notifications,
      favorites,
      queue,
      syncHistory,
    });
    AsyncStorage.setItem(STORAGE_KEY, payload).catch(() => undefined);
  }, [
    role,
    fisherStatus,
    fisherProfile,
    listings,
    reservations,
    notifications,
    favorites,
    queue,
    syncHistory,
    hydrated,
  ]);

  useEffect(() => {
    if (!isOnline || queue.length === 0) {
      return;
    }
    const timer = setTimeout(() => {
      syncQueue();
    }, 600);
    return () => clearTimeout(timer);
  }, [isOnline, queue.length]);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications]
  );

  const value = useMemo(
    () => ({
      role,
      setRole,
      fisherStatus,
      setFisherStatus,
      fisherProfile,
      setFisherProfile,
      listings,
      reservations,
      notifications,
      unreadCount,
      favorites,
      toggleFavorite,
      isOnline,
      queue,
      syncHistory,
      syncQueue,
      addListing,
      createReservation,
      updateReservationStatus,
      markAllNotificationsRead,
      resetApp,
      hydrated,
    }),
    [
      role,
      fisherStatus,
      fisherProfile,
      listings,
      reservations,
      notifications,
      unreadCount,
      favorites,
      isOnline,
      queue,
      syncHistory,
      hydrated,
    ]
  );

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return context;
};
