export type Role = 'fisher' | 'buyer' | 'admin';

export type AuthUser = {
  id: string;
  email: string;
  phone?: string;
  password: string;
  role: Role;
  name: string;
  company?: string;
  createdAt: string;
};

export type FisherStatus = 'draft' | 'pending' | 'verified' | 'rejected';

export type BuyerStatus = 'draft' | 'pending' | 'verified' | 'rejected';

export type VerificationStatus = 'pending' | 'verified' | 'rejected';

export type VerificationRiskLevel = 'low' | 'medium' | 'high';

export type VerificationCheck = {
  id: string;
  label: string;
  status: 'pending' | 'passed' | 'failed';
  detail?: string;
};

export type VerificationReport = {
  id: string;
  role: Role;
  provider: string;
  status: VerificationStatus;
  checks: VerificationCheck[];
  riskScore: number;
  riskLevel: VerificationRiskLevel;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
};

export type VerificationHistoryItem = {
  id: string;
  role: Role;
  subject: string;
  provider: string;
  status: VerificationStatus;
  riskScore: number;
  createdAt: string;
};

export type ListingStatus = 'active' | 'reserved_out' | 'closed';

export type ReservationStatus = 'pending' | 'confirmed' | 'picked_up' | 'rejected';

export type CompensationReason = 'late' | 'cancelled_after_arrival';

export type Compensation = {
  beneficiary: Role;
  amount: number;
  reason: CompensationReason;
  triggeredBy: Role;
  decidedAt: string;
};

export type Listing = {
  id: string;
  title: string;
  variety: string;
  pricePerKg: number;
  stockKg: number;
  location: string;
  pickupWindow: string;
  pickupSlots?: string[];
  catchDate: string;
  method: string;
  sizeGrade: string;
  qualityTags: string[];
  imageUri?: string;
  latitude?: number;
  longitude?: number;
  fisherPermit?: string;
  fisherBoat?: string;
  fisherRegistration?: string;
  status: ListingStatus;
  fisherName: string;
  createdAt: string;
};

export type Reservation = {
  id: string;
  checkoutId?: string;
  listingId: string;
  listingTitle: string;
  buyerName: string;
  qtyKg: number;
  pickupTime: string;
  note?: string;
  totalPrice: number;
  paymentStatus: 'unpaid' | 'paid';
  escrowStatus?: 'unpaid' | 'escrowed' | 'released' | 'refunded' | 'hold';
  paidAt?: string;
  status: ReservationStatus;
  deliveryStatus?: 'at_sea' | 'approaching_port' | 'arrived' | 'delivered';
  eta?: string;
  gpsLat?: number;
  gpsLng?: number;
  gpsUpdatedAt?: string;
  buyerConformity?: 'pending' | 'conform' | 'non_conform';
  disputeNote?: string;
  disputePhotos?: string[];
  buyerArrivalRequestedAt?: string;
  buyerArrivalConfirmedAt?: string;
  fisherArrivalDeclaredAt?: string;
  cancellationBy?: Role;
  cancellationAt?: string;
  compensation?: Compensation;
  disputeResolution?: 'refund_buyer' | 'pay_fisher' | 'split';
  disputeResolvedAt?: string;
};

export type FisherProfile = {
  name: string;
  permit: string;
  boat: string;
  registration: string;
  port: string;
  insurance: string;
  bankAccount: string;
  phone: string;
  email: string;
  idNumber: string;
  licensePhotoUri?: string;
  boatPhotoUri?: string;
  insurancePhotoUri?: string;
  ribPhotoUri?: string;
};

export type BuyerProfile = {
  name: string;
  company: string;
  registry: string;
  activity: string;
  phone: string;
  email: string;
  paymentMethod: string;
  idNumber: string;
  address: string;
  idPhotoUri?: string;
  kbisPhotoUri?: string;
};

export type FisherApplicantStatus = 'pending' | 'verified' | 'rejected';

export type FisherApplicant = FisherProfile & {
  id: string;
  status: FisherApplicantStatus;
  submittedAt: string;
};

export type BuyerApplicantStatus = 'pending' | 'verified' | 'rejected';

export type BuyerApplicant = BuyerProfile & {
  id: string;
  status: BuyerApplicantStatus;
  submittedAt: string;
};

export type AppNotification = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
};

export type ChatMessage = {
  id: string;
  threadId: string;
  sender: Role;
  text: string;
  createdAt: string;
};

export type ChatThread = {
  id: string;
  listingId: string;
  listingTitle: string;
  otherName: string;
  lastMessage: string;
  updatedAt: string;
  unreadCount: number;
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

export type CartItem = {
  id: string;
  listingId: string;
  title: string;
  pricePerKg: number;
  qtyKg: number;
  fisherName: string;
  location: string;
};
