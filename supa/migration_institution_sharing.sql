-- Add institution_name to profiles
alter table public.profiles add column if not exists institution_name text;

-- Update the handle_new_user function to extract institution_name
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, institution_name)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'institution_name'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Update RLS for classes to allow sharing within institution
drop policy if exists "Teachers can view their own classes." on public.classes;
create policy "Institutions can view shared classes" on public.classes
  for select using (
    auth.uid() = teacher_id OR 
    (select institution_name from public.profiles where id = auth.uid()) = 
    (select institution_name from public.profiles where id = teacher_id)
  );

-- Update RLS for children to allow sharing within institution
drop policy if exists "Teachers can view their own students." on public.children;
create policy "Institutions can view shared students" on public.children
  for select using (
    auth.uid() = teacher_id OR 
    (select institution_name from public.profiles where id = auth.uid()) = 
    (select institution_name from public.profiles where id = teacher_id)
  );
