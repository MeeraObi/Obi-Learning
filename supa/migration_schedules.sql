-- Create schedules table for storing weekly recurring classes
create table public.schedules (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  day_of_week text not null, -- 'Monday', 'Tuesday', etc.
  start_time time not null,
  end_time time not null,
  subject text not null,
  class_name text not null,
  room text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.schedules enable row level security;

-- Policies
create policy "Users can view their own schedule" on public.schedules
  for select using (auth.uid() = user_id);

create policy "Users can insert their own schedule" on public.schedules
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own schedule" on public.schedules
  for update using (auth.uid() = user_id);

create policy "Users can delete their own schedule" on public.schedules
  for delete using (auth.uid() = user_id);

-- Create index for faster queries by user and day
create index schedules_user_day_idx on public.schedules (user_id, day_of_week);
