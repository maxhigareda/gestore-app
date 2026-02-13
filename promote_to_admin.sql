-- =========================================================
-- PROMOTE USER TO ADMIN
-- =========================================================

-- Replace 'tu_email@ejemplo.com' with the email you are currently logged in with.
-- This is necessary because the default role is 'Colaborador', which cannot see other users.

UPDATE public.profiles
SET role = 'Admin'
WHERE email = 'admin@gestore.com'; -- <--- CAMBIA ESTE EMAIL POR EL TUYO SI ES DIFERENTE

-- Verify the change
SELECT email, role FROM public.profiles WHERE role = 'Admin';
