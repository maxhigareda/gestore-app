-- Add missing columns for full Collaborator Profile
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS last_name_mother text,
ADD COLUMN IF NOT EXISTS gender text, 
ADD COLUMN IF NOT EXISTS birth_country text,
ADD COLUMN IF NOT EXISTS document_type text,
ADD COLUMN IF NOT EXISTS curp text,
ADD COLUMN IF NOT EXISTS nss text,
ADD COLUMN IF NOT EXISTS marital_status text,
ADD COLUMN IF NOT EXISTS phone_office text,
ADD COLUMN IF NOT EXISTS phone_personal text,
ADD COLUMN IF NOT EXISTS email_personal text, -- email already exists for corporate
ADD COLUMN IF NOT EXISTS address_state text,
ADD COLUMN IF NOT EXISTS address_municipality text,
ADD COLUMN IF NOT EXISTS address_zip_code text,
ADD COLUMN IF NOT EXISTS payment_method text,
ADD COLUMN IF NOT EXISTS benefits text,
ADD COLUMN IF NOT EXISTS emergency_contact_name text,
ADD COLUMN IF NOT EXISTS emergency_contact_phone text,
ADD COLUMN IF NOT EXISTS emergency_contact_relation text;

-- Comment on columns for clarity
COMMENT ON COLUMN public.profiles.gender IS 'Masculino, Femenino, No Binario';
COMMENT ON COLUMN public.profiles.birth_country IS 'Dropdown with default Mexico';
COMMENT ON COLUMN public.profiles.document_type IS 'RFC by default for Mexico';
