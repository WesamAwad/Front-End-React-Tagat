import { useEffect, useRef } from "react";
import { CheckCircle2 } from "lucide-react";

type SuccessToastProps = {
  open: boolean;
  title?: string;
  message: string;
  onClose: () => void;
};

function SuccessToast({ open, title = "تم بنجاح", message, onClose }: SuccessToastProps) {
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    const timeoutId = window.setTimeout(() => {
      onCloseRef.current();
    }, 3500);

    return () => window.clearTimeout(timeoutId);
  }, [open]);

  if (!open) return null;

  return (
    <div className="pointer-events-none fixed top-4 right-4 z-2000 w-[min(100%-2rem,22rem)]">
      <div
        role="status"
        aria-live="polite"
        aria-labelledby="success-toast-title"
        onAnimationEnd={() => onCloseRef.current()}
        className="success-toast pointer-events-auto flex items-start gap-3 rounded-xl border border-emerald-200 bg-white p-4 shadow-lg"
      >
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="size-6 text-emerald-600" aria-hidden="true" />
        </div>
        <div className="min-w-0 text-start">
          <h2 id="success-toast-title" className="text-sm font-bold text-primary">
            {title}
          </h2>
          {message ? <p className="mt-1 text-sm leading-relaxed text-label">{message}</p> : null}
        </div>
      </div>
    </div>
  );
}

export default SuccessToast;
