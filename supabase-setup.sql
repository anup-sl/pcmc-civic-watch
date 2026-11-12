-- ========================================================
-- PCMC CivicWatch: Supabase Storage & Policy Configuration
-- Run this in the Supabase SQL Editor if civic-photos bucket is not yet created:
-- ========================================================

-- 1. Create civic-photos bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('civic-photos', 'civic-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Drop existing policies if needed to avoid conflicts
DROP POLICY IF EXISTS "Public civic-photos select" ON storage.objects;
DROP POLICY IF EXISTS "Public civic-photos insert" ON storage.objects;
DROP POLICY IF EXISTS "Public civic-photos update" ON storage.objects;

-- 3. Allow anonymous/public read access to civic-photos
CREATE POLICY "Public civic-photos select"
ON storage.objects FOR SELECT
USING (bucket_id = 'civic-photos');

-- 4. Allow anonymous/public upload access to civic-photos
CREATE POLICY "Public civic-photos insert"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'civic-photos');

-- 5. Hotspots & Reports tables (already created on your database, included for reference)
/*
CREATE TABLE IF NOT EXISTS public.hotspots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  sub_tag text,
  latitude float8 NOT NULL,
  longitude float8 NOT NULL,
  area_name text,
  status text DEFAULT 'OPEN',
  corroboration_count int DEFAULT 1,
  recurrence_count int DEFAULT 0,
  sla_hours int,
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotspot_id uuid REFERENCES public.hotspots(id) ON DELETE CASCADE,
  report_type text NOT NULL,
  photo_url text,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.hotspots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public all hotspots" ON public.hotspots FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all reports" ON public.reports FOR ALL USING (true) WITH CHECK (true);
*/
