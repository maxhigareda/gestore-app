-- Add the missing 'updated_at' column to the profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Optional: Create a trigger to automatically update this column on change
-- (This requires creating a function first, but for now we just need the column exists)
