import { AppNotification, Listing, Reservation } from '../types';

export const initialListings: Listing[] = [
  {
    id: 'l-1',
    title: 'Bar de ligne - 30 kg',
    variety: 'Bar',
    pricePerKg: 18,
    stockKg: 30,
    location: 'Port de Sète',
    pickupWindow: 'Aujourd\'hui 17:00-19:00',
    latitude: 43.4075,
    longitude: 3.7004,
    status: 'active',
    fisherName: 'Loïc Martin',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: 'l-2',
    title: 'Sardines fraîches - 50 kg',
    variety: 'Sardine',
    pricePerKg: 6,
    stockKg: 50,
    location: 'Port de Marseille',
    pickupWindow: 'Demain 08:00-10:00',
    latitude: 43.2965,
    longitude: 5.3698,
    status: 'active',
    fisherName: 'Kenza A.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
  },
];

export const initialReservations: Reservation[] = [
  {
    id: 'r-1',
    listingId: 'l-1',
    listingTitle: 'Bar de ligne - 30 kg',
    buyerName: 'Restaurant La Vague',
    qtyKg: 8,
    pickupTime: 'Aujourd\'hui 18:00',
    status: 'pending',
  },
];

export const initialNotifications: AppNotification[] = [];
