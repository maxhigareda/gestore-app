-- =========================================================
-- DIAGNÓSTICO: Verificar existencia de usuario
-- =========================================================

-- Reemplaza con el email del colaborador que intentaste crear
SELECT id, email, created_at, last_sign_in_at
FROM auth.users
WHERE email = 'CORREO_DEL_COLABORADOR@ejemplo.com'; -- <--- PON EL CORREO AQUI

-- Si esto no devuelve nada, el usuario NO EXISTE en la base de datos de Auth.
-- Si devuelve algo, copia el ID y verifiquemos si existe en profiles:

-- SELECT * FROM public.profiles WHERE id = 'ID_DEL_USUARIO';
