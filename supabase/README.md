# Supabase Setup (KYC)

## Schema
1. Create a new Supabase project.
2. Run `supabase/schema.sql` in the SQL editor.
3. Run `supabase/policies.sql` to enable RBAC + RLS rules (admin / buyer / fisher).

## Buckets
- `kyc-docs` (public or signed URLs depending on policy)

## Env vars (Expo)
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_API_BASE_URL` (endpoint exposing `/kyc/buyer` and `/kyc/fisher`)

## Notes
- The mobile app upserts profiles to `public.profiles` and KYC data to
  `public.buyer_profiles` / `public.fisher_profiles`.
- RBAC is enforced through `public.profiles.role` and RLS policies.
- Remote verification is optional; if `EXPO_PUBLIC_API_BASE_URL` is missing,
  the app uses the local mock verification logic.
 - Storage: create the `kyc-docs` bucket and store scanned documents there.
