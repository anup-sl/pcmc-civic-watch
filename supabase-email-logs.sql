create table if not exists email_logs (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid,
  recipient text not null,
  cc text,
  reply_to text,
  subject text,
  sent_at timestamptz default now(),
  resend_id text,
  status text
);