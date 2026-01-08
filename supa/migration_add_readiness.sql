-- Add readiness_data column to trail_evaluations
alter table public.trail_evaluations 
add column if not exists readiness_data jsonb;
