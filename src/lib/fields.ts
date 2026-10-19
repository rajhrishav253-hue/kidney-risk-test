// Field configuration for the kidney assessment form.
// Tooltip text and ranges derived from the UCI Chronic Kidney Disease dataset
// column definitions (see dataset README).

export interface FieldConfig {
  key: keyof AssessmentInput;
  label: string;
  unit: string;
  required: boolean;
  min: number;
  max: number;
  step: number;
  tooltip: string;
  placeholder?: string;
}

import type { AssessmentInput } from './types';

export const numericFields: FieldConfig[] = [
  {
    key: 'age',
    label: 'Age',
    unit: 'years',
    required: true,
    min: 1,
    max: 120,
    step: 1,
    tooltip: 'Patient age in years.',
    placeholder: 'e.g. 45',
  },
  {
    key: 'blood_pressure',
    label: 'Blood Pressure',
    unit: 'mmHg',
    required: true,
    min: 40,
    max: 250,
    step: 1,
    tooltip: 'Diastolic blood pressure in mmHg (e.g. 80).',
    placeholder: 'e.g. 80',
  },
  {
    key: 'specific_gravity',
    label: 'Specific Gravity (urine)',
    unit: 'SG',
    required: true,
    min: 1.0,
    max: 1.03,
    step: 0.001,
    tooltip: 'Urine specific gravity. Normal ~1.010-1.025. Use 1.020 if unknown.',
    placeholder: 'e.g. 1.020',
  },
  {
    key: 'albumin',
    label: 'Urine Albumin',
    unit: '0-5',
    required: true,
    min: 0,
    max: 5,
    step: 1,
    tooltip: 'Urine albumin level (0-5 scale). 0 = normal, higher = more protein.',
    placeholder: 'e.g. 0',
  },
  {
    key: 'sugar',
    label: 'Urine Sugar',
    unit: '0-5',
    required: true,
    min: 0,
    max: 5,
    step: 1,
    tooltip: 'Urine sugar (glucose) level on a 0-5 scale.',
    placeholder: 'e.g. 0',
  },
  {
    key: 'blood_glucose',
    label: 'Blood Glucose (random)',
    unit: 'mg/dL',
    required: true,
    min: 20,
    max: 500,
    step: 1,
    tooltip: 'Random blood glucose in mg/dL.',
    placeholder: 'e.g. 121',
  },
  {
    key: 'blood_urea',
    label: 'Blood Urea',
    unit: 'mg/dL',
    required: true,
    min: 1,
    max: 300,
    step: 0.1,
    tooltip: 'Blood urea in mg/dL. Normal range ~7-20.',
    placeholder: 'e.g. 36',
  },
  {
    key: 'serum_creatinine',
    label: 'Serum Creatinine',
    unit: 'mg/dL',
    required: true,
    min: 0.1,
    max: 50,
    step: 0.01,
    tooltip: 'Serum creatinine in mg/dL. Normal ~0.6-1.2.',
    placeholder: 'e.g. 1.1',
  },
  {
    key: 'sodium',
    label: 'Sodium',
    unit: 'mEq/L',
    required: true,
    min: 100,
    max: 170,
    step: 0.1,
    tooltip: 'Serum sodium in mEq/L. Normal ~135-145.',
    placeholder: 'e.g. 140',
  },
  {
    key: 'potassium',
    label: 'Potassium',
    unit: 'mEq/L',
    required: true,
    min: 1,
    max: 12,
    step: 0.1,
    tooltip: 'Serum potassium in mEq/L. Normal ~3.5-5.0.',
    placeholder: 'e.g. 4.5',
  },
  {
    key: 'hemoglobin',
    label: 'Hemoglobin',
    unit: 'g/dL',
    required: true,
    min: 1,
    max: 25,
    step: 0.1,
    tooltip: 'Hemoglobin in g/dL. Normal ~12-17 (men), 12-15 (women).',
    placeholder: 'e.g. 13.5',
  },
  {
    key: 'packed_cell_volume',
    label: 'Packed Cell Volume',
    unit: '%',
    required: true,
    min: 1,
    max: 70,
    step: 0.1,
    tooltip: 'Hematocrit / packed cell volume (%). Normal ~36-50.',
    placeholder: 'e.g. 42',
  },
  {
    key: 'white_blood_cell_count',
    label: 'White Blood Cell Count',
    unit: 'cells/cumm',
    required: true,
    min: 500,
    max: 40000,
    step: 100,
    tooltip: 'WBC count in cells/cumm. Normal ~4000-11000.',
    placeholder: 'e.g. 7800',
  },
  {
    key: 'red_blood_cell_count',
    label: 'Red Blood Cell Count',
    unit: 'millions/cumm',
    required: true,
    min: 0.5,
    max: 12,
    step: 0.01,
    tooltip: 'RBC count in millions/cumm. Normal ~4.5-6.1 (men), 4.0-5.4 (women).',
    placeholder: 'e.g. 5.0',
  },
];

