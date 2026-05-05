-- Users (linked to Supabase Auth)
CREATE TABLE users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id),
  name        TEXT,
  nickname    TEXT UNIQUE NOT NULL,
  phone       TEXT UNIQUE,
  avatar_url  TEXT,
  bio         TEXT,
  safe_score  NUMERIC(5,2) DEFAULT 0,
  swap_count  INT DEFAULT 0,
  violations  INT DEFAULT 0,
  is_admin    BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Listings
CREATE TABLE listings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT,
  category        TEXT CHECK (category IN ('clothing','skincare','makeup','accessories')),
  photos          TEXT[] NOT NULL,
  condition       SMALLINT CHECK (condition BETWEEN 1 AND 5),
  price           INT,
  swap_enabled    BOOLEAN DEFAULT TRUE,
  boost_until     TIMESTAMPTZ,
  verified        BOOLEAN DEFAULT FALSE,
  verify_tier     SMALLINT DEFAULT 0,
  verify_expiry   TIMESTAMPTZ,
  category_meta   JSONB,
  status          TEXT DEFAULT 'active' CHECK (status IN ('active','swapped','sold','archived')),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Full-text search index on listings title
CREATE INDEX listings_title_fts ON listings USING gin(to_tsvector('simple', title));

-- Proposals
CREATE TABLE proposals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id       UUID REFERENCES users(id),
  receiver_id     UUID REFERENCES users(id),
  offered_items   UUID[],
  requested_items UUID[],
  money_offer     INT DEFAULT 0,
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined','countered','completed')),
  escrow_id       TEXT,
  category_meta   JSONB,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER proposals_updated_at
  BEFORE UPDATE ON proposals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Messages
CREATE TABLE messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE,
  sender_id   UUID REFERENCES users(id),
  content     TEXT NOT NULL,
  blocked     BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews
CREATE TABLE reviews (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID UNIQUE REFERENCES proposals(id),
  reviewee_id UUID REFERENCES users(id),
  reviewer_id UUID REFERENCES users(id),
  rating      SMALLINT CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Verifications
CREATE TABLE verifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id  UUID UNIQUE REFERENCES listings(id),
  tier        SMALLINT,
  photos      TEXT[],
  status      TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  reviewed_at TIMESTAMPTZ,
  expires_at  TIMESTAMPTZ,
  admin_note  TEXT
);

-- Follows
CREATE TABLE follows (
  follower_id  UUID REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (follower_id, following_id)
);

-- Boosts
CREATE TABLE boosts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id  UUID REFERENCES listings(id),
  user_id     UUID REFERENCES users(id),
  days        SMALLINT,
  amount      INT,
  stripe_id   TEXT,
  starts_at   TIMESTAMPTZ DEFAULT NOW(),
  ends_at     TIMESTAMPTZ
);

-- Notifications
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,
  payload     JSONB,
  read        BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Helper RPCs
CREATE OR REPLACE FUNCTION increment_swap_count(user_id UUID)
RETURNS VOID AS $$
  UPDATE users SET swap_count = swap_count + 1 WHERE id = user_id;
$$ LANGUAGE SQL SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_violation(user_id UUID)
RETURNS VOID AS $$
  UPDATE users SET violations = violations + 1 WHERE id = user_id;
$$ LANGUAGE SQL SECURITY DEFINER;

-- RLS
ALTER TABLE users         ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings      ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals     ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages      ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews       ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows       ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE verifications ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "users_select_public"   ON users FOR SELECT USING (true);
CREATE POLICY "users_insert_own"      ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "users_update_own"      ON users FOR UPDATE USING (auth.uid() = id);

-- Listings policies
CREATE POLICY "listings_select_public" ON listings FOR SELECT USING (true);
CREATE POLICY "listings_insert_own"    ON listings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "listings_update_own"    ON listings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "listings_delete_own"    ON listings FOR DELETE USING (auth.uid() = user_id);

-- Proposals: only participants can view
CREATE POLICY "proposals_participant_select" ON proposals FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "proposals_insert"  ON proposals FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "proposals_update"  ON proposals FOR UPDATE
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Messages: only proposal participants can read/insert
CREATE POLICY "messages_participant_select" ON messages FOR SELECT
  USING (
    sender_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM proposals p
      WHERE p.id = proposal_id
        AND (p.sender_id = auth.uid() OR p.receiver_id = auth.uid())
    )
  );
CREATE POLICY "messages_participant_insert" ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM proposals p
      WHERE p.id = proposal_id
        AND (p.sender_id = auth.uid() OR p.receiver_id = auth.uid())
    )
  );

-- Reviews
CREATE POLICY "reviews_select_public" ON reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert_own"    ON reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- Follows
CREATE POLICY "follows_select_public" ON follows FOR SELECT USING (true);
CREATE POLICY "follows_insert_own"    ON follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "follows_delete_own"    ON follows FOR DELETE USING (auth.uid() = follower_id);

-- Notifications: only owner can read
CREATE POLICY "notifications_own" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifications_update_own" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Verifications: owner can view own
CREATE POLICY "verifications_owner_select" ON verifications FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM listings l WHERE l.id = listing_id AND l.user_id = auth.uid())
  );
CREATE POLICY "verifications_owner_insert" ON verifications FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM listings l WHERE l.id = listing_id AND l.user_id = auth.uid())
  );

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE proposals;
