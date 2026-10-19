/*
# AI KidneyGuard — Core Schema

## Overview
Creates the database foundation for AI KidneyGuard, an educational kidney disease
risk-assessment prototype. Users register and log in; each assessment's clinical
inputs and ML prediction are stored and isolated per user.

## New Tables

### profiles
- `id` (uuid, primary key, references auth.users on delete cascade)
- `full_name` (text, not null)
- `email` (text, unique, not null)
- `created_at`, `updated_at` (timestamptz)

Mirrors auth.users so the app can show a profile without touching auth metadata.

### assessments
- `id` (uuid primary key)
- `user_id` (uuid, references profiles.id, defaults to auth.uid())
- Clinical inputs: age, blood_pressure, specific_gravity, albumin, sugar,
  blood_glucose, blood_urea, serum_creatinine, sodium, potassium, hemoglobin,
  packed_cell_volume, white_blood_cell_count, red_blood_cell_count
- Categorical history: diabetes_history, hypertension_history (boolean)
- Symptoms: appetite (text), swelling (text) — optional
- ML output: model_version, predicted_class, risk_score
- `input_values` (jsonb) — full snapshot of submitted values for audit
- `created_at` (timestamptz)

### model_versions
- `id` (uuid primary key)
- `model_version` (text, unique)
- `dataset_source` (text)
- `training_date` (timestamptz)
- `evaluation_metrics` (jsonb)
- `artifact_reference` (text)

## Security (RLS)
- profiles: owner-only CRUD (authenticated, auth.uid() = id).
- assessments: owner-only CRUD via user_id ownership check.
- model_versions: read-only for authenticated users (public model metadata).
  Writes are not exposed through anon/authenticated — model metadata is seeded by admin.

## Indexes
- assessments(user_id)
- assessments(created_at desc)
- assessments(user_id, created_at desc)
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text UNIQUE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE IF NOT EXISTS assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  age double precision,
  blood_pressure double precision,
  specific_gravity double precision,
  albumin double precision,
  sugar double precision,
  blood_glucose double precision,
  blood_urea double precision,
  serum_creatinine double precision,
  sodium double precision,
  potassium double precision,
  hemoglobin double precision,
  packed_cell_volume double precision,
  white_blood_cell_count double precision,
  red_blood_cell_count double precision,
  diabetes_history boolean,
  hypertension_history boolean,
  appetite text,
  swelling text,
  model_version text,
  predicted_class text,
  risk_score double precision,
  input_values jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "assessments_select_own" ON assessments;
CREATE POLICY "assessments_select_own" ON assessments FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "assessments_insert_own" ON assessments;
CREATE POLICY "assessments_insert_own" ON assessments FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "assessments_update_own" ON assessments;
CREATE POLICY "assessments_update_own" ON assessments FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "assessments_delete_own" ON assessments;
CREATE POLICY "assessments_delete_own" ON assessments FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_assessments_created_at ON assessments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_assessments_user_created ON assessments(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS model_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_version text UNIQUE NOT NULL,
  dataset_source text NOT NULL,
  training_date timestamptz NOT NULL DEFAULT now(),
  evaluation_metrics jsonb NOT NULL DEFAULT '{}'::jsonb,
  artifact_reference text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE model_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "model_versions_select" ON model_versions;
CREATE POLICY "model_versions_select" ON model_versions FOR SELECT
  TO authenticated USING (true);

-- function to keep updated_at fresh
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_touch_updated_at ON profiles;
CREATE TRIGGER profiles_touch_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Auto-create a profile row when a new auth user signs up.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
