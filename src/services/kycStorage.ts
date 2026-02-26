import * as FileSystem from 'expo-file-system';
import { BuyerProfile, FisherProfile } from '../types';
import { supabase } from './supabase';

const bucket = 'kyc-docs';

type UploadResult = {
  path: string;
  publicUrl: string;
};

type UploadSummary<T> = {
  updates: Partial<T>;
  errors: string[];
};

const resolveUploadUri = async (uri: string) => {
  if (!uri.startsWith('content://')) {
    return uri;
  }
  const fsAny = FileSystem as typeof FileSystem & {
    cacheDirectory?: string;
    documentDirectory?: string;
  };
  const baseDir = fsAny.cacheDirectory || fsAny.documentDirectory;
  if (!baseDir) {
    return uri;
  }
  const rawName = uri.split('/').pop() || `doc-${Date.now()}.jpg`;
  const safeName = rawName.replace(/[^a-zA-Z0-9_.-]/g, '_');
  const target = `${baseDir}${safeName}`;
  await FileSystem.copyAsync({ from: uri, to: target });
  return target;
};

const uploadFile = async (
  userId: string,
  kind: string,
  uri: string
): Promise<UploadResult | null> => {
  if (!supabase) {
    return null;
  }
  if (uri.startsWith('http://') || uri.startsWith('https://')) {
    return null;
  }
  const normalizedUri = await resolveUploadUri(uri);
  const response = await fetch(normalizedUri);
  const blob = await response.blob();
  const extension = blob.type.split('/')[1] || 'jpg';
  const path = `${userId}/${kind}-${Date.now()}.${extension}`;
  const { error } = await supabase.storage.from(bucket).upload(path, blob, {
    contentType: blob.type || 'image/jpeg',
    upsert: true,
  });
  if (error) {
    throw new Error(error.message);
  }
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { path, publicUrl: data.publicUrl };
};

export const uploadFisherDocuments = async (
  userId: string,
  profile: FisherProfile
): Promise<UploadSummary<FisherProfile>> => {
  const updates: Partial<FisherProfile> = {};
  const errors: string[] = [];
  if (profile.licensePhotoUri) {
    try {
      const uploaded = await uploadFile(userId, 'license', profile.licensePhotoUri);
      if (uploaded) {
        updates.licensePhotoUri = uploaded.publicUrl;
      }
    } catch {
      errors.push('Pièce de licence');
    }
  }
  if (profile.boatPhotoUri) {
    try {
      const uploaded = await uploadFile(userId, 'boat', profile.boatPhotoUri);
      if (uploaded) {
        updates.boatPhotoUri = uploaded.publicUrl;
      }
    } catch {
      errors.push('Photo bateau');
    }
  }
  if (profile.insurancePhotoUri) {
    try {
      const uploaded = await uploadFile(
        userId,
        'insurance',
        profile.insurancePhotoUri
      );
      if (uploaded) {
        updates.insurancePhotoUri = uploaded.publicUrl;
      }
    } catch {
      errors.push('Assurance');
    }
  }
  if (profile.ribPhotoUri) {
    try {
      const uploaded = await uploadFile(userId, 'rib', profile.ribPhotoUri);
      if (uploaded) {
        updates.ribPhotoUri = uploaded.publicUrl;
      }
    } catch {
      errors.push('RIB');
    }
  }
  return { updates, errors };
};

export const uploadBuyerDocuments = async (
  userId: string,
  profile: BuyerProfile
): Promise<UploadSummary<BuyerProfile>> => {
  const updates: Partial<BuyerProfile> = {};
  const errors: string[] = [];
  if (profile.idPhotoUri) {
    try {
      const uploaded = await uploadFile(userId, 'id', profile.idPhotoUri);
      if (uploaded) {
        updates.idPhotoUri = uploaded.publicUrl;
      }
    } catch {
      errors.push('Pièce d’identité');
    }
  }
  if (profile.kbisPhotoUri) {
    try {
      const uploaded = await uploadFile(userId, 'kbis', profile.kbisPhotoUri);
      if (uploaded) {
        updates.kbisPhotoUri = uploaded.publicUrl;
      }
    } catch {
      errors.push('Extrait Kbis');
    }
  }
  return { updates, errors };
};
