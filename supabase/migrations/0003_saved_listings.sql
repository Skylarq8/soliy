CREATE TABLE IF NOT EXISTS saved_listings (
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, listing_id)
);

CREATE INDEX IF NOT EXISTS saved_listings_user_created_idx
  ON saved_listings(user_id, created_at DESC);

ALTER TABLE saved_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "saved_listings_select_own"
  ON saved_listings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "saved_listings_insert_own"
  ON saved_listings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "saved_listings_delete_own"
  ON saved_listings FOR DELETE
  USING (auth.uid() = user_id);

NOTIFY pgrst, 'reload schema';
