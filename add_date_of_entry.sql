-- Add date_of_entry column for "Group Entry Date" separation
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS date_of_entry date;

-- Ensure RLS allows updating it
-- (Policy already covers "all columns" usually, or at least the row update)
