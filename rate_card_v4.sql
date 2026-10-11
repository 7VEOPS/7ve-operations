-- V4 rate-card review flags on staff
alter table staff_people
  add column if not exists rate_card_version text,
  add column if not exists rate_review text,
  add column if not exists rate_review_at timestamptz;
