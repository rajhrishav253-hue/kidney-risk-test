# AI KidneyGuard — Kidney Risk Assessment Prototype

AI KidneyGuard is an educational web application that demonstrates a workflow for collecting selected patient measurements and returning an experimental CKD classification score. **It is not a medical device, diagnostic tool, or substitute for clinical assessment.**

## Current implementation

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS
- **Authentication and data:** Supabase Auth and PostgreSQL
- **Prediction endpoint:** Supabase Edge Function written in TypeScript
- **Current prediction logic:** coefficient-based logistic-regression-style demonstration baseline
- **Model output:** `ckd` or `no_ckd`, plus a score between 0 and 1

### Model transparency

The current repository contains embedded preprocessing constants and coefficients, but does not include a reproducible model-training pipeline, versioned training artifact, or independently reproducible evaluation report. For that reason, the application does **not** publish accuracy, precision, recall, F1, or ROC-AUC figures.

The returned score is an uncalibrated model score. It must not be interpreted as a patient's clinical probability of CKD. Before making performance claims, add a documented training pipeline, fixed train/validation/test protocol, leakage checks, model artifact/versioning, and a reproducible evaluation report reviewed by qualified domain experts.

## Features

- Email/password authentication through Supabase
- Patient measurement form with client- and server-side validation
- Supabase Edge Function prediction endpoint
- Saved assessment history and dashboard
- Demonstration patient presets for software testing

Sample patient presets are synthetic demo data. Do not use them as real patient records or clinical examples.

## Local setup

### Requirements

- Node.js 20 or newer
- npm
- A Supabase project

### Install dependencies

```bash
npm install
```

### Configure environment variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_OR_PUBLISHABLE_KEY
```

Use the project's public/anon key only. Never put a Supabase service-role key or other secret in a `VITE_*` variable because Vite exposes those values to browser code.

### Start the frontend

```bash
npm run dev
```

### Validate the frontend

```bash
npm run typecheck
npm run lint
npm run build
```

## Supabase deployment

1. Configure the Supabase project URL and public key in the hosting provider's environment settings.
2. Apply the database schema and Row Level Security policies required by the application.
3. Deploy the `predict` Edge Function.
4. Confirm the function's JWT verification setting matches the authenticated frontend flow.
5. Test registration, login, prediction, saving, reading, and deleting assessments using a non-production test account.

The repository must contain the authoritative SQL migrations for `profiles` and `assessments`, including ownership policies. Do not expose patient records through permissive public database policies.

## Important safety and privacy notes

- The app is an educational prototype and has not been clinically validated.
- Do not enter real patient information unless the deployment has been reviewed for privacy, security, consent, retention, and applicable legal requirements.
- Never use a low-risk result to rule out kidney disease or delay medical care.
- Consult a qualified healthcare professional for diagnosis and treatment decisions.

## Project structure

- `src/pages` — application pages
- `src/components` — reusable interface components
- `src/lib/api.ts` — frontend-to-prediction API communication
- `src/lib/fields.ts` — assessment field definitions and synthetic demo presets
- `src/lib/assessments.ts` — assessment persistence
- `supabase/functions/predict` — prediction Edge Function
- `supabase/config.toml` — Supabase function configuration
