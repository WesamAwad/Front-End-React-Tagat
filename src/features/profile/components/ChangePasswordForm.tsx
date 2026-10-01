import { useState, type FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useChangePasswordMutation } from "../../auth/authApi";
import type { AuthValidationErrorResponse } from "../../../types/authTypes";
import { ProfileField } from "./ProfileField";
import { ProfileSaveButton } from "./ProfileSection";

const emptyValues = { current_password: "", password: "", password_confirmation: "" };
type PasswordFieldName = keyof typeof emptyValues;

const hiddenPasswords: Record<PasswordFieldName, boolean> = { current_password: false, password: false, password_confirmation: false };

const passwordFields: { name: PasswordFieldName; label: string; placeholder: string; autoComplete: string }[] = [
  { name: "current_password", label: "كلمة المرور الحالية", placeholder: "أدخل كلمة المرور الحالية", autoComplete: "current-password" },
  { name: "password", label: "كلمة المرور الجديدة", placeholder: "أدخل كلمة المرور الجديدة", autoComplete: "new-password" },
  { name: "password_confirmation", label: "تأكيد كلمة المرور", placeholder: "أعد إدخال كلمة المرور الجديدة", autoComplete: "new-password" },
];

type ChangePasswordFormProps = {
  onSaved: (message: string) => void;
};

export function ChangePasswordForm({ onSaved }: ChangePasswordFormProps) {
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const [values, setValues] = useState(emptyValues);
  const [visiblePasswords, setVisiblePasswords] = useState(hiddenPasswords);
  const [fieldErrors, setFieldErrors] = useState(emptyValues);
  const [submitError, setSubmitError] = useState("");
  const isComplete = Object.values(values).every(Boolean);

  const handleChange = (name: PasswordFieldName, value: string) => {
    setValues((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => (current[name] ? { ...current, [name]: "" } : current));
    setSubmitError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFieldErrors(emptyValues);
    setSubmitError("");

    try {
      const result = await changePassword(values).unwrap();
      setValues(emptyValues);
      setVisiblePasswords(hiddenPasswords);
      onSaved(result.message || "تم تغيير كلمة المرور بنجاح.");
    } catch (error) {
      const errorData = (error as { data?: AuthValidationErrorResponse })?.data;
      const errors = errorData?.errors;
      const nextErrors = {
        current_password: errors?.current_password?.[0] ?? "",
        password: errors?.password?.[0] ?? "",
        password_confirmation: errors?.password_confirmation?.[0] ?? "",
      };

      setFieldErrors(nextErrors);
      if (!Object.values(nextErrors).some(Boolean)) {
        setSubmitError(errorData?.message || "تعذر تغيير كلمة المرور، حاول مرة أخرى.");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6">
      <div className="space-y-6">
        {passwordFields.map((field) => {
          const isVisible = visiblePasswords[field.name];

          return (
            <ProfileField
              key={field.name}
              label={field.label}
              name={field.name}
              type={isVisible ? "text" : "password"}
              autoComplete={field.autoComplete}
              value={values[field.name]}
              onChange={(event) => handleChange(field.name, event.target.value)}
              placeholder={field.placeholder}
              error={fieldErrors[field.name]}
              adornment={
                <button
                  type="button"
                  onClick={() => setVisiblePasswords((current) => ({ ...current, [field.name]: !current[field.name] }))}
                  aria-label={isVisible ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                  className="text-[#8a8a8a] transition hover:text-primary"
                >
                  {isVisible ? <Eye className="size-6" strokeWidth={1.5} /> : <EyeOff className="size-6" strokeWidth={1.5} />}
                </button>
              }
            />
          );
        })}
      </div>

      {submitError ? (
        <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {submitError}
        </p>
      ) : null}

      <ProfileSaveButton disabled={!isComplete} isLoading={isLoading} />
    </form>
  );
}
