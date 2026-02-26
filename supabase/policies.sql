-- Basic RLS policies (starter)

alter table public.profiles enable row level security;
alter table public.buyer_profiles enable row level security;
alter table public.fisher_profiles enable row level security;
alter table public.listings enable row level security;
alter table public.reservations enable row level security;
alter table public.ports enable row level security;
alter table public.favorites enable row level security;
alter table public.chat_threads enable row level security;
alter table public.chat_messages enable row level security;

-- Helpers
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists(
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.has_role(role_name public.app_role)
returns boolean
language sql
stable
as $$
  select exists(
    select 1 from public.profiles
    where id = auth.uid() and role = role_name
  );
$$;

create or replace function public.is_thread_participant(thread_id uuid)
returns boolean
language sql
stable
as $$
  select exists(
    select 1 from public.chat_threads
    where id = thread_id
      and (buyer_id = auth.uid() or fisher_id = auth.uid())
  );
$$;

-- Profiles
create policy "Profiles view own" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

create policy "Profiles insert own" on public.profiles
  for insert with check (id = auth.uid() or public.is_admin());

create policy "Profiles update own" on public.profiles
  for update using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- Buyer profiles
create policy "Buyer profiles view own" on public.buyer_profiles
  for select using (id = auth.uid() or public.is_admin());

create policy "Buyer profiles upsert own" on public.buyer_profiles
  for insert with check (id = auth.uid() or public.is_admin());

create policy "Buyer profiles update own" on public.buyer_profiles
  for update using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- Fisher profiles
create policy "Fisher profiles view own" on public.fisher_profiles
  for select using (id = auth.uid() or public.is_admin());

create policy "Fisher profiles upsert own" on public.fisher_profiles
  for insert with check (id = auth.uid() or public.is_admin());

create policy "Fisher profiles update own" on public.fisher_profiles
  for update using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- Listings: readable by all authenticated users, writable by fisher
create policy "Listings read" on public.listings
  for select using (true);

create policy "Listings insert by fisher" on public.listings
  for insert with check (
    (fisher_id = auth.uid() and public.has_role('fisher'))
    or public.is_admin()
  );

create policy "Listings update by fisher" on public.listings
  for update using (
    (fisher_id = auth.uid() and public.has_role('fisher'))
    or public.is_admin()
  )
  with check (
    (fisher_id = auth.uid() and public.has_role('fisher'))
    or public.is_admin()
  );

-- Reservations: buyer or fisher can read; buyer creates; buyer or fisher updates
create policy "Reservations read" on public.reservations
  for select using (
    buyer_id = auth.uid()
    or fisher_id = auth.uid()
    or public.is_admin()
  );

create policy "Reservations insert by buyer" on public.reservations
  for insert with check (
    (buyer_id = auth.uid() and public.has_role('buyer'))
    or public.is_admin()
  );

create policy "Reservations update by owner" on public.reservations
  for update using (
    (buyer_id = auth.uid() and public.has_role('buyer'))
    or (fisher_id = auth.uid() and public.has_role('fisher'))
    or public.is_admin()
  )
  with check (
    (buyer_id = auth.uid() and public.has_role('buyer'))
    or (fisher_id = auth.uid() and public.has_role('fisher'))
    or public.is_admin()
  );

-- Prevent role escalation for non-admin users
create or replace function public.prevent_role_change()
returns trigger
language plpgsql
security definer
as $$
begin
  if (old.role is distinct from new.role) and not public.is_admin() then
    raise exception 'Role change not allowed';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_role_guard on public.profiles;
create trigger profiles_role_guard
  before update on public.profiles
  for each row execute function public.prevent_role_change();

-- Ports: allow read to all authenticated, insert to authenticated
create policy "Ports read" on public.ports
  for select using (auth.uid() is not null);

create policy "Ports insert" on public.ports
  for insert with check (auth.uid() is not null);

-- Favorites: owner or admin
create policy "Favorites read" on public.favorites
  for select using (user_id = auth.uid() or public.is_admin());

create policy "Favorites insert" on public.favorites
  for insert with check (user_id = auth.uid() or public.is_admin());

create policy "Favorites delete" on public.favorites
  for delete using (user_id = auth.uid() or public.is_admin());

-- Chat threads
create policy "Chat threads read" on public.chat_threads
  for select using (
    buyer_id = auth.uid()
    or fisher_id = auth.uid()
    or public.is_admin()
  );

create policy "Chat threads insert" on public.chat_threads
  for insert with check (
    buyer_id = auth.uid()
    or fisher_id = auth.uid()
    or public.is_admin()
  );

create policy "Chat threads update" on public.chat_threads
  for update using (
    buyer_id = auth.uid()
    or fisher_id = auth.uid()
    or public.is_admin()
  )
  with check (
    buyer_id = auth.uid()
    or fisher_id = auth.uid()
    or public.is_admin()
  );

-- Chat messages
create policy "Chat messages read" on public.chat_messages
  for select using (
    public.is_thread_participant(thread_id)
    or public.is_admin()
  );

create policy "Chat messages insert" on public.chat_messages
  for insert with check (
    sender_id = auth.uid()
    and public.is_thread_participant(thread_id)
  );

create policy "Chat messages update" on public.chat_messages
  for update using (
    sender_id = auth.uid()
    or public.is_admin()
  )
  with check (
    sender_id = auth.uid()
    or public.is_admin()
  );
