import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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
  uploadBuyerDocuments,
  uploadFisherDocuments,
} from '../services/kycStorage';
import {
  configureNotifications,
  sendLocalNotification,
} from '../services/notifications';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import {
  fetchBuyerProfile,
  fetchFisherProfile,
  upsertBuyerProfile,
  upsertFisherProfile,
} from '../services/supabaseKyc';
import {
  fetchAllProfiles,
  resolveAuthUser,
  toAuthUser,
  updateProfileRole,
  upsertProfile,
} from '../services/supabaseProfiles';
import {
  canUseRemoteVerification,
  verifyBuyerRemote,
  verifyFisherRemote,
} from '../services/verificationApi';
import {
  finalizeBuyerVerification,
  finalizeFisherVerification,
  startBuyerVerification,
  startFisherVerification,
} from '../services/verification';
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
  VerificationHistoryItem,
  VerificationReport,
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
  {
    id: 'u-3',
    email: 'admin@dropipeche.demo',
    password: 'admin123',
    role: 'admin',
    name: 'Admin DroPiPêche',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
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
  idPhotoUri: undefined,
  kbisPhotoUri: undefined,
};

const normalizePortName = (value: string) =>
  value.trim().replace(/\s+/g, ' ');

const mergeUniqueStrings = (values: string[]) => {
  const seen = new Set<string>();
  const result: string[] = [];
  values.forEach((raw) => {
    const normalized = normalizePortName(raw);
    if (!normalized) {
      return;
    }
    const key = normalized.toLowerCase();
    if (seen.has(key)) {
      return;
    }
    seen.add(key);
    result.push(normalized);
  });
  return result;
};

const resolveBuyerName = (profile: BuyerProfile) => {
  if (profile.company.trim().length > 0) {
    return profile.company;
  }
  if (profile.name.trim().length > 0) {
    return profile.name;
  }
  return buyerName;
};

