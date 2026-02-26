import { BuyerProfile, FisherProfile } from '../types';
import { supabase } from './supabase';

type BuyerProfileRow = {
  registry: string | null;
  activity: string | null;
  payment_method: string | null;
  id_number: string | null;
  address: string | null;
  id_photo_url: string | null;
  kbis_photo_url: string | null;
  kyc_status: string | null;
};

type FisherProfileRow = {
  permit: string | null;
  boat: string | null;
  registration: string | null;
  port: string | null;
  insurance: string | null;
  bank_account: string | null;
  id_number: string | null;
  license_photo_url: string | null;
  boat_photo_url: string | null;
  insurance_photo_url: string | null;
  rib_photo_url: string | null;
  kyc_status: string | null;
};

export const fetchBuyerProfile = async (
  userId: string
): Promise<{ profile: BuyerProfile | null; status: string | null }> => {
  if (!supabase) {
    return { profile: null, status: null };
  }
  const { data, error } = await supabase
    .from('buyer_profiles')
    .select(
      'registry, activity, payment_method, id_number, address, id_photo_url, kbis_photo_url, kyc_status'
    )
    .eq('id', userId)
    .maybeSingle();
  if (error || !data) {
    return { profile: null, status: null };
  }
  const row = data as BuyerProfileRow;
  return {
    profile: {
      name: '',
      company: '',
      registry: row.registry ?? '',
      activity: row.activity ?? '',
      phone: '',
      email: '',
      paymentMethod: row.payment_method ?? '',
      idNumber: row.id_number ?? '',
      address: row.address ?? '',
      idPhotoUri: row.id_photo_url ?? undefined,
      kbisPhotoUri: row.kbis_photo_url ?? undefined,
    },
    status: row.kyc_status ?? null,
  };
};

export const fetchFisherProfile = async (
  userId: string
): Promise<{ profile: FisherProfile | null; status: string | null }> => {
  if (!supabase) {
    return { profile: null, status: null };
  }
  const { data, error } = await supabase
    .from('fisher_profiles')
    .select(
      'permit, boat, registration, port, insurance, bank_account, id_number, license_photo_url, boat_photo_url, insurance_photo_url, rib_photo_url, kyc_status'
    )
    .eq('id', userId)
    .maybeSingle();
  if (error || !data) {
    return { profile: null, status: null };
  }
  const row = data as FisherProfileRow;
  return {
    profile: {
      name: '',
      permit: row.permit ?? '',
      boat: row.boat ?? '',
      registration: row.registration ?? '',
      port: row.port ?? '',
      insurance: row.insurance ?? '',
      bankAccount: row.bank_account ?? '',
      phone: '',
      email: '',
      idNumber: row.id_number ?? '',
      licensePhotoUri: row.license_photo_url ?? undefined,
      boatPhotoUri: row.boat_photo_url ?? undefined,
      insurancePhotoUri: row.insurance_photo_url ?? undefined,
      ribPhotoUri: row.rib_photo_url ?? undefined,
    },
    status: row.kyc_status ?? null,
  };
};

export const upsertBuyerProfile = async (
  userId: string,
  profile: BuyerProfile
) => {
  if (!supabase) {
    return;
  }
  await supabase
    .from('buyer_profiles')
    .upsert(
      {
        id: userId,
        registry: profile.registry,
        activity: profile.activity,
        payment_method: profile.paymentMethod,
        id_number: profile.idNumber,
        address: profile.address,
        id_photo_url: profile.idPhotoUri ?? null,
        kbis_photo_url: profile.kbisPhotoUri ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );
};

export const upsertFisherProfile = async (
  userId: string,
  profile: FisherProfile
) => {
  if (!supabase) {
    return;
  }
  await supabase
    .from('fisher_profiles')
    .upsert(
      {
        id: userId,
        permit: profile.permit,
        boat: profile.boat,
        registration: profile.registration,
        port: profile.port,
        insurance: profile.insurance,
        bank_account: profile.bankAccount,
        id_number: profile.idNumber,
        license_photo_url: profile.licensePhotoUri ?? null,
        boat_photo_url: profile.boatPhotoUri ?? null,
        insurance_photo_url: profile.insurancePhotoUri ?? null,
        rib_photo_url: profile.ribPhotoUri ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );
};
