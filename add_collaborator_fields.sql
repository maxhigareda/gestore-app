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

-- 3. UPDATE RLS POLICIES FOR ADMINS
-- =================================
-- Allow Admins to view/insert/update/delete ALL profiles
CREATE POLICY "Admins can do everything on profiles"
ON public.profiles
FOR ALL
USING (
  auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'Admin' OR email = 'admin@gestore.com' -- Temporary fallback
  )
);

-- 4. STORAGE SETUP
-- ================
-- Create specific bucket for avatars if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to avatars
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

-- Allow Authenticated users to upload avatars
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'avatars' AND auth.role() = 'authenticated' );

-- Allow Users to update their own avatars
CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'avatars' AND owner = auth.uid() );
