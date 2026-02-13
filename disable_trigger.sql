-- =========================================================
-- SOLUCIÓN FINAL: DESACTIVAR TRIGGER AUTOMÁTICO
-- =========================================================

-- Al parecer el "Trigger" (la automatización) está fallando y haciendo que la creación del usuario
-- se cancele por completo. Por eso sale el error de "foreign key" (el usuario deja de existir).

-- Vamos a eliminar el trigger y dejar que la página web se encargue de crear el perfil.
-- Mi código ya está preparado para hacer esto manualmente (el "Upsert" que viste).

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Aseguramos que el Admin (tú) tenga permisos para insertar manualmente
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;

CREATE POLICY "Admins can insert profiles"
ON public.profiles
FOR INSERT
WITH CHECK ( public.is_admin() );
