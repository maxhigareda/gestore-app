-- 1. ADD MISSING COLUMNS
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS first_name text,
ADD COLUMN IF NOT EXISTS last_name text,
ADD COLUMN IF NOT EXISTS rfc text,
ADD COLUMN IF NOT EXISTS birth_date date,
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS department text,
ADD COLUMN IF NOT EXISTS division text,
ADD COLUMN IF NOT EXISTS company text,
ADD COLUMN IF NOT EXISTS job_title text,
ADD COLUMN IF NOT EXISTS cost_center text,
ADD COLUMN IF NOT EXISTS supervisor text,
ADD COLUMN IF NOT EXISTS team text,
ADD COLUMN IF NOT EXISTS substitute text,
ADD COLUMN IF NOT EXISTS regime_type text,
ADD COLUMN IF NOT EXISTS work_location text,
ADD COLUMN IF NOT EXISTS patronal_registration text,
ADD COLUMN IF NOT EXISTS contract_type text,
ADD COLUMN IF NOT EXISTS company_entry_date date,
ADD COLUMN IF NOT EXISTS photo_url text;

-- 2. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. CREATE/UPDATE POLICIES (Drop first to avoid "policy exists" error)
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- 4. INSERT MISSING PROFILES (Safe insert)
INSERT INTO public.profiles (id, email, first_name, last_name, role)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'full_name', 'Usuario'),
    '',
    'user'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);
