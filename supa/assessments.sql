-- Create a table for assessments
create table public.assessments (
  id uuid default gen_random_uuid() primary key,
  child_id uuid references public.children(id) on delete cascade not null,
  answers jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up RLS for assessments
alter table public.assessments enable row level security;

-- Policy: Users can view assessments for their own children
-- We join with the children table to check if the current user is the parent
create policy "Users can view assessments for their children." on public.assessments
  for select using (
    exists (
      select 1 from public.children
      where public.children.id = public.assessments.child_id
      and public.children.parent_id = auth.uid()
    )
  );

-- Policy: Users can insert assessments for their own children
create policy "Users can insert assessments for their children." on public.assessments
  for insert with check (
    exists (
      select 1 from public.children
      where public.children.id = public.assessments.child_id
      and public.children.parent_id = auth.uid()
    )
  );

-- Policy: Users can delete assessments for their own children
create policy "Users can delete assessments for their children." on public.assessments
  for delete using (
    exists (
      select 1 from public.children
      where public.children.id = public.assessments.child_id
      and public.children.parent_id = auth.uid()
    )
  );
