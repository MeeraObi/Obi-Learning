-- ==========================================
-- 1. PROFILES TABLE (Already exists, but for reference)
-- ==========================================
-- create table public.profiles (
--   id uuid references auth.users on delete cascade not null primary key,
--   email text,
--   full_name text,
--   updated_at timestamp with time zone,
--   created_at timestamp with time zone default timezone('utc'::text, now()) not null
-- );

-- ==========================================
-- 2. CLASSES TABLE (NEW)
-- ==========================================
create table if not exists public.classes (
  id uuid default gen_random_uuid() primary key,
  teacher_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  standard text,
  division text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.classes enable row level security;

-- Policies
drop policy if exists "Teachers can view their own classes." on public.classes;
create policy "Teachers can view their own classes." on public.classes
  for select using (auth.uid() = teacher_id);

drop policy if exists "Teachers can insert their own classes." on public.classes;
create policy "Teachers can insert their own classes." on public.classes
  for insert with check (auth.uid() = teacher_id);

drop policy if exists "Teachers can update their own classes." on public.classes;
create policy "Teachers can update their own classes." on public.classes
  for update using (auth.uid() = teacher_id);

drop policy if exists "Teachers can delete their own classes." on public.classes;
create policy "Teachers can delete their own classes." on public.classes
  for delete using (auth.uid() = teacher_id);

-- ==========================================
-- 3. UPDATING CHILDREN TABLE (NEW COLUMN)
-- ==========================================
-- This adds the class_id column to the existing children table
do $$ 
begin 
  if not exists (select 1 from information_schema.columns where table_name='children' and column_name='class_id') then
    alter table public.children add column class_id uuid references public.classes(id) on delete set null;
  end if;
end $$;

-- ==========================================
-- 4. REFRESH RLS FOR CHILDREN (Optional but recommended)
-- ==========================================
-- Ensure teachers/parents can see children in their classes
-- (The existing policy "Users can view their own children" already works if they are the ones who added them)
