-- =========================================================
-- VERIFICACIÓN DE ROL POR EMAIL
-- =========================================================

-- Reemplaza con TU email real
-- Esto nos dirá si realmente existes en la tabla y qué rol tienes exactamente.
SELECT id, email, role, length(role) as largo_rol
FROM public.profiles
WHERE email = 'admin@gestore.com'; -- <--- PON TU EMAIL AQUI

-- Si esto devuelve una fila, veremos si el rol es 'Admin' o 'admin' o con espacios.

-- TAMBIEN, vamos a ver si hay algun otro usuario Admin
SELECT * FROM public.profiles WHERE role LIKE '%Admin%';
