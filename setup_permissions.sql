-- Create permission_requests table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.permission_requests (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    days_requested integer NOT NULL,
    reason text,
    status text DEFAULT 'Solicitada' CHECK (status IN ('Solicitada', 'Aprobada', 'Rechazada')),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.permission_requests ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can view their own permissions" ON public.permission_requests;
CREATE POLICY "Users can view their own permissions"
ON public.permission_requests FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own permissions" ON public.permission_requests;
CREATE POLICY "Users can insert their own permissions"
ON public.permission_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);
