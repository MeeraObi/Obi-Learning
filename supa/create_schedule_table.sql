-- Create the schedule table
create table public.schedule (
  id uuid not null default gen_random_uuid (),
  teacher_id uuid not null default auth.uid (),
  day_of_week text not null,
  start_time time not null,
  end_time time not null,
  subject text not null,
  class_name text not null,
  room text null,
  created_at timestamp with time zone not null default now(),
  constraint schedule_pkey primary key (id),
  constraint schedule_teacher_id_fkey foreign key (teacher_id) references auth.users (id) on delete cascade
);

-- Enable RLS
alter table public.schedule enable row level security;

-- Policy: Teachers can view their own schedule
create policy "Teachers can view own schedule" on public.schedule for select using (auth.uid () = teacher_id);

-- Policy: Teachers can insert into their own schedule
create policy "Teachers can insert own schedule" on public.schedule for insert with check (auth.uid () = teacher_id);

-- Policy: Teachers can update their own schedule
create policy "Teachers can update own schedule" on public.schedule for update using (auth.uid () = teacher_id);

-- Policy: Teachers can delete from their own schedule
create policy "Teachers can delete own schedule" on public.schedule for delete using (auth.uid () = teacher_id);
