-- Add manager_id column for hierarchy
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS manager_id uuid REFERENCES public.profiles(id);

-- Update RLS policies to allow viewing others (needed for Org Chart)
-- Currently logic is "Users can view their own profile". 
-- We need "Users can view all profiles" OR "Users can view their hierarchy".
-- Usually Org Charts are public to the company.
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Users can view all profiles"
ON public.profiles
FOR SELECT
USING (true); -- Authenticated users see everyone

-- Optional: Function to count subordinates efficiently
CREATE OR REPLACE FUNCTION get_subordinate_count(user_uuid uuid)
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT count(*)::integer FROM public.profiles WHERE manager_id = user_uuid;
$$;
