-- Create storage bucket for inspiration board media
INSERT INTO storage.buckets (id, name, public) 
VALUES ('inspiration', 'inspiration', true);

-- Create RLS policies for inspiration bucket
CREATE POLICY "Users can view inspiration media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'inspiration');

CREATE POLICY "Authenticated users can upload inspiration media"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'inspiration' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own inspiration media"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'inspiration' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own inspiration media"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'inspiration' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create inspiration_items table
CREATE TABLE public.inspiration_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  title TEXT,
  notes TEXT,
  shared_with_vendors BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.inspiration_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage inspiration for their weddings"
  ON public.inspiration_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.weddings
      WHERE weddings.id = inspiration_items.wedding_id
      AND weddings.user_id = auth.uid()
    )
  );

-- Create vendors table
CREATE TABLE public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  rating DECIMAL(2,1),
  reviews_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view vendors"
  ON public.vendors FOR SELECT
  USING (true);