export interface BoolFieldConfig {
  key: 'diabetes_history' | 'hypertension_history';
  label: string;
  required: boolean;
  tooltip: string;
}

export const boolFields: BoolFieldConfig[] = [
  {
    key: 'diabetes_history',
    label: 'Diabetes History',
    required: true,
    tooltip: 'Does the patient have a history of diabetes mellitus?',
  },
  {
    key: 'hypertension_history',
    label: 'Hypertension History',
    required: true,
    tooltip: 'Does the patient have a history of hypertension (high blood pressure)?',
  },
];

export interface OptionalFieldConfig {
  key: 'appetite' | 'swelling';
  label: string;
  options: { value: string; label: string }[];
  tooltip: string;
}

export const optionalFields: OptionalFieldConfig[] = [
  {
    key: 'appetite',
    label: 'Appetite',
    options: [
      { value: 'good', label: 'Good' },
      { value: 'poor', label: 'Poor' },
    ],
    tooltip: 'Reported appetite (optional — informational only).',
  },
  {
    key: 'swelling',
    label: 'Swelling (edema)',
    options: [
      { value: 'none', label: 'None' },
      { value: 'present', label: 'Present' },
    ],
    tooltip: 'Visible swelling / edema (optional — informational only).',
  },
];

export function emptyAssessment(): AssessmentInput {
  return {
    age: 0,
    blood_pressure: 0,
    specific_gravity: 1.02,
    albumin: 0,
    sugar: 0,
    blood_glucose: 0,
    blood_urea: 0,
    serum_creatinine: 0,
    sodium: 140,
    potassium: 4.5,
    hemoglobin: 0,
    packed_cell_volume: 0,
    white_blood_cell_count: 0,
    red_blood_cell_count: 0,
    diabetes_history: false,
    hypertension_history: false,
    appetite: '',
    swelling: '',
  };
}

// Dummy / sample patient presets for quick demos. Values are realistic
// clinical measurements within the validated ranges. Not real patient data.
export interface SamplePreset {
  id: string;
  label: string;
  description: string;
  expectedRisk: 'low' | 'elevated';
  data: AssessmentInput;
}

export const samplePresets: SamplePreset[] = [
  {
    id: 'healthy-adult',
    label: 'Healthy adult',
    description: 'Normal lab values, no history of diabetes or hypertension.',
    expectedRisk: 'low',
    data: {
      age: 34,
      blood_pressure: 75,
      specific_gravity: 1.022,
      albumin: 0,
      sugar: 0,
      blood_glucose: 92,
      blood_urea: 14,
      serum_creatinine: 0.9,
      sodium: 140,
      potassium: 4.2,
      hemoglobin: 14.6,
      packed_cell_volume: 44,
      white_blood_cell_count: 7200,
      red_blood_cell_count: 5.1,
      diabetes_history: false,
      hypertension_history: false,
      appetite: 'good',
      swelling: 'none',
    },
  },
  {
    id: 'ckd-profile',
    label: 'CKD profile',
    description: 'Elevated creatinine, low hemoglobin, with diabetes & hypertension.',
    expectedRisk: 'elevated',
    data: {
      age: 62,
      blood_pressure: 88,
      specific_gravity: 1.01,
      albumin: 3,
      sugar: 2,
      blood_glucose: 185,
      blood_urea: 78,
      serum_creatinine: 4.8,
      sodium: 134,
      potassium: 5.6,
      hemoglobin: 9.4,
      packed_cell_volume: 28,
      white_blood_cell_count: 9600,
      red_blood_cell_count: 3.2,
      diabetes_history: true,
      hypertension_history: true,
      appetite: 'poor',
      swelling: 'present',
    },
  },
  {
    id: 'borderline',
    label: 'Borderline case',
    description: 'Some risk factors, mildly abnormal labs — useful for comparison.',
    expectedRisk: 'low',
    data: {
      age: 48,
      blood_pressure: 82,
      specific_gravity: 1.015,
      albumin: 1,
      sugar: 0,
      blood_glucose: 121,
      blood_urea: 36,
      serum_creatinine: 1.4,
      sodium: 138,
      potassium: 4.7,
      hemoglobin: 12.1,
      packed_cell_volume: 38,
      white_blood_cell_count: 8100,
      red_blood_cell_count: 4.3,
      diabetes_history: true,
      hypertension_history: false,
      appetite: 'good',
      swelling: 'none',
    },
  },
];
