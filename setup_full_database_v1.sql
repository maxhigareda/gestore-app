-- ==========================================
-- GeStore Master Database Setup Script v1
-- ==========================================

-- 1. PROFILES & USER MANAGEMENT
-- =============================
CREATE TABLE public.profiles (
    id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email text,
    full_name text,
    first_name text,
    last_name text,
    avatar_url text, -- Standard Supabase/Google avatar
    photo_url text, -- Custom profile photo
    role text DEFAULT 'Colaborador',
    job_title text,
    department text DEFAULT 'General',
    division text,
    company text,
    cost_center text,
    supervisor text,
    team text,
    substitute text,
    regime_type text,
    work_location text,
    patronal_registration text,
    contract_type text,
    rfc text,
    birth_date date,
    address text,
    phone text,
    company_entry_date date,
    date_of_entry date, -- Group entry date
    manager_id uuid REFERENCES public.profiles(id), -- For Org Chart hierarchy
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for Profiles
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Trigger to auto-create profile on Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 2. VACATION REQUESTS
-- ====================
CREATE TABLE public.vacation_requests (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    days_requested integer NOT NULL,
    status text DEFAULT 'Solicitada' CHECK (status IN ('Solicitada', 'Aprobada', 'Rechazada')),
    type text DEFAULT 'Vacaciones',
    reason text, -- Comment/Justification
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Vacations
ALTER TABLE public.vacation_requests ENABLE ROW LEVEL SECURITY;

-- Policies for Vacations
CREATE POLICY "Users can view their own vacation requests"
ON public.vacation_requests FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vacation requests"
ON public.vacation_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vacation requests"
ON public.vacation_requests FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vacation requests"
ON public.vacation_requests FOR DELETE USING (auth.uid() = user_id);


-- 3. PERMISSION REQUESTS
-- ======================
CREATE TABLE public.permission_requests (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    days_requested integer NOT NULL,
    status text DEFAULT 'Solicitada' CHECK (status IN ('Solicitada', 'Aprobada', 'Rechazada')),
    type text DEFAULT 'Permiso',
    reason text, -- Comment/Justification
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Permissions
ALTER TABLE public.permission_requests ENABLE ROW LEVEL SECURITY;

-- Policies for Permissions
CREATE POLICY "Users can view their own permissions"
ON public.permission_requests FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own permissions"
ON public.permission_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own permissions"
ON public.permission_requests FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own permissions"
ON public.permission_requests FOR DELETE USING (auth.uid() = user_id);


-- 4. EVALUATIONS (NATIVE MODULE)
-- ==============================
CREATE TABLE public.evaluations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    description text,
    target_area text NOT NULL, -- 'Desarrollo', 'Operaciones', etc.
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by uuid REFERENCES auth.users(id)
);

CREATE TABLE public.questions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    evaluation_id uuid REFERENCES public.evaluations(id) ON DELETE CASCADE NOT NULL,
    text text NOT NULL,
    type text NOT NULL, -- 'multiple_choice', 'text', 'rating'
    options jsonb, -- Array of strings for choices e.g. ["Opción A", "Opción B"]
    points integer DEFAULT 0,
    correct_answer text, -- For auto-grading
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.responses (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    evaluation_id uuid REFERENCES public.evaluations(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    total_score integer DEFAULT 0,
    max_score integer DEFAULT 0,
    status text DEFAULT 'completed',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.answers (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    response_id uuid REFERENCES public.responses(id) ON DELETE CASCADE NOT NULL,
    question_id uuid REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
    answer_text text,
    points_awarded integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Evaluations
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;

-- Policies for Evaluations
CREATE POLICY "Evaluations are viewable by everyone" ON public.evaluations FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create evaluations" ON public.evaluations FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Questions are viewable by everyone" ON public.questions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create questions" ON public.questions FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can view own responses" ON public.responses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own responses" ON public.responses FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own answers" ON public.answers FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.responses WHERE id = answers.response_id AND user_id = auth.uid())
);
CREATE POLICY "Users can insert own answers" ON public.answers FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.responses WHERE id = answers.response_id AND user_id = auth.uid())
);

-- ==========================================
-- End of Setup
-- ==========================================
