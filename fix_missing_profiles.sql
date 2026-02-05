-- SQL to fix "Missing Profile" issue:
-- This will insert a row in 'profiles' for every user in 'auth.users' that doesn't have one yet.
-- Using their ID and Email from the auth system.

INSERT INTO public.profiles (id, email, first_name, last_name, role)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'full_name', 'Usuario Nuevo'), -- Try to get name from Google metadata
    '', -- Last name empty initially
    'user' -- Default role
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);

-- Verify it worked:
SELECT * FROM public.profiles;
