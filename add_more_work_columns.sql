-- =========================================================
-- AGREGAR MÁS CAMPOS DE DATOS DE TRABAJO (REQ. USUARIO)
-- =========================================================

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS work_shift text;     -- Diurna, Nocturna, Mixta
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS work_schedule text;  -- Horario Semana (ej. Lunes a Viernes 9-6)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS work_days text[];    -- Días de Jornada (Array de strings: ['Lunes', 'Martes'...])
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS salary numeric;      -- Sueldo
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS compensation_type text; -- Fijo, Mixto, Variable

-- Nota: 'Registro Patronal' y 'Estado/Municipio' (work_location o address) ya se agregaron o mapearon antes.
-- Verificamos que salary sea numérico para cálculos futuros.
