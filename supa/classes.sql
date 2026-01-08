-- Create a table for classes
create table public.classes (
  id uuid default gen_random_uuid() primary key,
  teacher_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  standard text,
  division text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up RLS for classes
alter table public.classes enable row level security;

create policy "Teachers can view their own classes." on public.classes
  for select using (auth.uid() = teacher_id);

create policy "Teachers can insert their own classes." on public.classes
  for insert with check (auth.uid() = teacher_id);

create policy "Teachers can update their own classes." on public.classes
  for update using (auth.uid() = teacher_id);

create policy "Teachers can delete their own classes." on public.classes
  for delete using (auth.uid() = teacher_id);

-- Add class_id to children to establish the relationship
alter table public.children add column class_id uuid references public.classes(id) on delete set null;
