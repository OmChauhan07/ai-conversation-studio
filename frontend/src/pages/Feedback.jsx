import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const initialFeedback = [
  {
    id: 'FB-001',
    title: 'Response quality for policy guidance',
    rating: 5,
    comment: 'The assistant was very accurate and referenced the correct policy sections.',
    date: 'Jun 28, 2026',
  },
  {
    id: 'FB-002',
    title: 'Escalation workflow clarity',
    rating: 4,
    comment: 'Helpful answer overall, but it could use a more concise summary.',
    date: 'Jun 26, 2026',
  },
  {
    id: 'FB-003',
    title: 'Compliance checklist accuracy',
    rating: 5,
    comment: 'Great level of detail and the checklist matched our internal standards.',
    date: 'Jun 24, 2026',
  },
];

const starLabels = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

const Feedback = () => {
  const navigate = useNavigate();
  const [feedbackItems, setFeedbackItems] = useState(initialFeedback);
  const [modalOpen, setModalOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [title, setTitle] = useState('');

  const submitFeedback = () => {
    if (!title.trim() || !comment.trim() || rating === 0) return;

    setFeedbackItems((items) => [
      {
        id: `FB-${items.length + 1}`,
        title: title.trim(),
        rating,
        comment: comment.trim(),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      },
      ...items,
    ]);

    setTitle('');
    setComment('');
    setRating(0);
    setModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.08),transparent_18%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.05),transparent_22%),linear-gradient(180deg,#040612_0%,#090f1d_45%,#07101b_100%)] text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-[1200px] flex-col px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-[28px] border border-white/10 bg-slate-950/95 p-6 shadow-[0_40px_120px_-80px_rgba(0,0,0,0.6)] backdrop-blur-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/80 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
              >
                ← Back
              </button>
              <p className="text-xs uppercase tracking-[0.35em] text-sky-400">My Feedback</p>
              <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Review and send feedback</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                View past feedback and add your latest AI conversation review.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center justify-center rounded-3xl bg-sky-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-400"
            >
              Give New Feedback
            </button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {feedbackItems.map((item) => (
            <motion.article
              key={item.id}
              whileHover={{ y: -4 }}
              className="rounded-[28px] border border-white/10 bg-slate-950/95 p-6 shadow-[0_40px_120px_-80px_rgba(0,0,0,0.6)] backdrop-blur-xl"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-sky-400">{item.date}</p>
                  <h2 className="mt-2 text-xl font-semibold text-white">{item.title}</h2>
                </div>
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: 5 }, (_, index) => (
                    <span key={index} className={index < item.rating ? 'text-amber-300' : 'text-slate-700'}>★</span>
                  ))}
                </div>
              </div>
              <p className="mt-5 text-sm leading-6 text-slate-300">{item.comment}</p>
            </motion.article>
          ))}
        </div>

        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-lg">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-xl rounded-[32px] border border-white/10 bg-slate-950/95 p-6 shadow-[0_40px_120px_-80px_rgba(0,0,0,0.9)]"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-sky-400">New Feedback</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Share your latest rating</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-900"
                >
                  Close
                </button>
              </div>

              <div className="mt-6 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-300">Conversation Title</label>
                  <input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Enter a title for the feedback"
                    className="mt-3 w-full rounded-3xl border border-white/10 bg-slate-900/90 px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/10"
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-300">Rating</p>
                  <div className="mt-3 flex items-center gap-2">
                    {Array.from({ length: 5 }, (_, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setRating(index + 1)}
                        className={`text-3xl transition ${index < rating ? 'text-amber-300' : 'text-slate-700 hover:text-amber-300'}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  {rating > 0 && <p className="mt-2 text-sm text-slate-400">{starLabels[rating - 1]}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300">Comment</label>
                  <textarea
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    rows={5}
                    placeholder="Share what worked well or what can improve..."
                    className="mt-3 w-full rounded-3xl border border-white/10 bg-slate-900/90 px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/10"
                  />
                </div>

                <button
                  type="button"
                  onClick={submitFeedback}
                  className="inline-flex w-full items-center justify-center rounded-3xl bg-sky-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-700"
                  disabled={!title.trim() || !comment.trim() || rating === 0}
                >
                  Submit Feedback
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feedback;
