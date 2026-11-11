import { predictRisk } from '@/lib/api';
import { samplePresets } from '@/lib/fields';
import { supabase } from '@/lib/supabase';
import type { AssessmentInput, PredictionResponse } from '@/lib/types';

export async function saveAssessment(
  input: AssessmentInput,
  prediction: PredictionResponse
): Promise<void> {
  const { error } = await supabase.from('assessments').insert({
    ...input,
    model_version: prediction.model_version,
    predicted_class: prediction.predicted_class,
    risk_score: prediction.risk_score,
    input_values: input as unknown as Record<string, unknown>,
  });
  if (error) throw new Error(`Failed to save assessment: ${error.message}`);
}

export async function seedSampleAssessments(): Promise<void> {
  for (const preset of samplePresets) {
    const prediction = await predictRisk(preset.data);
    await saveAssessment(preset.data, prediction);
  }
}
