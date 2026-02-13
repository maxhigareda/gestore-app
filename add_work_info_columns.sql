-- =========================================================
-- AGREGAR CAMPOS DE DATOS DE TRABAJO
-- =========================================================

-- Aseguramos que existan los campos para la sección "Datos de Trabajo"
-- Usamos "IF NOT EXISTS" para no romper nada si ya existen.

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS division text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company text DEFAULT 'GeStore';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cost_center text;

-- Para Supervisor y Suplente, lo ideal es usar UUID (ID de usuario) para el Organigrama.
-- Si ya existía como 'text', esto podría dar error, así que revisa. 
-- Si da error, lo dejaremos como está y usaremos texto, pero intentaremos agregar columnas de ID.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS manager_id uuid REFERENCES public.profiles(id); -- Supervisor real (link)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS substitute_id uuid REFERENCES public.profiles(id); -- Suplente real (link)

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS team text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS regime_type text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS work_location text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS patronal_registration text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS contract_type text;

-- Comentarios para documentación
COMMENT ON COLUMN public.profiles.manager_id IS 'ID del Supervisor directo (para Organigrama)';
COMMENT ON COLUMN public.profiles.substitute_id IS 'ID del Suplente asignado';
