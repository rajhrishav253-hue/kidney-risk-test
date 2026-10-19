import { useEffect, useState } from 'react';
import { History as HistoryIcon, Trash2, X, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { useRouter } from '@/lib/router';
import type { AssessmentRecord } from '@/lib/types';
import { LineChart } from '@/components/Charts';
import { FullPageSpinner, DisclaimerBanner } from '@/components/ui';

const metricKeys = [
  'serum_creatinine',
  'blood_urea',
  'hemoglobin',
  'blood_glucose',
  'blood_pressure',
];

const metricLabels: Record<string, string> = {
  serum_creatinine: 'Serum creatinine (mg/dL)',
  blood_urea: 'Blood urea (mg/dL)',
  hemoglobin: 'Hemoglobin (g/dL)',
  blood_glucose: 'Blood glucose (mg/dL)',
  blood_pressure: 'Blood pressure (mmHg)',
};

export function HistoryPage() {
  const { user } = useAuth();
  const { navigate } = useRouter();
  const [records, setRecords] = useState<AssessmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<AssessmentRecord | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [activeMetric, setActiveMetric] = useState<string>('serum_creatinine');

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('assessments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      if (error) setError(error.message);
      else setRecords((data ?? []) as AssessmentRecord[]);
      setLoading(false);
    })();
  }, [user]);

  async function confirmDelete() {
    if (!deleteId) return;
    setDeleting(true);
    const { error } = await supabase.from('assessments').delete().eq('id', deleteId);
    setDeleting(false);
    if (error) {
      setError(error.message);
      return;
    }
    setRecords((prev) => prev.filter((r) => r.id !== deleteId));
    if (selected?.id === deleteId) setSelected(null);
    setDeleteId(null);
  }

  if (loading) return <FullPageSpinner label="Loading your assessment history…" />;

  const trendData = records
    .map((r) => ({
      label: new Date(r.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      value:
        (r[activeMetric as keyof AssessmentRecord] as number | null) ?? null,
    }))
    .slice(-15);

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 animate-fade-up">
      <div className="mb-7">
        <span className="chip mb-3">
          <HistoryIcon size={12} /> History
        </span>
        <h1 className="font-[Space_Grotesk] text-3xl font-bold text-white">
          Assessment history
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Review, compare, and delete your saved assessments. You can only access your own records.
        </p>
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-red-400/25 bg-red-400/5 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {records.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-slate-400">You have no saved assessments yet.</p>
          <button
            onClick={() => navigate({ name: 'assessment' })}
            className="btn-primary mt-5 inline-flex items-center gap-2"
          >
            Run an assessment <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        <>
          {/* Comparison chart */}
          <div className="card p-6">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-[Space_Grotesk] text-lg font-semibold text-white">
                  Metric trend over time
                </h3>
                <p className="text-xs text-slate-400">
                  Track how a single clinical value changes across your assessments.
                </p>
              </div>
              <select
                value={activeMetric}
                onChange={(e) => setActiveMetric(e.target.value)}
                className="input-field !w-auto"
              >
                {metricKeys.map((k) => (
                  <option key={k} value={k}>
                    {metricLabels[k]}
                  </option>
                ))}
              </select>
            </div>
            <LineChart data={trendData} color="#3b82f6" />
          </div>

          {/* Records list */}
          <div className="card mt-6 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Result</th>
                    <th className="px-4 py-3">Risk</th>
                    <th className="px-4 py-3">Creatinine</th>
                    <th className="px-4 py-3">Hemoglobin</th>
                    <th className="px-4 py-3">Diabetes</th>
                    <th className="px-4 py-3">Hypertension</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {[...records].reverse().map((r) => (
                    <tr
                      key={r.id}
                      className="cursor-pointer border-t border-white/5 transition hover:bg-cyan-400/[0.03]"
                      onClick={() => setSelected(r)}
                    >
                      <td className="px-4 py-3 text-slate-300">
                        {new Date(r.created_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`chip ${
                            r.predicted_class === 'ckd'
                              ? '!text-amber-200 !border-amber-400/30'
                              : '!text-emerald-200 !border-emerald-400/30'
                          }`}
                        >
                          {r.predicted_class === 'ckd' ? (
                            <AlertTriangle size={11} />
                          ) : (
                            <CheckCircle2 size={11} />
                          )}
                          {r.predicted_class === 'ckd' ? 'Elevated' : 'Low'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-cyan-300">
                        {r.risk_score?.toFixed(3)}
                      </td>
                      <td className="px-4 py-3 text-slate-300">{r.serum_creatinine}</td>
                      <td className="px-4 py-3 text-slate-300">{r.hemoglobin}</td>
                      <td className="px-4 py-3 text-slate-300">
                        {r.diabetes_history ? 'Yes' : 'No'}
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {r.hypertension_history ? 'Yes' : 'No'}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteId(r.id);
                          }}
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-red-400/10 hover:text-red-300"
                          aria-label="Delete assessment"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6">
            <DisclaimerBanner />
          </div>
        </>
      )}

      {/* Detail drawer */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-md overflow-y-auto border-l border-cyan-500/15 bg-[#060b1a] p-6 shadow-2xl animate-fade-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-[Space_Grotesk] text-lg font-semibold text-white">
                Assessment details
              </h3>
              <button
                onClick={() => setSelected(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
            <div
              className={`mb-4 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold ${
                selected.predicted_class === 'ckd'
                  ? 'bg-amber-400/15 text-amber-200'
                  : 'bg-emerald-400/15 text-emerald-200'
              }`}
            >
              {selected.predicted_class === 'ckd' ? 'Elevated risk' : 'Low risk'} ·{' '}
              {((selected.risk_score ?? 0) * 100).toFixed(0)}%
            </div>
            <p className="text-xs text-slate-400">
              {new Date(selected.created_at).toLocaleString()} · Model{' '}
              {selected.model_version}
            </p>
            <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {[
                ['Age', selected.age],
                ['Blood pressure', selected.blood_pressure],
                ['Specific gravity', selected.specific_gravity],
                ['Albumin', selected.albumin],
                ['Sugar', selected.sugar],
                ['Blood glucose', selected.blood_glucose],
                ['Blood urea', selected.blood_urea],
                ['Serum creatinine', selected.serum_creatinine],
                ['Sodium', selected.sodium],
                ['Potassium', selected.potassium],
                ['Hemoglobin', selected.hemoglobin],
                ['Packed cell volume', selected.packed_cell_volume],
                ['WBC', selected.white_blood_cell_count],
                ['RBC', selected.red_blood_cell_count],
                ['Diabetes', selected.diabetes_history ? 'Yes' : 'No'],
                ['Hypertension', selected.hypertension_history ? 'Yes' : 'No'],
              ].map(([k, v]) => (
                <div key={k as string} className="flex justify-between border-b border-white/5 py-1.5">
                  <span className="text-slate-400">{k}</span>
                  <span className="font-medium text-white">{String(v ?? '—')}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                setDeleteId(selected.id);
              }}
              className="btn-ghost mt-6 flex w-full items-center justify-center gap-2 !text-red-300 !border-red-400/30 hover:!bg-red-400/10"
            >
              <Trash2 size={16} /> Delete this assessment
            </button>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-5 backdrop-blur-sm"
          onClick={() => !deleting && setDeleteId(null)}
        >
          <div
            className="card w-full max-w-sm p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-red-400/15 text-red-300">
              <Trash2 size={22} />
            </div>
            <h3 className="font-[Space_Grotesk] text-lg font-semibold text-white">
              Delete this assessment?
            </h3>
            <p className="mt-2 text-sm text-slate-400">
              This permanently removes the record from your history. This cannot be undone.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                disabled={deleting}
                className="btn-ghost flex-1"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 rounded-xl bg-red-500/90 px-4 py-2.5 font-semibold text-white transition hover:bg-red-500 disabled:opacity-50"
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
