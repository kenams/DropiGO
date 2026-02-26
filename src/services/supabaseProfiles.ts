import { AuthUser, Role } from '../types';
import { supabase } from './supabase';

type ProfileRow = {
  id: string;
  role: Role;
  name: string;
  company: string | null;
  phone: string | null;
  email: string | null;
  created_at: string | null;
};

type AuthMeta = {
  role?: Role;
  name?: string;
  company?: string;
  phone?: string;
};

const toAuthUser = (profile: ProfileRow): AuthUser => ({
  id: profile.id,
  email: profile.email ?? '',
  phone: profile.phone ?? undefined,
  password: '',
  role: profile.role,
  name: profile.name,
  company: profile.company ?? undefined,
  createdAt: profile.created_at ?? new Date().toISOString(),
});

const baseProfileFromAuth = (
  authUser: { id: string; email: string | null; user_metadata?: AuthMeta },
  fallback: Partial<ProfileRow> = {}
): ProfileRow => {
  const meta = authUser.user_metadata ?? {};
  return {
    id: authUser.id,
    role: meta.role ?? fallback.role ?? 'buyer',
    name: meta.name ?? fallback.name ?? 'Compte DroPiPêche',
    company: meta.company ?? fallback.company ?? null,
    phone: meta.phone ?? fallback.phone ?? null,
    email: authUser.email ?? fallback.email ?? null,
    created_at: fallback.created_at ?? new Date().toISOString(),
  };
};

export const fetchProfile = async (userId: string): Promise<ProfileRow | null> => {
  if (!supabase) {
    return null;
  }
  const { data, error } = await supabase
    .from('profiles')
    .select('id, role, name, company, phone, email, created_at')
    .eq('id', userId)
    .single();
  if (error || !data) {
    return null;
  }
  return data as ProfileRow;
};

export const upsertProfile = async (
  authUser: { id: string; email: string | null; user_metadata?: AuthMeta },
  fallback: Partial<ProfileRow> = {}
): Promise<ProfileRow | null> => {
  if (!supabase) {
    return null;
  }
  const payload = baseProfileFromAuth(authUser, fallback);
  const { data, error } = await supabase
    .from('profiles')
    .upsert(payload, { onConflict: 'id' })
    .select('id, role, name, company, phone, email, created_at')
    .single();
  if (error || !data) {
    return null;
  }
  return data as ProfileRow;
};

export const resolveAuthUser = async (
  authUser: { id: string; email: string | null; user_metadata?: AuthMeta }
): Promise<AuthUser> => {
  const profile =
    (await fetchProfile(authUser.id)) ?? baseProfileFromAuth(authUser);
  return toAuthUser(profile);
};
