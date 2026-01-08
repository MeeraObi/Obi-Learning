-- Migration script: Rename parent_id to teacher_id in children table

-- 1. Rename the column
alter table public.children rename column parent_id to teacher_id;

-- 2. Drop existing policies that use the old column name
drop policy if exists "Users can view their own children." on public.children;
drop policy if exists "Users can insert their own children." on public.children;
drop policy if exists "Users can update their own children." on public.children;
drop policy if exists "Users can delete their own children." on public.children;

-- 3. Recreate policies with the new column name
create policy "Teachers can view their own students." on public.children
  for select using (auth.uid() = teacher_id);

create policy "Teachers can insert their own students." on public.children
  for insert with check (auth.uid() = teacher_id);

create policy "Teachers can update their own students." on public.children
  for update using (auth.uid() = teacher_id);

create policy "Teachers can delete their own students." on public.children
  for delete using (auth.uid() = teacher_id);
