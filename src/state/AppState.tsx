import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  initialChatMessages,
  initialChatThreads,
  initialFisherApplicants,
  initialBuyerApplicants,
  initialListings,
  initialNotifications,
  initialReservations,
} from '../data/mock';
import { knownPorts } from '../data/ports';
import { buildCompensation } from '../services/compensation';
import {
  configureNotifications,
  sendLocalNotification,
} from '../services/notifications';
import {
  AppNotification,
  AuthUser,
  BuyerApplicant,
  BuyerApplicantStatus,
  BuyerProfile,
  BuyerStatus,
  CartItem,
  ChatMessage,
  ChatThread,
  CompensationReason,
  FisherApplicant,
  FisherApplicantStatus,
  FisherProfile,
  FisherStatus,
  Listing,
  QueueItem,
  Reservation,
  ReservationStatus,
  Role,
  SyncHistoryItem,
} from '../types';

type NetInfoModule = typeof import('@react-native-community/netinfo');

let NetInfo: NetInfoModule | null = null;
try {
  NetInfo = require('@react-native-community/netinfo');
} catch {
  NetInfo = null;
}

const buyerName = 'Restaurant La Vague';
const fisherName = 'Loïc Martin';
const STORAGE_KEY = 'dropipeche-state-v1';
const COMMISSION_RATE = 0.08;

