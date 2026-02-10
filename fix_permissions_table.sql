-- Ensure table exists
CREATE TABLE IF NOT EXISTS public.permission_requests (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    days_requested integer NOT NULL,
    reason text,
    status text DEFAULT 'Solicitada' CHECK (status IN ('Solicitada', 'Aprobada', 'Rechazada')),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    type text DEFAULT 'Permiso'
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

DROP POLICY IF EXISTS "Users can update their own permissions" ON public.permission_requests;
CREATE POLICY "Users can update their own permissions"
ON public.permission_requests FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own permissions" ON public.permission_requests;
CREATE POLICY "Users can delete their own permissions"
ON public.permission_requests FOR DELETE
USING (auth.uid() = user_id);

-- Ensure columns exist (idempotent)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'permission_requests' AND column_name = 'type') THEN
        ALTER TABLE public.permission_requests ADD COLUMN type text DEFAULT 'Permiso';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'permission_requests' AND column_name = 'reason') THEN
        ALTER TABLE public.permission_requests ADD COLUMN reason text;
    END IF;
END $$;
