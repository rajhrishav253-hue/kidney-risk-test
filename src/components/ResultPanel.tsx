import { AlertTriangle, CheckCircle2, Clock, FileText, History, Plus, Stethoscope } from 'lucide-react';
import type { AssessmentInput, PredictionResponse } from '@/lib/types';
import { Gauge } from '@/components/Charts';
import { DisclaimerBanner } from '@/components/ui';

interface ResultPanelProps {
  result: PredictionResponse;
  input: AssessmentInput;
  onNew: () => void;
  onHistory: () => void;
}

const fieldLabels: Record<string, string> = {
  age: 'Age (years)',
  blood_pressure: 'Blood pressure (mmHg)',
  specific_gravity: 'Urine specific gravity',
  albumin: 'Urine albumin (0-5)',
  sugar: 'Urine sugar (0-5)',
  blood_glucose: 'Blood glucose (mg/dL)',
  blood_urea: 'Blood urea (mg/dL)',
  serum_creatinine: 'Serum creatinine (mg/dL)',
  sodium: 'Sodium (mEq/L)',
  potassium: 'Potassium (mEq/L)',
  hemoglobin: 'Hemoglobin (g/dL)',
  packed_cell_volume: 'Packed cell volume (%)',
  white_blood_cell_count: 'WBC (cells/cumm)',
  red_blood_cell_count: 'RBC (millions/cumm)',
  diabetes_history: 'Diabetes history',
  hypertension_history: 'Hypertension history',
};

export function ResultPanel({ result, input, onNew, onHistory }: ResultPanelProps) {
  const isCkd = result.predicted_class === 'ckd';
  const date = new Date(result.generated_at);

  return (
    <div className="mx-auto max-w-4xl px-5 py-10 animate-fade-up">
      <div className="mb-7">
        <span className="chip mb-3">
          <FileText size={12} /> Prediction result
        </span>
        <h1 className="font-[Space_Grotesk] text-3xl font-bold text-white">
          Your assessment result
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Generated on {date.toLocaleString()} · Model {result.model_version}
        </p>
      </div>

      {/* Primary result */}
      <div
        className={`card relative overflow-hidden p-8 ${
          isCkd ? '!border-amber-400/30' : '!border-emerald-400/30'
        }`}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background: isCkd
              ? 'radial-gradient(circle at 30% 0%, rgba(245,158,11,0.18), transparent 55%)'
              : 'radial-gradient(circle at 30% 0%, rgba(16,185,129,0.18), transparent 55%)',
          }}
        />
        <div className="relative flex flex-col items-center gap-6 md:flex-row md:items-center md:gap-10">
          <div className="flex flex-col items-center">
            <Gauge value={result.risk_score} size={180} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <div
              className={`mb-3 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold ${
                isCkd
                  ? 'bg-amber-400/15 text-amber-200'
                  : 'bg-emerald-400/15 text-emerald-200'
              }`}
            >
              {isCkd ? <AlertTriangle size={15} /> : <CheckCircle2 size={15} />}
              {isCkd ? 'Elevated risk detected' : 'Low risk detected'}
            </div>
            <h2 className="font-[Space_Grotesk] text-2xl font-bold text-white">
              {result.risk_label}
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-300">
              {isCkd
                ? 'The model classified this set of measurements as consistent with chronic kidney disease. This is an experimental ML risk classification — not a confirmed diagnosis. The score is not a calibrated probability and has not been clinically validated. Please review your measurements with a qualified healthcare professional.'
                : 'The model classified this set of measurements as not consistent with chronic kidney disease. This is an experimental model classification and not a guarantee of kidney health. The score is not clinically validated. Continue routine care and consult a healthcare professional for clinical evaluation.'}
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="chip">
                <Clock size={11} /> {date.toLocaleDateString()}
              </span>
              <span className="chip">Model score: {result.risk_score.toFixed(3)}</span>
              <span className="chip">Logit: {result.logit.toFixed(3)}</span>
              <span className="chip">Model: {result.model_version}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <DisclaimerBanner />
      </div>

      {/* Submitted values */}
      <div className="card mt-6 p-6">
        <h3 className="mb-4 font-[Space_Grotesk] text-lg font-semibold text-white">
          Submitted clinical values
        </h3>
        <div className="grid gap-x-6 gap-y-2 sm:grid-cols-2 md:grid-cols-3">
          {Object.entries(fieldLabels).map(([key, label]) => {
            const v = (input as unknown as Record<string, unknown>)[key];
            const display =
              v === true ? 'Yes' : v === false ? 'No' : v === '' || v == null ? '—' : String(v);
            return (
              <div key={key} className="flex items-center justify-between border-b border-white/5 py-1.5 text-sm">
                <span className="text-slate-400">{label}</span>
                <span className="font-medium text-white">{display}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Advice */}
      <div className="card mt-6 flex items-start gap-4 p-6">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cyan-400/10 text-cyan-300">
          <Stethoscope size={20} />
        </div>
        <div>
          <h3 className="font-[Space_Grotesk] text-base font-semibold text-white">
            Talk to a healthcare professional
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
            This tool does not recommend starting or stopping any medication. If your
            result suggests elevated risk, or you have concerns about your kidney
            health, please consult a qualified physician or nephrologist for proper
            clinical evaluation and laboratory testing.
          </p>
        </div>
      </div>

      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button onClick={onHistory} className="btn-ghost flex items-center gap-2">
          <History size={16} /> View history
        </button>
        <button onClick={onNew} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> New assessment
        </button>
      </div>
    </div>
  );
}
