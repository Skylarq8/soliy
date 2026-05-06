CREATE TABLE IF NOT EXISTS message_reads (
  proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  last_read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (proposal_id, user_id)
);

ALTER TABLE message_reads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "message_reads_own_select" ON message_reads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "message_reads_own_insert" ON message_reads FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM proposals p
      WHERE p.id = proposal_id
        AND (p.sender_id = auth.uid() OR p.receiver_id = auth.uid())
    )
  );

CREATE POLICY "message_reads_own_update" ON message_reads FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE message_reads;
