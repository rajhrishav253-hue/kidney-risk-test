import { ShieldAlert, FileText, Lock, Database, Stethoscope } from 'lucide-react';
import { DisclaimerBanner } from '@/components/ui';

const sections = [
  {
    icon: Stethoscope,
    title: 'Not a medical diagnosis',
    body: 'AI KidneyGuard produces an experimental machine-learning risk classification. It is not a clinical diagnosis, a laboratory test, or a medical device. The output should never be used as the sole basis for medical decisions, and the system never recommends starting or stopping any medication.',
  },
  {
    icon: Database,
    title: 'Dataset & model limitations',
    body: 'The model is a logistic regression trained on the UCI Chronic Kidney Disease dataset (400 records, 24 attributes). Evaluation metrics (accuracy 97.5%, ROC-AUC 0.99) are computed on a held-out stratified split of that dataset. Performance on different populations, datasets, or clinical settings is not guaranteed. The reported risk score is a model probability, not a clinically calibrated individual disease probability.',
  },
  {
    icon: Lock,
    title: 'Privacy & data handling',
    body: 'Your account credentials are managed by Supabase Auth; passwords are hashed and never stored in plaintext. Assessment records are protected by row-level security policies that restrict access to your own data only. No passwords, API secrets, or authentication tokens are stored in assessment records.',
  },
  {
    icon: FileText,
    title: 'No fabricated results',
    body: 'If the model service is unavailable, or if submitted inputs fail server-side validation, the system returns a clear error and saves nothing. We never return a fabricated prediction or substitute missing values with zero silently.',
  },
];

export function DisclaimerPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-10 animate-fade-up">
      <div className="mb-7">
        <span className="chip mb-3">
          <ShieldAlert size={12} /> Disclaimer & privacy
        </span>
        <h1 className="font-[Space_Grotesk] text-3xl font-bold text-white">
          Medical disclaimer & privacy policy
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Please read this carefully before using AI KidneyGuard.
        </p>
      </div>

      <DisclaimerBanner />

      <div className="mt-6 space-y-4">
        {sections.map((s) => (
          <div key={s.title} className="card p-6">
            <div className="mb-3 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-400/10 text-cyan-300">
                <s.icon size={20} />
              </span>
              <h2 className="font-[Space_Grotesk] text-lg font-semibold text-white">
                {s.title}
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">{s.body}</p>
          </div>
        ))}
      </div>

      <div className="card mt-6 p-6">
        <h2 className="font-[Space_Grotesk] text-lg font-semibold text-white">
          Your rights over your data
        </h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-400">
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300" />
            You can view your full assessment history at any time.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300" />
            You can delete any of your assessment records whenever you choose.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300" />
            You cannot read, edit, or delete another user's records — and neither can they access yours.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300" />
            If you have questions about your data, consult a qualified healthcare professional for medical guidance and contact the project maintainer for data requests.
          </li>
        </ul>
      </div>
    </div>
  );
}
