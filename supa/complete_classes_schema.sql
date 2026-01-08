-- Create trails table for storing generated learning paths
create table public.trails (
  id uuid default gen_random_uuid() primary key,
  board text not null,
  grade text not null,
  subject text not null,
  topic text not null,
  content text not null, -- The markdown content of the trail
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(board, grade, subject, topic) -- Ensure we don't regenerate for same params (optional, can be removed if we want versions)
);

-- Enable RLS
alter table public.trails enable row level security;

-- Allow read access to all authenticated users (teachers/students)
create policy "Authenticated users can read trails" on public.trails
  for select using (auth.role() = 'authenticated');

-- Allow insert access to authenticated users (or restrict to service role if generated via server action only, 
-- but server actions run as user usually unless using service key.
-- For now, let's allow authenticated users to insert if they generate a trail.)
create policy "Authenticated users can insert trails" on public.trails
  for insert with check (auth.role() = 'authenticated');
-- Create trails table for storing generated learning paths
create table public.trails (
  id uuid default gen_random_uuid() primary key,
  board text not null,
  grade text not null,
  subject text not null,
  topic text not null,
  content text not null, -- The markdown content of the trail
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(board, grade, subject, topic) -- Ensure we don't regenerate for same params (optional, can be removed if we want versions)
);

-- Enable RLS
alter table public.trails enable row level security;

-- Allow read access to all authenticated users (teachers/students)
create policy "Authenticated users can read trails" on public.trails
  for select using (auth.role() = 'authenticated');

-- Allow insert access to authenticated users (or restrict to service role if generated via server action only, 
-- but server actions run as user usually unless using service key.
-- For now, let's allow authenticated users to insert if they generate a trail.)
create policy "Authenticated users can insert trails" on public.trails
  for insert with check (auth.role() = 'authenticated');
-- Add readiness_data column to trail_evaluations
alter table public.trail_evaluations 
add column if not exists readiness_data jsonb;
