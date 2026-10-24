import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, X } from "lucide-react";
import type { ShopRecommendation } from "./aiService";
import { subscribeToOpenAIChat } from "./openAIChat";
import { useAIChat } from "./useAIChat";

const TOOLTIP_KEY = "swiftfix-ai-chat-tooltip-seen";
const SUGGESTIONS = ["الشاشة لا تعمل", "البطارية تنتهي بسرعة", "الجهاز يسخن", "لا يشحن"];

function ShopRecommendationCard({ shop, onNavigate }: { shop: ShopRecommendation; onNavigate?: () => void }) {
  const label = shop.shop_name || `ورشة #${shop.shop_id}`;

  return (
    <li>
      <Link
        to={`/workshops/${shop.shop_id}`}
        onClick={onNavigate}
        aria-label={`فتح صفحة ${label}`}
        className="block rounded-xl border border-primary/10 bg-white p-3 shadow-sm transition hover:border-secondary/40 hover:bg-primary-light/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/40"
      >
        <p className="text-sm font-bold text-secondary underline-offset-2 hover:underline">{label}</p>
        <p className="mt-1.5 text-xs leading-5 text-primary/80">{shop.reason}</p>
        <span className="mt-2 inline-flex text-xs font-semibold text-secondary">افتح صفحة الورشة ←</span>
      </Link>
    </li>
  );
}

