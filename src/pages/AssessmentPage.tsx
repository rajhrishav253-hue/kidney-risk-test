import { useState } from 'react';
import { Info, FlaskConical, AlertCircle, ArrowRight, RotateCcw, Sparkles } from 'lucide-react';
import { numericFields, boolFields, optionalFields, emptyAssessment, samplePresets } from '@/lib/fields';
import type { AssessmentInput, PredictionResponse } from '@/lib/types';
import { predictRisk } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { useRouter } from '@/lib/router';
import { DisclaimerBanner, Spinner } from '@/components/ui';
import { ResultPanel } from '@/components/ResultPanel';

export function AssessmentPage() {
  const [input, setInput] = useState<AssessmentInput>(emptyAssessment());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const { navigate } = useRouter();

  function update<K extends keyof AssessmentInput>(key: K, value: AssessmentInput[K]) {
    setInput((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    for (const f of numericFields) {
      const v = input[f.key];
      if (v === 0 && (f.key === 'age' || f.key === 'hemoglobin')) {
        // allow 0 only if user typed it; we still validate range below
      }
      const num = Number(v);
      if (v === undefined || v === null || v === '' || Number.isNaN(num)) {
        next[f.key] = `${f.label} is required.`;
      } else if (num < f.min || num > f.max) {
        next[f.key] = `${f.label} must be between ${f.min} and ${f.max} ${f.unit}.`;
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGlobalError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      const prediction = await predictRisk(input);

      const { data, error } = await supabase
        .from('assessments')
        .insert({
          ...input,
          model_version: prediction.model_version,
          predicted_class: prediction.predicted_class,
          risk_score: prediction.risk_score,
          input_values: input as unknown as Record<string, unknown>,
        })
        .select('id')
        .maybeSingle();

      if (error) throw new Error(`Failed to save assessment: ${error.message}`);
      setResult(prediction);
      // keep the id for navigation if needed
      void data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Prediction failed.';
      setGlobalError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setInput(emptyAssessment());
    setResult(null);
    setErrors({});
    setGlobalError(null);
  }

  if (result) {
    return (
      <ResultPanel
        result={result}
        input={input}
        onNew={() => resetForm()}
        onHistory={() => navigate({ name: 'history' })}
      />
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-10 animate-fade-up">
      <div className="mb-7">
        <span className="chip mb-3">
          <FlaskConical size={12} /> Assessment
        </span>
        <h1 className="font-[Space_Grotesk] text-3xl font-bold text-white">
          Kidney risk assessment
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          Enter the clinical measurements below. All required fields are validated on
          the server before the model produces a prediction. Hover the info icon on
          each field for guidance.
        </p>
      </div>

      <DisclaimerBanner />

      {/* Sample data picker */}
      <div className="card mt-5 p-5">
        <div className="flex items-center gap-2">
          <Sparkles size={15} className="text-cyan-300" />
          <h2 className="font-[Space_Grotesk] text-sm font-semibold text-white">Load sample patient data</h2>
          <span className="ml-1 text-[11px] text-slate-500">— fills the form with realistic dummy values for testing</span>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {samplePresets.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setInput(p.data);
                setErrors({});
                setGlobalError(null);
              }}
              className="group rounded-xl border border-cyan-500/15 bg-[#060b1a]/50 p-4 text-left transition hover:border-cyan-400/45 hover:bg-cyan-400/5"
            >
              <div className="flex items-center justify-between">
                <span className="font-[Space_Grotesk] text-sm font-semibold text-white">{p.label}</span>
                <span
                  className={`chip !px-2 !py-0.5 text-[10px] ${
                    p.expectedRisk === 'elevated'
                      ? '!text-amber-200 !border-amber-400/30'
                      : '!text-emerald-200 !border-emerald-400/30'
                  }`}
                >
                  {p.expectedRisk === 'elevated' ? 'High risk' : 'Low risk'}
                </span>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{p.description}</p>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-8">
        {/* Numeric fields */}
        <div className="card p-6">
          <h2 className="mb-1 font-[Space_Grotesk] text-lg font-semibold text-white">
            Laboratory measurements
          </h2>
          <p className="mb-5 text-xs text-slate-400">
            Use standard units as indicated. Do not invent values; if a measurement is
            unknown, obtain it before submitting.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {numericFields.map((f) => (
              <div key={f.key}>
                <label className="label-text flex items-center gap-1.5" htmlFor={f.key}>
                  {f.label}
                  <span className="text-cyan-400/70">({f.unit})</span>
                  <span className="group relative ml-auto">
                    <Info size={13} className="cursor-help text-slate-500" />
                    <span className="pointer-events-none absolute bottom-full right-0 z-10 mb-1 hidden w-48 rounded-lg border border-cyan-500/20 bg-[#0a1224] p-2 text-[11px] text-slate-300 group-hover:block">
                      {f.tooltip}
                    </span>
                  </span>
                </label>
                <input
                  id={f.key}
                  type="number"
                  inputMode="decimal"
                  step={f.step}
                  min={f.min}
                  max={f.max}
                  value={input[f.key] === 0 && f.placeholder ? '' : String(input[f.key])}
                  onChange={(e) => {
                    const raw = e.target.value;
                    update(f.key, (raw === '' ? 0 : Number(raw)) as AssessmentInput[typeof f.key]);
                  }}
                  placeholder={f.placeholder}
                  className={`input-field mt-1.5 ${errors[f.key] ? '!border-red-400/60' : ''}`}
                />
                {errors[f.key] && (
                  <p className="mt-1 text-xs text-red-300">{errors[f.key]}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Boolean fields */}
        <div className="card p-6">
          <h2 className="mb-5 font-[Space_Grotesk] text-lg font-semibold text-white">
            Patient history
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {boolFields.map((f) => (
              <div key={f.key}>
                <label className="label-text flex items-center gap-1.5">
                  {f.label}
                  <span className="group relative ml-auto">
                    <Info size={13} className="cursor-help text-slate-500" />
                    <span className="pointer-events-none absolute bottom-full right-0 z-10 mb-1 hidden w-48 rounded-lg border border-cyan-500/20 bg-[#0a1224] p-2 text-[11px] text-slate-300 group-hover:block">
                      {f.tooltip}
                    </span>
                  </span>
                </label>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => update(f.key, true)}
                    className={`flex-1 rounded-lg border px-4 py-2 text-sm transition ${
                      input[f.key] === true
                        ? 'border-cyan-400/60 bg-cyan-400/15 text-cyan-200'
                        : 'border-cyan-500/15 bg-[#060b1a]/50 text-slate-400 hover:border-cyan-400/30'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => update(f.key, false)}
                    className={`flex-1 rounded-lg border px-4 py-2 text-sm transition ${
                      input[f.key] === false
                        ? 'border-cyan-400/60 bg-cyan-400/15 text-cyan-200'
                        : 'border-cyan-500/15 bg-[#060b1a]/50 text-slate-400 hover:border-cyan-400/30'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Optional fields */}
        <div className="card p-6">
          <h2 className="mb-1 font-[Space_Grotesk] text-lg font-semibold text-white">
            Symptoms <span className="text-xs font-normal text-slate-500">(optional)</span>
          </h2>
          <p className="mb-5 text-xs text-slate-400">
            These fields are recorded for completeness and are not used by the current model.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {optionalFields.map((f) => (
              <div key={f.key}>
                <label className="label-text flex items-center gap-1.5" htmlFor={f.key}>
                  {f.label}
                  <span className="group relative ml-auto">
                    <Info size={13} className="cursor-help text-slate-500" />
                    <span className="pointer-events-none absolute bottom-full right-0 z-10 mb-1 hidden w-48 rounded-lg border border-cyan-500/20 bg-[#0a1224] p-2 text-[11px] text-slate-300 group-hover:block">
                      {f.tooltip}
                    </span>
                  </span>
                </label>
                <select
                  id={f.key}
                  value={input[f.key] ?? ''}
                  onChange={(e) => update(f.key, e.target.value as AssessmentInput[typeof f.key])}
                  className="input-field mt-1.5"
                >
                  <option value="">— Select —</option>
                  {f.options.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        {globalError && (
          <div className="flex items-start gap-2 rounded-lg border border-red-400/25 bg-red-400/5 px-4 py-3 text-sm text-red-200">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{globalError}</span>
          </div>
        )}

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={resetForm} className="btn-ghost flex items-center gap-2">
            <RotateCcw size={16} /> Reset
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary flex items-center gap-2"
          >
            {submitting ? (
              <>
                <Spinner /> Running model…
              </>
            ) : (
              <>
                Assess risk <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
