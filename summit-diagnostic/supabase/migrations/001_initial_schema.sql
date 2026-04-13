-- Diagnostic submissions — no user association, fully public
create table submissions (
  id uuid primary key default gen_random_uuid(),
  instrument_type text not null check (
    instrument_type in ('orra', 'orra-lite', 'four-a', 'plh', 'smp')
  ),
  client_label text,                    -- optional: org or individual name, entered by submitter
  report_input jsonb not null,          -- structured form data submitted
  diagnostic_output jsonb,              -- full AI response stored after processing
  status text not null default 'pending' check (
    status in ('pending', 'processing', 'complete', 'error')
  ),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index for fast lookup by id (used on report page)
create index submissions_id_idx on submissions(id);
create index submissions_status_idx on submissions(status);

-- RLS: public read on complete submissions, public insert
alter table submissions enable row level security;

create policy "anyone can insert submissions"
  on submissions for insert
  with check (true);

create policy "anyone can read complete submissions"
  on submissions for select
  using (status = 'complete');

-- Service role bypasses RLS for server-side updates
