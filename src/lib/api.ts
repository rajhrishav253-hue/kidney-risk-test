import { supabase } from './supabase';
import type { AssessmentInput, PredictionResponse } from './types';

export async function predictRisk(
  input: AssessmentInput
): Promise<PredictionResponse> {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/predict`;
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    apikey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
  };
  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  }

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) detail = body.error;
      if (body?.details) detail += ': ' + body.details.join('; ');
    } catch {
      // ignore parse errors
    }
    throw new Error(detail);
  }

  const data: PredictionResponse = await res.json();
  if (
    !data ||
    !['ckd', 'no_ckd'].includes(data.predicted_class) ||
    typeof data.risk_score !== 'number' ||
    !Number.isFinite(data.risk_score) ||
    data.risk_score < 0 ||
    data.risk_score > 1 ||
    typeof data.model_version !== 'string' ||
    typeof data.generated_at !== 'string'
  ) {
    throw new Error('Invalid prediction response from model service.');
  }
  return data;
}
