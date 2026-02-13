-- =========================================================
-- FIX: Infinite Recursion in Profiles RLS Policy
-- =========================================================

-- The previous policy caused a loop because checking if someone is an Admin
-- required reading the 'profiles' table, which triggered the policy again.

-- 1. Create a helper function to safely check Admin status
-- SECURITY DEFINER = Runs with privileges of the creator (postgres), bypassing RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND (role = 'Super Admin' OR role = 'Admin' OR email = 'admin@gestore.com')
  );
END;
$$;

-- 2. Drop the defective policy
DROP POLICY IF EXISTS "Admins can do everything on profiles" ON public.profiles;

-- 3. Create the new optimized policy
CREATE POLICY "Admins can do everything on profiles"
ON public.profiles
FOR ALL
USING ( public.is_admin() );

-- 4. Ensure RLS is enabled (just in case)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
