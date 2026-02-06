-- Add 'type' column to permission_requests if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'permission_requests' AND column_name = 'type') THEN
        ALTER TABLE public.permission_requests ADD COLUMN type text DEFAULT 'Permiso';
    END IF;
END $$;

-- Add 'reason' column to vacation_requests if it doesn't exist (for comments)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vacation_requests' AND column_name = 'reason') THEN
        ALTER TABLE public.vacation_requests ADD COLUMN reason text;
    END IF;
END $$;
