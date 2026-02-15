-- =========================================================
-- AGREGAR CAMPOS EXTENDIDOS DE NOMINA/JORNADA
-- =========================================================

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS work_shift text;     -- Diurna, Nocturna, Mixta
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS work_schedule text;  -- Horario (ej. 9:00 - 18:00)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS work_days text[];    -- Array de días ['Lunes', 'Martes', ...]
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS salary numeric;      -- Sueldo base
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS compensation_type text; -- Fijo, Variable, Mixto

-- Comentarios
COMMENT ON COLUMN public.profiles.work_days IS 'Días laborales seleccionados';
