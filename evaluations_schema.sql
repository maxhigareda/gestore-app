-- Create evaluations table
create table public.evaluations (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  form_url text not null,
  target_area text not null, -- 'Desarrollo', 'Operaciones', etc.
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by uuid references auth.users
);

-- RLS
alter table public.evaluations enable row level security;

-- Everyone can read (filtering will be done in frontend or via policy if strictness needed)
create policy "Evaluations are viewable by everyone" 
  on public.evaluations for select 
  using ( true );

-- Only authenticated users can insert (you might want to restrict this to admins later)
create policy "Authenticated users can create evaluations" 
  on public.evaluations for insert 
  with check ( auth.role() = 'authenticated' );
