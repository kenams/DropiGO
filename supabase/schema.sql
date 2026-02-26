-- DroPiPeche Supabase schema (demo-ready)
-- Run in Supabase SQL editor after creating the project.

create extension if not exists "pgcrypto";

DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('buyer', 'fisher', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.kyc_status AS ENUM ('draft', 'pending', 'verified', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.listing_status AS ENUM ('active', 'reserved_out', 'closed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.reservation_status AS ENUM ('pending', 'confirmed', 'rejected', 'picked_up');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.delivery_status AS ENUM ('at_sea', 'approaching_port', 'arrived', 'delivered');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.escrow_status AS ENUM ('unpaid', 'escrowed', 'hold', 'released', 'refunded');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.payment_status AS ENUM ('unpaid', 'paid');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.app_role not null default 'buyer',
  name text not null,
  company text,
  phone text,
  email text,
  created_at timestamptz not null default now()
);

create table if not exists public.buyer_profiles (
  id uuid primary key references public.profiles (id) on delete cascade,
  registry text,
  activity text,
  payment_method text,
  id_number text,
  address text,
  id_photo_url text,
  kbis_photo_url text,
  kyc_status public.kyc_status not null default 'pending',
  provider text,
  risk_score integer,
  updated_at timestamptz not null default now()
);

create table if not exists public.fisher_profiles (
  id uuid primary key references public.profiles (id) on delete cascade,
  permit text,
  boat text,
  registration text,
  port text,
  insurance text,
  bank_account text,
  id_number text,
  license_photo_url text,
  boat_photo_url text,
  insurance_photo_url text,
  rib_photo_url text,
  kyc_status public.kyc_status not null default 'pending',
  provider text,
  risk_score integer,
  updated_at timestamptz not null default now()
);

create table if not exists public.ports (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  country text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.favorites (
  user_id uuid references public.profiles (id) on delete cascade,
  listing_id uuid references public.listings (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

create table if not exists public.chat_threads (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.listings (id) on delete set null,
  buyer_id uuid references public.profiles (id) on delete set null,
  fisher_id uuid references public.profiles (id) on delete set null,
  listing_title text,
  buyer_name text,
  fisher_name text,
  last_message text,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid references public.chat_threads (id) on delete cascade,
  sender_id uuid references public.profiles (id) on delete set null,
  sender_role public.app_role not null,
  text text not null,
  read_by_buyer boolean not null default false,
  read_by_fisher boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  fisher_id uuid references public.profiles (id) on delete set null,
  title text not null,
  variety text,
  price_per_kg numeric(10, 2) not null,
  stock_kg numeric(10, 2) not null,
  location text not null,
  latitude numeric(9, 6),
  longitude numeric(9, 6),
  pickup_window text,
  pickup_slots text[],
  catch_date text,
  method text,
  size_grade text,
  quality_tags text[],
  image_url text,
  fisher_permit text,
  fisher_boat text,
  fisher_registration text,
  fisher_name text,
  status public.listing_status not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.listings (id) on delete set null,
  buyer_id uuid references public.profiles (id) on delete set null,
  fisher_id uuid references public.profiles (id) on delete set null,
  listing_title text,
  buyer_name text,
  qty_kg numeric(10, 2) not null,
  total_price numeric(10, 2) not null,
  pickup_time text,
  note text,
  checkout_id text,
  payment_status public.payment_status not null default 'unpaid',
  escrow_status public.escrow_status not null default 'unpaid',
  status public.reservation_status not null default 'pending',
  delivery_status public.delivery_status not null default 'at_sea',
  buyer_conformity text,
  dispute_note text,
  dispute_photos text[],
  buyer_arrival_requested_at timestamptz,
  buyer_arrival_confirmed_at timestamptz,
  fisher_arrival_declared_at timestamptz,
  cancellation_by public.app_role,
  cancellation_at timestamptz,
  compensation jsonb,
  dispute_resolution text,
  dispute_resolved_at timestamptz,
  gps_lat numeric(9, 6),
  gps_lng numeric(9, 6),
  gps_updated_at timestamptz,
  created_at timestamptz not null default now()
);
