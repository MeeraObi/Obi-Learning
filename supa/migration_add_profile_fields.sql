-- Add phone, country, and role to profiles
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists country text;
alter table public.profiles add column if not exists role text default 'Lead Teacher';

-- Update the handle_new_user function to extract missing fields
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, institution_name, phone, country, role)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'institution_name',
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'country',
    coalesce(new.raw_user_meta_data->>'role', 'Lead Teacher')
  );
  return new;
end;
$$ language plpgsql security definer;
