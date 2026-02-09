export type Role = 'fisher' | 'buyer';

export type FisherStatus = 'draft' | 'pending' | 'approved';

export type ListingStatus = 'active' | 'reserved_out' | 'closed';

export type ReservationStatus = 'pending' | 'confirmed' | 'picked_up' | 'rejected';

export type Listing = {
  id: string;
  title: string;
  variety: string;
  pricePerKg: number;
  stockKg: number;
  location: string;
  pickupWindow: string;
  imageUri?: string;
  latitude?: number;
  longitude?: number;
  status: ListingStatus;
  fisherName: string;
  createdAt: string;
};

export type Reservation = {
  id: string;
  listingId: string;
  listingTitle: string;
  buyerName: string;
  qtyKg: number;
  pickupTime: string;
  status: ReservationStatus;
};

export type FisherProfile = {
  name: string;
  permit: string;
  boat: string;
  registration: string;
  port: string;
};

export type AppNotification = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
};

export type QueueItem = {
  id: string;
  type: 'add_listing' | 'create_reservation' | 'update_reservation';
  summary: string;
  createdAt: string;
  status: 'pending' | 'synced';
};

export type SyncHistoryItem = {
  id: string;
  summary: string;
  syncedAt: string;
};
