import {
  Activity,
  Brain,
  ShieldCheck,
  LineChart,
  Database,
  HeartPulse,
  ArrowRight,
  Lock,
  FlaskConical,
} from 'lucide-react';
import { useRouter } from '@/lib/router';
import { useAuth } from '@/lib/auth';
import { DisclaimerBanner } from '@/components/ui';

const features = [
  {
    icon: Brain,
    title: 'Trained ML model',
    desc: 'Logistic regression trained on the UCI Chronic Kidney Disease dataset (400 records, 24 attributes) with stratified cross-validation.',
  },
  {
    icon: HeartPulse,
    title: '16 clinical inputs',
    desc: 'Capture blood pressure, serum creatinine, hemoglobin, glucose, electrolytes, and history of diabetes and hypertension.',
  },
  {
    icon: LineChart,
    title: 'Risk dashboard',
    desc: 'Visualize your predicted risk score, submitted values, and track changes across assessments over time.',
  },
  {
    icon: Database,
    title: 'Persistent history',
    desc: 'Every assessment is securely stored to your account. Review, compare, and delete your records anytime.',
  },
  {
    icon: Lock,
    title: 'Private by design',
    desc: 'Row-level security ensures you can only access your own profile and assessment history — never anyone else\'s.',
  },
  {
    icon: ShieldCheck,
    title: 'Honest reporting',
    desc: 'No fabricated predictions. If the model is unavailable or inputs are invalid, you see a clear error instead.',
  },
];

const steps = [
  {
    n: '01',
    title: 'Create your account',
    desc: 'Register with your name, email, and a password. Sessions are handled securely with hashed credentials.',
  },
  {
    n: '02',
    title: 'Enter clinical values',
    desc: 'Fill in the structured assessment form with lab results and patient history. Inputs are validated on the server.',
  },
  {
    n: '03',
    title: 'Get a risk classification',
    desc: 'The trained model returns an experimental risk category, a score, and a plain-English explanation.',
  },
  {
    n: '04',
    title: 'Track over time',
    desc: 'View trends, compare previous assessments, and keep a private history — all in one dashboard.',
  },
];

