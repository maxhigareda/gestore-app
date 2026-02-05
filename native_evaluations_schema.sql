-- 1. Modify evaluations table (drop form_url)
alter table public.evaluations drop column if exists form_url;
-- (Optional) If we want to keep it backward compatible we could leave it, but let's clean it up.

-- 2. Create Questions Table
create table public.questions (
  id uuid default gen_random_uuid() primary key,
  evaluation_id uuid references public.evaluations on delete cascade not null,
  text text not null,
  type text not null, -- 'multiple_choice', 'text', 'rating'
  options jsonb, -- Array of strings for choices e.g. ["Opción A", "Opción B"]
  points integer default 0,
  correct_answer text, -- For auto-grading
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create Responses Table (The 'Exam Attempt')
create table public.responses (
  id uuid default gen_random_uuid() primary key,
  evaluation_id uuid references public.evaluations on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  total_score integer default 0,
  max_score integer default 0,
  status text default 'completed',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Create Answers Table (Individual Question Answers)
create table public.answers (
  id uuid default gen_random_uuid() primary key,
  response_id uuid references public.responses on delete cascade not null,
  question_id uuid references public.questions on delete cascade not null,
  answer_text text,
  points_awarded integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies
alter table public.questions enable row level security;
alter table public.responses enable row level security;
alter table public.answers enable row level security;

-- Questions: Viewable by everyone (who can view the evaluation)
create policy "Questions are viewable by everyone" on public.questions for select using (true);
create policy "Authenticated users can create questions" on public.questions for insert with check (auth.role() = 'authenticated');

-- Responses: Users can view/insert their own. Admin can view all? (For now, user focused)
create policy "Users can view own responses" on public.responses for select using (auth.uid() = user_id);
create policy "Users can insert own responses" on public.responses for insert with check (auth.uid() = user_id);

-- Answers: Users can view/insert their own
create policy "Users can view own answers" on public.answers for select using (
  exists (select 1 from public.responses where id = answers.response_id and user_id = auth.uid())
);
create policy "Users can insert own answers" on public.answers for insert with check (
  exists (select 1 from public.responses where id = answers.response_id and user_id = auth.uid())
);
