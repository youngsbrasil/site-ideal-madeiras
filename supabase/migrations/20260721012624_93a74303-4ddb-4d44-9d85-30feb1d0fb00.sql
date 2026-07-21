CREATE TABLE public.search_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  term text NOT NULL,
  term_normalized text NOT NULL,
  results_count integer NOT NULL DEFAULT 0,
  clicked_product_id uuid NULL,
  user_id uuid NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_search_log_term_norm ON public.search_log (term_normalized);
CREATE INDEX idx_search_log_created_at ON public.search_log (created_at DESC);
CREATE INDEX idx_search_log_zero ON public.search_log (term_normalized) WHERE results_count = 0;

GRANT SELECT, INSERT ON public.search_log TO anon;
GRANT SELECT, INSERT ON public.search_log TO authenticated;
GRANT ALL ON public.search_log TO service_role;

ALTER TABLE public.search_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can insert search logs"
  ON public.search_log FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "admins can read search logs"
  ON public.search_log FOR SELECT
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'));