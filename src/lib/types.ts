export type PredictedClass = 'ckd' | 'no_ckd';

export interface AssessmentInput {
  age: number;
  blood_pressure: number;
  specific_gravity: number;
  albumin: number;
  sugar: number;
  blood_glucose: number;
  blood_urea: number;
  serum_creatinine: number;
  sodium: number;
  potassium: number;
  hemoglobin: number;
  packed_cell_volume: number;
  white_blood_cell_count: number;
  red_blood_cell_count: number;
  diabetes_history: boolean;
  hypertension_history: boolean;
  appetite?: string;
  swelling?: string;
}

export interface PredictionResponse {
  model_version: string;
  predicted_class: PredictedClass;
  risk_label: string;
  risk_score: number;
  logit: number;
  evaluation_metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1: number;
    roc_auc: number;
    specificity: number;
    sensitivity: number;
  };
  disclaimer: string;
  submitted_values: Record<string, number>;
  generated_at: string;
}

export interface AssessmentRecord {
  id: string;
  user_id: string;
  age: number | null;
  blood_pressure: number | null;
  specific_gravity: number | null;
  albumin: number | null;
  sugar: number | null;
  blood_glucose: number | null;
  blood_urea: number | null;
  serum_creatinine: number | null;
  sodium: number | null;
  potassium: number | null;
  hemoglobin: number | null;
  packed_cell_volume: number | null;
  white_blood_cell_count: number | null;
  red_blood_cell_count: number | null;
  diabetes_history: boolean | null;
  hypertension_history: boolean | null;
  appetite: string | null;
  swelling: string | null;
  model_version: string | null;
  predicted_class: string | null;
  risk_score: number | null;
  input_values: Record<string, unknown>;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface ModelVersion {
  id: string;
  model_version: string;
  dataset_source: string;
  training_date: string;
  evaluation_metrics: Record<string, number | { tn: number; fp: number; fn: number; tp: number }>;
  artifact_reference: string;
  created_at: string;
}
