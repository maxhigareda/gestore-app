-- =========================================================
-- VERIFY AND FIX PROFILE TRIGGER
-- =========================================================

-- 1. Check if the function exists
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    'Colaborador' -- Default role
  );
  RETURN new;
END;
$$;

-- 2. Drop the trigger if it exists to ensure it's clean
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 3. Re-create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Verify RLS for INSERT on profiles (needed for the Upsert fallback)
-- Admin should be able to insert too.
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
CREATE POLICY "Admins can insert profiles"
ON public.profiles
FOR INSERT
WITH CHECK ( public.is_admin() ); 
