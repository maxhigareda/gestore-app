-- Create job_titles table
CREATE TABLE IF NOT EXISTS public.job_titles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL, -- Puesto (Role)
    department TEXT NOT NULL, -- Area (Department)
    company TEXT DEFAULT 'The Store Intelligence',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.job_titles ENABLE ROW LEVEL SECURITY;

-- Policy: Allow read access to authenticated users
CREATE POLICY "Allow read access to authenticated users" ON public.job_titles
    FOR SELECT TO authenticated USING (true);

-- Policy: Allow insert/update/delete to authenticated users (for now, ideally admins)
CREATE POLICY "Allow write access to authenticated users" ON public.job_titles
    FOR ALL TO authenticated USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_job_titles_department ON public.job_titles(department);