export function AIChatWidget() {
  const titleId = useId();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);
  const { messages, status, errorMessage, isBusy, send, retry, reset } = useAIChat();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [showTooltip, setShowTooltip] = useState(() => !localStorage.getItem(TOOLTIP_KEY));

  useEffect(() => {
    const onOpen = () => {
      setShowTooltip(false);
      localStorage.setItem(TOOLTIP_KEY, "1");
      setOpen(true);
    };

    return subscribeToOpenAIChat(onOpen);
  }, []);

  useEffect(() => {
    if (!showTooltip) return;

    const timeoutId = window.setTimeout(() => {
      setShowTooltip(false);
      localStorage.setItem(TOOLTIP_KEY, "1");
    }, 9000);

    return () => window.clearTimeout(timeoutId);
  }, [showTooltip]);

  useEffect(() => {
    if (!open) {
      if (wasOpen.current) launcherRef.current?.focus();
      return;
    }

    wasOpen.current = true;
    inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const media = window.matchMedia("(max-width: 639px)");
    if (!media.matches) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages, status, open]);

  useEffect(() => {
    const field = inputRef.current;
    if (!field) return;
    field.style.height = "auto";
    field.style.height = `${Math.min(field.scrollHeight, 128)}px`;
  }, [draft, open]);

  function hideTooltip() {
    setShowTooltip(false);
    localStorage.setItem(TOOLTIP_KEY, "1");
  }

  function toggleOpen() {
    hideTooltip();
    setOpen((current) => !current);
  }

  function submitDraft() {
    if (!draft.trim() || isBusy) return;
    send(draft);
    setDraft("");
  }

  function submitSuggestion(text: string) {
    if (isBusy) return;
    send(text);
  }

  return (
    <>
      {open ? (
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="ai-chat-panel fixed inset-0 z-50 flex h-dvh flex-col bg-white sm:inset-auto sm:bottom-21 sm:left-5 sm:h-128 sm:max-h-[calc(100dvh-8rem)] sm:w-md sm:overflow-hidden sm:rounded-2xl sm:shadow-2xl sm:ring-1 sm:ring-primary/10 lg:h-136 lg:w-120"
        >
          <header className="flex items-center justify-between gap-3 border-b border-primary/10 bg-primary px-4 py-3 text-white">
            <h2 id={titleId} className="text-sm font-bold sm:text-base">
              مساعد SwiftFix الذكي
            </h2>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={reset}
                className="rounded-lg px-2 py-1.5 text-xs font-medium text-white/90 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              >
                محادثة جديدة
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="إغلاق المحادثة"
                className="rounded-lg p-1.5 text-white/90 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
          </header>

          <p className="border-b border-primary/10 bg-primary-light px-4 py-2 text-xs text-primary/70">التشخيص مبدئي وقد يختلف بعد فحص الفني</p>

          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
            {messages.length === 0 ? (
              <div className="space-y-3">
                <p className="rounded-2xl rounded-es-sm bg-primary-light px-3 py-2.5 text-sm leading-6 text-primary">مرحباً، أنا مساعد SwiftFix. صف عطل جهازك وسأعطيك تشخيصاً مبدئياً، ثم أرشّح لك لاحقاً ورشاً قريبة.</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      disabled={isBusy}
                      onClick={() => submitSuggestion(suggestion)}
                      className="rounded-full border border-primary/15 bg-white px-3 py-1.5 text-xs font-medium text-primary transition hover:border-secondary hover:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/40 disabled:opacity-60"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message) =>
                message.role === "user" ? (
                  <p key={message.id} className="max-w-[85%] self-end rounded-2xl rounded-ee-sm bg-secondary px-3 py-2.5 text-sm leading-6 text-white">
                    {message.content}
                  </p>
                ) : (
                  <div key={message.id} className="w-full self-start space-y-2">
                    {message.content ? <p className="rounded-2xl rounded-es-sm bg-primary-light px-3 py-2.5 text-sm leading-6 text-primary">{message.content}</p> : null}
                    {message.recommendations && message.recommendations.length > 0 ? (
                      <ul className="space-y-2">
                        {message.recommendations.map((shop) => (
                          <ShopRecommendationCard key={`${message.id}-${shop.shop_id}`} shop={shop} onNavigate={() => setOpen(false)} />
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ),
              )
            )}

            {status === "sending" ? (
              <p className="self-start rounded-2xl rounded-es-sm bg-primary-light px-3 py-2.5 text-sm text-primary/70" role="status">
                جاري الرد
                <span aria-hidden="true">...</span>
              </p>
            ) : null}

            {status === "error" ? (
              <div className="self-start rounded-2xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700" role="alert">
                <p>{errorMessage || "تعذر الحصول على الرد. حاول مرة أخرى."}</p>
                <button
                  type="button"
                  onClick={retry}
                  className="mt-2 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/40"
                >
                  إعادة المحاولة
                </button>
              </div>
            ) : null}

            <div ref={bottomRef} />
          </div>

          <form
            className="flex items-end gap-2 border-t border-primary/10 px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
            onSubmit={(event) => {
              event.preventDefault();
              submitDraft();
            }}
          >
            <label htmlFor="ai-chat-input" className="sr-only">
              رسالة إلى المساعد
            </label>
            <textarea
              id="ai-chat-input"
              ref={inputRef}
              rows={1}
              value={draft}
              disabled={isBusy}
              placeholder="صف عطل جهازك..."
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  submitDraft();
                }
              }}
              className="max-h-32 min-h-11 flex-1 resize-none rounded-xl border border-primary/15 px-3 py-2.5 text-sm text-primary outline-none transition placeholder:text-primary/40 focus-visible:ring-2 focus-visible:ring-secondary/40 disabled:bg-primary-light"
            />
            <button
              type="submit"
              disabled={isBusy || draft.trim() === ""}
              className="rounded-xl bg-secondary px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-secondary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/40 disabled:opacity-60"
            >
              إرسال
            </button>
          </form>
        </section>
      ) : null}

      <div className={`fixed bottom-5 left-5 z-50 ${open ? "hidden sm:block" : ""}`}>
        {showTooltip && !open ? (
          <p role="status" className="absolute bottom-full left-0 mb-3 w-max max-w-56 rounded-xl bg-primary px-3 py-2 text-xs leading-5 text-white shadow-lg">
            اسأل المساعد الذكي عن عطل جهازك
          </p>
        ) : null}
        <button
          ref={launcherRef}
          type="button"
          onClick={toggleOpen}
          aria-expanded={open}
          aria-label={open ? "إغلاق المساعد الذكي" : "فتح المساعد الذكي"}
          className="flex size-14 items-center justify-center rounded-full bg-secondary text-white shadow-lg transition hover:bg-secondary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/50 focus-visible:ring-offset-2"
        >
          {open ? <X className="size-6" aria-hidden="true" /> : <Sparkles className="size-6" aria-hidden="true" />}
        </button>
      </div>
    </>
  );
}
