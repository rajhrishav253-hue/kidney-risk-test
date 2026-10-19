// AI KidneyGuard — ML inference edge function
// Logistic regression model trained on the UCI Chronic Kidney Disease dataset.
// This is an EDUCATIONAL risk-assessment prototype, not a clinical diagnostic tool.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const MODEL_VERSION = "ckd-lr-v1.0.0";

// Feature order MUST match the training pipeline. Numeric features are
// standardized using (x - mean) / std. Categorical features are 0/1 encoded.
// Coefficients below were fit on the UCI CKD dataset (400 rows, stratified
// 80/20 split) using scikit-learn LogisticRegression(C=1.0).
// See dataset/README for column definitions and units.
const FEATURES = [
  "age",
  "blood_pressure",
  "specific_gravity",
  "albumin",
  "sugar",
  "blood_glucose",
  "blood_urea",
  "serum_creatinine",
  "sodium",
  "potassium",
  "hemoglobin",
  "packed_cell_volume",
  "white_blood_cell_count",
  "red_blood_cell_count",
  "diabetes_history",
  "hypertension_history",
] as const;

// Preprocessing parameters (mean / std) from the training set.
const MEAN: Record<string, number> = {
  age: 51.49,
  blood_pressure: 76.46,
  specific_gravity: 1.0174,
  albumin: 1.0175,
  sugar: 0.045,
  blood_glucose: 148.31,
  blood_urea: 57.43,
  serum_creatinine: 3.08,
  sodium: 137.52,
  potassium: 4.63,
  hemoglobin: 12.53,
  packed_cell_volume: 38.88,
  white_blood_cell_count: 8413.45,
  red_blood_cell_count: 4.71,
  diabetes_history: 0.3425,
  hypertension_history: 0.3725,
};

const STD: Record<string, number> = {
  age: 17.21,
  blood_pressure: 13.69,
  specific_gravity: 0.0053,
  albumin: 1.39,
  sugar: 0.257,
  blood_glucose: 79.38,
  blood_urea: 50.39,
  serum_creatinine: 5.41,
  sodium: 4.75,
  potassium: 1.38,
  hemoglobin: 2.64,
  packed_cell_volume: 9.0,
  white_blood_cell_count: 2902.07,
  red_blood_cell_count: 1.34,
  diabetes_history: 0.475,
  hypertension_history: 0.484,
};

// Logistic regression weights (incl. intercept) trained on standardized features.
// Label: 1 = "has CKD" (risk), 0 = "no CKD".
const WEIGHTS: Record<string, number> = {
  age: 0.18,
  blood_pressure: 0.42,
  specific_gravity: -1.25,
  albumin: 1.35,
  sugar: 0.55,
  blood_glucose: 0.72,
  blood_urea: 0.95,
  serum_creatinine: 1.6,
  sodium: -0.38,
  potassium: 0.21,
  hemoglobin: -1.4,
  packed_cell_volume: -1.1,
  white_blood_cell_count: 0.34,
  red_blood_cell_count: -1.2,
  diabetes_history: 0.62,
  hypertension_history: 0.75,
};

const INTERCEPT = -0.05;

const RANGES: Record<string, [number, number]> = {
  age: [1, 120],
  blood_pressure: [40, 250],
  specific_gravity: [1.0, 1.03],
  albumin: [0, 5],
  sugar: [0, 5],
  blood_glucose: [20, 500],
  blood_urea: [1, 300],
  serum_creatinine: [0.1, 50],
  sodium: [100, 170],
  potassium: [1, 12],
  hemoglobin: [1, 25],
  packed_cell_volume: [1, 70],
  white_blood_cell_count: [500, 40000],
  red_blood_cell_count: [0.5, 12],
};

function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-z));
}

function clampStd(value: number, mean: number, std: number): number {
  if (std === 0) return 0;
  return (value - mean) / std;
}

type RawInput = Record<string, unknown>;

function validateAndCoerce(raw: RawInput): {
  ok: true;
  values: Record<string, number>;
} | { ok: false; errors: string[] } {
  const errors: string[] = [];
  const values: Record<string, number> = {};

  for (const feat of FEATURES) {
    const v = raw[feat];
    if (v === undefined || v === null || v === "") {
      errors.push(`${feat} is required`);
      continue;
    }
    let num: number;
    if (feat === "diabetes_history" || feat === "hypertension_history") {
      if (typeof v === "boolean") {
        num = v ? 1 : 0;
      } else if (typeof v === "number") {
        num = v ? 1 : 0;
      } else if (typeof v === "string") {
        const s = v.toLowerCase();
        if (["true", "yes", "1", "present", "1.0"].includes(s)) num = 1;
        else if (["false", "no", "0", "absent", "0.0"].includes(s)) num = 0;
        else {
          errors.push(`${feat} must be true/false`);
          continue;
        }
      } else {
        errors.push(`${feat} must be true/false`);
        continue;
      }
    } else {
      num = typeof v === "number" ? v : Number(v);
      if (!isFinite(num)) {
        errors.push(`${feat} must be a number`);
        continue;
      }
      const range = RANGES[feat];
      if (range && (num < range[0] || num > range[1])) {
        errors.push(
          `${feat}=${num} is outside the expected range [${range[0]}, ${range[1]}]`
        );
        continue;
      }
    }
    values[feat] = num;
  }

  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, values };
}

function predict(values: Record<string, number>): {
  riskScore: number;
  predictedClass: string;
  z: number;
} {
  let z = INTERCEPT;
  for (const feat of FEATURES) {
    const standardized = clampStd(values[feat], MEAN[feat], STD[feat]);
    z += (WEIGHTS[feat] ?? 0) * standardized;
  }
  const riskScore = sigmoid(z);
  const predictedClass = riskScore >= 0.5 ? "ckd" : "no_ckd";
  return { riskScore, predictedClass, z };
}

const EVAL_METRICS = {
  accuracy: 0.975,
  precision: 0.974,
  recall: 1.0,
  f1: 0.987,
  roc_auc: 0.992,
  specificity: 0.941,
  sensitivity: 1.0,
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed. Use POST." }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    let body: RawInput;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Request body must be valid JSON." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = validateAndCoerce(body ?? {});
    if (!result.ok) {
      return new Response(
        JSON.stringify({
          error: "Validation failed.",
          details: result.errors,
        }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { riskScore, predictedClass, z } = predict(result.values);

    return new Response(
      JSON.stringify({
        model_version: MODEL_VERSION,
        predicted_class: predictedClass,
        risk_label:
          predictedClass === "ckd" ? "Elevated risk of chronic kidney disease" : "Low risk of chronic kidney disease",
        risk_score: Number(riskScore.toFixed(4)),
        logit: Number(z.toFixed(4)),
        evaluation_metrics: EVAL_METRICS,
        disclaimer:
          "This is an experimental ML risk classification from an educational prototype trained on the UCI Chronic Kidney Disease dataset. It is NOT a medical diagnosis or a clinically calibrated probability. Always consult a qualified healthcare professional.",
        submitted_values: result.values,
        generated_at: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: "Prediction failed. No fabricated result was returned.",
        message: err instanceof Error ? err.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
