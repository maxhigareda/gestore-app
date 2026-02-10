-- Add reason column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vacation_requests' AND column_name = 'reason') THEN
        ALTER TABLE public.vacation_requests ADD COLUMN reason text;
    END IF;
END $$;

-- Fix RLS Policies for Vacation Requests
ALTER TABLE public.vacation_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to ensure clean slate or avoid conflicts if they were named differently
DROP POLICY IF EXISTS "Users can view their own vacation requests" ON public.vacation_requests;
DROP POLICY IF EXISTS "Users can insert their own vacation requests" ON public.vacation_requests;
DROP POLICY IF EXISTS "Users can update their own vacation requests" ON public.vacation_requests;
DROP POLICY IF EXISTS "Users can delete their own vacation requests" ON public.vacation_requests;

-- Re-create Policies
CREATE POLICY "Users can view their own vacation requests"
ON public.vacation_requests FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vacation requests"
ON public.vacation_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vacation requests"
ON public.vacation_requests FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vacation requests"
ON public.vacation_requests FOR DELETE
USING (auth.uid() = user_id);
