-- Create trail_evaluations table for storing topic evaluation scores

create table public.trail_evaluations (
  id uuid default gen_random_uuid() primary key,
  child_id uuid references public.children(id) on delete cascade not null,
  board text not null,
  subject text not null,
  topic text not null,
  score integer not null check (score >= 0 and score <= 100),
  rubric_data jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.trail_evaluations enable row level security;

-- Teachers can view evaluations for their own students
create policy "Teachers can view their students' evaluations." on public.trail_evaluations
  for select using (
    exists (
      select 1 from public.children
      where children.id = trail_evaluations.child_id
      and children.teacher_id = auth.uid()
    )
  );

-- Teachers can insert evaluations for their own students
create policy "Teachers can insert evaluations for their students." on public.trail_evaluations
  for insert with check (
    exists (
      select 1 from public.children
      where children.id = trail_evaluations.child_id
      and children.teacher_id = auth.uid()
    )
  );

-- Teachers can update evaluations for their own students
create policy "Teachers can update their students' evaluations." on public.trail_evaluations
  for update using (
    exists (
      select 1 from public.children
      where children.id = trail_evaluations.child_id
      and children.teacher_id = auth.uid()
    )
  );

-- Teachers can delete evaluations for their own students
create policy "Teachers can delete their students' evaluations." on public.trail_evaluations
  for delete using (
    exists (
      select 1 from public.children
      where children.id = trail_evaluations.child_id
      and children.teacher_id = auth.uid()
    )
  );

-- Create index for faster queries
create index trail_evaluations_child_id_idx on public.trail_evaluations(child_id);
create index trail_evaluations_subject_idx on public.trail_evaluations(subject);
