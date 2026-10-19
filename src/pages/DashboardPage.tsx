import { useEffect, useState } from 'react';
import { Activity, ArrowRight, ClipboardList, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { useRouter } from '@/lib/router';
import type { AssessmentRecord } from '@/lib/types';
import { LineChart } from '@/components/Charts';
import { FullPageSpinner, DisclaimerBanner } from '@/components/ui';

export function DashboardPage() {
  const { user, profile } = useAuth();
  const { navigate } = useRouter();
  const [records, setRecords] = useState<AssessmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('assessments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      if (error) {
        setError(error.message);
      } else {
        setRecords((data ?? []) as AssessmentRecord[]);
      }
      setLoading(false);
    })();
  }, [user]);

  if (loading) return <FullPageSpinner label="Loading your dashboard…" />;

  const latest = records.length > 0 ? records[records.length - 1] : null;
  const ckdCount = records.filter((r) => r.predicted_class === 'ckd').length;
  const lowCount = records.filter((r) => r.predicted_class === 'no_ckd').length;
  const avgScore =
    records.length > 0
      ? records.reduce((s, r) => s + (r.risk_score ?? 0), 0) / records.length
      : 0;

  const trendData = records
    .map((r) => ({
      label: new Date(r.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      value: r.risk_score,
    }))
    .slice(-12);

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 animate-fade-up">
      <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <span className="chip mb-3">
            <Activity size={12} /> Dashboard
          </span>
          <h1 className="font-[Space_Grotesk] text-3xl font-bold text-white">
            Welcome back, {profile?.full_name ?? user?.email}
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            An overview of your kidney risk assessments and trends over time.
          </p>
        </div>
        <button
          onClick={() => navigate({ name: 'assessment' })}
          className="btn-primary flex items-center gap-2 self-start"
        >
          New assessment <ArrowRight size={16} />
        </button>
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-red-400/25 bg-red-400/5 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<ClipboardList size={20} />}
          label="Total assessments"
          value={String(records.length)}
        />
        <StatCard
          icon={<TrendingUp size={20} />}
          label="Average risk score"
          value={avgScore.toFixed(3)}
        />
        <StatCard
          icon={<AlertTriangle size={20} />}
          label="Elevated-risk results"
          value={String(ckdCount)}
          tone="warn"
        />
        <StatCard
          icon={<CheckCircle2 size={20} />}
          label="Low-risk results"
          value={String(lowCount)}
          tone="good"
        />
      </div>

      {/* Latest result + trend */}
      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-1">
          <h3 className="mb-4 font-[Space_Grotesk] text-lg font-semibold text-white">
            Latest result
          </h3>
          {latest ? (
            <div>
              <div
                className={`mb-4 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold ${
                  latest.predicted_class === 'ckd'
                    ? 'bg-amber-400/15 text-amber-200'
                    : 'bg-emerald-400/15 text-emerald-200'
                }`}
              >
                {latest.predicted_class === 'ckd' ? (
                  <AlertTriangle size={14} />
                ) : (
                  <CheckCircle2 size={14} />
                )}
                {latest.predicted_class === 'ckd' ? 'Elevated risk' : 'Low risk'}
              </div>
              <p className="font-[Space_Grotesk] text-4xl font-bold text-cyan-300">
                {((latest.risk_score ?? 0) * 100).toFixed(0)}%
              </p>
              <p className="mt-1 text-xs uppercase tracking-wider text-slate-500">
                risk score
              </p>
              <div className="mt-4 space-y-1.5 text-sm text-slate-400">
                <div className="flex justify-between">
                  <span>Date</span>
                  <span className="text-slate-200">
                    {new Date(latest.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Model</span>
                  <span className="text-slate-200">{latest.model_version}</span>
                </div>
                <div className="flex justify-between">
                  <span>Serum creatinine</span>
                  <span className="text-slate-200">{latest.serum_creatinine}</span>
                </div>
                <div className="flex justify-between">
                  <span>Hemoglobin</span>
                  <span className="text-slate-200">{latest.hemoglobin}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-sm text-slate-400">No assessments yet.</p>
              <button
                onClick={() => navigate({ name: 'assessment' })}
                className="btn-primary mt-4 inline-flex items-center gap-2 text-sm"
              >
                Run your first assessment <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>

        <div className="card p-6 lg:col-span-2">
          <h3 className="mb-1 font-[Space_Grotesk] text-lg font-semibold text-white">
            Risk score trend
          </h3>
          <p className="mb-4 text-xs text-slate-400">
            Your risk score across all assessments, oldest to newest.
          </p>
          <LineChart data={trendData} yMin={0} yMax={1} yLabel="risk score" />
        </div>
      </div>

      {/* Recent assessments */}
      <div className="card mt-6 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-[Space_Grotesk] text-lg font-semibold text-white">
            Recent assessments
          </h3>
          <button
            onClick={() => navigate({ name: 'history' })}
            className="text-sm text-cyan-300 hover:text-cyan-200"
          >
            View all →
          </button>
        </div>
        {records.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">
            No assessments yet. Run one to see it here.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Result</th>
                  <th className="py-2 pr-4">Risk score</th>
                  <th className="py-2 pr-4">Serum creatinine</th>
                  <th className="py-2 pr-4">Hemoglobin</th>
                  <th className="py-2">Model</th>
                </tr>
              </thead>
              <tbody>
                {records
                  .slice(-5)
                  .reverse()
                  .map((r) => (
                    <tr key={r.id} className="border-t border-white/5">
                      <td className="py-2.5 pr-4 text-slate-300">
                        {new Date(r.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-2.5 pr-4">
                        <span
                          className={`chip ${
                            r.predicted_class === 'ckd'
                              ? '!text-amber-200 !border-amber-400/30'
                              : '!text-emerald-200 !border-emerald-400/30'
                          }`}
                        >
                          {r.predicted_class === 'ckd' ? 'Elevated' : 'Low'}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4 font-medium text-cyan-300">
                        {r.risk_score?.toFixed(3)}
                      </td>
                      <td className="py-2.5 pr-4 text-slate-300">{r.serum_creatinine}</td>
                      <td className="py-2.5 pr-4 text-slate-300">{r.hemoglobin}</td>
                      <td className="py-2.5 text-xs text-slate-500">{r.model_version}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-6">
        <DisclaimerBanner />
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone = 'default',
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: 'default' | 'good' | 'warn';
}) {
  const toneClass =
    tone === 'good'
      ? 'text-emerald-300'
      : tone === 'warn'
      ? 'text-amber-300'
      : 'text-cyan-300';
  return (
    <div className="card card-hover p-5">
      <div className={`mb-3 grid h-10 w-10 place-items-center rounded-xl bg-white/5 ${toneClass}`}>
        {icon}
      </div>
      <p className="font-[Space_Grotesk] text-2xl font-bold text-white">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-wider text-slate-400">{label}</p>
    </div>
  );
}