const demoUsers: AuthUser[] = [
  {
    id: 'u-1',
    email: 'pecheur@dropipeche.demo',
    phone: '+33 6 11 11 11 11',
    password: 'demo123',
    role: 'fisher',
    name: 'Loïc Martin',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 'u-2',
    email: 'acheteur@dropipeche.demo',
    phone: '+33 6 22 22 22 22',
    password: 'demo123',
    role: 'buyer',
    name: 'Restaurant La Vague',
    company: 'Restaurant La Vague',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
];

const defaultFisherProfile: FisherProfile = {
  name: '',
  permit: '',
  boat: '',
  registration: '',
  port: '',
  insurance: '',
  bankAccount: '',
  phone: '',
  email: '',
  idNumber: '',
  licensePhotoUri: undefined,
  boatPhotoUri: undefined,
  insurancePhotoUri: undefined,
  ribPhotoUri: undefined,
};

const defaultBuyerProfile: BuyerProfile = {
  name: '',
  company: '',
  registry: '',
  activity: '',
  phone: '',
  email: '',
  paymentMethod: '',
  idNumber: '',
  address: '',
};

const normalizePortName = (value: string) =>
  value.trim().replace(/\s+/g, ' ');

const resolveBuyerName = (profile: BuyerProfile) => {
  if (profile.company.trim().length > 0) {
    return profile.company;
  }
  if (profile.name.trim().length > 0) {
    return profile.name;
  }
  return buyerName;
};

type AppState = {
  currentUser: AuthUser | null;
  users: AuthUser[];
  signIn: (identifier: string, password: string) => { ok: boolean; message?: string };
  signUp: (data: {
    name: string;
    email: string;
    phone?: string;
    password: string;
    role: Role;
    company?: string;
  }) => { ok: boolean; message?: string };
  signOut: () => void;
  role: Role | null;
  setRole: (role: Role | null) => void;
  fisherStatus: FisherStatus;
  setFisherStatus: (status: FisherStatus) => void;
  fisherProfile: FisherProfile;
  setFisherProfile: (profile: FisherProfile) => void;
  buyerStatus: BuyerStatus;
  setBuyerStatus: (status: BuyerStatus) => void;
  buyerProfile: BuyerProfile;
  setBuyerProfile: (profile: BuyerProfile) => void;
  knownPorts: string[];
  registerPort: (port: string) => void;
  listings: Listing[];
  reservations: Reservation[];
  cart: CartItem[];
  notifications: AppNotification[];
  unreadCount: number;
  favorites: string[];
  toggleFavorite: (listingId: string) => void;
  chatThreads: ChatThread[];
  chatMessages: ChatMessage[];
  startChat: (listingId: string) => string;
  sendChatMessage: (threadId: string, text: string) => void;
  markThreadRead: (threadId: string) => void;
  fisherApplicants: FisherApplicant[];
  updateFisherApplicantStatus: (id: string, status: FisherApplicantStatus) => void;
  buyerApplicants: BuyerApplicant[];
  updateBuyerApplicantStatus: (id: string, status: BuyerApplicantStatus) => void;
  isOnline: boolean;
  queue: QueueItem[];
  syncHistory: SyncHistoryItem[];
  syncQueue: () => void;
  addListing: (listing: Omit<Listing, 'id' | 'status' | 'fisherName' | 'createdAt'>) => void;
  createReservation: (listingId: string, qtyKg: number, pickupTime: string, note?: string) => void;
  updateReservationStatus: (id: string, status: ReservationStatus) => void;
  markReservationPaid: (id: string) => void;
  addToCart: (listingId: string, qtyKg: number) => void;
  updateCartQty: (itemId: string, qtyKg: number) => void;
  removeCartItem: (itemId: string) => void;
  clearCart: () => void;
  checkoutCart: (pickupTime: string, note?: string) => void;
  updateDeliveryStatus: (id: string, status: Reservation['deliveryStatus']) => void;
  setBuyerConformity: (id: string, conformity: 'conform' | 'non_conform', note?: string) => void;
  releaseEscrow: (id: string) => void;
  resolveDispute: (id: string, resolution: 'refund_buyer' | 'pay_fisher' | 'split') => void;
  requestBuyerArrival: (id: string) => void;
  confirmBuyerArrival: (id: string) => void;
  declareFisherArrival: (id: string) => void;
  declareDelay: (id: string, triggeredBy: Role) => void;
  cancelAfterArrival: (id: string, triggeredBy: Role) => void;
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
  const [users, setUsers] = useState<AuthUser[]>(demoUsers);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [fisherStatus, setFisherStatus] = useState<FisherStatus>('draft');
  const [fisherProfile, setFisherProfile] = useState<FisherProfile>({
    ...defaultFisherProfile,
  });
  const [buyerStatus, setBuyerStatus] = useState<BuyerStatus>('draft');
  const [buyerProfile, setBuyerProfile] = useState<BuyerProfile>({
    ...defaultBuyerProfile,
  });
  const [knownPortsState, setKnownPortsState] = useState<string[]>(knownPorts);
  const [listings, setListings] = useState<Listing[]>(initialListings);
  const [reservations, setReservations] = useState<Reservation[]>(
    initialReservations
  );
  const [cart, setCart] = useState<CartItem[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>(
    initialNotifications
  );
  const [chatThreads, setChatThreads] = useState<ChatThread[]>(
    initialChatThreads
  );
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(
    initialChatMessages
  );
  const [fisherApplicants, setFisherApplicants] = useState<FisherApplicant[]>(
    initialFisherApplicants
  );
  const [buyerApplicants, setBuyerApplicants] = useState<BuyerApplicant[]>(
    initialBuyerApplicants
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

  const currentUser = useMemo(
    () => users.find((user) => user.id === currentUserId) ?? null,
    [users, currentUserId]
  );

  const signIn: AppState['signIn'] = (identifier, password) => {
    const normalized = identifier.trim().toLowerCase();
    if (!normalized || !password) {
      return { ok: false, message: 'Renseignez vos identifiants.' };
    }
    const user = users.find(
      (item) =>
        item.email.toLowerCase() === normalized ||
        (item.phone ?? '').replace(/\s+/g, '') === normalized.replace(/\s+/g, '')
    );
    if (!user) {
      return { ok: false, message: 'Compte introuvable.' };
    }
    if (user.password !== password) {
      return { ok: false, message: 'Mot de passe incorrect.' };
    }
    setCurrentUserId(user.id);
    setRole(user.role);
    if (user.role === 'buyer') {
      setBuyerProfile((prev) => ({
        ...prev,
        name: prev.name || user.name,
        company: prev.company || user.company || user.name,
        email: prev.email || user.email,
        phone: prev.phone || user.phone || '',
      }));
    } else {
      setFisherProfile((prev) => ({
        ...prev,
        name: prev.name || user.name,
        email: prev.email || user.email,
        phone: prev.phone || user.phone || '',
      }));
    }
    return { ok: true };
  };

  const signUp: AppState['signUp'] = (data) => {
    const email = data.email.trim().toLowerCase();
    const phone = data.phone?.trim();
    if (!data.name.trim() || !email || !data.password) {
      return { ok: false, message: 'Nom, email et mot de passe requis.' };
    }
    if (users.some((item) => item.email.toLowerCase() === email)) {
      return { ok: false, message: 'Cet email est déjà utilisé.' };
    }
    if (phone && users.some((item) => (item.phone ?? '') === phone)) {
      return { ok: false, message: 'Ce téléphone est déjà utilisé.' };
    }
    const newUser: AuthUser = {
      id: `u-${Date.now()}`,
      email,
      phone: phone || undefined,
      password: data.password,
      role: data.role,
      name: data.name.trim(),
      company: data.company?.trim(),
      createdAt: new Date().toISOString(),
    };
    setUsers((prev) => [newUser, ...prev]);
    setCurrentUserId(newUser.id);
    setRole(newUser.role);
    if (newUser.role === 'buyer') {
      setBuyerProfile((prev) => ({
        ...prev,
        name: newUser.name,
        company: newUser.company || newUser.name,
        email: newUser.email,
        phone: newUser.phone || '',
      }));
    } else {
      setFisherProfile((prev) => ({
        ...prev,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone || '',
      }));
    }
    return { ok: true };
  };

  const signOut: AppState['signOut'] = () => {
    setCurrentUserId(null);
    setRole(null);
    setBuyerStatus('draft');
    setFisherStatus('draft');
    setBuyerProfile({ ...defaultBuyerProfile });
    setFisherProfile({ ...defaultFisherProfile });
  };

  const registerPort = (port: string) => {
    const normalized = normalizePortName(port);
    if (!normalized) {
      return;
    }
    setKnownPortsState((prev) => {
      const exists = prev.some(
        (item) => item.toLowerCase() === normalized.toLowerCase()
      );
      if (exists) {
        return prev;
      }
      return [normalized, ...prev];
    });
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
    const enrichedListing = {
      ...listing,
      fisherPermit: listing.fisherPermit ?? fisherProfile.permit,
      fisherBoat: listing.fisherBoat ?? fisherProfile.boat,
      fisherRegistration: listing.fisherRegistration ?? fisherProfile.registration,
    };
    registerPort(listing.location);
    setListings((prev) => [
      {
        id: `l-${prev.length + 1}`,
        status: 'active',
        fisherName: effectiveFisherName,
        createdAt,
        ...enrichedListing,
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
    pickupTime,
    note
  ) => {
    const listing = listings.find((item) => item.id === listingId);
    if (!listing) {
      return;
    }
    const effectiveBuyerName = resolveBuyerName(buyerProfile);
    const totalPrice = qtyKg * listing.pricePerKg;
    const checkoutId = `ck-${Date.now()}`;
    const paidAt = new Date().toISOString();
    setReservations((prev) => [
      {
        id: `r-${prev.length + 1}`,
        checkoutId,
        listingId,
        listingTitle: listing.title,
        buyerName: effectiveBuyerName,
        qtyKg,
        pickupTime,
        note,
        totalPrice,
        paymentStatus: 'paid',
        escrowStatus: 'escrowed',
        paidAt,
        status: 'pending',
        deliveryStatus: 'at_sea',
        eta: listing.pickupWindow,
        buyerConformity: 'pending',
      },
      ...prev,
    ]);
    pushNotification(
      'Nouvelle réservation',
      `${effectiveBuyerName} a réservé ${qtyKg} kg sur ${listing.title}.`
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
      prev.map((reservation) => {
        if (reservation.id !== id) {
          return reservation;
        }
        if (status === 'picked_up') {
          return {
            ...reservation,
            status,
            deliveryStatus: 'delivered',
          };
        }
        if (status === 'rejected') {
          const now = new Date().toISOString();
          return {
            ...reservation,
            status,
            cancellationBy: reservation.cancellationBy ?? 'fisher',
            cancellationAt: reservation.cancellationAt ?? now,
            escrowStatus:
              reservation.escrowStatus === 'escrowed'
                ? 'refunded'
                : reservation.escrowStatus,
          };
        }
        return { ...reservation, status };
      })
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
        'Remise confirmée',
        'La remise a été confirmée. Le client peut valider la conformité.'
      );
    }
    if (!isOnline) {
      enqueueAction('update_reservation', `Statut réservation : ${status}`);
    }
  };

  const markReservationPaid: AppState['markReservationPaid'] = (id) => {
    setReservations((prev) =>
      prev.map((reservation) =>
        reservation.id === id
          ? {
              ...reservation,
              paymentStatus: 'paid',
              paidAt: new Date().toISOString(),
            }
          : reservation
      )
    );
  };

  const addToCart: AppState['addToCart'] = (listingId, qtyKg) => {
    const listing = listings.find((item) => item.id === listingId);
    if (!listing) {
      return;
    }
    setCart((prev) => {
      const existing = prev.find((item) => item.listingId === listingId);
      if (existing) {
        return prev.map((item) =>
          item.listingId === listingId
            ? {
                ...item,
                qtyKg: Math.max(
                  1,
                  Math.min(item.qtyKg + qtyKg, listing.stockKg)
                ),
              }
            : item
        );
      }
      return [
        ...prev,
        {
          id: `c-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          listingId,
          title: listing.title,
          pricePerKg: listing.pricePerKg,
          qtyKg: Math.max(1, Math.min(qtyKg, listing.stockKg)),
          fisherName: listing.fisherName,
          location: listing.location,
        },
      ];
    });
  };

  const updateCartQty: AppState['updateCartQty'] = (itemId, qtyKg) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) {
          return item;
        }
        const listing = listings.find((l) => l.id === item.listingId);
        const maxQty = listing ? listing.stockKg : qtyKg;
        return {
          ...item,
          qtyKg: Math.max(1, Math.min(qtyKg, maxQty)),
        };
      })
    );
  };

  const removeCartItem: AppState['removeCartItem'] = (itemId) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  const clearCart: AppState['clearCart'] = () => {
    setCart([]);
  };

  const checkoutCart: AppState['checkoutCart'] = (pickupTime, note) => {
    if (cart.length === 0) {
      return;
    }
    const checkoutId = `ck-${Date.now()}`;
    const effectiveBuyerName = resolveBuyerName(buyerProfile);
    const createdAt = new Date().toISOString();
    const newReservations: Reservation[] = cart.map((item, index) => ({
      id: `r-${reservations.length + index + 1}`,
      checkoutId,
      listingId: item.listingId,
      listingTitle: item.title,
      buyerName: effectiveBuyerName,
      qtyKg: item.qtyKg,
      pickupTime,
      note,
      totalPrice: item.qtyKg * item.pricePerKg,
      paymentStatus: 'paid',
      escrowStatus: 'escrowed',
      paidAt: createdAt,
      status: 'pending',
      deliveryStatus: 'at_sea',
      eta: pickupTime,
      buyerConformity: 'pending',
    }));
    setReservations((prev) => [...newReservations, ...prev]);
    setCart([]);
    pushNotification(
      'Paiement séquestré',
      'Votre paiement est sécurisé jusqu’à la validation de la remise.'
    );
    if (!isOnline) {
      enqueueAction('create_reservation', `Checkout : ${checkoutId}`);
    }
  };

  const updateDeliveryStatus: AppState['updateDeliveryStatus'] = (
    id,
    status
  ) => {
    setReservations((prev) =>
      prev.map((reservation) =>
        reservation.id === id
          ? { ...reservation, deliveryStatus: status }
          : reservation
      )
    );
  };

  const setBuyerConformity: AppState['setBuyerConformity'] = (
    id,
    conformity,
    note
  ) => {
    setReservations((prev) =>
      prev.map((reservation) => {
        if (reservation.id !== id) {
          return reservation;
        }
        return {
          ...reservation,
          buyerConformity: conformity,
          escrowStatus: conformity === 'non_conform' ? 'hold' : reservation.escrowStatus,
          disputeNote: conformity === 'non_conform' ? note ?? reservation.disputeNote : reservation.disputeNote,
        };
      })
    );
    if (conformity === 'non_conform') {
      pushNotification(
        'Litige ouvert',
        'Votre signalement a été transmis à l’équipe DroPiPêche.'
      );
    }
  };

  const releaseEscrow: AppState['releaseEscrow'] = (id) => {
    let released = false;
    setReservations((prev) =>
      prev.map((reservation) =>
        reservation.id === id
          ? reservation.status === 'picked_up' &&
            reservation.buyerConformity === 'conform'
            ? (() => {
                released = true;
                return {
                  ...reservation,
                  escrowStatus: 'released',
                  paymentStatus: 'paid',
                  paidAt: reservation.paidAt ?? new Date().toISOString(),
                };
              })()
            : reservation
          : reservation
      )
    );
    if (released) {
      pushNotification(
        'Paiement débloqué',
        'La validation est terminée, le paiement est transféré au pêcheur.'
      );
    }
  };

  const resolveDispute: AppState['resolveDispute'] = (id, resolution) => {
    const now = new Date().toISOString();
    setReservations((prev) =>
      prev.map((reservation) => {
        if (reservation.id !== id) {
          return reservation;
        }
        if (reservation.escrowStatus !== 'hold') {
          return reservation;
        }
        if (resolution === 'refund_buyer') {
          return {
            ...reservation,
            escrowStatus: 'refunded',
            disputeResolution: resolution,
            disputeResolvedAt: now,
          };
        }
        if (resolution === 'split') {
          return {
            ...reservation,
            escrowStatus: 'released',
            disputeResolution: resolution,
            disputeResolvedAt: now,
          };
        }
        return {
          ...reservation,
          escrowStatus: 'released',
          status: reservation.status === 'picked_up' ? reservation.status : 'picked_up',
          disputeResolution: resolution,
          disputeResolvedAt: now,
        };
      })
    );
    pushNotification(
      'Litige traité',
      resolution === 'refund_buyer'
        ? 'Le remboursement acheteur a été validé.'
        : resolution === 'split'
        ? 'Un partage a été appliqué sur le paiement.'
        : 'Le paiement pêcheur a été validé.'
    );
  };

  const requestBuyerArrival: AppState['requestBuyerArrival'] = (id) => {
    const now = new Date().toISOString();
    let updated = false;
    setReservations((prev) =>
      prev.map((reservation) => {
        if (reservation.id !== id) {
          return reservation;
        }
        if (reservation.status !== 'confirmed' || reservation.buyerArrivalRequestedAt) {
          return reservation;
        }
        updated = true;
        return { ...reservation, buyerArrivalRequestedAt: now };
      })
    );
    if (updated) {
      pushNotification(
        'Arrivée signalée',
        'Le pêcheur doit confirmer votre arrivée au point de rendez-vous.'
      );
    }
  };

  const confirmBuyerArrival: AppState['confirmBuyerArrival'] = (id) => {
    const now = new Date().toISOString();
    let updated = false;
    setReservations((prev) =>
      prev.map((reservation) => {
        if (reservation.id !== id) {
          return reservation;
        }
        if (reservation.status !== 'confirmed' || reservation.buyerArrivalConfirmedAt) {
          return reservation;
        }
        updated = true;
        return {
          ...reservation,
          buyerArrivalRequestedAt: reservation.buyerArrivalRequestedAt ?? now,
          buyerArrivalConfirmedAt: now,
        };
      })
    );
    if (updated) {
      pushNotification(
        'Arrivée confirmée',
        'L\'acheteur est bien arrivé au point de rendez-vous.'
      );
    }
  };

  const declareFisherArrival: AppState['declareFisherArrival'] = (id) => {
    const now = new Date().toISOString();
    let updated = false;
    setReservations((prev) =>
      prev.map((reservation) => {
        if (reservation.id !== id) {
          return reservation;
        }
        if (reservation.status !== 'confirmed' || reservation.fisherArrivalDeclaredAt) {
          return reservation;
        }
        updated = true;
        return { ...reservation, fisherArrivalDeclaredAt: now };
      })
    );
    if (updated) {
      pushNotification(
        'Présence confirmée',
        'Le pêcheur est arrivé au point de rendez-vous.'
      );
    }
  };

  const applyCompensation = (
    id: string,
    triggeredBy: Role,
    reason: CompensationReason
  ) => {
    const now = new Date().toISOString();
    const target = reservations.find((item) => item.id === id);
    if (!target) {
      return;
    }
    if (target.status !== 'confirmed' || target.compensation) {
      return;
    }
    if (
      (triggeredBy === 'fisher' && !target.buyerArrivalConfirmedAt) ||
      (triggeredBy === 'buyer' && !target.fisherArrivalDeclaredAt)
    ) {
      return;
    }
    const compensation = buildCompensation({
      totalPrice: target.totalPrice,
      triggeredBy,
      reason,
      decidedAt: now,
    });
    const escrowStatus =
      reason === 'cancelled_after_arrival'
        ? triggeredBy === 'fisher'
          ? 'refunded'
          : 'released'
        : target.escrowStatus;
    setReservations((prev) =>
      prev.map((reservation) =>
        reservation.id === id
          ? {
              ...reservation,
              compensation,
              escrowStatus,
              ...(reason === 'cancelled_after_arrival'
                ? {
                    status: 'rejected',
                    cancellationBy: triggeredBy,
                    cancellationAt: now,
                  }
                : null),
            }
          : reservation
      )
    );
    pushNotification(
      'Compensation déplacement',
      `Une compensation de ${compensation.amount.toFixed(2)} € a été attribuée au ${
        compensation.beneficiary === 'buyer' ? 'client' : 'pêcheur'
      }.`
    );
  };

  const declareDelay: AppState['declareDelay'] = (id, triggeredBy) => {
    applyCompensation(id, triggeredBy, 'late');
  };

  const cancelAfterArrival: AppState['cancelAfterArrival'] = (id, triggeredBy) => {
    applyCompensation(id, triggeredBy, 'cancelled_after_arrival');
  };

  const toggleFavorite = (listingId: string) => {
    setFavorites((prev) =>
      prev.includes(listingId)
        ? prev.filter((id) => id !== listingId)
        : [listingId, ...prev]
    );
  };

  const startChat: AppState['startChat'] = (listingId) => {
    const existing = chatThreads.find((thread) => thread.listingId === listingId);
    if (existing) {
      return existing.id;
    }
    const listing = listings.find((item) => item.id === listingId);
    const newThread: ChatThread = {
      id: `t-${Date.now()}`,
      listingId,
      listingTitle: listing?.title ?? 'Annonce',
      otherName: listing?.fisherName ?? 'Pêcheur',
      lastMessage: 'Conversation démarrée',
      updatedAt: new Date().toISOString(),
      unreadCount: 0,
    };
    setChatThreads((prev) => [newThread, ...prev]);
    return newThread.id;
  };

  const sendChatMessage: AppState['sendChatMessage'] = (threadId, text) => {
    if (!role) {
      return;
    }
    const trimmed = text.trim();
    if (!trimmed) {
      return;
    }
    const message: ChatMessage = {
      id: `m-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      threadId,
      sender: role,
      text: trimmed,
      createdAt: new Date().toISOString(),
    };
    setChatMessages((prev) => [...prev, message]);
    setChatThreads((prev) =>
      prev.map((thread) =>
        thread.id === threadId
          ? {
              ...thread,
              lastMessage: trimmed,
              updatedAt: message.createdAt,
            }
          : thread
      )
    );
  };

  const markThreadRead: AppState['markThreadRead'] = (threadId) => {
    setChatThreads((prev) =>
      prev.map((thread) =>
        thread.id === threadId ? { ...thread, unreadCount: 0 } : thread
      )
    );
  };

  const updateFisherApplicantStatus: AppState['updateFisherApplicantStatus'] = (
    id,
    status
  ) => {
    setFisherApplicants((prev) =>
      prev.map((applicant) =>
        applicant.id === id ? { ...applicant, status } : applicant
      )
    );
  };

  const updateBuyerApplicantStatus: AppState['updateBuyerApplicantStatus'] = (
    id,
    status
  ) => {
    setBuyerApplicants((prev) =>
      prev.map((applicant) =>
        applicant.id === id ? { ...applicant, status } : applicant
      )
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  const resetApp = () => {
    setUsers(demoUsers);
    setCurrentUserId(null);
    setRole(null);
    setFisherStatus('draft');
    setFisherProfile({ ...defaultFisherProfile });
    setBuyerStatus('draft');
    setBuyerProfile({ ...defaultBuyerProfile });
    setKnownPortsState(knownPorts);
    setListings(initialListings);
    setReservations(initialReservations);
    setCart([]);
    setNotifications(initialNotifications);
    setChatThreads(initialChatThreads);
    setChatMessages(initialChatMessages);
    setFisherApplicants(initialFisherApplicants);
    setBuyerApplicants(initialBuyerApplicants);
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
          users: AuthUser[];
          currentUserId: string | null;
          role: Role | null;
          fisherStatus: FisherStatus;
          fisherProfile: FisherProfile;
          buyerStatus: BuyerStatus;
          buyerProfile: BuyerProfile;
          knownPorts: string[];
          listings: Listing[];
          reservations: Reservation[];
          cart: CartItem[];
          notifications: AppNotification[];
          chatThreads: ChatThread[];
          chatMessages: ChatMessage[];
          fisherApplicants: FisherApplicant[];
          buyerApplicants: BuyerApplicant[];
          favorites: string[];
          queue: QueueItem[];
          syncHistory: SyncHistoryItem[];
        }>;
        if (data.role !== undefined) {
          setRole(data.role);
        }
        if (data.users && data.users.length > 0) {
          setUsers(data.users);
        } else {
          setUsers(demoUsers);
        }
        if (data.currentUserId !== undefined) {
          setCurrentUserId(data.currentUserId);
        }
        if (data.fisherStatus) {
          setFisherStatus(data.fisherStatus);
        }
        if (data.fisherProfile) {
          setFisherProfile({
            ...defaultFisherProfile,
            ...data.fisherProfile,
          });
        }
        if (data.buyerStatus) {
          setBuyerStatus(data.buyerStatus);
        }
        if (data.buyerProfile) {
          setBuyerProfile({
            ...defaultBuyerProfile,
            ...data.buyerProfile,
          });
        }
        if (data.knownPorts && data.knownPorts.length > 0) {
          const merged = [...data.knownPorts, ...knownPorts].reduce<string[]>(
            (acc, port) => {
              const normalized = normalizePortName(port);
              if (!normalized) {
                return acc;
              }
              const exists = acc.some(
                (item) => item.toLowerCase() === normalized.toLowerCase()
              );
              if (!exists) {
                acc.push(normalized);
              }
              return acc;
            },
            []
          );
          setKnownPortsState(merged);
        } else {
          setKnownPortsState(knownPorts);
        }
        if (data.listings && data.listings.length >= initialListings.length) {
          const safeListings = data.listings.map((item) => ({
            ...item,
            createdAt: item.createdAt ?? new Date().toISOString(),
            catchDate: item.catchDate ?? 'Aujourd\'hui',
            method: item.method ?? 'Non précisée',
            sizeGrade: item.sizeGrade ?? 'Standard',
            qualityTags: item.qualityTags ?? ['Frais'],
          }));
          setListings(safeListings);
        } else if (!data.listings) {
          setListings(initialListings);
        } else {
          setListings(initialListings);
        }
        if (data.reservations && data.reservations.length >= initialReservations.length) {
          const safeReservations = data.reservations.map((item) => ({
            ...item,
            totalPrice:
              item.totalPrice ??
              (() => {
                const listing = (data.listings ?? listings).find(
                  (l) => l.id === item.listingId
                );
                return listing ? item.qtyKg * listing.pricePerKg : 0;
              })(),
            paymentStatus: item.paymentStatus ?? 'unpaid',
            escrowStatus: item.escrowStatus ?? 'unpaid',
            buyerConformity: item.buyerConformity ?? 'pending',
          }));
          setReservations(safeReservations);
        } else if (!data.reservations) {
          setReservations(initialReservations);
        } else {
          setReservations(initialReservations);
        }
        if (data.cart) {
          setCart(data.cart);
        }
        if (data.notifications) {
          setNotifications(data.notifications);
        }
        if (data.chatThreads) {
          setChatThreads(data.chatThreads);
        }
        if (data.chatMessages) {
          setChatMessages(data.chatMessages);
        }
        if (data.fisherApplicants) {
          setFisherApplicants(data.fisherApplicants);
        }
        if (data.buyerApplicants) {
          setBuyerApplicants(data.buyerApplicants);
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
    if (!currentUser) {
      return;
    }
    if (role !== currentUser.role) {
      setRole(currentUser.role);
    }
  }, [currentUser, role]);

  useEffect(() => {
    const netInfoModule: any = NetInfo ? (NetInfo as any).default ?? NetInfo : null;
    if (!netInfoModule?.addEventListener) {
      setIsOnline(true);
      return;
    }
    const unsubscribe = netInfoModule.addEventListener((state: any) => {
      const online =
        Boolean(state.isConnected) && state.isInternetReachable !== false;
      setIsOnline(online);
    });
    netInfoModule
      .fetch()
      .then((state: any) => {
        const online =
          Boolean(state.isConnected) && state.isInternetReachable !== false;
        setIsOnline(online);
      })
      .catch(() => undefined);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    const payload = JSON.stringify({
      users,
      currentUserId,
      role,
      fisherStatus,
      fisherProfile,
      buyerStatus,
      buyerProfile,
      knownPorts: knownPortsState,
      listings,
      reservations,
      cart,
      notifications,
      chatThreads,
      chatMessages,
      fisherApplicants,
      buyerApplicants,
      favorites,
      queue,
      syncHistory,
    });
    AsyncStorage.setItem(STORAGE_KEY, payload).catch(() => undefined);
  }, [
    users,
    currentUserId,
    role,
    fisherStatus,
    fisherProfile,
    buyerStatus,
    buyerProfile,
    knownPortsState,
    listings,
    reservations,
    cart,
    notifications,
    chatThreads,
    chatMessages,
    fisherApplicants,
    buyerApplicants,
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
      currentUser,
      users,
      signIn,
      signUp,
      signOut,
      role,
      setRole,
      fisherStatus,
      setFisherStatus,
      fisherProfile,
      setFisherProfile,
      buyerStatus,
      setBuyerStatus,
      buyerProfile,
      setBuyerProfile,
      knownPorts: knownPortsState,
      registerPort,
      listings,
      reservations,
      cart,
      notifications,
      chatThreads,
      chatMessages,
      fisherApplicants,
      buyerApplicants,
      unreadCount,
      favorites,
      toggleFavorite,
      startChat,
      sendChatMessage,
      markThreadRead,
      updateFisherApplicantStatus,
      updateBuyerApplicantStatus,
      isOnline,
      queue,
      syncHistory,
      syncQueue,
      addListing,
      createReservation,
      updateReservationStatus,
      markReservationPaid,
      addToCart,
      updateCartQty,
      removeCartItem,
      clearCart,
      checkoutCart,
      updateDeliveryStatus,
      setBuyerConformity,
      releaseEscrow,
      resolveDispute,
      requestBuyerArrival,
      confirmBuyerArrival,
      declareFisherArrival,
      declareDelay,
      cancelAfterArrival,
      markAllNotificationsRead,
      resetApp,
      hydrated,
    }),
    [
      currentUser,
      users,
      signIn,
      signUp,
      signOut,
      role,
      fisherStatus,
      fisherProfile,
      buyerStatus,
      buyerProfile,
      knownPortsState,
      listings,
      reservations,
      cart,
      notifications,
      chatThreads,
      chatMessages,
      fisherApplicants,
      buyerApplicants,
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
