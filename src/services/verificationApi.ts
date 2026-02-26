import { BuyerProfile, FisherProfile, VerificationReport } from '../types';

const baseUrl = (process.env.EXPO_PUBLIC_API_BASE_URL ?? '')
  .trim()
  .replace(/\/$/, '');

export const canUseRemoteVerification = () => Boolean(baseUrl);

const postJson = async <T>(path: string, payload: unknown): Promise<T | null> => {
  if (!baseUrl) {
    return null;
  }
  const response = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    return null;
  }
  return (await response.json()) as T;
};

export const verifyBuyerRemote = async (
  profile: BuyerProfile
): Promise<VerificationReport | null> =>
  postJson<VerificationReport>('/kyc/buyer', { profile, role: 'buyer' });

export const verifyFisherRemote = async (
  profile: FisherProfile
): Promise<VerificationReport | null> =>
  postJson<VerificationReport>('/kyc/fisher', { profile, role: 'fisher' });
