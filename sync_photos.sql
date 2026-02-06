-- Update profiles photo_url from auth.users metadata
UPDATE public.profiles
SET photo_url = auth.users.raw_user_meta_data->>'avatar_url'
FROM auth.users
WHERE public.profiles.id = auth.users.id
AND public.profiles.photo_url IS NULL;
