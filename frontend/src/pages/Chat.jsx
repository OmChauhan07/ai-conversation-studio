import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const suggestedPrompts = [
  'Summarize latest product feedback',
  'What are the top AI risks today?',
  'Generate a compliance checklist',
];

const initialMessages = [
  {
    id: 1,
    sender: 'ai',
    text: 'Welcome back! Ask me anything about your AI conversations, coverage, or policy guidance.',
    confidence: '94%',
    source: 'Welcome-Guide.pdf',
  },
];

const sampleAiResponses = [
  {
    text: 'I recommend focusing on prompt clarity, source attribution, and guardrail checks for sensitive queries.',
    confidence: '91%',
    source: 'Policy-Playbook.pdf',
  },
  {
    text: 'Your best option is to use short contextual prompts and verify answers against internal documentation.',
    confidence: '88%',
    source: 'AI-Testing-Guide.docx',
  },
  {
    text: 'When evaluating accuracy, always prioritize user intent and filter out speculative statements.',
    confidence: '93%',
    source: 'Support-FAQ.md',
  },
];

const Chat = () => {
  const navigate = useNavigate();
  const [chatHistory, setChatHistory] = useState(initialMessages);
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const [likedMessages, setLikedMessages] = useState({});
  const endRef = useRef(null);

  const scrollToLatest = () => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  };

  useEffect(() => {
    scrollToLatest();
  }, [chatHistory, typing]);

  const addAiResponse = () => {
    const response = sampleAiResponses[Math.floor(Math.random() * sampleAiResponses.length)];
    setChatHistory((history) => [
      ...history,
      {
        id: Date.now(),
        sender: 'ai',
        text: response.text,
        confidence: response.confidence,
        source: response.source,
      },
    ]);
    setTyping(false);
  };

  const sendMessage = (messageText) => {
    const trimmed = messageText.trim();
    if (!trimmed || typing) return;

    setChatHistory((history) => [
      ...history,
      {
        id: Date.now(),
        sender: 'user',
        text: trimmed,
      },
    ]);
    setDraft('');
    setTyping(true);

    window.setTimeout(addAiResponse, 1200);
  };

  const onSend = () => sendMessage(draft);

  const onKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onSend();
    }
  };

  const toggleLike = (messageId, type) => {
    setLikedMessages((current) => ({
      ...current,
      [messageId]: current[messageId] === type ? null : type,
    }));
  };

  const onCopy = async (text) => {
    if (!navigator.clipboard) return;
    await navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.08),transparent_18%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.05),transparent_22%),linear-gradient(180deg,#040612_0%,#090f1d_45%,#07101b_100%)] text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-[1200px] flex-col px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-[28px] border border-white/10 bg-slate-950/95 p-6 shadow-[0_40px_120px_-80px_rgba(0,0,0,0.6)] backdrop-blur-xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/80 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
              >
                ← Back
              </button>
              <p className="text-xs uppercase tracking-[0.35em] text-sky-400">Chat with AI</p>
              <h2 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Ask the studio assistant</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                Use suggested prompts or ask directly. The AI will respond with confidence, source data, and feedback controls.
              </p>
            </div>
            <div className="mt-4 flex flex-wrap gap-3 sm:mt-0">
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendMessage(prompt)}
                  className="rounded-full border border-white/10 bg-slate-900/80 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-sky-300/40 hover:bg-slate-900"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-6 grid flex-1 gap-6 lg:grid-cols-[0.92fr_0.8fr]">
          <div className="flex min-h-[540px] flex-col overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/95 shadow-[0_40px_120px_-80px_rgba(0,0,0,0.6)] backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-sky-400">Live chat</p>
                <h2 className="text-xl font-semibold text-white">AI conversation</h2>
              </div>
              <div className="rounded-3xl bg-slate-900/85 px-4 py-2 text-sm font-medium text-slate-200">
                {typing ? 'AI is typing…' : 'Ready to chat'}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5" style={{ scrollbarGutter: 'stable' }}>
              <div className="space-y-5">
                {chatHistory.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={message.sender === 'user' ? 'flex justify-end' : 'flex justify-start'}
                  >
                    <div className={message.sender === 'user' ? 'w-full max-w-[72%]' : 'w-full max-w-[72%]'}>
                      <div className={message.sender === 'user' ? 'rounded-[28px] border border-slate-700 bg-slate-900/95 p-5 text-right shadow-[0_20px_60px_-40px_rgba(0,0,0,0.6)]' : 'rounded-[28px] border border-white/10 bg-slate-900/90 p-5 text-left shadow-[0_20px_60px_-40px_rgba(0,0,0,0.6)]'}>
                        <p className="text-sm leading-7 text-slate-100">{message.text}</p>
                        {message.sender === 'ai' && (
                          <div className="mt-4 rounded-[24px] border border-white/10 bg-slate-950/85 p-4 text-sm text-slate-300">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div className="space-y-1">
                                <p>
                                  <span className="font-semibold text-slate-200">Confidence:</span>{' '}
                                  <span className="text-sky-300">{message.confidence}</span>
                                </p>
                                <p>
                                  <span className="font-semibold text-slate-200">Source:</span>{' '}
                                  <span className="text-slate-300">{message.source}</span>
                                </p>
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => onCopy(message.text)}
                                  className="rounded-full border border-white/10 bg-slate-900/80 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-900"
                                >
                                  Copy
                                </button>
                                <button
                                  type="button"
                                  onClick={() => toggleLike(message.id, 'like')}
                                  className={`rounded-full px-3 py-2 text-xs font-semibold transition ${likedMessages[message.id] === 'like' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-white/5 text-slate-200 hover:bg-white/10'}`}
                                >
                                  👍 Like
                                </button>
                                <button
                                  type="button"
                                  onClick={() => toggleLike(message.id, 'dislike')}
                                  className={`rounded-full px-3 py-2 text-xs font-semibold transition ${likedMessages[message.id] === 'dislike' ? 'bg-rose-500/15 text-rose-300' : 'bg-white/5 text-slate-200 hover:bg-white/10'}`}
                                >
                                  👎 Dislike
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {typing && (
                  <div className="flex justify-start">
                    <div className="w-full max-w-[72%] rounded-[28px] border border-white/10 bg-slate-900/90 p-5 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.6)]">
                      <div className="h-4 w-24 rounded-full bg-slate-800/80" />
                      <div className="mt-4 flex items-center gap-2">
                        <span className="h-3 w-3 animate-pulse rounded-full bg-slate-200/70" />
                        <span className="h-3 w-3 animate-pulse rounded-full bg-slate-200/70 delay-150" />
                        <span className="h-3 w-3 animate-pulse rounded-full bg-slate-200/70 delay-300" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={endRef} />
              </div>
            </div>

            <div className="border-t border-white/10 bg-slate-950/95 p-5">
              <label className="mb-2 block text-sm font-medium text-slate-400">Message</label>
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={onKeyDown}
                rows={4}
                placeholder="Type your question here..."
                className="w-full resize-none rounded-3xl border border-white/10 bg-slate-900/90 px-4 py-4 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/10"
              />
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">Press Enter to send, Shift+Enter for a new line.</p>
                <button
                  type="button"
                  onClick={onSend}
                  disabled={typing || !draft.trim()}
                  className="inline-flex items-center justify-center rounded-3xl bg-sky-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-700"
                >
                  Send
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-slate-950/95 p-6 shadow-[0_40px_120px_-80px_rgba(0,0,0,0.6)] backdrop-blur-xl">
            <h2 className="text-xl font-semibold text-white">Conversation tips</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              Keep prompts specific and context-rich. Use the source feedback buttons after each response to tune the quality of future answers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
