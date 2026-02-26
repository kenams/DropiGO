-- Basic RLS policies (starter)

alter table public.profiles enable row level security;
alter table public.buyer_profiles enable row level security;
alter table public.fisher_profiles enable row level security;
alter table public.listings enable row level security;
alter table public.reservations enable row level security;

-- Profiles
create policy "Profiles view own" on public.profiles
  for select using (id = auth.uid());

create policy "Profiles insert own" on public.profiles
  for insert with check (id = auth.uid());

create policy "Profiles update own" on public.profiles
  for update using (id = auth.uid());

-- Buyer profiles
create policy "Buyer profiles view own" on public.buyer_profiles
  for select using (id = auth.uid());

create policy "Buyer profiles upsert own" on public.buyer_profiles
  for insert with check (id = auth.uid());

create policy "Buyer profiles update own" on public.buyer_profiles
  for update using (id = auth.uid());

-- Fisher profiles
create policy "Fisher profiles view own" on public.fisher_profiles
  for select using (id = auth.uid());

create policy "Fisher profiles upsert own" on public.fisher_profiles
  for insert with check (id = auth.uid());

create policy "Fisher profiles update own" on public.fisher_profiles
  for update using (id = auth.uid());

-- Listings: readable by all authenticated users, writable by fisher
create policy "Listings read" on public.listings
  for select using (true);

create policy "Listings insert by fisher" on public.listings
  for insert with check (fisher_id = auth.uid());

create policy "Listings update by fisher" on public.listings
  for update using (fisher_id = auth.uid());

-- Reservations: buyer or fisher can read; buyer creates; buyer or fisher updates
create policy "Reservations read" on public.reservations
  for select using (buyer_id = auth.uid() or fisher_id = auth.uid());

create policy "Reservations insert by buyer" on public.reservations
  for insert with check (buyer_id = auth.uid());

create policy "Reservations update by owner" on public.reservations
  for update using (buyer_id = auth.uid() or fisher_id = auth.uid());
