-- Create a table for public profiles
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  updated_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can insert their own profile." on public.profiles
  for insert with check ((select auth.uid()) = id);

create policy "Users can update own profile." on public.profiles
  for update using ((select auth.uid()) = id);

-- Create a table for children
create table public.children (
  id uuid default gen_random_uuid() primary key,
  parent_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  date_of_birth date not null,
  gender text, /* 'boy', 'girl', etc. */
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up RLS for children
alter table public.children enable row level security;

create policy "Users can view their own children." on public.children
  for select using ((select auth.uid()) = parent_id);

create policy "Users can insert their own children." on public.children
  for insert with check ((select auth.uid()) = parent_id);

create policy "Users can update their own children." on public.children
  for update using ((select auth.uid()) = parent_id);

create policy "Users can delete their own children." on public.children
  for delete using ((select auth.uid()) = parent_id);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
