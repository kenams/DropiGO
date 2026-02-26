import { BuyerProfile, FisherProfile } from '../types';
import { supabase } from './supabase';

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
