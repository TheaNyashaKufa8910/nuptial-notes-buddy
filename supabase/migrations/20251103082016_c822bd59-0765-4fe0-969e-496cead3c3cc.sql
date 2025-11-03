-- Create appointments table
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  appointment_date DATE NOT NULL,
  appointment_time TIME,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage appointments for their weddings"
  ON public.appointments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.weddings
      WHERE weddings.id = appointments.wedding_id
      AND weddings.user_id = auth.uid()
    )
  );