const toNumber = (value: unknown, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const mapListingRow = (row: any): Listing => ({
  id: row.id,
  title: row.title ?? '',
  variety: row.variety ?? '',
  pricePerKg: toNumber(row.price_per_kg),
  stockKg: toNumber(row.stock_kg),
  location: row.location ?? '',
  pickupWindow: row.pickup_window ?? '',
  pickupSlots: row.pickup_slots ?? undefined,
  catchDate: row.catch_date ?? 'Aujourd\'hui',
  method: row.method ?? 'Non précisée',
  sizeGrade: row.size_grade ?? 'Standard',
  qualityTags: row.quality_tags ?? ['Frais'],
  imageUri: row.image_url ?? undefined,
  latitude: row.latitude !== null && row.latitude !== undefined ? toNumber(row.latitude) : undefined,
  longitude: row.longitude !== null && row.longitude !== undefined ? toNumber(row.longitude) : undefined,
  fisherPermit: row.fisher_permit ?? undefined,
  fisherBoat: row.fisher_boat ?? undefined,
  fisherRegistration: row.fisher_registration ?? undefined,
  status: row.status ?? 'active',
  fisherName: row.fisher_name ?? fisherName,
  fisherId: row.fisher_id ?? undefined,
  createdAt: row.created_at ?? new Date().toISOString(),
});

const mapReservationRow = (row: any): Reservation => ({
  id: row.id,
  checkoutId: row.checkout_id ?? undefined,
  listingId: row.listing_id ?? '',
  buyerId: row.buyer_id ?? undefined,
  fisherId: row.fisher_id ?? undefined,
  listingTitle: row.listing_title ?? '',
  buyerName: row.buyer_name ?? '',
  qtyKg: toNumber(row.qty_kg),
  pickupTime: row.pickup_time ?? '',
  note: row.note ?? undefined,
  totalPrice: toNumber(row.total_price),
  paymentStatus: row.payment_status ?? 'unpaid',
  escrowStatus: row.escrow_status ?? 'unpaid',
  paidAt: row.paid_at ?? undefined,
  status: row.status ?? 'pending',
  deliveryStatus: row.delivery_status ?? 'at_sea',
  eta: row.eta ?? undefined,
  gpsLat: row.gps_lat !== null && row.gps_lat !== undefined ? toNumber(row.gps_lat) : undefined,
  gpsLng: row.gps_lng !== null && row.gps_lng !== undefined ? toNumber(row.gps_lng) : undefined,
  gpsUpdatedAt: row.gps_updated_at ?? undefined,
  buyerConformity: row.buyer_conformity ?? 'pending',
  disputeNote: row.dispute_note ?? undefined,
  disputePhotos: row.dispute_photos ?? undefined,
  buyerArrivalRequestedAt: row.buyer_arrival_requested_at ?? undefined,
  buyerArrivalConfirmedAt: row.buyer_arrival_confirmed_at ?? undefined,
  fisherArrivalDeclaredAt: row.fisher_arrival_declared_at ?? undefined,
  cancellationBy: row.cancellation_by ?? undefined,
  cancellationAt: row.cancellation_at ?? undefined,
  compensation: row.compensation ?? undefined,
  disputeResolution: row.dispute_resolution ?? undefined,
  disputeResolvedAt: row.dispute_resolved_at ?? undefined,
});

const mapChatMessageRow = (row: any): ChatMessage => ({
  id: row.id,
  threadId: row.thread_id ?? '',
  sender: row.sender_role ?? 'buyer',
  text: row.text ?? '',
  createdAt: row.created_at ?? new Date().toISOString(),
});

const resolveThreadOtherName = (row: any, currentRole: Role | null) => {
  if (currentRole === 'buyer') {
    return row.fisher_name ?? 'Pêcheur';
  }
  if (currentRole === 'fisher') {
    return row.buyer_name ?? 'Acheteur';
  }
  if (row.buyer_name && row.fisher_name) {
    return `${row.buyer_name} · ${row.fisher_name}`;
  }
  return row.buyer_name ?? row.fisher_name ?? 'Conversation';
};

const mapChatThreadRow = (
  row: any,
  currentRole: Role | null,
  unreadCount = 0
): ChatThread => ({
  id: row.id,
  listingId: row.listing_id ?? '',
  listingTitle: row.listing_title ?? 'Annonce',
  otherName: resolveThreadOtherName(row, currentRole),
  lastMessage: row.last_message ?? '',
  updatedAt: row.updated_at ?? new Date().toISOString(),
  unreadCount,
});

type AppState = {
  currentUser: AuthUser | null;
  users: AuthUser[];
  signIn: (identifier: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  signUp: (data: {
    name: string;
    email: string;
    phone?: string;
    password: string;
    role: Role;
    company?: string;
  }) => Promise<{ ok: boolean; message?: string }>;
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
  buyerVerification: VerificationReport | null;
  fisherVerification: VerificationReport | null;
  verificationHistory: VerificationHistoryItem[];
  submitBuyerVerification: (profile: BuyerProfile) => Promise<void>;
  submitFisherVerification: (profile: FisherProfile) => Promise<void>;
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
  startChat: (
    listingId: string,
    context?: {
      buyerId?: string;
      buyerName?: string;
      fisherId?: string;
      fisherName?: string;
      listingTitle?: string;
    }
  ) => Promise<string>;
  sendChatMessage: (threadId: string, text: string) => Promise<void>;
  markThreadRead: (threadId: string) => void;
  adminProfiles: AuthUser[];
  refreshAdminProfiles: () => Promise<void>;
  updateUserRole: (id: string, role: Role) => Promise<void>;
  fisherApplicants: FisherApplicant[];
  updateFisherApplicantStatus: (id: string, status: FisherApplicantStatus) => void;
  buyerApplicants: BuyerApplicant[];
  updateBuyerApplicantStatus: (id: string, status: BuyerApplicantStatus) => void;
  isOnline: boolean;
  queue: QueueItem[];
  syncHistory: SyncHistoryItem[];
  syncQueue: () => void;
  addListing: (
    listing: Omit<Listing, 'id' | 'status' | 'fisherName' | 'createdAt'>
  ) => Promise<void>;
  createReservation: (
    listingId: string,
    qtyKg: number,
    pickupTime: string,
    note?: string
  ) => Promise<void>;
  updateReservationStatus: (id: string, status: ReservationStatus) => void;
  markReservationPaid: (id: string) => void;
  addToCart: (listingId: string, qtyKg: number) => void;
  updateCartQty: (itemId: string, qtyKg: number) => void;
  removeCartItem: (itemId: string) => void;
  clearCart: () => void;
  checkoutCart: (pickupTime: string, note?: string) => void;
  updateDeliveryStatus: (id: string, status: Reservation['deliveryStatus']) => void;
  updateReservationLocation: (id: string, lat: number, lng: number) => void;
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
  const [buyerVerification, setBuyerVerification] =
    useState<VerificationReport | null>(null);
  const [fisherVerification, setFisherVerification] =
    useState<VerificationReport | null>(null);
  const [verificationHistory, setVerificationHistory] = useState<
    VerificationHistoryItem[]
  >([]);
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
  const [adminProfiles, setAdminProfiles] = useState<AuthUser[]>([]);
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
  const [authSource, setAuthSource] = useState<'local' | 'supabase' | null>(null);
  const authSourceRef = useRef<'local' | 'supabase' | null>(null);

  const pushNotification = (title: string, body: string) => {
    const notification = createNotification(title, body);
    setNotifications((prev) => [notification, ...prev]);
    sendLocalNotification(title, body).catch(() => undefined);
  };

  useEffect(() => {
    authSourceRef.current = authSource;
  }, [authSource]);

  const hasRole = (allowed: Role[], _allowAdmin = false) => {
    if (!role) {
      return false;
    }
    if (role === 'admin') {
      return true;
    }
    return allowed.includes(role);
  };

  const requireRole = (
    allowed: Role[],
    message: string,
    allowAdmin = false
  ) => {
    if (hasRole(allowed, allowAdmin)) {
      return true;
    }
    pushNotification('Accès restreint', message);
    return false;
  };

  const currentUser = useMemo(
    () => users.find((user) => user.id === currentUserId) ?? null,
    [users, currentUserId]
  );

  const upsertUserState = (user: AuthUser) => {
    setUsers((prev) => {
      const index = prev.findIndex((item) => item.id === user.id);
      if (index >= 0) {
        const next = [...prev];
        next[index] = { ...next[index], ...user };
        return next;
      }
      return [user, ...prev];
    });
    setCurrentUserId(user.id);
    setRole(user.role);
  };

  const clearUserContext = () => {
    setCurrentUserId(null);
    setRole(null);
    setBuyerStatus('draft');
    setFisherStatus('draft');
    setBuyerVerification(null);
    setFisherVerification(null);
    setBuyerProfile({ ...defaultBuyerProfile });
    setFisherProfile({ ...defaultFisherProfile });
    setAuthSource(null);
  };

  const applyUserContext = async (user: AuthUser) => {
    const isDemo = user.email.endsWith('@dropipeche.demo');
    upsertUserState(user);

    if (user.role === 'buyer') {
      let nextProfile: BuyerProfile = {
        ...defaultBuyerProfile,
        name: user.name,
        company: user.company || user.name,
        email: user.email,
        phone: user.phone || '',
      };
      let remoteStatus: BuyerStatus | null = null;
      if (isSupabaseConfigured()) {
        const { profile, status } = await fetchBuyerProfile(user.id);
        if (profile) {
          nextProfile = {
            ...nextProfile,
            ...profile,
            name: user.name,
            company: user.company || user.name,
            email: user.email,
            phone: user.phone || '',
          };
        }
        if (status === 'draft' || status === 'pending' || status === 'verified' || status === 'rejected') {
          remoteStatus = status;
        }
      }

      if (isDemo && !remoteStatus) {
        nextProfile = {
          ...nextProfile,
          registry: '55210055400013',
          activity: 'Restaurant',
          paymentMethod: 'Carte professionnelle',
          idNumber: 'ID-FR-932193',
          address: 'Quai des Pêcheurs, Sète',
        };
      }

      setBuyerProfile(nextProfile);
      const report = isDemo
        ? finalizeBuyerVerification(nextProfile, true)
        : startBuyerVerification();
      setBuyerVerification(report);
      setBuyerStatus(remoteStatus ?? (isDemo ? report.status : 'draft'));
      setFisherStatus('draft');
      setFisherVerification(null);
      setFisherProfile({ ...defaultFisherProfile });
      return;
    }

    if (user.role === 'fisher') {
      let nextProfile: FisherProfile = {
        ...defaultFisherProfile,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
      };
      let remoteStatus: FisherStatus | null = null;
      if (isSupabaseConfigured()) {
        const { profile, status } = await fetchFisherProfile(user.id);
        if (profile) {
          nextProfile = {
            ...nextProfile,
            ...profile,
            name: user.name,
            email: user.email,
            phone: user.phone || '',
          };
        }
        if (status === 'draft' || status === 'pending' || status === 'verified' || status === 'rejected') {
          remoteStatus = status;
        }
      }

      if (isDemo && !remoteStatus) {
        nextProfile = {
          ...nextProfile,
          permit: 'FR-PECH-9821',
          boat: 'L’Étoile Marine',
          registration: 'SE-4592',
          port: 'Port de Sète',
          insurance: 'Assurance Maritime AXA',
          bankAccount: 'FR76 3000 6000 0112 3456 7890 189',
          idNumber: 'ID-FR-125971',
        };
      }

      setFisherProfile(nextProfile);
      const report = isDemo
        ? finalizeFisherVerification(nextProfile, true)
        : startFisherVerification();
      setFisherVerification(report);
      setFisherStatus(remoteStatus ?? (isDemo ? report.status : 'draft'));
      setBuyerStatus('draft');
      setBuyerVerification(null);
      setBuyerProfile({ ...defaultBuyerProfile });
      return;
    }

    setBuyerStatus('draft');
    setFisherStatus('draft');
    setBuyerVerification(null);
    setFisherVerification(null);
    setBuyerProfile({ ...defaultBuyerProfile });
    setFisherProfile({ ...defaultFisherProfile });
  };

  const loadRemoteData = async (user: AuthUser) => {
    const client = supabase;
    if (!isSupabaseConfigured() || !client || authSourceRef.current !== 'supabase') {
      return;
    }

    const roleForData = user.role;
    try {
      const portsPromise = client
        .from('ports')
        .select('name')
        .order('created_at', { ascending: false });

      const listingsQuery = client
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false });
      if (roleForData === 'fisher' && user.id) {
        listingsQuery.eq('fisher_id', user.id);
      }

      const reservationsQuery = client
        .from('reservations')
        .select('*')
        .order('created_at', { ascending: false });
      if (roleForData === 'buyer') {
        reservationsQuery.eq('buyer_id', user.id);
      } else if (roleForData === 'fisher') {
        reservationsQuery.eq('fisher_id', user.id);
      }

      const favoritesPromise = client
        .from('favorites')
        .select('listing_id')
        .eq('user_id', user.id);

      const threadsQuery = client
        .from('chat_threads')
        .select('*')
        .order('updated_at', { ascending: false });
      if (roleForData !== 'admin') {
        threadsQuery.or(`buyer_id.eq.${user.id},fisher_id.eq.${user.id}`);
      }

      const [
        portsResult,
        listingsResult,
        reservationsResult,
        favoritesResult,
        threadsResult,
      ] = await Promise.all([
        portsPromise,
        listingsQuery,
        reservationsQuery,
        favoritesPromise,
        threadsQuery,
      ]);

      if (!portsResult.error && portsResult.data) {
        const remotePorts = portsResult.data
          .map((row: any) => row.name)
          .filter(Boolean);
        if (remotePorts.length > 0) {
          setKnownPortsState((prev) =>
            mergeUniqueStrings([...remotePorts, ...prev, ...knownPorts])
          );
        }
      }

      if (!listingsResult.error && listingsResult.data) {
        setListings(listingsResult.data.map(mapListingRow));
      }

      if (!reservationsResult.error && reservationsResult.data) {
        setReservations(reservationsResult.data.map(mapReservationRow));
      }

      if (!favoritesResult.error && favoritesResult.data) {
        setFavorites(
          favoritesResult.data
            .map((row: any) => row.listing_id)
            .filter(Boolean)
        );
      }

      if (!threadsResult.error && threadsResult.data) {
        const threads = threadsResult.data as any[];
        const threadIds = threads.map((row) => row.id).filter(Boolean);
        let messages: any[] = [];
        if (threadIds.length > 0) {
          const { data: messageRows } = await client
            .from('chat_messages')
            .select('*')
            .in('thread_id', threadIds)
            .order('created_at', { ascending: true });
          messages = messageRows ?? [];
        }

        const mappedMessages = messages.map(mapChatMessageRow);
        setChatMessages(mappedMessages);

        const unreadByThread = new Map<string, number>();
        if (roleForData === 'buyer' || roleForData === 'fisher') {
          messages.forEach((row) => {
            const senderRole = row.sender_role;
            if (senderRole === roleForData) {
              return;
            }
            const isRead =
              roleForData === 'buyer' ? row.read_by_buyer : row.read_by_fisher;
            if (isRead) {
              return;
            }
            const count = unreadByThread.get(row.thread_id) ?? 0;
            unreadByThread.set(row.thread_id, count + 1);
          });
        }

        setChatThreads(
          threads.map((row) =>
            mapChatThreadRow(row, roleForData, unreadByThread.get(row.id) ?? 0)
          )
        );
      }
    } catch {
      // Ignore remote sync errors for now.
    }
  };

  const refreshAdminProfiles: AppState['refreshAdminProfiles'] = async () => {
    if (role !== 'admin') {
      setAdminProfiles([]);
      return;
    }
    const client = supabase;
    if (!isSupabaseConfigured() || !client || authSource !== 'supabase') {
      setAdminProfiles(users);
      return;
    }
    const rows = await fetchAllProfiles();
    setAdminProfiles(rows.map(toAuthUser));
  };

  const updateUserRole: AppState['updateUserRole'] = async (id, nextRole) => {
    if (!requireRole(['admin'], 'Action réservée aux administrateurs.')) {
      return;
    }
    const client = supabase;
    if (isSupabaseConfigured() && client && authSource === 'supabase') {
      await updateProfileRole(id, nextRole);
      setAdminProfiles((prev) =>
        prev.map((profile) =>
          profile.id === id ? { ...profile, role: nextRole } : profile
        )
      );
    }

    setUsers((prev) =>
      prev.map((user) => (user.id === id ? { ...user, role: nextRole } : user))
    );
  };

  const signIn: AppState['signIn'] = async (identifier, password) => {
    const normalized = identifier.trim().toLowerCase();
    if (!normalized || !password) {
      return { ok: false, message: 'Renseignez vos identifiants.' };
    }

    const client = supabase;
    if (isSupabaseConfigured() && client && normalized.includes('@') && !normalized.endsWith('@dropipeche.demo')) {
      const { data, error } = await client.auth.signInWithPassword({
        email: normalized,
        password,
      });
      if (error || !data.user) {
        return { ok: false, message: error?.message ?? 'Connexion impossible.' };
      }
      const authUser = await resolveAuthUser(data.user);
      await applyUserContext({ ...authUser, password: '' });
      setAuthSource('supabase');
      return { ok: true };
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
    await applyUserContext(user);
    setAuthSource('local');
    return { ok: true };
  };

  const signUp: AppState['signUp'] = async (data) => {
    const email = data.email.trim().toLowerCase();
    const phone = data.phone?.trim();
    if (!data.name.trim() || !email || !data.password) {
      return { ok: false, message: 'Nom, email et mot de passe requis.' };
    }

    const client = supabase;
    if (isSupabaseConfigured() && client) {
      const { data: authData, error } = await client.auth.signUp({
        email,
        password: data.password,
        options: {
          data: {
            role: data.role,
            name: data.name.trim(),
            company: data.company?.trim(),
            phone: phone,
          },
        },
      });
      if (error) {
        return { ok: false, message: error.message };
      }
      if (authData.user) {
        await upsertProfile(authData.user, {
          role: data.role,
          name: data.name.trim(),
          company: data.company?.trim() ?? null,
          phone: phone ?? null,
          email,
        });
        if (authData.session?.user) {
          const authUser = await resolveAuthUser(authData.user);
          await applyUserContext({ ...authUser, password: '' });
          setAuthSource('supabase');
        }
      }
      return { ok: true };
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
    await applyUserContext(newUser);
    setAuthSource('local');
    return { ok: true };
  };

  const signOut: AppState['signOut'] = () => {
    const client = supabase;
    if (isSupabaseConfigured() && client) {
      client.auth.signOut().catch(() => undefined);
    }
    clearUserContext();
  };

  useEffect(() => {
    if (!currentUser || authSource !== 'supabase') {
      return;
    }
    loadRemoteData(currentUser);
    if (currentUser.role === 'admin') {
      refreshAdminProfiles().catch(() => undefined);
    }
  }, [authSource, currentUser?.id, currentUser?.role]);

  const recordVerification = (report: VerificationReport, subject: string) => {
    const history: VerificationHistoryItem = {
      id: `vh-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      role: report.role,
      subject,
      provider: report.provider,
      status: report.status,
      riskScore: report.riskScore,
      createdAt: report.createdAt,
    };
    setVerificationHistory((prev) => [history, ...prev]);
  };

  const submitBuyerVerification: AppState['submitBuyerVerification'] = async (
    profile
  ) => {
    if (!currentUser) {
      return;
    }
    setBuyerStatus('pending');
    setBuyerVerification(startBuyerVerification());

    let nextProfile = { ...profile };
    if (isSupabaseConfigured()) {
      const { updates, errors } = await uploadBuyerDocuments(
        currentUser.id,
        nextProfile
      );
      if (Object.keys(updates).length > 0) {
        nextProfile = { ...nextProfile, ...updates };
        setBuyerProfile(nextProfile);
      }
      if (errors.length > 0) {
        pushNotification(
          'Documents partiels',
          `Certains documents n'ont pas été envoyés : ${errors.join(', ')}.`
        );
      }
      await upsertBuyerProfile(currentUser.id, nextProfile);
    } else if (nextProfile.idPhotoUri || nextProfile.kbisPhotoUri) {
      pushNotification(
        'Stockage KYC désactivé',
        'Configurez Supabase pour enregistrer les documents.'
      );
    }

    const remoteReport =
      isOnline && canUseRemoteVerification()
        ? await verifyBuyerRemote(nextProfile)
        : null;
    const report =
      remoteReport ?? finalizeBuyerVerification(nextProfile, isOnline);
    setBuyerVerification(report);
    setBuyerStatus(report.status);
    recordVerification(report, nextProfile.company || nextProfile.name);
    setBuyerApplicants((prev) => {
      const submittedAt = new Date().toISOString();
      const payload: BuyerApplicant = {
        ...nextProfile,
        id: currentUser.id,
        status: report.status,
        submittedAt,
      };
      const index = prev.findIndex((item) => item.id === currentUser.id);
      if (index === -1) {
        return [payload, ...prev];
      }
      const next = [...prev];
      next[index] = { ...next[index], ...payload };
      return next;
    });
    pushNotification(
      report.status === 'verified' ? 'KYC validé' : 'KYC en analyse',
      report.status === 'rejected'
        ? 'Le dossier acheteur a été refusé.'
        : 'Votre dossier acheteur est en cours de vérification.'
    );
  };

  const submitFisherVerification: AppState['submitFisherVerification'] = async (
    profile
  ) => {
    if (!currentUser) {
      return;
    }
    setFisherStatus('pending');
    setFisherVerification(startFisherVerification());

    let nextProfile = { ...profile };
    if (isSupabaseConfigured()) {
      const { updates, errors } = await uploadFisherDocuments(
        currentUser.id,
        nextProfile
      );
      if (Object.keys(updates).length > 0) {
        nextProfile = { ...nextProfile, ...updates };
        setFisherProfile(nextProfile);
      }
      if (errors.length > 0) {
        pushNotification(
          'Documents partiels',
          `Certains documents n'ont pas été envoyés : ${errors.join(', ')}.`
        );
      }
      await upsertFisherProfile(currentUser.id, nextProfile);
    } else if (
      nextProfile.licensePhotoUri ||
      nextProfile.boatPhotoUri ||
      nextProfile.insurancePhotoUri ||
      nextProfile.ribPhotoUri
    ) {
      pushNotification(
        'Stockage KYC désactivé',
        'Configurez Supabase pour enregistrer les documents.'
      );
    }

    const remoteReport =
      isOnline && canUseRemoteVerification()
        ? await verifyFisherRemote(nextProfile)
        : null;
    const report =
      remoteReport ?? finalizeFisherVerification(nextProfile, isOnline);
    setFisherVerification(report);
    setFisherStatus(report.status);
    recordVerification(report, nextProfile.boat || nextProfile.name);
    setFisherApplicants((prev) => {
      const submittedAt = new Date().toISOString();
      const payload: FisherApplicant = {
        ...nextProfile,
        id: currentUser.id,
        status: report.status,
        submittedAt,
      };
      const index = prev.findIndex((item) => item.id === currentUser.id);
      if (index === -1) {
        return [payload, ...prev];
      }
      const next = [...prev];
      next[index] = { ...next[index], ...payload };
      return next;
    });
    pushNotification(
      report.status === 'verified' ? 'KYC validé' : 'KYC en analyse',
      report.status === 'rejected'
        ? 'Le dossier pêcheur a été refusé.'
        : 'Votre dossier pêcheur est en cours de vérification.'
    );
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

    const client = supabase;
    if (isSupabaseConfigured() && client && authSource === 'supabase' && currentUser) {
      void client
        .from('ports')
        .upsert(
          {
            name: normalized,
            created_by: currentUser.id,
          },
          { onConflict: 'name' }
        )
        .then(() => undefined);
    }
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

  const addListing: AppState['addListing'] = async (listing) => {
    if (!requireRole(['fisher'], 'Action réservée aux pêcheurs.')) {
      return;
    }
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
    const client = supabase;
    if (isSupabaseConfigured() && client && authSource === 'supabase' && currentUser) {
      const payload = {
        fisher_id: currentUser.id,
        fisher_name: effectiveFisherName,
        title: listing.title,
        variety: listing.variety,
        price_per_kg: listing.pricePerKg,
        stock_kg: listing.stockKg,
        location: listing.location,
        latitude: listing.latitude ?? null,
        longitude: listing.longitude ?? null,
        pickup_window: listing.pickupWindow,
        pickup_slots: listing.pickupSlots ?? null,
        catch_date: listing.catchDate,
        method: listing.method,
        size_grade: listing.sizeGrade,
        quality_tags: listing.qualityTags,
        image_url: listing.imageUri ?? null,
        fisher_permit: enrichedListing.fisherPermit ?? null,
        fisher_boat: enrichedListing.fisherBoat ?? null,
        fisher_registration: enrichedListing.fisherRegistration ?? null,
        status: 'active',
        created_at: createdAt,
      };
      const { data, error } = await client
        .from('listings')
        .insert(payload)
        .select('*')
        .single();
      if (error || !data) {
        pushNotification('Erreur', 'Impossible de publier l’annonce.');
        return;
      }
      setListings((prev) => [mapListingRow(data), ...prev]);
    } else {
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
      if (!isOnline) {
        enqueueAction('add_listing', `Annonce : ${listing.title}`);
      }
    }

    pushNotification(
      'Nouvelle pêche disponible',
      `${effectiveFisherName} propose ${listing.variety} à ${listing.pricePerKg} € / kg.`
    );
  };

  const createReservation: AppState['createReservation'] = async (
    listingId,
    qtyKg,
    pickupTime,
    note
  ) => {
    if (!requireRole(['buyer'], 'Action réservée aux acheteurs.')) {
      return;
    }
    const listing = listings.find((item) => item.id === listingId);
    if (!listing) {
      return;
    }
    const effectiveBuyerName = resolveBuyerName(buyerProfile);
    const totalPrice = qtyKg * listing.pricePerKg;
    const checkoutId = `ck-${Date.now()}`;
    const paidAt = new Date().toISOString();
    const client = supabase;
    if (isSupabaseConfigured() && client && authSource === 'supabase' && currentUser) {
      const payload = {
        listing_id: listingId,
        buyer_id: currentUser.id,
        fisher_id: listing.fisherId ?? null,
        listing_title: listing.title,
        buyer_name: effectiveBuyerName,
        qty_kg: qtyKg,
        total_price: totalPrice,
        pickup_time: pickupTime,
        note: note ?? null,
        checkout_id: checkoutId,
        payment_status: 'paid',
        escrow_status: 'escrowed',
        status: 'pending',
        delivery_status: 'at_sea',
        buyer_conformity: 'pending',
        gps_lat: listing.latitude ?? null,
        gps_lng: listing.longitude ?? null,
        gps_updated_at: listing.latitude && listing.longitude ? paidAt : null,
        created_at: paidAt,
      };
      const { data, error } = await client
        .from('reservations')
        .insert(payload)
        .select('*')
        .single();
      if (error || !data) {
        pushNotification('Erreur', 'Impossible de créer la réservation.');
        return;
      }
      setReservations((prev) => [mapReservationRow(data), ...prev]);
    } else {
      setReservations((prev) => [
        {
          id: `r-${prev.length + 1}`,
          checkoutId,
          listingId,
          buyerId: currentUser?.id,
          fisherId: listing.fisherId,
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
          gpsLat: listing.latitude,
          gpsLng: listing.longitude,
          gpsUpdatedAt: listing.latitude && listing.longitude ? paidAt : undefined,
          buyerConformity: 'pending',
        },
        ...prev,
      ]);
      if (!isOnline) {
        enqueueAction('create_reservation', `Réservation : ${listing.title}`);
      }
    }

    pushNotification(
      'Nouvelle réservation',
      `${effectiveBuyerName} a réservé ${qtyKg} kg sur ${listing.title}.`
    );
  };

  const updateReservationRemote = (id: string, payload: Record<string, any>) => {
    const client = supabase;
    if (!isSupabaseConfigured() || !client || authSource !== 'supabase') {
      return;
    }
    const cleaned = Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== undefined)
    );
    if (Object.keys(cleaned).length === 0) {
      return;
    }
    void client
      .from('reservations')
      .update(cleaned)
      .eq('id', id)
      .then(() => undefined);
  };

  const updateReservationStatus: AppState['updateReservationStatus'] = (
    id,
    status
  ) => {
    if (!requireRole(['fisher'], 'Action réservée aux pêcheurs.', true)) {
      return;
    }
    const now = new Date().toISOString();
    setReservations((prev) =>
      prev.map((reservation) => {
        if (reservation.id !== id) {
          return reservation;
        }
        if (status === 'picked_up') {
          const updated = {
            ...reservation,
            status,
            deliveryStatus: 'delivered' as Reservation['deliveryStatus'],
          };
          updateReservationRemote(id, {
            status,
            delivery_status: 'delivered',
          });
          return updated;
        }
        if (status === 'rejected') {
          const updated = {
            ...reservation,
            status,
            cancellationBy: reservation.cancellationBy ?? 'fisher',
            cancellationAt: reservation.cancellationAt ?? now,
            escrowStatus:
              reservation.escrowStatus === 'escrowed'
                ? 'refunded'
                : reservation.escrowStatus,
          };
          updateReservationRemote(id, {
            status,
            cancellation_by: updated.cancellationBy ?? 'fisher',
            cancellation_at: updated.cancellationAt ?? now,
            escrow_status: updated.escrowStatus ?? null,
          });
          return updated;
        }
        updateReservationRemote(id, { status });
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
    if (!requireRole(['buyer'], 'Action réservée aux acheteurs.', true)) {
      return;
    }
    const paidAt = new Date().toISOString();
    setReservations((prev) =>
      prev.map((reservation) =>
        reservation.id === id
          ? {
              ...reservation,
              paymentStatus: 'paid',
              paidAt,
            }
          : reservation
      )
    );
    updateReservationRemote(id, { payment_status: 'paid', paid_at: paidAt });
  };

  const addToCart: AppState['addToCart'] = (listingId, qtyKg) => {
    if (!requireRole(['buyer'], 'Action réservée aux acheteurs.')) {
      return;
    }
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
    if (!requireRole(['buyer'], 'Action réservée aux acheteurs.')) {
      return;
    }
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
    if (!requireRole(['buyer'], 'Action réservée aux acheteurs.')) {
      return;
    }
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  const clearCart: AppState['clearCart'] = () => {
    if (!requireRole(['buyer'], 'Action réservée aux acheteurs.')) {
      return;
    }
    setCart([]);
  };

  const checkoutCart: AppState['checkoutCart'] = (pickupTime, note) => {
    if (!requireRole(['buyer'], 'Action réservée aux acheteurs.')) {
      return;
    }
    if (cart.length === 0) {
      return;
    }
    const checkoutId = `ck-${Date.now()}`;
    const effectiveBuyerName = resolveBuyerName(buyerProfile);
    const createdAt = new Date().toISOString();
    const newReservations: Reservation[] = cart.map((item, index) => {
      const listing = listings.find((l) => l.id === item.listingId);
      return {
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
        gpsLat: listing?.latitude,
        gpsLng: listing?.longitude,
        gpsUpdatedAt:
          listing?.latitude && listing?.longitude ? createdAt : undefined,
        buyerConformity: 'pending',
      };
    });
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
    if (!requireRole(['fisher'], 'Action réservée aux pêcheurs.', true)) {
      return;
    }
    setReservations((prev) =>
      prev.map((reservation) =>
        reservation.id === id
          ? { ...reservation, deliveryStatus: status }
          : reservation
      )
    );
    if (status) {
      updateReservationRemote(id, { delivery_status: status });
    }
  };

  const updateReservationLocation: AppState['updateReservationLocation'] = (
    id,
    lat,
    lng
  ) => {
    if (!requireRole(['fisher'], 'Action réservée aux pêcheurs.', true)) {
      return;
    }
    const now = new Date().toISOString();
    setReservations((prev) =>
      prev.map((reservation) =>
        reservation.id === id
          ? {
              ...reservation,
              gpsLat: lat,
              gpsLng: lng,
              gpsUpdatedAt: now,
            }
          : reservation
      )
    );
    updateReservationRemote(id, {
      gps_lat: lat,
      gps_lng: lng,
      gps_updated_at: now,
    });
  };

  const setBuyerConformity: AppState['setBuyerConformity'] = (
    id,
    conformity,
    note
  ) => {
    if (!requireRole(['buyer'], 'Action réservée aux acheteurs.', true)) {
      return;
    }
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
    updateReservationRemote(id, {
      buyer_conformity: conformity,
      escrow_status: conformity === 'non_conform' ? 'hold' : undefined,
      dispute_note: conformity === 'non_conform' ? note ?? null : undefined,
    });
    if (conformity === 'non_conform') {
      pushNotification(
        'Litige ouvert',
        'Votre signalement a été transmis à l’équipe DroPiPêche.'
      );
    }
  };

  const releaseEscrow: AppState['releaseEscrow'] = (id) => {
    if (!requireRole(['buyer'], 'Action réservée aux acheteurs.', true)) {
      return;
    }
    const paidAt = new Date().toISOString();
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
                  paidAt: reservation.paidAt ?? paidAt,
                };
              })()
            : reservation
          : reservation
      )
    );
    if (released) {
      updateReservationRemote(id, {
        escrow_status: 'released',
        payment_status: 'paid',
        paid_at: paidAt,
      });
    }
    if (released) {
      pushNotification(
        'Paiement débloqué',
        'La validation est terminée, le paiement est transféré au pêcheur.'
      );
    }
  };

  const resolveDispute: AppState['resolveDispute'] = (id, resolution) => {
    if (!requireRole(['admin'], 'Action réservée aux administrateurs.')) {
      return;
    }
    const now = new Date().toISOString();
    let payload: Record<string, any> = {
      dispute_resolution: resolution,
      dispute_resolved_at: now,
    };
    setReservations((prev) =>
      prev.map((reservation) => {
        if (reservation.id !== id) {
          return reservation;
        }
        if (reservation.escrowStatus !== 'hold') {
          return reservation;
        }
        if (resolution === 'refund_buyer') {
          payload = { ...payload, escrow_status: 'refunded' };
          return {
            ...reservation,
            escrowStatus: 'refunded',
            disputeResolution: resolution,
            disputeResolvedAt: now,
          };
        }
        if (resolution === 'split') {
          payload = { ...payload, escrow_status: 'released' };
          return {
            ...reservation,
            escrowStatus: 'released',
            disputeResolution: resolution,
            disputeResolvedAt: now,
          };
        }
        payload = { ...payload, escrow_status: 'released', status: 'picked_up' };
        return {
          ...reservation,
          escrowStatus: 'released',
          status: reservation.status === 'picked_up' ? reservation.status : 'picked_up',
          disputeResolution: resolution,
          disputeResolvedAt: now,
        };
      })
    );
    updateReservationRemote(id, payload);
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
    if (!requireRole(['buyer'], 'Action réservée aux acheteurs.')) {
      return;
    }
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
      updateReservationRemote(id, { buyer_arrival_requested_at: now });
    }
    if (updated) {
      pushNotification(
        'Arrivée signalée',
        'Le pêcheur doit confirmer votre arrivée au point de rendez-vous.'
      );
    }
  };

  const confirmBuyerArrival: AppState['confirmBuyerArrival'] = (id) => {
    if (!requireRole(['fisher'], 'Action réservée aux pêcheurs.', true)) {
      return;
    }
    const now = new Date().toISOString();
    let updated = false;
    let requestedAt = now;
    setReservations((prev) =>
      prev.map((reservation) => {
        if (reservation.id !== id) {
          return reservation;
        }
        if (reservation.status !== 'confirmed' || reservation.buyerArrivalConfirmedAt) {
          return reservation;
        }
        updated = true;
        requestedAt = reservation.buyerArrivalRequestedAt ?? now;
        return {
          ...reservation,
          buyerArrivalRequestedAt: requestedAt,
          buyerArrivalConfirmedAt: now,
        };
      })
    );
    if (updated) {
      updateReservationRemote(id, {
        buyer_arrival_requested_at: requestedAt,
        buyer_arrival_confirmed_at: now,
      });
    }
    if (updated) {
      pushNotification(
        'Arrivée confirmée',
        'L\'acheteur est bien arrivé au point de rendez-vous.'
      );
    }
  };

  const declareFisherArrival: AppState['declareFisherArrival'] = (id) => {
    if (!requireRole(['fisher'], 'Action réservée aux pêcheurs.', true)) {
      return;
    }
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
      updateReservationRemote(id, { fisher_arrival_declared_at: now });
    }
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
    updateReservationRemote(id, {
      compensation,
      escrow_status: escrowStatus,
      ...(reason === 'cancelled_after_arrival'
        ? {
            status: 'rejected',
            cancellation_by: triggeredBy,
            cancellation_at: now,
          }
        : null),
    });
    pushNotification(
      'Compensation déplacement',
      `Une compensation de ${compensation.amount.toFixed(2)} € a été attribuée au ${
        compensation.beneficiary === 'buyer' ? 'client' : 'pêcheur'
      }.`
    );
  };

  const declareDelay: AppState['declareDelay'] = (id, triggeredBy) => {
    if (
      !requireRole(
        ['buyer', 'fisher'],
        'Action réservée aux comptes métier.',
        true
      )
    ) {
      return;
    }
    applyCompensation(id, triggeredBy, 'late');
  };

  const cancelAfterArrival: AppState['cancelAfterArrival'] = (id, triggeredBy) => {
    if (
      !requireRole(
        ['buyer', 'fisher'],
        'Action réservée aux comptes métier.',
        true
      )
    ) {
      return;
    }
    applyCompensation(id, triggeredBy, 'cancelled_after_arrival');
  };

  const toggleFavorite = (listingId: string) => {
    const isFavorite = favorites.includes(listingId);
    setFavorites((prev) =>
      isFavorite ? prev.filter((id) => id !== listingId) : [listingId, ...prev]
    );

    const client = supabase;
    if (isSupabaseConfigured() && client && authSource === 'supabase' && currentUser) {
      if (isFavorite) {
        void client
          .from('favorites')
          .delete()
          .eq('user_id', currentUser.id)
          .eq('listing_id', listingId)
          .then(() => undefined);
      } else {
        void client
          .from('favorites')
          .insert({ user_id: currentUser.id, listing_id: listingId })
          .then(() => undefined);
      }
    }
  };

  const startChat: AppState['startChat'] = async (listingId, context) => {
    const existing = chatThreads.find((thread) => thread.listingId === listingId);
    if (existing) {
      return existing.id;
    }
    const listing = listings.find((item) => item.id === listingId);
    const now = new Date().toISOString();

    const client = supabase;
    if (
      isSupabaseConfigured() &&
      client &&
      authSource === 'supabase' &&
      currentUser &&
      role &&
      role !== 'admin'
    ) {
      const buyerId = context?.buyerId ?? (role === 'buyer' ? currentUser.id : null);
      const fisherId =
        context?.fisherId ??
        (role === 'fisher' ? currentUser.id : listing?.fisherId ?? null);
      const buyerName =
        context?.buyerName ??
        (role === 'buyer' ? resolveBuyerName(buyerProfile) : 'Acheteur');
      const fisherNameResolved =
        context?.fisherName ??
        (role === 'fisher'
          ? fisherProfile.name || fisherName
          : listing?.fisherName ?? 'Pêcheur');
      const listingTitle = context?.listingTitle ?? listing?.title ?? 'Annonce';
      if (buyerId && fisherId) {
        const payload = {
          listing_id: listingId,
          buyer_id: buyerId,
          fisher_id: fisherId,
          listing_title: listingTitle,
          buyer_name: buyerName,
          fisher_name: fisherNameResolved,
          last_message: 'Conversation démarrée',
          updated_at: now,
        };
        const { data, error } = await client
          .from('chat_threads')
          .insert(payload)
          .select('*')
          .single();
        if (!error && data) {
          const newThread = mapChatThreadRow(data, role, 0);
          setChatThreads((prev) => [newThread, ...prev]);
          return data.id as string;
        }
      }
    }

    const newThread: ChatThread = {
      id: `t-${Date.now()}`,
      listingId,
      listingTitle: context?.listingTitle ?? listing?.title ?? 'Annonce',
      otherName:
        role === 'fisher'
          ? context?.buyerName ?? 'Acheteur'
          : listing?.fisherName ?? 'Pêcheur',
      lastMessage: 'Conversation démarrée',
      updatedAt: now,
      unreadCount: 0,
    };
    setChatThreads((prev) => [newThread, ...prev]);
    return newThread.id;
  };

  const sendChatMessage: AppState['sendChatMessage'] = async (
    threadId,
    text
  ) => {
    if (!role) {
      return;
    }
    const trimmed = text.trim();
    if (!trimmed) {
      return;
    }
    const createdAt = new Date().toISOString();
    const localMessage: ChatMessage = {
      id: `m-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      threadId,
      sender: role,
      text: trimmed,
      createdAt,
    };
    setChatMessages((prev) => [...prev, localMessage]);
    setChatThreads((prev) =>
      prev.map((thread) =>
        thread.id === threadId
          ? {
              ...thread,
              lastMessage: trimmed,
              updatedAt: createdAt,
              unreadCount: 0,
            }
          : thread
      )
    );

    const client = supabase;
    if (
      isSupabaseConfigured() &&
      client &&
      authSource === 'supabase' &&
      currentUser &&
      role !== 'admin'
    ) {
      const payload = {
        thread_id: threadId,
        sender_id: currentUser.id,
        sender_role: role,
        text: trimmed,
        read_by_buyer: role === 'buyer',
        read_by_fisher: role === 'fisher',
        created_at: createdAt,
      };
      const { data, error } = await client
        .from('chat_messages')
        .insert(payload)
        .select('*')
        .single();
      if (!error && data) {
        const mapped = mapChatMessageRow(data);
        setChatMessages((prev) =>
          prev.map((item) => (item.id === localMessage.id ? mapped : item))
        );
      }
      void client
        .from('chat_threads')
        .update({ last_message: trimmed, updated_at: createdAt })
        .eq('id', threadId)
        .then(() => undefined);
    }
  };

  const markThreadRead: AppState['markThreadRead'] = (threadId) => {
    setChatThreads((prev) =>
      prev.map((thread) =>
        thread.id === threadId ? { ...thread, unreadCount: 0 } : thread
      )
    );

    const client = supabase;
    if (
      isSupabaseConfigured() &&
      client &&
      authSource === 'supabase' &&
      currentUser &&
      role &&
      (role === 'buyer' || role === 'fisher')
    ) {
      const column = role === 'buyer' ? 'read_by_buyer' : 'read_by_fisher';
      void client
        .from('chat_messages')
        .update({ [column]: true })
        .eq('thread_id', threadId)
        .neq('sender_role', role)
        .then(() => undefined);
    }
  };

  const updateFisherApplicantStatus: AppState['updateFisherApplicantStatus'] = (
    id,
    status
  ) => {
    if (!requireRole(['admin'], 'Action réservée aux administrateurs.')) {
      return;
    }
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
    if (!requireRole(['admin'], 'Action réservée aux administrateurs.')) {
      return;
    }
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
    clearUserContext();
    setVerificationHistory([]);
    setKnownPortsState(knownPorts);
    setListings(initialListings);
    setReservations(initialReservations);
    setCart([]);
    setNotifications(initialNotifications);
    setChatThreads(initialChatThreads);
    setChatMessages(initialChatMessages);
    setAdminProfiles([]);
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
          buyerVerification: VerificationReport | null;
          fisherVerification: VerificationReport | null;
          verificationHistory: VerificationHistoryItem[];
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
        if (data.buyerVerification) {
          setBuyerVerification(data.buyerVerification);
        }
        if (data.fisherVerification) {
          setFisherVerification(data.fisherVerification);
        }
        if (data.verificationHistory) {
          setVerificationHistory(data.verificationHistory);
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
    const client = supabase;
    if (!isSupabaseConfigured() || !client) {
      return;
    }
    let active = true;

    const syncSession = async () => {
      const { data } = await client.auth.getSession();
      if (!active) {
        return;
      }
      if (data.session?.user) {
        const authUser = await resolveAuthUser(data.session.user);
        await applyUserContext({ ...authUser, password: '' });
        setAuthSource('supabase');
      }
    };

    syncSession().catch(() => undefined);

    const { data: listener } = client.auth.onAuthStateChange(
      async (_event, session) => {
        if (!active) {
          return;
        }
        if (session?.user) {
          const authUser = await resolveAuthUser(session.user);
          await applyUserContext({ ...authUser, password: '' });
          setAuthSource('supabase');
        } else if (authSourceRef.current === 'supabase') {
          clearUserContext();
        }
      }
    );

    return () => {
      active = false;
      listener?.subscription?.unsubscribe();
    };
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
      buyerVerification,
      fisherVerification,
      verificationHistory,
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
    buyerVerification,
    fisherVerification,
    verificationHistory,
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
      buyerVerification,
      fisherVerification,
      verificationHistory,
      submitBuyerVerification,
      submitFisherVerification,
      knownPorts: knownPortsState,
      registerPort,
      listings,
      reservations,
      cart,
      notifications,
      chatThreads,
      chatMessages,
      adminProfiles,
      fisherApplicants,
      buyerApplicants,
      unreadCount,
      favorites,
      toggleFavorite,
      startChat,
      sendChatMessage,
      markThreadRead,
      refreshAdminProfiles,
      updateUserRole,
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
      updateReservationLocation,
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
      buyerVerification,
      fisherVerification,
      verificationHistory,
      knownPortsState,
      listings,
      reservations,
      cart,
      notifications,
      chatThreads,
      chatMessages,
      adminProfiles,
      fisherApplicants,
      buyerApplicants,
      unreadCount,
      favorites,
      isOnline,
      queue,
      syncHistory,
      hydrated,
      submitBuyerVerification,
      submitFisherVerification,
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
