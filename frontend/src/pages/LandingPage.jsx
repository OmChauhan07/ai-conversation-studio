import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const features = [
  {
    title: 'Knowledge Library',
    description: 'Centralize product, compliance, and support knowledge for every AI assistant.',
  },
  {
    title: 'Prompt Lab',
    description: 'Test prompt variations, compare responses, and identify the most reliable instructions.',
  },
  {
    title: 'Governance Radar',
    description: 'Track hallucinations, response quality, and policy risks with clear dashboards.',
  },
];

const stats = [
  { label: 'Active assistants', value: '24' },
  { label: 'Prompt tests', value: '1.2k' },
  { label: 'Quality score', value: '94%' },
];

const LandingPage = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.2),_transparent_35%),linear-gradient(135deg,#020617_0%,#0f172a_45%,#111827_100%)] text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-wrap items-center justify-between rounded-full border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">AI Conversation Studio</p>
            <p className="text-sm text-slate-300">Enterprise-grade visibility for trusted AI responses</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1 text-sm text-sky-200">
              {user?.name || user?.email || 'Team workspace'}
            </div>
            <button
              onClick={logout}
              className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
            >
              Sign out
            </button>
          </div>
        </header>

        <main className="grid flex-1 gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-2xl shadow-black/30 backdrop-blur">
            <div className="mb-6 inline-flex rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-sm text-emerald-200">
              Live monitoring • Governance • Feedback loops
            </div>
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
              Turn every AI conversation into a measurable, trustworthy experience.
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-slate-300">
              Give your team a studio for prompt testing, knowledge management, response evaluation, and executive-ready analytics in one place.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/dashboard"
                className="rounded-full bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-400"
              >
                Open workspace
              </Link>
              <a
                href="#features"
                className="rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/20"
              >
                Explore capabilities
              </a>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/10 bg-slate-800/80 p-4">
                  <p className="text-2xl font-semibold text-white">{stat.value}</p>
                  <p className="text-sm text-slate-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </section>

          <aside className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-black/20 backdrop-blur">
            <div className="rounded-2xl border border-sky-400/20 bg-sky-400/10 p-4">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-300">Today’s focus</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Prompt reliability review</h2>
              <p className="mt-2 text-sm text-slate-300">
                Compare three variations of your support prompt and spot the highest-quality response path.
              </p>
            </div>
            <div className="mt-5 space-y-3">
              <div className="rounded-2xl border border-white/10 bg-slate-800/80 p-4">
                <p className="text-sm font-medium text-white">Hallucination risk</p>
                <p className="mt-1 text-sm text-amber-300">Low • 2 flagged responses today</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-800/80 p-4">
                <p className="text-sm font-medium text-white">Knowledge coverage</p>
                <p className="mt-1 text-sm text-emerald-300">92% • Policy documents synced</p>
              </div>
            </div>
          </aside>
        </main>

        <section id="features" className="mt-8 grid gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <article key={feature.title} className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
              <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
              <p className="mt-2 text-sm text-slate-300">{feature.description}</p>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
};

export default LandingPage;
