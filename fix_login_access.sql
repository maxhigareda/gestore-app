-- =========================================================
-- REPARAR ACCESO DE LOGIN
-- =========================================================

-- 1. Habilitar extensión para encriptar contraseñas (necesaria para cambiar password manual)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Confirmar AUTOMÁTICAMENTE a todos los usuarios que falten
-- (Esto soluciona que el Nuevo Colaborador no pueda entrar por falta de verificación de email)
UPDATE auth.users
SET email_confirmed_at = now()
WHERE email_confirmed_at IS NULL;

-- 3. Asignar contraseña 'TempPassword123!' a TU usuario Admin
-- (IMPORTANTE: Cambia 'admin@gestore.com' por tu email real si es diferente)
-- Esto te permitirá entrar con email/password aunque tu cuenta sea de Google.
UPDATE auth.users
SET encrypted_password = crypt('TempPassword123!', gen_salt('bf'))
WHERE email = 'admin@gestore.com';  -- <--- CAMBIA ESTO POR TU EMAIL

-- Comprobación:
SELECT email, email_confirmed_at, last_sign_in_at FROM auth.users;
