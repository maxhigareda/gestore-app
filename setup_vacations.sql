-- Create a table for Vacation Requests
CREATE TABLE IF NOT EXISTS public.vacation_requests (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    days_requested int NOT NULL,
    status text CHECK (status IN ('Solicitada', 'Aprobada', 'Rechazada')) DEFAULT 'Solicitada',
    created_at timestamptz DEFAULT now(),
    type text DEFAULT 'Vacaciones'
);

-- Enable RLS
ALTER TABLE public.vacation_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see their own requests
CREATE POLICY "Users can view their own vacation requests"
ON public.vacation_requests FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own requests
CREATE POLICY "Users can create their own vacation requests"
ON public.vacation_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);
