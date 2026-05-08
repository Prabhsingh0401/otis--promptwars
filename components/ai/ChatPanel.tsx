'use client';
// components/ai/ChatPanel.tsx
// Streaming AI chat panel for itinerary generation

import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import type { ItineraryOutput } from '@/lib/gemini/schema';

interface Message {
  role:    'user' | 'assistant';
  content: string;
  isError?: boolean;
}

interface ChatPanelProps {
  onItineraryGenerated: (data: ItineraryOutput) => void;
  className?:           string;
}

export default function ChatPanel({ onItineraryGenerated, className = '' }: ChatPanelProps) {
  const [messages,  setMessages]  = useState<Message[]>([
    { role: 'assistant', content: "Hi! Tell me where you'd like to go and I'll plan your perfect trip. 🌍" }
  ]);
  const [input,     setInput]     = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Message = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Add placeholder assistant message
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

    try {
      // Parse destination from natural language (simple extraction)
      const today = new Date();
      const next  = new Date(today);
      next.setDate(today.getDate() + 7);

      const body = {
        destination:       text,
        startDate:         today.toISOString().split('T')[0],
        endDate:           next.toISOString().split('T')[0],
        budget:            2000,
        numberOfTravelers: 2,
        preferences: {
          budget:              'moderate',
          travelStyle:         ['cultural'],
          dietaryRestrictions: [],
          mobility:            'full',
          preferredTransport:  ['walking', 'transit'],
        },
      };

      const response = await fetch('/api/generate', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });

      if (!response.ok || !response.body) {
        throw new Error('Generation request failed');
      }

      const reader  = response.body.getReader();
      const decoder = new TextDecoder();
      let   assistantText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const rawChunk = decoder.decode(value, { stream: true });
        const lines    = rawChunk.split('\n').filter((l) => l.startsWith('data: '));

        for (const line of lines) {
          try {
            const data = JSON.parse(line.slice(6));

            if (data.error) {
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role:    'assistant',
                  content: `Sorry, I couldn't generate the itinerary: ${data.error}`,
                  isError: true,
                };
                return updated;
              });
              setIsLoading(false);
              return;
            }

            if (data.chunk) {
              assistantText += data.chunk;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: '✦ Generating your itinerary...' };
                return updated;
              });
            }

            if (data.done && data.data) {
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role:    'assistant',
                  content: `✅ Your ${data.data.title} itinerary is ready! Check the planner.`,
                };
                return updated;
              });
              onItineraryGenerated(data.data);
            }
          } catch {
            // Skip malformed SSE chunks
          }
        }
      }
    } catch (err) {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role:    'assistant',
          content: 'Something went wrong. Please try again.',
          isError: true,
        };
        return updated;
      });
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className={`flex flex-col h-full bg-bg-primary ${className}`}>
      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
        aria-relevant="additions"
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-card-in`}
          >
            <div
              className={[
                'max-w-[80%] rounded-2xl px-4 py-2.5 text-callout',
                msg.role === 'user'
                  ? 'bg-accent text-white rounded-br-sm'
                  : msg.isError
                    ? 'bg-[#FFF3E0] text-warning'
                    : 'bg-bg-secondary text-label-primary rounded-bl-sm',
              ].join(' ')}
              aria-label={`${msg.role === 'user' ? 'You' : 'Otis'}: ${msg.content}`}
            >
              {msg.content || (
                <span className="flex gap-1" aria-label="Typing">
                  {[0, 1, 2].map((j) => (
                    <span
                      key={j}
                      className="inline-block w-1.5 h-1.5 rounded-full bg-neutral animate-bounce"
                      style={{ animationDelay: `${j * 150}ms` }}
                    />
                  ))}
                </span>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} aria-hidden />
      </div>

      {/* Input */}
      <div className="px-4 pb-4 pt-2 border-t border-separator">
        <div className="flex gap-2 items-center">
          <label htmlFor="chat-input" className="sr-only">
            Describe your trip
          </label>
          <input
            id="chat-input"
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Where do you want to go?"
            disabled={isLoading}
            className={[
              'flex-1 rounded-xl px-4 py-2.5 text-callout bg-bg-secondary text-label-primary',
              'placeholder:text-label-tertiary',
              'border border-separator',
              'focus:outline-none focus:ring-2 focus:ring-accent',
              'disabled:opacity-50',
            ].join(' ')}
            aria-label="Describe your trip destination and preferences"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className={[
              'w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center shrink-0',
              'disabled:opacity-40 disabled:pointer-events-none',
              'active:scale-95 transition-transform',
              'focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
            ].join(' ')}
            aria-label="Send message"
          >
            <Send size={16} strokeWidth={2} aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
