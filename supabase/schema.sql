-- Run this in the Supabase SQL editor.

create table if not exists public.users (
  id uuid primary key,
  created_at timestamptz not null default now()
);

create table if not exists public.design_dnas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  name text not null,
  prompt text not null,
  moodboard_title text not null,
  moodboard_image_url text,
  dna jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists design_dnas_user_id_idx on public.design_dnas (user_id);

alter table public.users enable row level security;
alter table public.design_dnas enable row level security;
