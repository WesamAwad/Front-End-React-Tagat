import { useEffect, useId, useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Flag, X } from "lucide-react";
import { RichTextEditor } from "../../../components/RichTextEditor";
import { isRichTextEmpty } from "../../../components/richText";
import SuccessToast from "../../../components/SuccessToast";
import { useAppSelector } from "../../../store/hooks";
import { isCustomerSession } from "../../auth/authRoles";
import { useStoreComplaintMutation } from "../../auth/authApi";
import type { AuthValidationErrorResponse } from "../../../types/authTypes";

type WorkshopComplaintDialogProps = {
  shopId: string | number;
  shopName: string;
  open: boolean;
  onClose: () => void;
};

export function WorkshopComplaintDialog({ shopId, shopName, open, onClose }: WorkshopComplaintDialogProps) {
  const titleId = useId();
  const subjectId = useId();
  const messageId = useId();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [subjectError, setSubjectError] = useState("");
  const [messageError, setMessageError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [storeComplaint, { isLoading }] = useStoreComplaintMutation();

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isLoading) {
        setSubject("");
        setMessage("");
        setSubjectError("");
        setMessageError("");
        setSubmitError("");
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose, isLoading]);

  if (!open) {
    return <SuccessToast open={Boolean(successMessage)} message={successMessage} onClose={() => setSuccessMessage("")} />;
  }

  const handleClose = () => {
    if (isLoading) return;
    setSubject("");
    setMessage("");
    setSubjectError("");
    setMessageError("");
    setSubmitError("");
    onClose();
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (isLoading) return;

    setSubjectError("");
    setMessageError("");
    setSubmitError("");

    const trimmedSubject = subject.trim();
    let hasError = false;

    if (!trimmedSubject) {
      setSubjectError("أدخل موضوع الشكوى");
      hasError = true;
    }
    if (isRichTextEmpty(message)) {
      setMessageError("أدخل تفاصيل الشكوى");
      hasError = true;
    }
    if (hasError) return;

    try {
      const result = await storeComplaint({
        shop_id: shopId,
        subject: trimmedSubject,
        message: message.trim(),
      }).unwrap();
      setSubject("");
      setMessage("");
      setSuccessMessage(result.message || "تم إرسال الشكوى بنجاح.");
      onClose();
    } catch (error) {
      const errorData = (error as { data?: AuthValidationErrorResponse })?.data;
      const errors = errorData?.errors;
      if (errors?.subject?.[0]) {
        setSubjectError(errors.subject[0]);
        return;
      }
      if (errors?.message?.[0]) {
        setMessageError(errors.message[0]);
        return;
      }
      setSubmitError(errorData?.message || "تعذر إرسال الشكوى، حاول مرة أخرى.");
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-2000 flex items-center justify-center p-4" role="presentation">
        <button type="button" aria-label="إغلاق نموذج الشكوى" className="absolute inset-0 bg-primary/45 backdrop-blur-[2px]" disabled={isLoading} onClick={handleClose} />

        <div role="dialog" aria-modal="true" aria-labelledby={titleId} className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 id={titleId} className="text-lg font-bold text-primary">
                تقديم شكوى
              </h2>
              <p className="mt-1 text-sm text-gray-500">ضد ورشة «{shopName}»</p>
            </div>
            <button type="button" onClick={handleClose} disabled={isLoading} className="rounded-lg p-1.5 text-gray-500 transition hover:bg-primary-light hover:text-primary disabled:opacity-60" aria-label="إغلاق">
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>

          <form className="mt-5 space-y-4" onSubmit={(event) => void handleSubmit(event)}>
            {submitError ? (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                {submitError}
              </p>
            ) : null}

            <div>
              <label htmlFor={subjectId} className="mb-1.5 block text-sm font-medium text-label">
                الموضوع
              </label>
              <input
                id={subjectId}
                type="text"
                value={subject}
                disabled={isLoading}
                onChange={(event) => {
                  setSubject(event.target.value);
                  setSubjectError("");
                }}
                placeholder="مثال: تأخير في الإصلاح"
                className={`w-full rounded-lg border px-4 py-3 text-sm text-primary outline-none transition placeholder:text-primary/40 focus:border-primary disabled:opacity-70 ${
                  subjectError ? "border-red-500" : "border-primary/15"
                }`}
              />
              {subjectError ? <p className="mt-1.5 text-xs text-red-600">{subjectError}</p> : null}
            </div>

            <div>
              <label htmlFor={messageId} className="mb-1.5 block text-sm font-medium text-label">
                تفاصيل الشكوى
              </label>
              <RichTextEditor
                id={messageId}
                value={message}
                onChange={(html) => {
                  setMessage(html);
                  setMessageError("");
                }}
                placeholder="اكتب تفاصيل المشكلة بوضوح..."
                disabled={isLoading}
                invalid={Boolean(messageError)}
                describedBy={messageError ? `${messageId}-error` : undefined}
              />
              {messageError ? (
                <p id={`${messageId}-error`} className="mt-1.5 text-xs text-red-600">
                  {messageError}
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap justify-end gap-2">
              <button type="button" onClick={handleClose} disabled={isLoading} className="rounded-lg border border-primary/15 px-4 py-2 text-sm font-medium text-primary transition hover:bg-primary-light disabled:opacity-60">
                إلغاء
              </button>
              <button type="submit" disabled={isLoading} className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-white transition hover:bg-secondary-hover disabled:opacity-60">
                <Flag className="size-3.5" aria-hidden="true" />
                {isLoading ? "جاري الإرسال..." : "إرسال الشكوى"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <SuccessToast open={Boolean(successMessage)} message={successMessage} onClose={() => setSuccessMessage("")} />
    </>
  );
}

export function useWorkshopComplaintLauncher(shopId: string | number) {
  const navigate = useNavigate();
  const location = useLocation();
  const token = useAppSelector((state) => state.auth.token);
  const role = useAppSelector((state) => state.auth.user?.role);
  const [open, setOpen] = useState(false);

  const openComplaint = () => {
    if (!token || !isCustomerSession(role)) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    setOpen(true);
  };

  return {
    open,
    openComplaint,
    closeComplaint: () => setOpen(false),
    shopId,
  };
}
