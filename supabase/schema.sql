-- ======================================================
-- MeetMind Supabase Postgres Database Schema & RLS
-- Run this script in your Supabase SQL Editor (https://supabase.com/dashboard)
-- ======================================================

-- 1. Create Meetings Table
create table if not exists public.meetings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  duration text,
  file_name text,
  sentiment text,
  summary text,
  key_takeaways jsonb default '[]'::jsonb,
  action_items jsonb default '[]'::jsonb,
  transcript jsonb default '[]'::jsonb,
  created_at timestamp with time zone default now()
);

-- 2. Enable Row Level Security (RLS)
alter table public.meetings enable row level security;

-- 3. Row Level Security Policies (Using Supabase Security Best Practices)

-- SELECT: Users can only read their own meetings
create policy "Users can view own meetings"
  on public.meetings
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- INSERT: Users can only insert meetings owned by themselves
create policy "Users can insert own meetings"
  on public.meetings
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

-- UPDATE: Users can update their own meetings (USING + WITH CHECK)
create policy "Users can update own meetings"
  on public.meetings
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- DELETE: Users can delete their own meetings
create policy "Users can delete own meetings"
  on public.meetings
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- 4. Create Index on user_id for fast query performance
create index if not exists idx_meetings_user_id on public.meetings(user_id);
create index if not exists idx_meetings_created_at on public.meetings(created_at desc);