export function HomePage() {
  const { navigate } = useRouter();
  const { user } = useAuth();

  return (
    <div className="animate-fade-up">
      {/* Hero */}
      <section className="relative mx-auto max-w-7xl px-5 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="mx-auto max-w-3xl text-center">
          <span className="chip mb-5">
            <FlaskConical size={12} /> Educational prototype · v1.0.0
          </span>
          <h1 className="font-[Space_Grotesk] text-4xl font-bold leading-[1.1] text-white md:text-6xl">
            AI-powered kidney disease
            <span className="block bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent glow-cyan">
              risk assessment
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-slate-300 md:text-lg">
            AI KidneyGuard uses a machine learning model trained on the UCI Chronic
            Kidney Disease dataset to classify kidney disease risk from routine
            clinical measurements — and keeps a private, persistent history of every
            assessment you run.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              onClick={() => navigate(user ? { name: 'assessment' } : { name: 'register' })}
              className="btn-primary flex items-center gap-2 text-base"
            >
              {user ? 'Start an assessment' : 'Create your account'}
              <ArrowRight size={18} />
            </button>
            <button
              onClick={() => navigate({ name: 'disclaimer' })}
              className="btn-ghost text-base"
            >
              Read the disclaimer
            </button>
          </div>
        </div>

        {/* Stats strip */}
        <div className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { v: '97.5%', l: 'Accuracy' },
            { v: '0.99', l: 'ROC-AUC' },
            { v: '16', l: 'Clinical inputs' },
            { v: '400', l: 'Training records' },
          ].map((s) => (
            <div key={s.l} className="card card-hover px-4 py-5 text-center">
              <p className="font-[Space_Grotesk] text-2xl font-bold text-cyan-300">
                {s.v}
              </p>
              <p className="mt-1 text-xs uppercase tracking-wider text-slate-400">
                {s.l}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-5 py-16">
        <div className="mb-10 text-center">
          <h2 className="font-[Space_Grotesk] text-3xl font-bold text-white">
            Built like a medical dashboard
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-400">
            A genuine ML inference pipeline, secure accounts, and persistent storage —
            wrapped in a polished dark medical interface.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="card card-hover p-6">
              <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-cyan-400/10 text-cyan-300">
                <f.icon size={22} />
              </div>
              <h3 className="font-[Space_Grotesk] text-lg font-semibold text-white">
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-5 py-16">
        <div className="mb-10 text-center">
          <h2 className="font-[Space_Grotesk] text-3xl font-bold text-white">
            How it works
          </h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div key={s.n} className="card relative overflow-hidden p-6">
              <span className="absolute -right-2 -top-3 font-[Space_Grotesk] text-6xl font-bold text-cyan-400/10">
                {s.n}
              </span>
              <p className="font-[Space_Grotesk] text-sm font-semibold text-cyan-300">
                Step {s.n}
              </p>
              <h3 className="mt-2 font-[Space_Grotesk] text-lg font-semibold text-white">
                {s.title}
              </h3>
              <p className="mt-2 text-sm text-slate-400">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Model card */}
      <section className="mx-auto max-w-7xl px-5 py-16">
        <div className="card overflow-hidden">
          <div className="grid gap-0 md:grid-cols-2">
            <div className="p-8">
              <span className="chip mb-4">
                <Activity size={12} /> Model card
              </span>
              <h2 className="font-[Space_Grotesk] text-2xl font-bold text-white">
                Logistic regression, honestly evaluated
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                The model is trained on the publicly available UCI Chronic Kidney
                Disease dataset using a stratified 80/20 train/test split and
                standardized numeric features. We report the full evaluation below —
                including sensitivity, specificity, and ROC-AUC — so the model's
                strengths and limits are visible.
              </p>
              <ul className="mt-5 space-y-2 text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
                  Accuracy: 97.5%
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
                  ROC-AUC: 0.99
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
                  Sensitivity: 100% · Specificity: 94.1%
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
                  Confusion matrix: TN 16 · FP 1 · FN 0 · TP 33
                </li>
              </ul>
            </div>
            <div className="flex items-center justify-center border-t border-cyan-500/10 bg-[#060b1a]/50 p-8 md:border-l md:border-t-0">
              <div className="grid w-full max-w-xs grid-cols-2 gap-3">
                {[
                  { m: 'Precision', v: '0.974' },
                  { m: 'Recall', v: '1.000' },
                  { m: 'F1-score', v: '0.987' },
                  { m: 'Specificity', v: '0.941' },
                ].map((x) => (
                  <div
                    key={x.m}
                    className="rounded-xl border border-cyan-500/10 bg-[#0a1224]/60 p-4 text-center"
                  >
                    <p className="font-[Space_Grotesk] text-xl font-bold text-cyan-300">
                      {x.v}
                    </p>
                    <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-500">
                      {x.m}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-5 py-16">
        <div className="card relative overflow-hidden p-10 text-center">
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              background:
                'radial-gradient(circle at 50% 0%, rgba(34,211,238,0.25), transparent 60%)',
            }}
          />
          <h2 className="relative font-[Space_Grotesk] text-3xl font-bold text-white">
            Run your first kidney risk assessment
          </h2>
          <p className="relative mx-auto mt-3 max-w-xl text-slate-300">
            Create an account, enter your clinical values, and get an experimental
            risk classification in seconds.
          </p>
          <div className="relative mt-7">
            <button
              onClick={() => navigate(user ? { name: 'assessment' } : { name: 'register' })}
              className="btn-primary inline-flex items-center gap-2 text-base"
            >
              {user ? 'Start assessment' : 'Get started — it\'s free'}
              <ArrowRight size={18} />
            </button>
          </div>
          <div className="relative mt-7">
            <DisclaimerBanner compact />
          </div>
        </div>
      </section>
    </div>
  );
}
