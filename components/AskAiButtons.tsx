"use client";

import { trackAskAi } from "@/lib/analytics";

interface Provider {
  id: "chatgpt" | "claude" | "gemini";
  name: string;
  tagline: string;
  buildUrl: (prompt: string) => string;
  icon: React.ReactNode;
  accent: string;
}

// Simplified brand marks, inline so no external requests are needed (CSP).
const ChatGptIcon = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M22.28 9.82a5.98 5.98 0 0 0-.52-4.91 6.05 6.05 0 0 0-6.51-2.9A6.07 6.07 0 0 0 4.98 4.18a5.98 5.98 0 0 0-4 2.9 6.05 6.05 0 0 0 .75 7.1 5.98 5.98 0 0 0 .51 4.91 6.05 6.05 0 0 0 6.51 2.9A5.98 5.98 0 0 0 13.26 24a6.06 6.06 0 0 0 5.77-4.21 5.98 5.98 0 0 0 4-2.9 6.06 6.06 0 0 0-.75-7.07zm-9.02 12.61a4.48 4.48 0 0 1-2.88-1.04l.14-.08 4.78-2.76a.79.79 0 0 0 .39-.68v-6.74l2.02 1.17a.07.07 0 0 1 .04.05v5.58a4.5 4.5 0 0 1-4.49 4.5zm-9.66-4.13a4.47 4.47 0 0 1-.54-3.01l.14.09 4.78 2.76a.77.77 0 0 0 .78 0l5.84-3.37v2.33a.08.08 0 0 1-.03.06L9.74 19.95a4.5 4.5 0 0 1-6.14-1.65zM2.34 7.9a4.48 4.48 0 0 1 2.37-1.97v5.68a.77.77 0 0 0 .39.68l5.81 3.35-2.02 1.17a.08.08 0 0 1-.07 0l-4.83-2.79A4.5 4.5 0 0 1 2.34 7.87zm16.6 3.86-5.83-3.39L15.12 7.2a.08.08 0 0 1 .07 0l4.83 2.79a4.49 4.49 0 0 1-.68 8.1v-5.68a.79.79 0 0 0-.4-.66zm2.01-3.02-.14-.09-4.77-2.78a.78.78 0 0 0-.79 0L9.41 9.23V6.9a.07.07 0 0 1 .03-.06l4.83-2.79a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.13-2.02-1.16a.08.08 0 0 1-.04-.06V6.07a4.5 4.5 0 0 1 7.38-3.45l-.14.08-4.78 2.76a.79.79 0 0 0-.39.68zm1.1-2.37 2.6-1.5 2.6 1.5v3l-2.6 1.5-2.6-1.5z" />
  </svg>
);

const ClaudeIcon = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M16.8 3H12.9l6.6 18H23L16.8 3zM7.2 3 1 21h4l1.3-3.9h6.5L14 21h4L11.4 3H7.2zm.4 10.3 2.1-6.4 2.1 6.4H7.6z" />
  </svg>
);

const GeminiIcon = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 0c.7 6.4 5.6 11.3 12 12-6.4.7-11.3 5.6-12 12-.7-6.4-5.6-11.3-12-12C6.4 11.3 11.3 6.4 12 0z" />
  </svg>
);

export function AskAiButtons({ prompt }: { prompt: string }) {
  const providers: Provider[] = [
    {
      id: "chatgpt",
      name: "ChatGPT",
      tagline: "OpenAI",
      buildUrl: (p) => `https://chatgpt.com/?q=${encodeURIComponent(p)}`,
      icon: ChatGptIcon,
      accent: "hover:ring-emerald-300",
    },
    {
      id: "claude",
      name: "Claude",
      tagline: "Anthropic",
      buildUrl: (p) => `https://claude.ai/new?q=${encodeURIComponent(p)}`,
      icon: ClaudeIcon,
      accent: "hover:ring-orange-300",
    },
    {
      id: "gemini",
      name: "Gemini",
      tagline: "Google AI Mode",
      buildUrl: (p) => `https://www.google.com/search?udm=50&q=${encodeURIComponent(p)}`,
      icon: GeminiIcon,
      accent: "hover:ring-blue-300",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {providers.map((p) => (
        <a
          key={p.id}
          href={p.buildUrl(prompt)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackAskAi(p.id)}
          className={`glass flex flex-col items-center gap-3 rounded-2xl p-6 text-center transition-all hover:-translate-y-1 hover:shadow-xl hover:ring-2 ${p.accent}`}
        >
          <span className="text-neutral-800">{p.icon}</span>
          <span>
            <span className="block text-[16px] font-bold">{p.name}</span>
            <span className="block text-[12px] text-neutral-500">{p.tagline}</span>
          </span>
          <span className="bg-brand-red mt-1 rounded-full px-4 py-1.5 text-[13px] font-semibold text-white">
            Ask now →
          </span>
        </a>
      ))}
    </div>
  );
}
